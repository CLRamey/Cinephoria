import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { VerificationService } from '../../../../services/verification.service';

@Component({
  selector: 'caw-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss'],
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  // Properties to manage loading state, success state, and messages
  isLoading: boolean = true;
  isSuccess: boolean = false;

  // Constructor to inject necessary services
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly verificationService: VerificationService,
  ) {
    // Initialization logic can go here if needed
  }

  // Subscription to manage observables
  private subscriptions = new Subscription();

  // Lifecycle hook to handle email verification when the component initializes
  ngOnInit(): void {
    this.isLoading = true;
    this.isSuccess = false;
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      const verifySub = this.verificationService.verifyEmail(code).subscribe({
        next: () => {
          this.isLoading = false;
          this.isSuccess = true;
          setTimeout(() => {
            this.router.navigate(['/login-client']);
          }, 6000);
        },
        error: err => {
          this.isLoading = false;
          this.isSuccess = false;
          console.error('Email verification failed:', err);
        },
      });
      this.subscriptions.add(verifySub);
    }
  }

  // Method to navigate to the login page
  goToLogin(): void {
    this.router.navigate(['/login-client']);
  }

  // Lifecycle hook to clean up subscriptions
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
