import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { EmployeeLoginComponent } from '../../projects/auth/src/lib/shared/employee-login/employee-token-login/employee-login.component';
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
import { MatDivider } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { throwError } from 'rxjs';

describe('EmployeeLoginComponent with Tokens', () => {
  let component: EmployeeLoginComponent;
  let fixture: ComponentFixture<EmployeeLoginComponent>;

  let mockAuthService: Partial<AuthService>;
  let mockSnackBar: Partial<MatSnackBar>;
  let mockRouter: Partial<Router>;

  let userRoleSubject: BehaviorSubject<Role | null>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;

  beforeEach(async () => {
    userRoleSubject = new BehaviorSubject<Role | null>(null);
    isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    mockAuthService = {
      loginEmployee: jest.fn().mockReturnValue(of({})),
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
      navigate: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        EmployeeLoginComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        MatDivider,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeeLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create the employee login component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loginSuccessSnackBar and resetForm on successful login', async () => {
    component.loginForm.get('email')?.setValue('employee@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(mockAuthService.loginEmployee).toHaveBeenCalledWith({
      userEmail: 'employee@example.com',
      userPassword: 'StrongPassword123!',
    });
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.EMPLOYEE);
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
    component.loginForm.get('email')?.setValue('employee@example.com');
    component.loginForm.get('password')?.setValue('WrongPassword123!');
    mockAuthService.loginEmployee = jest
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
});
