import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ReservationComponent } from './reservation.component';

const routes: Routes = [
  {
    path: '',
    component: ReservationComponent,
  },
];

@NgModule({
  declarations: [ReservationComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [ReservationComponent],
})
export class ReservationModule {}
