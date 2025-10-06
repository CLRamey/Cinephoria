import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { AdminZoneService } from '../../services/admin-zone.service';
import { AdminComponent } from './admin.component';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
  },
];

@NgModule({
  declarations: [AdminComponent],
  imports: [CommonModule, RouterModule.forChild(routes), MatProgressSpinnerModule],
  providers: [AdminZoneService],
  exports: [AdminComponent],
})
export class AdminModule {}
