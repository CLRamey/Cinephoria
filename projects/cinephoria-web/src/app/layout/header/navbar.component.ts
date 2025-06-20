import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'caw-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  @ViewChild('drawer') drawer!: MatSidenav;

  open(): void {
    this.drawer.open();
  }

  close(): void {
    this.drawer.close();
  }
}
