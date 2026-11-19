import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { ChatEstudiantePage } from './chat-estudiante.page';

describe('ChatEstudiantePage', () => {
  let page: ChatEstudiantePage;
  let http: HttpTestingController;
  const conversacionesUrl = `${environment.gatewayUrl}/api/chat/conversaciones/mias`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideIonicAngular(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap({}) } },
        },
      ],
    });
    page = TestBed.createComponent(ChatEstudiantePage).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga conversaciones, mensajes y permite enviar mensaje', () => {
    page.ionViewWillEnter();

    http.expectOne(conversacionesUrl).flush([
      {
        id: 'conv1',
        proyectoId: 'o1',
        clienteId: 'cli1',
        estudianteId: 'est1',
        tituloProyecto: 'E-commerce',
      },
    ]);
    http.expectOne(`${environment.gatewayUrl}/api/chat/conversaciones/conv1/mensajes`).flush([]);

    page.vm.mensajeInput.set('Hola, ya subí el avance.');
    page.vm.enviarMensaje();

    const msgReq = http.expectOne(
      `${environment.gatewayUrl}/api/chat/conversaciones/conv1/mensajes`,
    );
    expect(msgReq.request.method).toBe('POST');
    expect(msgReq.request.body).toEqual({ contenido: 'Hola, ya subí el avance.' });
    msgReq.flush({
      id: 'm1',
      conversacionId: 'conv1',
      remitenteId: 'est1',
      contenido: 'Hola, ya subí el avance.',
      enviadoEn: '2026-11-19T02:00:00Z',
    });

    expect(page.vm.mensajes()).toHaveLength(1);
    expect(page.vm.mensajeInput()).toBe('');
  });
});
