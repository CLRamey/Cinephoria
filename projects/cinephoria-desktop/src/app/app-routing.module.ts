import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from '../../../../projects/auth/src/lib/interfaces/auth-interfaces';
import { AuthGuard } from '../../../../projects/auth/src/lib/guards/auth-guard.guard';

const routes: Routes = [
  { path: '', redirectTo: 'accueil', pathMatch: 'full' },
  {
    path: 'accueil',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomeModule),
  },
  {
    path: 'login-employee',
    loadChildren: () =>
      import('./features/login-employee/login-employee.module').then(m => m.LoginEmployeeModule),
  },
  {
    path: 'employee',
    loadChildren: () => import('./features/employee/employee.module').then(m => m.EmployeeModule),
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    data: { roles: [Role.EMPLOYEE] },
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
