import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { leerSesionJwt } from '../utils/sesion-jwt.util';
import { PerfilService } from '../../features/usuarios/services/perfil.service';

/**
 * Exige sesión válida.
 * Si el usuario es Estudiante, también exige perfil completo antes del marketplace.
 */
export const marketplaceGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const perfilService = inject(PerfilService);
  const sesion = leerSesionJwt();

  if (!sesion) {
    return router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });
  }

  if (sesion.rol !== 'Estudiante') {
    return true;
  }

  return perfilService.getMiPerfil().pipe(
    map(perfil => {
      if (perfil && perfil.esPerfilCompleto === false) {
        return router.createUrlTree(['/auth/perfil']);
      }
      return true;
    }),
    catchError(() => of(router.createUrlTree(['/auth/perfil']))),
  );
};
