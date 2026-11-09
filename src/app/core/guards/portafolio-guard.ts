import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// La protección definitiva de rol y propiedad se hace en la API.
export const portafolioGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  try {
    const token = localStorage.getItem('jwt_token');
    if (!token) throw new Error('Sin sesión');
    const partes = token.split('.');
    if (partes.length !== 3) throw new Error('Token inválido');
    const payload = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(payload.padEnd(Math.ceil(payload.length / 4) * 4, '=')));
    if (typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now()) throw new Error('Sesión vencida');
    return true;
  } catch {
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }
};
