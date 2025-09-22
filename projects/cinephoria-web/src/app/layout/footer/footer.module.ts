import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FooterComponent } from './footer.component';
import { CinemaInfoService } from '../../services/cinema-info.service';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [FooterComponent],
  imports: [CommonModule, RouterModule, MatToolbarModule, MatListModule],
  exports: [FooterComponent],
  providers: [CinemaInfoService],
})
export class FooterModule {}
