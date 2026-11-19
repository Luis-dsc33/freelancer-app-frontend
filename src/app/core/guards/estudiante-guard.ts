import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { leerSesionJwt } from '../utils/sesion-jwt.util';

/** Protege rutas exclusivas del flujo Estudiante en el cliente. La autorización real se valida en la API. */
export const estudianteGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const sesion = leerSesionJwt();

  if (!sesion) {
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }

  if (sesion.rol && sesion.rol !== 'Estudiante') {
    return sesion.rol === 'Administrador'
      ? router.createUrlTree(['/admin'])
      : router.createUrlTree(['/marketplace']);
  }

  return true;
};
