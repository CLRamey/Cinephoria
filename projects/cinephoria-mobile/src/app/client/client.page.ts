import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../../projects/auth/src/lib/services/auth.service';
import {
  IonContent,
  IonHeader,
  IonToolbar,
  IonSpinner,
  IonItem,
  IonLabel,
  IonText,
  IonAccordion,
  IonAccordionGroup,
  IonButton,
  IonIcon,
  IonButtons,
  IonModal,
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ClientReservationsService } from '../../../../auth/src/lib/services/clientReservations.service';
import { Reservation } from '../../../../auth/src/lib/interfaces/user-interfaces';
import { QRCodeComponent } from 'angularx-qrcode';

@Component({
  selector: 'app-client',
  standalone: true,
  templateUrl: './client.page.html',
  styleUrls: ['./client.page.scss'],
  imports: [
    IonModal,
    IonButtons,
    IonIcon,
    IonButton,
    CommonModule,
    IonHeader,
    IonToolbar,
    IonContent,
    IonSpinner,
    IonItem,
    IonLabel,
    IonText,
    IonAccordion,
    IonAccordionGroup,
    QRCodeComponent,
  ],
})
export class ClientPageComponent implements OnInit, OnDestroy {
  // Loading and error states
  isLoading = false;
  hasError = false;

  // User reservations
  reservations: Reservation[] = [];

  // QR handling
  selectedQrCode: string | null = null;
  isQrOpen = false;

  // Constructor to inject necessary services
  constructor(
    private readonly clientReservationsService: ClientReservationsService,
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

  // Subscription to manage multiple observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to initialize component
  ngOnInit(): void {
    this.loadUserReservations();
  }

  // Method to load user reservations
  private loadUserReservations(): void {
    this.isLoading = true;
    const today = new Date(); // Todays date for filtering reservations
    today.setHours(0, 0, 0, 0); // Set to the start of the day
    const resub = this.clientReservationsService.getUserReservations().subscribe({
      next: response => {
        if (!response?.reservations) {
          this.isLoading = false;
          return;
        }
        this.reservations = response.reservations;
        this.reservations = response.reservations
          .filter(r => new Date(r.screening?.screeningDate ?? '') >= today)
          .sort((a, b) => {
            const dateA = new Date(a.screening?.screeningDate ?? '');
            const dateB = new Date(b.screening?.screeningDate ?? '');
            return dateB.getTime() - dateA.getTime();
          });
        this.hasError = false;
        this.isLoading = false;
      },
      error: () => {
        console.error('Error loading user reservations:');
        this.hasError = true;
        this.isLoading = false;
      },
    });
    this.subscriptions.add(resub);
  }

  // Method to open QR code modal
  openQrCode(qrData: string): void {
    this.selectedQrCode = qrData;
    this.isQrOpen = true;
  }

  // Method to close QR code modal
  closeQrCode(): void {
    this.isQrOpen = false;
    this.selectedQrCode = null;
  }

  // Method to handle user logout
  logout(): void {
    const logoutSub = this.authService
      .logoutSecurely()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.router.navigate(['/accueil']);
        },
      });
    this.subscriptions.add(logoutSub);
  }

  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
