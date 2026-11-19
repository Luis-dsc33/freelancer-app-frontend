import { Routes } from '@angular/router';

export const ESTUDIANTE_ROUTES: Routes = [
  {
    path: 'perfil',
    redirectTo: '/auth/perfil',
    pathMatch: 'full',
  },
  {
    path: 'postulaciones',
    loadComponent: () =>
      import('./pages/mis-postulaciones/mis-postulaciones.page').then(m => m.MisPostulacionesPage),
  },
  {
    path: 'contratos',
    loadComponent: () =>
      import('./pages/mis-contratos/mis-contratos.page').then(m => m.MisContratosPage),
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./pages/chat-estudiante/chat-estudiante.page').then(m => m.ChatEstudiantePage),
  },
  {
    path: '',
    redirectTo: 'postulaciones',
    pathMatch: 'full',
  },
];
