import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { MisContratosPage } from './mis-contratos.page';

describe('MisContratosPage', () => {
  let page: MisContratosPage;
  let http: HttpTestingController;
  const contratosUrl = `${environment.gatewayUrl}/api/marketplace/contratos/mis-contratos`;
  const resenasEmitidasUrl = `${environment.gatewayUrl}/api/resenas/mis-resenas-emitidas`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideIonicAngular(),
      ],
    });
    page = TestBed.createComponent(MisContratosPage).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga contratos, finaliza contrato activo y envía reseña al cliente', () => {
    page.ionViewWillEnter();

    http.expectOne(contratosUrl).flush([
      {
        id: 'c1',
        postulacionId: 'p1',
        proyectoId: 'o1',
        clienteId: 'cli1',
        estudianteId: 'e1',
        importeAcordado: 6000,
        fechaInicio: '2026-11-01T00:00:00Z',
        fechaCompromiso: '2026-11-20T00:00:00Z',
        estado: 'Activo',
        creadoEn: '2026-11-01T00:00:00Z',
      },
    ]);
    http.expectOne(resenasEmitidasUrl).flush([]);

    page.vm.solicitarAccion(page.vm.contratos()[0], 'finalizar');
    page.vm.confirmarAccionContrato();

    const finReq = http.expectOne(`${environment.gatewayUrl}/api/marketplace/contratos/c1/finalizar`);
    expect(finReq.request.method).toBe('PUT');
    finReq.flush(null, { status: 204, statusText: 'No Content' });

    expect(page.vm.contratos()[0].estado).toBe('Finalizado');

    page.abrirCalificacion(page.vm.contratos()[0]);
    page.puntuacionSeleccionada.set(5);
    page.comentarioResena.set('Excelente experiencia');
    page.enviarCalificacion();

    const resReq = http.expectOne(`${environment.gatewayUrl}/api/resenas/contratos/c1/cliente`);
    expect(resReq.request.method).toBe('POST');
    expect(resReq.request.body).toEqual({
      puntuacion: 5,
      comentario: 'Excelente experiencia',
    });
    resReq.flush({
      id: 'r1',
      contratoId: 'c1',
      autorId: 'e1',
      destinatarioId: 'cli1',
      puntuacion: 5,
      comentario: 'Excelente experiencia',
      creadaEn: '2026-11-19T02:00:00Z',
    });

    expect(page.vm.estaCalificado('c1')).toBe(true);
  });
});
