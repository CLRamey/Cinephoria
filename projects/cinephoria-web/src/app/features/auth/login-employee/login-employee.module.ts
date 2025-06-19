import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginEmployeeComponent } from './login-employee.component';

const routes: Routes = [
  {
    path: '',
    component: LoginEmployeeComponent,
  },
];

@NgModule({
  declarations: [LoginEmployeeComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [LoginEmployeeComponent],
})
export class LoginEmployeeModule {}
