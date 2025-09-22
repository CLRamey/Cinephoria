import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from 'projects/auth/src/lib/interfaces/auth-interfaces';
import { AuthGuard } from 'projects/auth/src/lib/guards/auth-guard.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  {
    path: 'accueil',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'films',
    loadChildren: () => import('./features/films/films.module').then(m => m.FilmsModule),
  },
  {
    path: 'reservation',
    loadChildren: () =>
      import('./features/reservation/reservation.module').then(m => m.ReservationModule),
  },
  {
    path: 'login-client',
    loadChildren: () =>
      import('./features/auth/login-client/login-client.module').then(m => m.LoginClientModule),
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.module').then(m => m.ClientModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [Role.CLIENT] },
  },
  {
    path: 'login-employee',
    loadChildren: () =>
      import('./features/auth/login-employee/login-employee.module').then(
        m => m.LoginEmployeeModule,
      ),
  },
  {
    path: 'employee',
    loadChildren: () => import('./features/employee/employee.module').then(m => m.EmployeeModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [Role.EMPLOYEE] },
  },
  {
    path: 'login-admin',
    loadChildren: () =>
      import('./features/auth/login-admin/login-admin.module').then(m => m.LoginAdminModule),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [Role.ADMIN] },
  },
  {
    path: 'contact',
    loadChildren: () => import('./features/contact/contact.module').then(m => m.ContactModule),
  },
  { path: '**', redirectTo: 'accueil' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      scrollOffset: [0, 64], // Adjust offset for fixed header
      onSameUrlNavigation: 'reload', // Reload component on same URL navigation
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
