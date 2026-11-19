import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { MisPostulacionesPage } from './mis-postulaciones.page';

describe('MisPostulacionesPage', () => {
  let page: MisPostulacionesPage;
  let http: HttpTestingController;
  const misPostulacionesUrl = `${environment.gatewayUrl}/api/marketplace/postulaciones/mis-postulaciones`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideIonicAngular(),
      ],
    });
    page = TestBed.createComponent(MisPostulacionesPage).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('consulta mis postulaciones y permite retirar una pendiente', () => {
    page.ionViewWillEnter();

    http.expectOne(misPostulacionesUrl).flush([
      {
        id: 'p1',
        proyectoId: 'o1',
        estudianteId: 'e1',
        mensaje: 'Propuesta inicial',
        estado: 'Pendiente',
        creadaEn: '2026-11-18T10:00:00Z',
        tituloProyecto: 'Landing page',
      },
    ]);

    expect(page.vm.postulaciones()).toHaveLength(1);
    page.vm.solicitarRetiro(page.vm.postulaciones()[0]);
    page.vm.confirmarRetiro();

    const req = http.expectOne(`${environment.gatewayUrl}/api/marketplace/postulaciones/p1/retirar`);
    expect(req.request.method).toBe('PUT');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(page.vm.postulaciones()[0].estado).toBe('Retirada');
  });
});
