import { Routes } from '@angular/router';

export const CLIENTES_ROUTES: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/dashboard/cliente-dashboard.page').then(m => m.ClienteDashboardPage),
  },
  {
    path: 'publicar-oferta',
    loadComponent: () => import('./pages/publicar-oferta/publicar-oferta.page').then(m => m.PublicarOfertaPage),
  },
  {
    path: 'ofertas/:id/postulaciones',
    loadComponent: () => import('./pages/postulaciones/postulaciones.page').then(m => m.PostulacionesPage),
  },
  {
    path: 'ofertas',
    loadComponent: () => import('./pages/mis-ofertas/mis-ofertas.page').then(m => m.MisOfertasPage),
  },
  {
    path: 'contratos',
    loadComponent: () => import('./pages/contratos/contratos.page').then(m => m.ContratosPage),
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat-cliente.page').then(m => m.ChatClientePage),
  },
  {
    path: 'perfil',
    loadComponent: () => import('./pages/perfil-cliente/perfil-cliente.page').then(m => m.PerfilClientePage),
  },
];
