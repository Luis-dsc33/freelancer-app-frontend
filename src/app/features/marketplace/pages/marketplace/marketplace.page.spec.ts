import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { MarketplacePage } from './marketplace.page';

describe('MarketplacePage', () => {
  let page: MarketplacePage;
  let http: HttpTestingController;
  const proyectosUrl = `${environment.gatewayUrl}/api/marketplace/api/Proyectos`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideIonicAngular(),
      ],
    });
    page = TestBed.createComponent(MarketplacePage).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga oportunidades al entrar a la vista', () => {
    page.ionViewWillEnter();

    const request = http.expectOne(proyectosUrl);
    expect(request.request.method).toBe('GET');
    request.flush([
      {
        id: 'p1',
        titulo: 'App móvil universitaria',
        descripcion: 'MVP para estudiantes',
        presupuesto: 10_000,
        esUrgente: false,
        habilidadesRequeridas: ['Angular', 'Ionic'],
        nombreCliente: 'CodeBridge',
        estado: 'Abierto',
        creadoEn: '2026-11-01T00:00:00Z',
      },
    ]);

    expect(page.vm.oportunidades()).toHaveLength(1);
    expect(page.vm.oportunidades()[0].pagoEstimadoEstudiante).toBeTruthy();
    expect(page.vm.cargando()).toBe(false);
    expect(page.vm.error()).toBe('');
  });

  it('muestra error cuando el marketplace no responde', () => {
    page.ionViewWillEnter();
    http.expectOne(proyectosUrl).flush({}, { status: 404, statusText: 'Not Found' });

    expect(page.vm.oportunidades()).toEqual([]);
    expect(page.vm.error()).toBe('El servicio de marketplace aún no está disponible.');
  });
});
