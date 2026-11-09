import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  // ERJ 26/09/2026: AUN NO VALIDA SESION NI ROL, NO LO TOQUEN MIENTRAS DEFINO LA LOGICA DE PROTECCION DE RUTAS
  return true;
};