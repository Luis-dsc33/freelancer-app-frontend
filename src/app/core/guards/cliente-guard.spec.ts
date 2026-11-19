import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clienteGuard } from './cliente-guard';

function tokenConRol(rol: string): string {
  const claims = { exp: Math.floor(Date.now() / 1000) + 60, role: rol };
  return `header.${btoa(JSON.stringify(claims))}.signature`;
}

describe('clienteGuard', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
  });

  afterEach(() => localStorage.clear());

  const ejecutar = () => TestBed.runInInjectionContext(() =>
    clienteGuard({} as ActivatedRouteSnapshot, { url: '/cliente/publicar-oferta' } as RouterStateSnapshot),
  );

  it('redirige al login y conserva el destino sin una sesión', () => {
    const resultado = ejecutar();

    expect(TestBed.inject(Router).serializeUrl(resultado as never))
      .toBe('/auth/login?returnUrl=%2Fcliente%2Fpublicar-oferta');
  });

  it('redirige a la zona del estudiante si el rol no es Cliente', () => {
    localStorage.setItem('jwt_token', tokenConRol('Estudiante'));

    const resultado = ejecutar();

    expect(TestBed.inject(Router).serializeUrl(resultado as never)).toBe('/marketplace');
  });

  it('permite continuar a una sesión válida de Cliente', () => {
    localStorage.setItem('jwt_token', tokenConRol('Cliente'));

    expect(ejecutar()).toBe(true);
  });
});
