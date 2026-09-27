import { Routes } from '@angular/router';

export const USUARIOS_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];