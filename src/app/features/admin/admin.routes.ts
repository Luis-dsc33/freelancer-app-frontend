import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'panel', // HU-28
    loadComponent: () => import('./pages/panel/panel.page').then(m => m.PanelPage)
  },
  {
    path: 'usuarios', // HU-25 (cascarón)
    loadComponent: () => import('./pages/usuarios/usuarios.page').then(m => m.UsuariosAdminPage)
  },
  {
    path: 'moderacion', // HU-21 / HU-26 (cascarón)
    loadComponent: () => import('./pages/moderacion/moderacion.page').then(m => m.ModeracionPage)
  },
  {
    path: 'disputas', // HU-24 (cascarón)
    loadComponent: () => import('./pages/disputas/disputas.page').then(m => m.DisputasPage)
  },
  {
    path: 'bitacora', // HU-27 (cascarón)
    loadComponent: () => import('./pages/bitacora/bitacora.page').then(m => m.BitacoraPage)
  },
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full'
  }
];
