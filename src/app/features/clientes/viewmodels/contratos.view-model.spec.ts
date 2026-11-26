import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ContratosViewModel } from './contratos.view-model';

describe('ContratosViewModel (calificación del cliente)', () => {
  const contratosUrl = `${environment.gatewayUrl}/api/marketplace/contratos/mis-contratos`;
  const emitidasUrl = `${environment.gatewayUrl}/api/resenas/mis-resenas-emitidas`;
  let vm: ContratosViewModel;
  let http: HttpTestingController;

  const contrato = (id: string, estado: string) => ({
    id,
    postulacionId: 'p-1',
    proyectoId: 'o-1',
    estudianteId: 'est-1',
    estado,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ContratosViewModel,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    vm = TestBed.inject(ContratosViewModel);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function cargarContratos(emitidas: { contratoId: string }[] = []): void {
    vm.cargar();
    http.expectOne(contratosUrl).flush([contrato('c-1', 'Finalizado'), contrato('c-2', 'Activo')]);
    http.expectOne(emitidasUrl).flush(emitidas);
  }

  it('solo permite calificar contratos Finalizado que aún no califiqué', () => {
    cargarContratos([{ contratoId: 'c-3' }]);
    const [finalizado, activo] = vm.contratos();

    expect(vm.puedeCalificar(finalizado)).toBe(true);
    expect(vm.puedeCalificar(activo)).toBe(false);

    vm.abrirCalificacion(activo);
    expect(vm.contratoACalificar()).toBeNull();
  });

  it('oculta "Calificar" para contratos presentes en mis-resenas-emitidas', () => {
    cargarContratos([{ contratoId: 'c-1' }]);
    expect(vm.estaCalificado('c-1')).toBe(true);
    expect(vm.puedeCalificar(vm.contratos()[0])).toBe(false);
  });

  it('valida puntuación y comentario antes de llamar al API', () => {
    cargarContratos();
    vm.abrirCalificacion(vm.contratos()[0]);

    vm.enviarCalificacion(0, 'Bien');
    expect(vm.errorResena()).toContain('1 y 5');
    vm.enviarCalificacion(5, '   ');
    expect(vm.errorResena()).toContain('comentario');
    vm.enviarCalificacion(5, 'x'.repeat(2001));
    expect(vm.errorResena()).toContain('2000');
  });

  it('envía POST /contratos/{id}/estudiante sin autorId ni destinatarioId y marca el contrato como calificado', () => {
    cargarContratos();
    vm.abrirCalificacion(vm.contratos()[0]);
    vm.enviarCalificacion(5, '  Excelente comunicación.  ');

    const req = http.expectOne(`${environment.gatewayUrl}/api/resenas/contratos/c-1/estudiante`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ puntuacion: 5, comentario: 'Excelente comunicación.' });
    req.flush({ id: 'r-1', contratoId: 'c-1', autorId: 'cli', destinatarioId: 'est-1', puntuacion: 5, comentario: 'x', creadaEn: '2026-11-26T17:15:00Z' });

    expect(vm.estaCalificado('c-1')).toBe(true);
    expect(vm.contratoACalificar()).toBeNull();
    expect(vm.mensaje()).toContain('reseña');
  });

  it('ante 409 marca el contrato como calificado y muestra el mensaje del servidor', () => {
    cargarContratos();
    vm.abrirCalificacion(vm.contratos()[0]);
    vm.enviarCalificacion(4, 'Todo bien');

    http
      .expectOne(`${environment.gatewayUrl}/api/resenas/contratos/c-1/estudiante`)
      .flush({ error: 'Ya calificaste al estudiante en este contrato.' }, { status: 409, statusText: 'Conflict' });

    expect(vm.estaCalificado('c-1')).toBe(true);
    expect(vm.errorResena()).toContain('Ya calificaste');
  });
});
