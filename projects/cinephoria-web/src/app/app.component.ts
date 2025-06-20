import { Component, OnInit } from '@angular/core';
import { ConfigService } from './core/services/config.service';

@Component({
  selector: 'caw-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'cinephoria-web';
  status = 'Loading...';

  constructor(private api: ConfigService) {}

  ngOnInit(): void {
    this.api.getHealth().subscribe({
      next: response => {
        this.status = response.status;
      },
      error: error => {
        console.error('Error fetching health status:', error);
        this.status = 'Error';
      },
    });
  }
}
