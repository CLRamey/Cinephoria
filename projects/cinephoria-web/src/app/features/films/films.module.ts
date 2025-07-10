import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe, NgFor } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FilmsComponent } from './films.component';

import { FilmCardComponent } from '../../utils/film-card/film-card.component';
import { FilmDetailsComponent } from './film-details/film-details.component';

import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ScreeningCardComponent } from '../../utils/screening-card/screening-card.component';

const routes: Routes = [
  {
    path: '',
    component: FilmsComponent,
  },
  {
    path: ':filmId',
    component: FilmDetailsComponent,
  },
];

@NgModule({
  declarations: [FilmsComponent, FilmDetailsComponent],
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
    FilmCardComponent,
    ScreeningCardComponent,
    CurrencyPipe,
    NgFor,
  ],
  exports: [FilmsComponent, FilmDetailsComponent, RouterModule],
})
export class FilmsModule {}
