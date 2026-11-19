import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin-guard';
import { estudianteGuard } from './core/guards/estudiante-guard';
import { clienteGuard } from './core/guards/cliente-guard';
import { leerSesionJwt } from './core/utils/sesion-jwt.util';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [
      () => {
        const sesion = leerSesionJwt();
        if (!sesion) return true;
        const router = inject(Router);
        const destino =
          sesion.rol === 'Administrador' ? '/admin' : sesion.rol === 'Cliente' ? '/cliente' : '/marketplace';
        return router.createUrlTree([destino]);
      },
    ],
    loadComponent: () =>
      import('./features/usuarios/pages/splash/splash.page').then(m => m.SplashPage),
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
    path: 'marketplace',
    loadChildren: () => import('./features/marketplace/marketplace.routes').then(m => m.MARKETPLACE_ROUTES)
  },
  {
    path: 'estudiante',
    canActivate: [estudianteGuard],
    loadChildren: () => import('./features/estudiante/estudiante.routes').then(m => m.ESTUDIANTE_ROUTES)
  },
  {
    path: 'cliente',
    canActivate: [clienteGuard],
    loadChildren: () => import('./features/clientes/clientes.routes').then(m => m.CLIENTES_ROUTES)
  },
  // ADMIN Marcos: se separan las rutas de marketplace y admin (el merge las había dejado en un solo objeto)
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];