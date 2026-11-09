import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PortafolioPage } from './portafolio.page';
import { environment } from '../../../../../environments/environment';

describe('PortafolioPage', () => {
  let page: PortafolioPage;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    page = TestBed.runInInjectionContext(() => new PortafolioPage()); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('cancelar la eliminación no envía ninguna petición', () => {
    page.seleccionado.set({ id: 'uno', titulo: 'Proyecto', descripcion: 'Texto', enlace: null, creadoEn: '', actualizadoEn: null });
    page.cancelarEliminar(); expect(page.seleccionado()).toBeNull(); http.expectNone(() => true);
  });
  it('confirma una sola eliminación aunque se pulse dos veces', () => {
    page.seleccionado.set({ id: 'uno', titulo: 'Proyecto', descripcion: 'Texto', enlace: null, creadoEn: '', actualizadoEn: null });
    page.confirmarEliminar(); page.confirmarEliminar();
    http.expectOne(`${environment.gatewayUrl}/api/usuarios/Portafolios/trabajos/uno`).flush(null, { status: 204, statusText: 'No Content' });
    expect(page.seleccionado()).toBeNull();
  });
  it('no convierte URLs inseguras en enlaces clicables', () => {
    expect(page.enlaceSeguro('javascript:alert(1)')).toBeNull();
    expect(page.enlaceSeguro('https://example.com')).toBe('https://example.com/');
  });
});
