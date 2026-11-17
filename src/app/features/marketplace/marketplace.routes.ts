import { Routes } from '@angular/router';
import { marketplaceGuard } from '../../core/guards/marketplace-guard';

export const MARKETPLACE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [marketplaceGuard],
    loadComponent: () =>
      import('./pages/marketplace/marketplace.page').then(m => m.MarketplacePage),
  },
];
