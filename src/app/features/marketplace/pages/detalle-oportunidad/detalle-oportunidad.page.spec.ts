import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';
import { DetalleOportunidadPage } from './detalle-oportunidad.page';

describe('DetalleOportunidadPage', () => {
  let page: DetalleOportunidadPage;
  let http: HttpTestingController;
  const ofertaUrl = `${environment.gatewayUrl}/api/marketplace/Proyectos/oferta-1`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideIonicAngular(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ id: 'oferta-1' }) } },
        },
      ],
    });
    page = TestBed.createComponent(DetalleOportunidadPage).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('carga detalle de la oferta y permite enviar postulación', () => {
    page.ionViewWillEnter();

    http.expectOne(ofertaUrl).flush({
      id: 'oferta-1',
      titulo: 'App React Native',
      descripcion: 'Desarrollo MVP móvil',
      presupuesto: 12000,
      esUrgente: false,
      habilidadesRequeridas: ['React Native'],
      nombreCliente: 'Startup Lab',
      estado: 'Publicada',
      creadoEn: '2026-11-10T00:00:00Z',
      yaPostulado: false,
    });

    expect(page.vm.oportunidad()?.titulo).toBe('App React Native');

    page.mensajePropuesta.set('Tengo experiencia en React Native y apps publicadas.');
    page.enviarPostulacion();

    const req = http.expectOne(
      `${environment.gatewayUrl}/api/marketplace/ofertas/oferta-1/postulaciones`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      mensaje: 'Tengo experiencia en React Native y apps publicadas.',
    });
    req.flush({
      id: 'post-1',
      proyectoId: 'oferta-1',
      estudianteId: 'est-1',
      mensaje: 'Tengo experiencia en React Native y apps publicadas.',
      estado: 'Pendiente',
      creadaEn: '2026-11-19T02:00:00Z',
    });

    expect(page.vm.postulacionExitosa()).toBe(true);
    expect(page.vm.oportunidad()?.yaPostulado).toBe(true);
  });
});
