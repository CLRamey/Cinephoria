import { Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'caw-privacy-policy',
  standalone: true,
  templateUrl: './privacy-policy.component.html',
  imports: [MatDialogModule, MatButtonModule],
  styleUrls: ['./privacy-policy.component.scss'],
})
export class PrivacyPolicyComponent {}
