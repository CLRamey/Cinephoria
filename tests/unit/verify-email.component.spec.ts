import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { VerifyEmailComponent } from '../../projects/cinephoria-web/src/app/features/auth/login-client/verify-email/verify-email.component';
import { VerificationService } from '../../projects/cinephoria-web/src/app/services/verification.service';

describe('VerifyEmailComponent', () => {
  let component: VerifyEmailComponent;
  let fixture: ComponentFixture<VerifyEmailComponent>;

  let mockVerificationService: jest.Mocked<VerificationService>;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    mockVerificationService = {
      verifyEmail: jest.fn().mockReturnValue(of({ success: true })),
    } as unknown as jest.Mocked<VerificationService>;

    await TestBed.configureTestingModule({
      declarations: [VerifyEmailComponent],
      providers: [
        { provide: VerificationService, useValue: mockVerificationService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: { get: (key: string) => (key === 'code' ? 'test-code' : null) },
            },
          },
        },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VerifyEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should verifyEmail on init with code from route and navigate to login page on success', () => {
    const verifyEmailSpy = jest.spyOn(mockVerificationService, 'verifyEmail');
    jest.useFakeTimers();
    component.ngOnInit();
    jest.advanceTimersByTime(6000);
    expect(verifyEmailSpy).toHaveBeenCalledWith('test-code');
    expect(component.isLoading).toBe(false);
    expect(component.isSuccess).toBe(true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login-client']);
  });

  it('should handle the isLoading and isSuccess states correctly on init', () => {
    mockVerificationService.verifyEmail.mockReturnValue(of({ success: true }));
    component.ngOnInit();
    expect(component.isLoading).toBe(false);
    expect(component.isSuccess).toBe(true);
  });

  it('should handle error when verification fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockVerificationService.verifyEmail.mockReturnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Email verification failed:', expect.any(Error));
    expect(component.isLoading).toBe(false);
    expect(component.isSuccess).toBe(false);
  });

  it('should navigate to login with the goToLogin method', () => {
    component.goToLogin();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login-client']);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
