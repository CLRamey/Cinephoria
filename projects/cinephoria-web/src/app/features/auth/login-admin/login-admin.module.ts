import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../../../../../auth/src/lib/services/auth.service';
import { LoginAdminComponent } from './login-admin.component';

const routes: Routes = [
  {
    path: '',
    component: LoginAdminComponent,
  },
];

@NgModule({
  declarations: [LoginAdminComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatCheckboxModule,
    MatProgressSpinner,
  ],
  providers: [AuthService],
  exports: [LoginAdminComponent],
})
export class LoginAdminModule {}
