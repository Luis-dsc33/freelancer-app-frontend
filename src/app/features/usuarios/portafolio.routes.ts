import { Routes } from '@angular/router';
import { portafolioGuard } from '../../core/guards/portafolio-guard';

export const PORTAFOLIO_ROUTES: Routes = [
  {
    path: '', canActivate: [portafolioGuard],
    loadComponent: () => import('./pages/portafolio/portafolio.page').then(m => m.PortafolioPage),
  },
  {
    path: 'agregar', canActivate: [portafolioGuard],
    loadComponent: () => import('./pages/trabajo-portafolio/trabajo-portafolio.page').then(m => m.TrabajoPortafolioPage),
  },
  {
    path: ':id/editar', canActivate: [portafolioGuard],
    loadComponent: () => import('./pages/trabajo-portafolio/trabajo-portafolio.page').then(m => m.TrabajoPortafolioPage),
  },
];
