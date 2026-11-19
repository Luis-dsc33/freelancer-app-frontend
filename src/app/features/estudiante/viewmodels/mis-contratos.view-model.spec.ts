import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { CalificarClienteHandler } from '../commands/calificar-cliente.handler';
import { CancelarContratoHandler } from '../commands/cancelar-contrato.handler';
import { FinalizarContratoHandler } from '../commands/finalizar-contrato.handler';
import { ContratoEstudiante } from '../models/contrato';
import { ListarMisContratosHandler } from '../queries/listar-mis-contratos.handler';
import { ListarMisResenasEmitidasHandler } from '../queries/listar-mis-resenas-emitidas.handler';
import { MisContratosViewModel } from './mis-contratos.view-model';

describe('MisContratosViewModel', () => {
  const contratoActivo: ContratoEstudiante = {
    id: 'con-1',
    postulacionId: 'post-1',
    proyectoId: 'proy-1',
    clienteId: 'cli-1',
    estudianteId: 'est-1',
    importeAcordado: 5000,
    fechaInicio: '2026-11-01T00:00:00Z',
    fechaCompromiso: '2026-11-30T00:00:00Z',
    estado: 'Activo',
    creadoEn: '2026-11-01T00:00:00Z',
  };

  function setup() {
    const listarContratos = { execute: vi.fn().mockReturnValue(of([contratoActivo])) };
    const finalizar = { execute: vi.fn().mockReturnValue(of(undefined)) };
    const cancelar = { execute: vi.fn().mockReturnValue(of(undefined)) };
    const calificar = {
      execute: vi.fn().mockReturnValue(
        of({
          id: 'res-1',
          contratoId: 'con-1',
          autorId: 'est-1',
          destinatarioId: 'cli-1',
          puntuacion: 5,
          comentario: 'Excelente comunicación',
          creadaEn: '2026-11-19T00:00:00Z',
        }),
      ),
    };
    const listarResenas = { execute: vi.fn().mockReturnValue(of([])) };

    TestBed.configureTestingModule({
      providers: [
        MisContratosViewModel,
        { provide: ListarMisContratosHandler, useValue: listarContratos },
        { provide: FinalizarContratoHandler, useValue: finalizar },
        { provide: CancelarContratoHandler, useValue: cancelar },
        { provide: CalificarClienteHandler, useValue: calificar },
        { provide: ListarMisResenasEmitidasHandler, useValue: listarResenas },
      ],
    });

    return {
      vm: TestBed.inject(MisContratosViewModel),
      finalizar,
      calificar,
    };
  }

  it('finaliza un contrato activo y luego permite calificar al cliente', () => {
    const { vm, finalizar, calificar } = setup();
    vm.cargar();

    expect(vm.contratos()).toHaveLength(1);
    expect(vm.contratos()[0].pagoNetoEstimado).toBeGreaterThan(0);

    vm.solicitarAccion(vm.contratos()[0], 'finalizar');
    vm.confirmarAccionContrato();

    expect(finalizar.execute).toHaveBeenCalledTimes(1);
    expect(vm.contratos()[0].estado).toBe('Finalizado');

    vm.abrirModalResena(vm.contratos()[0]);
    vm.enviarResena(5, 'Excelente cliente, pagos puntuales');

    expect(calificar.execute).toHaveBeenCalledTimes(1);
    expect(vm.estaCalificado('con-1')).toBe(true);
    expect(vm.contratoACalificar()).toBeNull();
  });

  it('valida rango de puntuación y comentario obligatorio antes de enviar reseña', () => {
    const { vm, calificar } = setup();
    vm.cargar();
    vm.solicitarAccion(vm.contratos()[0], 'finalizar');
    vm.confirmarAccionContrato();

    vm.abrirModalResena(vm.contratos()[0]);
    vm.enviarResena(0, '   ');

    expect(vm.errorResena()).toContain('1 y 5');
    expect(calificar.execute).not.toHaveBeenCalled();

    vm.enviarResena(4, '   ');
    expect(vm.errorResena()).toContain('comentario');
    expect(calificar.execute).not.toHaveBeenCalled();
  });
});
