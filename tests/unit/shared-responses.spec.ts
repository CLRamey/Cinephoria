import { TestBed } from '@angular/core/testing';
import {
  loginSuccessSnackBar,
  notAuthorizedSnackBar,
  catchErrorSnackBar,
  resetForm,
  errorForm,
} from '../../projects/auth/src/lib/shared/utils/shared-responses';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, FormGroup } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('Shared Responses', () => {
  let snackBar: jest.Mocked<MatSnackBar>;
  let openSpy: jest.SpyInstance;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
    }).compileComponents();
    snackBar = TestBed.inject(MatSnackBar) as jest.Mocked<MatSnackBar>;
    openSpy = jest.spyOn(snackBar, 'open');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('SnackBar messages', () => {
    it('should show success snackbar on loginSuccessSnackBar', () => {
      loginSuccessSnackBar(snackBar);
      expect(openSpy).toHaveBeenCalledWith(
        'Connexion réussie ! Redirection en cours...',
        'Fermer',
        {
          duration: 1000,
          verticalPosition: 'top',
          panelClass: 'snackbar-success',
        },
      );
    });

    it('should show not authorized snackbar on notAuthorizedSnackBar', () => {
      notAuthorizedSnackBar(snackBar);
      expect(openSpy).toHaveBeenCalledWith(
        "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
        'Fermer',
        {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: 'snackbar-error',
        },
      );
    });

    it('should show error snackbar on catchErrorSnackBar', () => {
      catchErrorSnackBar(snackBar);
      expect(openSpy).toHaveBeenCalledWith(
        'Une erreur est survenue. Veuillez réessayer plus tard.',
        'Fermer',
        {
          duration: 3000,
          verticalPosition: 'top',
          panelClass: 'snackbar-error',
        },
      );
    });
  });

  describe('Form utilities', () => {
    let mockForm: FormGroup;

    beforeEach(() => {
      mockForm = new FormGroup({
        email: new FormControl('test@example.com'),
        password: new FormControl('¨Password123!'),
      });
    });

    it('should reset form and clear errors in resetForm()', () => {
      mockForm.get('email')?.setErrors({ some: 'error' });
      mockForm.get('password')?.setErrors({ some: 'error' });
      resetForm(mockForm);
      expect(mockForm.get('email')?.errors).toBeNull();
      expect(mockForm.get('password')?.errors).toBeNull();
      expect(mockForm.pristine).toBe(true);
      expect(mockForm.untouched).toBe(true);
    });

    it('should clear password, set incorrect errors and mark controls as touched/dirty in errorForm()', () => {
      mockForm.get('password')?.setValue('password123');
      errorForm(mockForm);
      expect(mockForm.get('password')?.value).toBe('');
      Object.values(mockForm.controls).forEach(control => {
        expect(control.errors).toEqual({ incorrect: true });
        expect(control.touched).toBe(true);
        expect(control.dirty).toBe(true);
      });
    });
  });
});
