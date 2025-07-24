import { FormControl, FormGroup } from '@angular/forms';
import {
  nameValidator,
  usernameValidator,
  noWhitespaceValidator,
  passwordStrengthValidator,
  passwordMatchValidator,
} from '../../projects/auth/src/lib/validators/auth-validators'; // Adjust the import path

describe('Custom Validators', () => {
  describe('nameValidator', () => {
    const validator = nameValidator();

    it('should return null for valid names', () => {
      expect(validator(new FormControl('Julien'))).toBeNull();
      expect(validator(new FormControl('Mattéas'))).toBeNull();
      expect(validator(new FormControl('Éloise'))).toBeNull();
    });

    it('should return invalidName error for invalid names', () => {
      expect(validator(new FormControl('J'))).toEqual({ invalidName: true });
      expect(validator(new FormControl('J123'))).toEqual({ invalidName: true });
      expect(validator(new FormControl(' '))).toEqual({ invalidName: true });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('usernameValidator', () => {
    const validator = usernameValidator();
    it('should return null for valid usernames', () => {
      expect(validator(new FormControl('jule123'))).toBeNull();
      expect(validator(new FormControl('Matt98'))).toBeNull();
    });

    it('should return invalidUsername error for invalid usernames', () => {
      expect(validator(new FormControl('ab'))).toEqual({ invalidUsername: true });
      expect(validator(new FormControl('jule mat'))).toEqual({ invalidUsername: true });
      expect(validator(new FormControl('jule_mat'))).toEqual({ invalidUsername: true });
      expect(validator(new FormControl(' '))).toEqual({ invalidUsername: true });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('noWhitespaceValidator', () => {
    const validator = noWhitespaceValidator();

    it('should return whitespace error if value is only spaces', () => {
      expect(validator(new FormControl('    '))).toEqual({ whitespace: true });
      expect(validator(new FormControl('\t\n '))).toEqual({ whitespace: true });
    });

    it('should return null if value has non-whitespace characters', () => {
      expect(validator(new FormControl('text'))).toBeNull();
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('passwordStrengthValidator', () => {
    const validator = passwordStrengthValidator();

    it('should return null for strong password', () => {
      expect(validator(new FormControl('StrongP@ssw0rd123'))).toBeNull();
    });

    it('should return passwordStrength error for weak passwords', () => {
      expect(validator(new FormControl('weakpass'))).toEqual({ passwordStrength: true });
      expect(validator(new FormControl('NoNumber!@#'))).toEqual({ passwordStrength: true });
      expect(validator(new FormControl('noCharacters12345'))).toEqual({ passwordStrength: true });
      expect(validator(new FormControl('nocapitals!12345'))).toEqual({ passwordStrength: true });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('passwordMatchValidator', () => {
    const validator = passwordMatchValidator('password');

    it('should return null when passwords match', () => {
      const group = new FormGroup({
        password: new FormControl('StrongP@ssw0rd1'),
        confirmPassword: new FormControl('StrongP@ssw0rd1'),
      });
      expect(validator(group)).toBeNull();
      expect(group.get('confirmPassword')?.errors).toBeNull();
    });

    it('should return passwordMismatch error when passwords do not match', () => {
      const group = new FormGroup({
        password: new FormControl('StrongP@ssw0rd1'),
        confirmPassword: new FormControl('WrongPassword'),
      });
      expect(validator(group)).toEqual({ passwordMismatch: true });
      expect(group.get('confirmPassword')?.errors).toEqual({ passwordMismatch: true });
    });

    it('should handle missing controls gracefully', () => {
      const group1 = new FormGroup({
        password: new FormControl('abc'),
      });
      expect(validator(group1)).toBeNull();

      const group2 = new FormGroup({
        confirmPassword: new FormControl('abc'),
      });
      expect(validator(group2)).toBeNull();

      const emptyGroup = new FormGroup({});
      expect(validator(emptyGroup)).toBeNull();
    });
  });
});
