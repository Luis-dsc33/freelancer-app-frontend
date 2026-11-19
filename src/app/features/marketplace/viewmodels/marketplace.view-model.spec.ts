import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ObtenerMiPerfilHandler } from '../../usuarios/queries/obtener-mi-perfil.handler';
import { MarketplaceViewModel } from './marketplace.view-model';
import { ListarOportunidadesHandler } from '../queries/listar-oportunidades.handler';
import { OportunidadProyecto } from '../models/oportunidad-proyecto';

describe('MarketplaceViewModel', () => {
  const oportunidad: OportunidadProyecto = {
    id: '1',
    titulo: 'Landing page',
    descripcion: 'Sitio corporativo',
    presupuesto: 10_000,
    esUrgente: true,
    habilidadesRequeridas: ['HTML'],
    skills: [
      { skillId: 'sk-1', nombreSkill: 'HTML', tipoRequisito: 'Requerida' },
      { skillId: 'sk-2', nombreSkill: 'CSS', tipoRequisito: 'Deseable' },
    ],
    nombreCliente: 'Cliente Demo',
    estado: 'Abierto',
    creadoEn: '2026-11-01T00:00:00Z',
  };

  afterEach(() => localStorage.clear());

  it('mapea el pago estimado al listar oportunidades', () => {
    const handler = { execute: vi.fn().mockReturnValue(of([oportunidad])) };
    TestBed.configureTestingModule({
      providers: [
        MarketplaceViewModel,
        { provide: ListarOportunidadesHandler, useValue: handler },
      ],
    });

    const vm = TestBed.inject(MarketplaceViewModel);
    vm.cargar();

    expect(handler.execute).toHaveBeenCalled();
    expect(vm.oportunidades()).toHaveLength(1);
    expect(vm.oportunidades()[0].pagoEstimadoEstudiante).toBeGreaterThan(0);
    expect(vm.urgentes()).toBe(1);
    expect(vm.cargando()).toBe(false);
  });

  it('expone un mensaje claro cuando falla la query', () => {
    const handler = {
      execute: vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 }))),
    };
    TestBed.configureTestingModule({
      providers: [
        MarketplaceViewModel,
        { provide: ListarOportunidadesHandler, useValue: handler },
      ],
    });

    const vm = TestBed.inject(MarketplaceViewModel);
    vm.cargar();

    expect(vm.error()).toContain('No pudimos conectar');
    expect(vm.oportunidades()).toEqual([]);
  });

  it('envía filtros al aplicar búsqueda y calcula matching cuando el estudiante tiene skills', () => {
    const tokenPayload = btoa(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      role: 'Estudiante',
    }));
    localStorage.setItem('jwt_token', `h.${tokenPayload}.s`);

    const handler = { execute: vi.fn().mockReturnValue(of([oportunidad])) };
    const perfilHandler = {
      execute: vi.fn().mockReturnValue(
        of({
          carrera: 'TI',
          descripcion: 'Dev',
          habilidades: [],
          skillsCatalogo: [{ skillId: 'sk-1', nombreSkill: 'HTML', nivelDominio: 'Avanzado' }],
        }),
      ),
    };

    TestBed.configureTestingModule({
      providers: [
        MarketplaceViewModel,
        { provide: ListarOportunidadesHandler, useValue: handler },
        { provide: ObtenerMiPerfilHandler, useValue: perfilHandler },
      ],
    });

    const vm = TestBed.inject(MarketplaceViewModel);
    vm.busqueda.set('Landing');
    vm.modalidad.set('Remoto');
    vm.soloUrgentes.set(true);
    vm.cargar();

    const queryArg = handler.execute.mock.calls[0][0];
    expect(queryArg.filtros).toEqual({
      busqueda: 'Landing',
      modalidad: 'Remoto',
      soloUrgentes: true,
    });
    expect(vm.oportunidades()[0].matching.requeridasCumplidas).toBe(1);
    expect(vm.oportunidades()[0].matching.porcentajeRequeridas).toBe(100);
  });
});
