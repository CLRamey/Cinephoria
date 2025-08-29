import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClientReservationsService } from '../../../../../../projects/auth/src/lib/services/clientReservations.service';
import { Reservation } from 'projects/auth/src/lib/interfaces/user-interfaces';
import { Subscription } from 'rxjs';

@Component({
  selector: 'caw-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
})
export class ClientComponent implements OnInit, OnDestroy {
  // Loading and error states
  isLoading: boolean = false;
  hasError: boolean = false;

  // User reservations
  reservations: Reservation[] = [];

  // Constructor to inject necessary services
  constructor(private readonly clientReservationsService: ClientReservationsService) {}

  // Subscription to manage multiple observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to initialize component
  ngOnInit(): void {
    this.loadUserReservations();
  }

  // Method to load user reservations
  private loadUserReservations(): void {
    this.isLoading = true;
    const resSub = this.clientReservationsService.getUserReservations().subscribe({
      next: response => {
        if (!response || !response.reservations) {
          this.isLoading = false;
          return;
        }
        this.reservations = response.reservations;
        this.reservations.sort((a, b) => {
          const dateA = new Date(a.screening?.screeningDate ?? '');
          const dateB = new Date(b.screening?.screeningDate ?? '');
          return dateB.getTime() - dateA.getTime();
        });
        this.hasError = false;
        this.isLoading = false;
      },
      error: () => {
        console.error('Error loading user reservations');
        this.hasError = true;
        this.isLoading = false;
      },
    });
    this.subscriptions.add(resSub);
  }

  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
