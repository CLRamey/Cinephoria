import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminZoneService } from '../../services/admin-zone.service';
import { AdminComponent } from './admin.component';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { StaffActionsComponent } from 'projects/auth/src/lib/shared/staff-actions/staff-actions.component';
import { EmployeeAccountComponent } from './employee-account/employee-account.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
  },
];

@NgModule({
  declarations: [AdminComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatTableModule,
    MatDivider,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    StaffActionsComponent,
    EmployeeAccountComponent,
  ],
  providers: [AdminZoneService],
  exports: [AdminComponent],
})
export class AdminModule {}
