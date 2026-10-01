import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { TrabajoPortafolioPage } from './trabajo-portafolio.page';
import { environment } from '../../../../../environments/environment';

describe('TrabajoPortafolioPage', () => {
  let page: TrabajoPortafolioPage;
  let http: HttpTestingController;
  const router = { navigate: vi.fn().mockResolvedValue(true) };
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(),
      { provide: Router, useValue: router },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({}) } } },
    ] });
    page = TestBed.runInInjectionContext(() => new TrabajoPortafolioPage());
    http = TestBed.inject(HttpTestingController); page.listo.set(true);
  });
  afterEach(() => http.verify());
  it('rechaza título y descripción vacíos sin llamar a la API', () => {
    page.form.setValue({ titulo: '  ', descripcion: '', enlace: '' }); page.guardar();
    expect(page.form.invalid).toBe(true); expect(page.errorCampo('titulo')).toContain('obligatorio');
    http.expectNone(() => true);
  });
  it('el enlace es opcional y solo permite http o https', () => {
    page.form.setValue({ titulo: 'Proyecto', descripcion: 'Descripción', enlace: '' });
    expect(page.form.valid).toBe(true);
    for (const enlace of ['no-es-url', 'javascript:alert(1)', 'ftp://example.com']) {
      page.form.controls.enlace.setValue(enlace); expect(page.form.invalid).toBe(true);
    }
    page.form.controls.enlace.setValue('https://example.com'); expect(page.form.valid).toBe(true);
  });
  it('recorta los textos, normaliza enlace y evita guardar dos veces', () => {
    page.form.setValue({ titulo: '  Proyecto  ', descripcion: '  Texto  ', enlace: '  ' });
    page.guardar(); page.guardar();
    const req = http.expectOne(`${environment.gatewayUrl}/api/usuarios/Portafolios/trabajos`);
    expect(req.request.body).toEqual({ titulo: 'Proyecto', descripcion: 'Texto', enlace: null });
    req.flush({ id: 'uno' }); expect(router.navigate).toHaveBeenCalledWith(['/portafolio']);
  });
  it('conserva el formulario si falla el guardado', () => {
    page.form.setValue({ titulo: 'Proyecto', descripcion: 'Texto', enlace: '' }); page.guardar();
    http.expectOne(`${environment.gatewayUrl}/api/usuarios/Portafolios/trabajos`).flush({}, { status: 500, statusText: 'Error' });
    expect(page.form.controls.titulo.value).toBe('Proyecto'); expect(page.portafolio.error()).toBeTruthy();
  });
});
