import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { PostularAOfertaHandler } from '../../estudiante/commands/postular-a-oferta.handler';
import { ObtenerMiPerfilHandler } from '../../usuarios/queries/obtener-mi-perfil.handler';
import { ObtenerDetalleOportunidadHandler } from '../queries/obtener-detalle-oportunidad.handler';
import { DetalleOportunidadViewModel } from './detalle-oportunidad.view-model';

describe('DetalleOportunidadViewModel', () => {
  const oferta = {
    id: 'o-1',
    titulo: 'API Pagos',
    descripcion: 'Integración REST',
    presupuesto: 8000,
    esUrgente: false,
    habilidadesRequeridas: ['C#', '.NET'],
    habilidadesDeseables: ['Docker'],
    skills: [
      { skillId: 's1', nombreSkill: 'C#', tipoRequisito: 'Requerida' as const },
      { skillId: 's2', nombreSkill: '.NET', tipoRequisito: 'Requerida' as const },
      { skillId: 's3', nombreSkill: 'Docker', tipoRequisito: 'Deseable' as const },
    ],
    nombreCliente: 'FinTech MX',
    estado: 'Publicada',
    creadoEn: '2026-11-10T00:00:00Z',
    yaPostulado: false,
  };

  afterEach(() => localStorage.clear());

  it('carga detalle, calcula matching y envía postulación válida', () => {
    const tokenPayload = btoa(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: 'Estudiante',
    }));
    localStorage.setItem('jwt_token', `h.${tokenPayload}.s`);

    const detalleHandler = { execute: vi.fn().mockReturnValue(of(oferta)) };
    const postularHandler = {
      execute: vi.fn().mockReturnValue(
        of({
          id: 'post-1',
          proyectoId: 'o-1',
          estudianteId: 'est-1',
          mensaje: 'Tengo experiencia sólida construyendo APIs en .NET',
          estado: 'Pendiente',
          creadaEn: '2026-11-19T00:00:00Z',
        }),
      ),
    };
    const perfilHandler = {
      execute: vi.fn().mockReturnValue(
        of({
          carrera: 'TI',
          descripcion: 'Backend',
          habilidades: [],
          skillsCatalogo: [{ skillId: 's1', nombreSkill: 'C#', nivelDominio: 'Avanzado' }],
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        DetalleOportunidadViewModel,
        { provide: ObtenerDetalleOportunidadHandler, useValue: detalleHandler },
        { provide: PostularAOfertaHandler, useValue: postularHandler },
        { provide: ObtenerMiPerfilHandler, useValue: perfilHandler },
      ],
    });

    const vm = TestBed.inject(DetalleOportunidadViewModel);
    vm.cargar('o-1');

    expect(vm.matching()?.requeridasCumplidas).toBe(1);
    expect(vm.matching()?.totalRequeridas).toBe(2);

    vm.postularse('corto');
    expect(vm.errorPostulacion()).toContain('10 caracteres');
    expect(postularHandler.execute).not.toHaveBeenCalled();

    vm.postularse('Tengo experiencia sólida construyendo APIs en .NET');
    expect(postularHandler.execute).toHaveBeenCalledTimes(1);
    expect(vm.postulacionExitosa()).toBe(true);
    expect(vm.oportunidad()?.yaPostulado).toBe(true);
  });

  it('maneja error 409 cuando ya existe postulación', () => {
    const detalleHandler = { execute: vi.fn().mockReturnValue(of(oferta)) };
    const postularHandler = {
      execute: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 }))),
    };

    TestBed.configureTestingModule({
      providers: [
        DetalleOportunidadViewModel,
        { provide: ObtenerDetalleOportunidadHandler, useValue: detalleHandler },
        { provide: PostularAOfertaHandler, useValue: postularHandler },
      ],
    });

    const vm = TestBed.inject(DetalleOportunidadViewModel);
    vm.cargar('o-1');
    vm.postularse('Propuesta de al menos diez caracteres');

    expect(vm.errorPostulacion()).toContain('Ya te postulaste');
  });
});
