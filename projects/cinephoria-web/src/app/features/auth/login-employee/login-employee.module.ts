import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginEmployeeComponent } from './login-employee.component';
import { EmployeeCLoginComponent } from 'projects/auth/src/lib/shared/employee-login/employee-c-login/employee-c-login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginEmployeeComponent,
  },
];

@NgModule({
  declarations: [LoginEmployeeComponent],
  imports: [CommonModule, RouterModule.forChild(routes), EmployeeCLoginComponent],
  exports: [LoginEmployeeComponent],
})
export class LoginEmployeeModule {}
