import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'cad-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnDestroy {
  // Loading and error state properties
  isLoading: boolean = false;
  hasError: string | null = null;

  // Constructor to inject services and router
  constructor(private readonly router: Router) {}

  // Subscription to manage observables
  private readonly subscriptions: Subscription = new Subscription();

  // Method to navigate to login employee page
  goToLogin(): void {
    this.router.navigate(['/login-employee']);
  }

  // Lifecycle hook to clean up subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
