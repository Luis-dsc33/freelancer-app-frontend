import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { leerSesionJwt } from '../utils/sesion-jwt.util';
import { AuthService } from '../../features/usuarios/services/auth.service';

export const clienteGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const sesion = leerSesionJwt();

  if (!sesion) {
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }

  const rol = sesion.rol ?? auth.currentUser?.rol;
  if (rol === 'Cliente') return true;
  if (rol === 'Estudiante') return router.createUrlTree(['/marketplace']);
  if (rol === 'Administrador') return router.createUrlTree(['/admin']);

  return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
};
