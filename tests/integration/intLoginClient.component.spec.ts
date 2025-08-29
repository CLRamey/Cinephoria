import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { LoginClientComponent } from '../../projects/cinephoria-web/src/app/features/auth/login-client/login-client.component';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { throwError } from 'rxjs';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';
import { Screening } from '../../projects/cinephoria-web/src/app/interfaces/film';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('LoginClientComponent', () => {
  let component: LoginClientComponent;
  let fixture: ComponentFixture<LoginClientComponent>;

  let mockAuthService: Partial<AuthService>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockRouter: Partial<Router>;
  let mockReservationService: Partial<ReservationService>;

  let userRoleSubject: BehaviorSubject<Role | null>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  const mockScreening: Screening = {
    screeningId: 10,
    screeningDate: '2025-08-27T17:00:00Z',
    screeningStatus: 'active',
    cinemaId: 1,
    filmId: 12,
    roomId: 5,
  };

  beforeEach(async () => {
    userRoleSubject = new BehaviorSubject<Role | null>(null);
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthService = {
      loginClient: jest.fn().mockReturnValue(of({})),
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      userRole$: userRoleSubject.asObservable(),
      getUserRole: jest.fn() as jest.Mock<Role | null>,
      logout: jest.fn(),
      register: jest.fn(),
    };
    mockSnackBar = {
      open: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn().mockReturnValue(Promise.resolve(true)),
    };
    mockReservationService = {
      getSelectedScreening: jest.fn().mockReturnValue(of(null)),
    } as Partial<ReservationService> as ReservationService;

    await TestBed.configureTestingModule({
      declarations: [LoginClientComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        NoopAnimationsModule,
        MatDividerModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter },
        { provide: ReservationService, useValue: mockReservationService },
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create the client login component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loginSuccessSnackBar and resetForm on successful login', async () => {
    component.loginForm.get('email')?.setValue('client@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(mockAuthService.loginClient).toHaveBeenCalledWith({
      userEmail: 'client@example.com',
      userPassword: 'StrongPassword123!',
    });
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    await fixture.whenStable();
    expect(component.loginError).toBe(false);
    expect(component.loginForm.get('email')?.errors).toBeNull();
    expect(component.loginForm.get('password')?.errors).toBeNull();
    expect(component.loginForm.get('email')?.pristine).toBeTruthy();
    expect(component.loginForm.get('password')?.pristine).toBeTruthy();
    expect(component.loginForm.get('email')?.touched).toBe(false);
    expect(component.loginForm.get('password')?.touched).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Connexion réussie ! Redirection en cours...',
      'Fermer',
      {
        duration: 1000,
        verticalPosition: 'top',
        panelClass: 'snackbar-success',
      },
    );
    expect(window.location.href).toBeDefined();
  });

  it('should handle login error and display error form', async () => {
    component.loginForm.get('email')?.setValue('client@example.com');
    component.loginForm.get('password')?.setValue('WrongPassword123!');
    mockAuthService.loginClient = jest
      .fn()
      .mockReturnValue(throwError(() => new Error('Login failed')));
    component.onLogin();
    fixture.detectChanges();
    await fixture.whenStable();
    isAuthenticatedSubject.next(false);
    userRoleSubject.next(null);
    expect(component.loginError).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.loginForm.get('email')?.errors).toEqual({ incorrect: true });
    expect(component.loginForm.get('password')?.errors).toEqual({ incorrect: true });
    expect(component.loginForm.get('email')?.touched).toBe(true);
    expect(component.loginForm.get('password')?.touched).toBe(true);
    expect(component.loginForm.get('email')?.dirty).toBe(true);
    expect(component.loginForm.get('password')?.dirty).toBe(true);
    expect(component.loginForm.get('password')?.value).toBe('');
  });

  it('should navigate to reservation if there is a reservation in progress', async () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(mockScreening);
    component.loginForm.get('email')?.setValue('client@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(mockAuthService.loginClient).toHaveBeenCalledWith({
      userEmail: 'client@example.com',
      userPassword: 'StrongPassword123!',
    });
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    await fixture.whenStable();
    expect(component.loginError).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reservation']);
  });

  it('should use window.location.href to the client space on successful login', async () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(null);
    component.loginForm.get('email')?.setValue('client@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(mockAuthService.loginClient).toHaveBeenCalledWith({
      userEmail: 'client@example.com',
      userPassword: 'StrongPassword123!',
    });
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    await fixture.whenStable();
    expect(component.loginError).toBe(false);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(window.location.href).toBeDefined();
  });

  it('should handle login error from authService', () => {
    jest
      .spyOn(mockAuthService, 'loginClient')
      .mockReturnValue(throwError(() => new Error('Invalid credentials')));
    component.loginForm.setValue({
      email: 'test@test.com',
      password: 'Password123!',
    });
    component.onLogin();
    expect(component.loginError).toBe(true);
    expect(component.loginForm.get('email')?.errors).toEqual({ incorrect: true });
    expect(component.loginForm.get('password')?.errors).toEqual({ incorrect: true });
  });
});
