import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LoginClientComponent } from './login-client.component';

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
import { RegisterClientComponent } from './register-client/register-client.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';

const routes: Routes = [
  {
    path: '',
    component: LoginClientComponent,
  },
  {
    path: 'register',
    component: RegisterClientComponent,
  },
  {
    path: 'verify-email',
    component: VerifyEmailComponent,
  },
];

@NgModule({
  declarations: [LoginClientComponent, RegisterClientComponent, VerifyEmailComponent],
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
  exports: [LoginClientComponent],
})
export class LoginClientModule {}
