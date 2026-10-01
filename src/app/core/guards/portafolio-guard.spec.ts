import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot, provideRouter, Router } from '@angular/router';
import { portafolioGuard } from './portafolio-guard';

describe('portafolioGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const valores = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (clave: string) => valores.get(clave) ?? null,
      setItem: (clave: string, valor: string) => valores.set(clave, valor),
      removeItem: (clave: string) => valores.delete(clave),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  const run = () => TestBed.runInInjectionContext(() => portafolioGuard({} as ActivatedRouteSnapshot, { url: '/portafolio' } as RouterStateSnapshot));
  it('redirige al login y conserva el destino sin sesión', () => {
    const result = run();
    expect(TestBed.inject(Router).serializeUrl(result as never)).toBe('/auth/login?returnUrl=%2Fportafolio');
  });
  it('rechaza tokens malformados o vencidos', () => {
    for (const token of ['invalido', `a.${btoa(JSON.stringify({ exp: 1 }))}.c`]) {
      localStorage.setItem('jwt_token', token); expect(run()).not.toBe(true);
    }
  });
  it('permite navegar con una sesión vigente', () => {
    localStorage.setItem('jwt_token', `a.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }))}.c`);
    expect(run()).toBe(true);
  });
});
