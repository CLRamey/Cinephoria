import { Component, OnInit } from '@angular/core';
import { ApiService } from './services/api.service';

@Component({
  selector: 'caw-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  status = 'Loading...';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getStatus().subscribe({
      next: data => {
        this.status = data.status;
      },
      error: () => (this.status = 'Error'),
    });
  }
}
