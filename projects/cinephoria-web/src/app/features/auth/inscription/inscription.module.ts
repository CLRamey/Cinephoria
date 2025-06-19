import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { InscriptionComponent } from './inscription.component';

const routes: Routes = [
  {
    path: '',
    component: InscriptionComponent,
  },
];

@NgModule({
  declarations: [InscriptionComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [InscriptionComponent],
})
export class InscriptionModule {}
