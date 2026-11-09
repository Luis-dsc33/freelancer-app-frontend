import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { RecuperacionService } from './recuperacion.service';

describe('RecuperacionService', () => {
  let service: RecuperacionService;
  let http: HttpTestingController;
  const base = `${environment.gatewayUrl}/api/usuarios/Auth`;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [RecuperacionService, provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(RecuperacionService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('envía el correo por el gateway y muestra la confirmación con 202', () => {
    service.solicitarRecuperacion({ email: 'prueba@example.com' });
    expect(service.enviando()).toBe(true);
    const req = http.expectOne(`${base}/recuperar-password`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'prueba@example.com' });
    req.flush({ mensaje: 'Solicitud recibida' }, { status: 202, statusText: 'Accepted' });
    expect(service.estado()).toBe('enviado');
    expect(service.enviando()).toBe(false);
  });
  it('envía confirmarPassword y muestra éxito con 204', () => {
    const datos = { token: 'token-de-prueba', password: 'NuevaClave123!', confirmarPassword: 'NuevaClave123!' };
    service.restablecerContrasena(datos);
    const req = http.expectOne(`${base}/restablecer-password`);
    expect(req.request.body).toEqual(datos);
    req.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.estado()).toBe('actualizado');
  });
  it('muestra enlace inválido para un token vencido o utilizado', () => {
    service.restablecerContrasena({ token: 'vencido', password: 'Nueva123!', confirmarPassword: 'Nueva123!' });
    http.expectOne(`${base}/restablecer-password`).flush({ error: 'El enlace no es válido' }, { status: 400, statusText: 'Bad Request' });
    expect(service.estado()).toBe('invalido');
    expect(service.enviando()).toBe(false);
  });
  it('conserva el formulario cuando falla SMTP para permitir reintentar', () => {
    service.solicitarRecuperacion({ email: 'prueba@example.com' });
    http.expectOne(`${base}/recuperar-password`).flush({}, { status: 503, statusText: 'Service Unavailable' });
    expect(service.estado()).toBe('formulario');
    expect(service.error()).toBeTruthy();
    expect(service.enviando()).toBe(false);
  });
  it('no duplica una petición mientras está enviando', () => {
    service.solicitarRecuperacion({ email: 'prueba@example.com' });
    service.solicitarRecuperacion({ email: 'prueba@example.com' });
    http.expectOne(`${base}/recuperar-password`).flush({ mensaje: 'Solicitud recibida' });
  });
});
