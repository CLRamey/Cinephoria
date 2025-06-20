import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginClientComponent } from './login-client.component';

const routes: Routes = [
  {
    path: '',
    component: LoginClientComponent,
  },
];

@NgModule({
  declarations: [LoginClientComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [LoginClientComponent],
})
export class LoginClientModule {}
