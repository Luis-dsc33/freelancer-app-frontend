import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends registration to the configured gateway', () => {
    const datos = {
      nombre: 'Ana García',
      email: 'ana@example.com',
      password: 'Password123!',
      rol: 'Estudiante',
    };

    service.registrar(datos).subscribe();

    const request = http.expectOne(`${environment.gatewayUrl}/api/usuarios/Auth/registro`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(datos);
    request.flush({ id: 'usuario-1' }, { status: 201, statusText: 'Created' });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
