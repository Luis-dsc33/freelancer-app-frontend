import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/usuarios/usuarios.routes').then(m => m.USUARIOS_ROUTES)
  },
  {
    path: 'portafolio',
    loadChildren: () => import('./features/usuarios/portafolio.routes').then(m => m.PORTAFOLIO_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];