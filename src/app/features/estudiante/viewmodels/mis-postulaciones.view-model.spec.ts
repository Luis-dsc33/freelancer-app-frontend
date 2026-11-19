import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { RetirarPostulacionHandler } from '../commands/retirar-postulacion.handler';
import { PostulacionEstudiante } from '../models/postulacion';
import { ListarMisPostulacionesHandler } from '../queries/listar-mis-postulaciones.handler';
import { MisPostulacionesViewModel } from './mis-postulaciones.view-model';

describe('MisPostulacionesViewModel', () => {
  const basePostulacion: PostulacionEstudiante = {
    id: 'post-1',
    proyectoId: 'proy-1',
    estudianteId: 'est-1',
    mensaje: 'Tengo experiencia en Angular y .NET',
    estado: 'Pendiente',
    creadaEn: '2026-11-15T12:00:00Z',
    tituloProyecto: 'Portal académico',
  };

  function setup(overrides?: { listar$?: ReturnType<typeof of>; retirar$?: ReturnType<typeof of> }) {
    const listarHandler = {
      execute: vi.fn().mockReturnValue(
        overrides?.listar$ ?? of([
          basePostulacion,
          { ...basePostulacion, id: 'post-2', estado: 'Aceptada' as const },
        ]),
      ),
    };
    const retirarHandler = {
      execute: vi.fn().mockReturnValue(overrides?.retirar$ ?? of(undefined)),
    };

    TestBed.configureTestingModule({
      providers: [
        MisPostulacionesViewModel,
        { provide: ListarMisPostulacionesHandler, useValue: listarHandler },
        { provide: RetirarPostulacionHandler, useValue: retirarHandler },
      ],
    });

    return {
      vm: TestBed.inject(MisPostulacionesViewModel),
      retirarHandler,
    };
  }

  it('carga postulaciones y calcula conteos y filtros por estado', () => {
    const { vm } = setup();
    vm.cargar();

    expect(vm.conteos()).toEqual({
      total: 2,
      pendientes: 1,
      aceptadas: 1,
      rechazadas: 0,
      retiradas: 0,
    });

    vm.seleccionarFiltro('Aceptada');
    expect(vm.postulacionesFiltradas().map(p => p.id)).toEqual(['post-2']);
  });

  it('retira una postulación pendiente tras confirmar', () => {
    const { vm, retirarHandler } = setup();
    vm.cargar();

    vm.solicitarRetiro(basePostulacion);
    vm.confirmarRetiro();

    expect(retirarHandler.execute).toHaveBeenCalledTimes(1);
    expect(vm.postulaciones()[0].estado).toBe('Retirada');
    expect(vm.postulacionARetirar()).toBeNull();
    expect(vm.mensajeExito()).toContain('retirada');
  });

  it('expone error legible si falla la carga', () => {
    const { vm } = setup({
      listar$: throwError(() => new HttpErrorResponse({ status: 403 })),
    });
    vm.cargar();

    expect(vm.error()).toContain('estudiante');
    expect(vm.postulaciones()).toEqual([]);
  });
});
