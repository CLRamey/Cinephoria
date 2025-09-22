import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RegisterClientComponent } from '../../projects/cinephoria-web/src/app/features/auth/login-client/register-client/register-client.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterClientComponent – Integration Tests', () => {
  let component: RegisterClientComponent;
  let fixture: ComponentFixture<RegisterClientComponent>;
  let authServiceMock: jest.Mocked<AuthService>;
  let snackBarMock: Partial<MatSnackBar>;

  const mockFormValue = {
    firstName: 'Julien',
    lastName: 'Mathews',
    username: 'JueMat89',
    email: 'julien.mathews@example.com',
    password: 'StrongPassword1!',
    confirmPassword: 'StrongPassword1!',
    agreedPolicy: true,
    agreedCgvCgu: true,
  };

  beforeEach(async () => {
    authServiceMock = {
      isAuthenticated$: of(false),
      register: jest.fn().mockReturnValue(of({ success: true })),
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    snackBarMock = {
      open: jest.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [RegisterClientComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatCardModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call authService.register with form values on valid form and reset form on success', () => {
    authServiceMock.register.mockReturnValue(of({ success: true }));
    component.registerForm.setValue(mockFormValue);
    expect(component.registerForm.valid).toBe(true);
    expect(component.registerForm.value).toEqual(mockFormValue);
    component.onRegister();
    expect(authServiceMock.register).toHaveBeenCalledWith({
      userFirstName: 'Julien',
      userLastName: 'Mathews',
      userUsername: 'JueMat89',
      userEmail: 'julien.mathews@example.com',
      userPassword: 'StrongPassword1!',
      userRole: 'client',
      agreedPolicy: true,
      agreedCgvCgu: true,
    });
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.',
      'Fermer',
      { duration: 5000, verticalPosition: 'top', panelClass: 'snackbar-success' },
    );
    component.registerForm.reset();
    expect(component.showPassword).toBe(false);
    expect(component.registerForm.value).toEqual({
      firstName: null,
      lastName: null,
      username: null,
      email: null,
      password: null,
      confirmPassword: null,
      agreedPolicy: null,
      agreedCgvCgu: null,
    });
  });

  it('should show error message if registration fails', () => {
    authServiceMock.register.mockReturnValue(of({ success: false }));
    component.registerForm.setValue(mockFormValue);
    component.onRegister();
    expect(snackBarMock.open).toHaveBeenCalledWith(
      "Une erreur est survenue lors de l'inscription. Veuillez réessayer plus tard.",
      'Fermer',
      { duration: 5000, verticalPosition: 'top', panelClass: 'snackbar-error' },
    );
  });
});
