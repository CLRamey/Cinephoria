import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { FilmsComponent } from './films.component';

const routes: Routes = [
  {
    path: '',
    component: FilmsComponent,
  },
];

@NgModule({
  declarations: [FilmsComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [FilmsComponent],
})
export class FilmsModule {}
