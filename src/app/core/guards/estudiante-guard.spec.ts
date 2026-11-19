import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { estudianteGuard } from './estudiante-guard';

function tokenConRol(rol: string): string {
  const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    exp: Math.floor(Date.now() / 1000) + 3600,
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': rol,
  }));
  return `${header}.${payload}.sig`;
}

describe('estudianteGuard', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    router = TestBed.inject(Router);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('redirige a login si no hay sesión', () => {
    const res = TestBed.runInInjectionContext(() =>
      estudianteGuard({} as ActivatedRouteSnapshot, { url: '/estudiante/contratos' } as RouterStateSnapshot),
    ) as UrlTree;
    expect(router.serializeUrl(res)).toBe('/auth/login?returnUrl=%2Festudiante%2Fcontratos');
  });

  it('redirige a marketplace si el rol es Cliente', () => {
    localStorage.setItem('jwt_token', tokenConRol('Cliente'));
    const res = TestBed.runInInjectionContext(() =>
      estudianteGuard({} as ActivatedRouteSnapshot, { url: '/estudiante/postulaciones' } as RouterStateSnapshot),
    ) as UrlTree;
    expect(router.serializeUrl(res)).toBe('/marketplace');
  });

  it('permite entrar a un Estudiante autenticado', () => {
    localStorage.setItem('jwt_token', tokenConRol('Estudiante'));
    const res = TestBed.runInInjectionContext(() =>
      estudianteGuard({} as ActivatedRouteSnapshot, { url: '/estudiante/postulaciones' } as RouterStateSnapshot),
    );
    expect(res).toBe(true);
  });
});
