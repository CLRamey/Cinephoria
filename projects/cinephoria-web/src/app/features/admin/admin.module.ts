import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminZoneService } from '../../services/admin-zone.service';
import { AdminComponent } from './admin.component';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDivider } from '@angular/material/divider';
import { StaffActionsComponent } from 'projects/auth/src/lib/shared/staff-actions/staff-actions.component';
import { EmployeeAccountComponent } from './employee-account/employee-account.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
  },
];

@NgModule({
  declarations: [AdminComponent, EmployeeAccountComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatTableModule,
    MatDivider,
    StaffActionsComponent,
  ],
  providers: [AdminZoneService],
  exports: [AdminComponent],
})
export class AdminModule {}
