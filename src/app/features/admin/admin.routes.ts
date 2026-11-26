import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'panel', // HU-28
    loadComponent: () => import('./pages/panel/panel.page').then(m => m.PanelPage)
  },
  {
    path: 'usuarios', // HU-25
    loadComponent: () => import('./pages/usuarios/usuarios.page').then(m => m.UsuariosAdminPage)
  },
  {
    path: 'moderacion', // HU-21 / HU-26
    loadComponent: () => import('./pages/moderacion/moderacion.page').then(m => m.ModeracionPage)
  },
  // ADMIN Marcos: se quitó la sección de Disputas (HU-24) por decisión del equipo
  {
    path: 'bitacora', // HU-27
    loadComponent: () => import('./pages/bitacora/bitacora.page').then(m => m.BitacoraPage)
  },
  {
    path: '',
    redirectTo: 'panel',
    pathMatch: 'full'
  }
];
