import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { leerSesionJwt } from '../utils/sesion-jwt.util';

// La protección definitiva de rol y propiedad se hace en la API.
export const portafolioGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  if (leerSesionJwt()) return true;
  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
