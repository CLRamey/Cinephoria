import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RegisterClientComponent } from '../../projects/cinephoria-web/src/app/features/auth/login-client/register-client/register-client.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterClientComponent', () => {
  let component: RegisterClientComponent;
  let fixture: ComponentFixture<RegisterClientComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let dialogMock: Partial<MatDialog>;

  beforeEach(async () => {
    authServiceMock = {
      isAuthenticated$: of(false),
      register: jest.fn().mockReturnValue(of({ success: true })),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    dialogMock = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        NoopAnimationsModule,
      ],
      declarations: [RegisterClientComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create the component and initialize form', () => {
    expect(component).toBeTruthy();
    expect(component.registerForm).toBeDefined();
    expect(component.registerForm.controls.firstName).toBeDefined();
    expect(component.registerForm.controls.agreedPolicy.value).toBe(false);
  });

  it('should mark form invalid when empty and not submit', () => {
    component.onRegister();
    expect(component.registerForm.invalid).toBe(true);
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should open privacy policy dialog', () => {
    component.openPrivacyPolicy();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should open CGU/CGV dialog', () => {
    component.openCguCgv();
    expect(dialogMock.open).toHaveBeenCalled();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBe(false);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(true);
    component.togglePasswordVisibility();
    expect(component.showPassword).toBe(false);
  });

  it('should not call authService if form invalid', () => {
    component.onRegister();
    expect(authServiceMock.register).not.toHaveBeenCalled();
  });

  it('should set password mismatch error when passwords do not match', () => {
    component.registerForm.patchValue({
      password: 'Password123!',
      confirmPassword: 'Password1234!',
    });
    component.registerForm.updateValueAndValidity();
    expect(component.registerForm.errors).toEqual({ passwordMismatch: true });
    expect(component.registerForm.controls.confirmPassword.hasError('passwordMismatch')).toBe(true);
  });
});
