import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'caw-cgu-cgv',
  standalone: true,
  templateUrl: './cgu-cgv.component.html',
  imports: [MatDialogModule, MatButtonModule],
  styleUrls: ['./cgu-cgv.component.scss'],
})
export class CguCgvComponent {}
