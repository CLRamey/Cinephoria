import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { ClientReservationsService } from 'projects/auth/src/lib/services/clientReservations.service';
import { ClientComponent } from './client.component';

const routes: Routes = [
  {
    path: '',
    component: ClientComponent,
  },
];

@NgModule({
  declarations: [ClientComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    MatDividerModule,
  ],
  providers: [ClientReservationsService],
  exports: [ClientComponent],
})
export class ClientModule {}
