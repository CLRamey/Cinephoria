import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
import { EmployeeLoginComponent } from '../../projects/auth/src/lib/shared/employee-login/employee-token-login/employee-login.component';
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
import { MatDivider } from '@angular/material/divider';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('EmployeeLoginComponent', () => {
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

  it('should initialize the component with default values', () => {
    expect(component.showPassword).toBe(false);
    expect(component.loginError).toBe(false);
    expect(component.loginForm).toBeDefined();
  });

  it('should initialize the login form with empty values', () => {
    expect(component.loginForm.value).toEqual({
      email: '',
      password: '',
    });
  });

  it('should initialize the login form with correct validators', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.loginForm.get('email')?.validator).toBeDefined();
    expect(component.loginForm.get('password')?.validator).toBeDefined();
  });

  it('should not submit form if invalid', () => {
    component.loginForm.get('email')?.setValue('');
    component.loginForm.get('password')?.setValue('');
    component.onLogin();
    expect(component.loginForm.invalid).toBe(true);
    expect(mockAuthService.loginEmployee).not.toHaveBeenCalled();
  });

  it('should mark all fields as touched if the form is invalid', () => {
    component.loginForm.get('email')?.setValue('');
    component.loginForm.get('password')?.setValue('');
    component.onLogin();
    expect(component.loginForm.invalid).toBe(true);
    expect(component.loginForm.get('email')?.touched).toBe(true);
    expect(component.loginForm.get('password')?.touched).toBe(true);
    expect(mockAuthService.loginEmployee).not.toHaveBeenCalled();
    expect(mockSnackBar.open).not.toHaveBeenCalled();
  });

  it('should change the email to lowercase before login', () => {
    component.loginForm.get('email')?.setValue('TEST@EXAMPLE.COM');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(mockAuthService.loginEmployee).toHaveBeenCalledWith({
      userEmail: 'test@example.com',
      userPassword: 'StrongPassword123!',
    });
  });

  it('should call authService.loginEmployee on valid form submission', () => {
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(component.loginForm.invalid).toBe(false);
    expect(mockAuthService.loginEmployee).toHaveBeenCalled();
    expect(mockAuthService.loginEmployee).toHaveBeenCalledWith({
      userEmail: 'test@example.com',
      userPassword: 'StrongPassword123!',
    });
  });

  it('should handle login success to then navigate to employee space', async () => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.EMPLOYEE);
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('StrongPassword123!');
    component.onLogin();
    expect(component.loginForm.invalid).toBe(false);
    expect(mockAuthService.loginEmployee).toHaveBeenCalled();
    expect(mockAuthService.loginEmployee).toHaveBeenCalledWith({
      userEmail: 'test@example.com',
      userPassword: 'StrongPassword123!',
    });
  });

  it('should have the show password set to false on initialisation', () => {
    expect(component.showPassword).toBe(false);
  });

  it('should show password when toggle is clicked', () => {
    component.showPassword = false;
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
  });

  it('should hide password when toggle is clicked again', () => {
    component.showPassword = true;
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });
});
