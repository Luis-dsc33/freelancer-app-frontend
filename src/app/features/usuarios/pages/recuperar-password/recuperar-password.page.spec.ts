import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RecuperarPasswordPage } from './recuperar-password.page';
import { RecuperacionService } from '../../services/recuperacion.service';

describe('RecuperarPasswordPage', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [
    RecuperacionService, provideHttpClient(), provideHttpClientTesting(),
  ] }));
  it('rechaza un correo incorrecto sin enviar una petición', () => {
    const page = TestBed.runInInjectionContext(() => new RecuperarPasswordPage());
    page.form.setValue({ email: 'correo-incorrecto' });
    page.enviar();
    expect(page.form.invalid).toBe(true);
    expect(page.form.controls.email.touched).toBe(true);
    TestBed.inject(HttpTestingController).expectNone(() => true);
  });
});
