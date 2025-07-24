import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

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
    path: 'login-employee',
    loadChildren: () =>
      import('./features/auth/login-employee/login-employee.module').then(
        m => m.LoginEmployeeModule,
      ),
  },
  {
    path: 'login-admin',
    loadChildren: () =>
      import('./features/auth/login-admin/login-admin.module').then(m => m.LoginAdminModule),
  },
  {
    path: 'client',
    loadChildren: () => import('./features/client/client.module').then(m => m.ClientModule),
    //canActivate: [() => import('./core/guards/client-auth.guard').then(m => m.ClientAuthGuard)],
  },
  {
    path: 'employe',
    loadChildren: () => import('./features/employee/employee.module').then(m => m.EmployeeModule),
    //canActivate: [() => import('./core/guards/employee-auth.guard').then(m => m.EmployeeAuthGuard)],
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule),
    //canActivate: [() => import('./core/guards/admin-auth.guard').then(m => m.AdminAuthGuard)],
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
