import { Routes } from '@angular/router';
import { Role } from '../../../auth/src/lib/interfaces/auth-interfaces';
import { AuthGuard } from '../../../auth/src/lib/guards/auth-guard.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'accueil',
    pathMatch: 'full',
  },
  {
    path: 'accueil',
    loadComponent: () => import('./home/home.page').then(m => m.HomePageComponent),
  },
  {
    path: 'login-client',
    loadComponent: () => import('./login/login-client.page').then(m => m.LoginClientPageComponent),
  },
  {
    path: 'client',
    loadComponent: () => import('./client/client.page').then(m => m.ClientPageComponent),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [Role.CLIENT] },
  },
  { path: '**', redirectTo: 'accueil' },
];
