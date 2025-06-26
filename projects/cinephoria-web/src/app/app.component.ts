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
      next: data => {
        this.status = data.status;
      },
      error: err => {
        console.error('Error fetching health status:', err);
        this.status = 'Error';
      },
      complete: () => {
        console.log('Health check completed');
      },
    });
  }
}
