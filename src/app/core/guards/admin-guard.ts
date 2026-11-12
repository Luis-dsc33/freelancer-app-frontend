import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

const CLAIM_ROL_LARGO = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

// Protege /admin/** en el FRONT (solo comodidad visual).
// La seguridad real es [Authorize(Roles = "Administrador")] en cada endpoint del backend (HU-22).
export const adminGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const aLogin = router.createUrlTree(['/auth/login'], { queryParams: { returnUrl: state.url } });

  const token = localStorage.getItem('jwt_token');
  if (!token) return aLogin;

  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const vencido = typeof payload.exp === 'number' && payload.exp * 1000 < Date.now();
    const roles = [payload.role ?? payload[CLAIM_ROL_LARGO]].flat();
    return !vencido && roles.includes('Administrador') ? true : aLogin;
  } catch {
    return aLogin;
  }
};
