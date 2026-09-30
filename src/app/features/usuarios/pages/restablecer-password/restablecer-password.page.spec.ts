import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { RestablecerPasswordPage } from './restablecer-password.page';
import { RecuperacionService } from '../../services/recuperacion.service';

describe('RestablecerPasswordPage', () => {
  function crear(token = 'token-de-prueba') {
    TestBed.configureTestingModule({ providers: [RecuperacionService,
      provideHttpClient(), provideHttpClientTesting(),
      { provide: ActivatedRoute, useValue: { queryParamMap: of(convertToParamMap({ token })) } },
    ] });
    return TestBed.runInInjectionContext(() => new RestablecerPasswordPage());
  }
  it('rechaza contraseñas diferentes sin enviar una petición', () => {
    const page = crear();
    page.form.setValue({ password: 'NuevaClave123!', confirmarPassword: 'OtraClave123!' });
    page.cambiar();
    expect(page.form.hasError('noCoinciden')).toBe(true);
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
  it('rechaza contraseñas menores a ocho caracteres', () => {
    const page = crear();
    page.form.setValue({ password: 'corta', confirmarPassword: 'corta' });
    expect(page.form.invalid).toBe(true);
  });
  it('muestra enlace inválido si la URL no trae un token', () => {
    const page = crear('');
    expect(page.recuperacion.estado()).toBe('invalido');
  });
});
