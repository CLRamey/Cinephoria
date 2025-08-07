import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginEmployeeComponent } from './login-employee.component';
import { EmployeeLoginComponent } from 'projects/auth/src/lib/shared/employee-login/employee-login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginEmployeeComponent,
  },
];

@NgModule({
  declarations: [LoginEmployeeComponent],
  imports: [CommonModule, RouterModule.forChild(routes), EmployeeLoginComponent],
  exports: [LoginEmployeeComponent],
})
export class LoginEmployeeModule {}
