import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { AuthService } from '../../../../../../projects/auth/src/lib/services/auth.service';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Role } from '../../../../../../projects/auth/src/lib/interfaces/auth-interfaces';

@Component({
  selector: 'cad-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() logoClickEnabled: boolean = true;
  // Property to track authentication status
  isAuthenticated$!: Observable<boolean>;
  userRole$!: Observable<Role | null>;

  // Property to store the user role
  userRole: Role | null = null;

  // Store subscriptions for cleanup
  private readonly subscriptions: Subscription = new Subscription();

  // Constructor that injects the AuthService to manage authentication state.
  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.userRole$ = this.authService.userRole$;
  }

  // Lifecycle hook that runs when the component is initialized.
  ngOnInit(): void {
    const authSub = this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated === true) {
        const roleSub = this.authService.userRole$.subscribe(role => {
          this.userRole = role;
        });
        this.subscriptions.add(roleSub);
      }
    });
    this.subscriptions.add(authSub);
  }

  // Method to get the profile URL based on the user role
  get profileUrl(): string {
    switch (this.userRole as Role) {
      case Role.EMPLOYEE:
        return '/employee';
      default:
        return '/accueil';
    }
  }

  // Method to get the account label based on the user role
  get accountLabel(): string {
    switch (this.userRole as Role) {
      case Role.EMPLOYEE:
        return 'Incidents';
      default:
        return 'Mon Espace';
    }
  }

  // Method to log out the user
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

  // Lifecycle hook that runs when the component is destroyed to clean up subscriptions.
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
