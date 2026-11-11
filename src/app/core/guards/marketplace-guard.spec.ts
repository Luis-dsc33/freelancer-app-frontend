import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GuardResult, provideRouter, Router, UrlTree } from '@angular/router';
import { isObservable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { marketplaceGuard } from './marketplace-guard';

function tokenConRol(rol: string, expiraEnSegundos = Math.floor(Date.now() / 1000) + 3600): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    exp: expiraEnSegundos,
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': rol,
  }));
  return `${header}.${payload}.firma`;
}

describe('marketplaceGuard', () => {
  let http: HttpTestingController;
  let router: Router;
  const perfilUrl = `${environment.gatewayUrl}/api/usuarios/Perfiles/mi-perfil`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('redirige a login sin sesión', () => {
    const resultado = TestBed.runInInjectionContext(() =>
      marketplaceGuard({} as never, { url: '/marketplace' } as never),
    ) as UrlTree;

    expect(router.serializeUrl(resultado)).toContain('/auth/login');
  });

  it('permite entrar a un cliente autenticado', () => {
    localStorage.setItem('jwt_token', tokenConRol('Cliente'));

    const resultado = TestBed.runInInjectionContext(() =>
      marketplaceGuard({} as never, { url: '/marketplace' } as never),
    );

    expect(resultado).toBe(true);
  });

  it('bloquea a un estudiante con perfil incompleto', () => {
    localStorage.setItem('jwt_token', tokenConRol('Estudiante'));

    let destino: GuardResult | undefined;
    const resultado = TestBed.runInInjectionContext(() =>
      marketplaceGuard({} as never, { url: '/marketplace' } as never),
    );
    expect(isObservable(resultado)).toBe(true);
    if (isObservable(resultado)) {
      resultado.subscribe(value => { destino = value; });
    }

    http.expectOne(perfilUrl).flush({ esPerfilCompleto: false });
    expect(destino instanceof UrlTree).toBe(true);
    expect(router.serializeUrl(destino as UrlTree)).toContain('/auth/perfil');
  });

  it('permite a un estudiante con perfil completo', () => {
    localStorage.setItem('jwt_token', tokenConRol('Estudiante'));

    let destino: GuardResult | undefined;
    const resultado = TestBed.runInInjectionContext(() =>
      marketplaceGuard({} as never, { url: '/marketplace' } as never),
    );
    expect(isObservable(resultado)).toBe(true);
    if (isObservable(resultado)) {
      resultado.subscribe(value => { destino = value; });
    }

    http.expectOne(perfilUrl).flush({ esPerfilCompleto: true });
    expect(destino).toBe(true);
  });
});
