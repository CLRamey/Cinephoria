import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from './services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'caw-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
  // Initial status
  status = 'Loading...';

  // Constructor
  constructor(private readonly api: ApiService) {}

  // Subscription to manage multiple observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to load the API status when the app and component initializes
  ngOnInit(): void {
    const statusSub = this.api.getStatus().subscribe({
      next: data => {
        this.status = data.status;
      },
      error: () => (this.status = 'Error'),
    });
    this.subscriptions.add(statusSub);
  }

  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
