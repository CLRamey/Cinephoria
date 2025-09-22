import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ReservationComponent } from './reservation.component';

import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ReservationCardComponent } from '../../utils/reservation-card/reservation-card.component';
import { SeatSelectionComponent } from '../../utils/seat-selection/seat-selection.component';
import { MatDivider } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';

const routes: Routes = [
  {
    path: '',
    component: ReservationComponent,
  },
];

@NgModule({
  declarations: [ReservationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatButtonModule,
    ReservationCardComponent,
    SeatSelectionComponent,
    MatDivider,
    MatSnackBarModule,
  ],
  exports: [ReservationComponent],
})
export class ReservationModule {}
