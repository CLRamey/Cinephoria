import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { LoginClientComponent } from '../../projects/cinephoria-web/src/app/features/auth/login-client/login-client.component';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';
import { SavedReservation } from '../../projects/cinephoria-web/src/app/interfaces/reservation';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ExtendedScreening } from '../../projects/cinephoria-web/src/app/interfaces/screening';

describe('LoginClientComponent', () => {
  let component: LoginClientComponent;
  let fixture: ComponentFixture<LoginClientComponent>;

  let mockAuthService: Partial<AuthService>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockRouter: Partial<Router>;
  let mockReservationService: Partial<ReservationService>;

  let userRoleSubject: BehaviorSubject<Role | null>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  const mockExtendedScreening: ExtendedScreening = {
    screeningId: 10,
    screeningDate: new Date('2026-08-27T17:00:00Z'),
    screeningStatus: 'active',
    cinemaId: 1,
    filmId: 12,
    roomId: 5,
    startTime: '17:00',
    endTime: '19:00',
    quality: 'HD',
    price: 10.0,
  };

  const mockSavedReservation: SavedReservation | null = {
    cinemaId: 1,
    filmId: 12,
    screeningId: 10,
    seatCount: 2,
    selectedSeats: [
      { seatId: 101, seatRow: 'A', seatNumber: 1, pmrSeat: false, roomId: 5, isReserved: false },
      { seatId: 102, seatRow: 'A', seatNumber: 2, pmrSeat: false, roomId: 5, isReserved: false },
    ],
    selectedSeatLabels: 'A1, A2',
    selectedScreening: [mockExtendedScreening],
  };

  beforeEach(async () => {
    userRoleSubject = new BehaviorSubject<Role | null>(null);
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthService = {
      loginCookieClient: jest.fn().mockReturnValue(of({})),
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      userRole$: userRoleSubject.asObservable(),
      getUserRole: jest.fn() as jest.Mock<Role | null>,
      logoutSecurely: jest.fn(),
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
      getSavedReservation: jest.fn().mockReturnValue(of([])),
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
    expect(mockAuthService.loginCookieClient).toHaveBeenCalledWith({
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
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/client']);
  });

  it('should handle login error and display error form', async () => {
    component.loginForm.get('email')?.setValue('client@example.com');
    component.loginForm.get('password')?.setValue('WrongPassword123!');
    mockAuthService.loginCookieClient = jest
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
    (mockReservationService.getSavedReservation as jest.Mock).mockReturnValue(
      of(mockSavedReservation),
    );
    component.loginForm.get('email')?.setValue('client@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(mockAuthService.loginCookieClient).toHaveBeenCalledWith({
      userEmail: 'client@example.com',
      userPassword: 'StrongPassword123!',
    });
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    await fixture.whenStable();
    expect(component.loginError).toBe(false);
    mockReservationService.getSavedReservation?.();
    expect(mockReservationService.getSavedReservation).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/client']);
    jest.setTimeout(4000);
    await new Promise(resolve => setTimeout(resolve, 1500));
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/reservation']);
  });

  it('should navigate to the client space on successful login', async () => {
    (mockReservationService.getSelectedScreening as jest.Mock).mockReturnValue(null);
    component.loginForm.get('email')?.setValue('client@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(mockAuthService.loginCookieClient).toHaveBeenCalledWith({
      userEmail: 'client@example.com',
      userPassword: 'StrongPassword123!',
    });
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    await fixture.whenStable();
    expect(component.loginError).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/client']);
  });

  it('should handle login error from authService', () => {
    jest
      .spyOn(mockAuthService, 'loginCookieClient')
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
