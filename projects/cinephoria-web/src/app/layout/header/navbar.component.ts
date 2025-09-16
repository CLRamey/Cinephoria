import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../../../../../projects/auth/src/lib/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Role } from '../../../../../../projects/auth/src/lib/interfaces/auth-interfaces';
import { ReservationService } from '../../services/reservation.service';

@Component({
  selector: 'caw-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit, OnDestroy {
  // ViewChild to access the sidenav in the template
  @ViewChild('drawer') drawer!: MatSidenav;

  // Property to track authentication status
  isAuthenticated$!: Observable<boolean>;
  userRole$!: Observable<Role | null>;

  // Property to store the user role
  userRole: Role | null = null;

  // Store subscriptions for cleanup
  private subscriptions: Subscription = new Subscription();

  // Constructor that injects the AuthService to manage authentication state.
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly reservationService: ReservationService,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.userRole$ = this.authService.userRole$;
  }

  // Lifecycle hook that runs when the component is initialized.
  ngOnInit(): void {
    const authSub = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        const roleSub = this.authService.userRole$.subscribe(role => {
          this.userRole = role;
        });
        this.subscriptions.add(roleSub);
      }
    });
    this.subscriptions.add(authSub);
  }

  // Method to open the sidenav
  open(): void {
    this.drawer.open();
  }
  // Method to close the sidenav
  close(): void {
    this.drawer.close();
  }

  // Method to get the profile URL based on the user role
  get profileUrl(): string {
    switch (this.userRole as Role) {
      case Role.CLIENT:
        return '/client';
      case Role.EMPLOYEE:
        return '/employee';
      case Role.ADMIN:
        return '/admin';
      default:
        return '/accueil';
    }
  }

  // Method to log out the user
  logout(): void {
    this.reservationService.clearStoredReservation();
    this.reservationService.clearSelectedScreening();
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

  // Lifecycle hook that runs when the component is destroyed to clean up subscriptions.
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
