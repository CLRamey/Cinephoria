import { FormControl } from '@angular/forms';
import {
  filmTitleValidator,
  filmDescriptionValidator,
  filmImgValidator,
  filmDurationValidator,
  filmMinimumAgeValidator,
  filmActiveDateValidator,
  positiveIntegerValidator,
  isIntegerValidator,
  isFutureDateValidator,
} from '../../projects/auth/src/lib/validators/staff-validators';

describe('Film Validators', () => {
  describe('filmTitleValidator', () => {
    const validator = filmTitleValidator();

    it('should return null for valid titles', () => {
      expect(validator(new FormControl('The Great Adventure'))).toBeNull();
      expect(validator(new FormControl("Cinéphoria 2, L'Aube"))).toBeNull();
      expect(validator(new FormControl("L'homme, l'ombre et le feu!"))).toBeNull();
    });

    it('should return invalidFilmTitle for invalid titles', () => {
      expect(validator(new FormControl('A'))).toEqual({ invalidFilmTitle: true });
      expect(validator(new FormControl('@bad#title'))).toEqual({ invalidFilmTitle: true });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('filmDescriptionValidator', () => {
    const validator = filmDescriptionValidator();

    it('should return null for valid descriptions', () => {
      const validDesc = 'An inspiring journey through time and space with unexpected twists.';
      expect(validator(new FormControl(validDesc))).toBeNull();
    });

    it('should return invalidFilmDescription for too short or invalid descriptions', () => {
      expect(validator(new FormControl('Too short'))).toEqual({ invalidFilmDescription: true });
      expect(validator(new FormControl('Invalid # symbols!'))).toEqual({
        invalidFilmDescription: true,
      });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('filmImgValidator', () => {
    const validator = filmImgValidator();

    it('should return null for valid image URLs', () => {
      expect(validator(new FormControl('https://example.com/image.webp'))).toBeNull();
      expect(validator(new FormControl('http://example.com/poster.jpg'))).toBeNull();
    });

    it('should return invalidFilmImg for invalid URLs or wrong extensions', () => {
      expect(validator(new FormControl('invalid_url'))).toEqual({ invalidFilmImg: true });
      expect(validator(new FormControl('https://example.com/file.txt'))).toEqual({
        invalidFilmImg: true,
      });
      expect(validator(new FormControl('short.webp'))).toEqual({ invalidFilmImg: true });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('filmDurationValidator', () => {
    const validator = filmDurationValidator();

    it('should return null for valid durations', () => {
      expect(validator(new FormControl(90))).toBeNull();
      expect(validator(new FormControl(250))).toBeNull();
    });

    it('should return invalidFilmDuration for invalid values', () => {
      expect(validator(new FormControl(10))).toEqual({ invalidFilmDuration: true });
      expect(validator(new FormControl(600))).toEqual({ invalidFilmDuration: true });
      expect(validator(new FormControl('abc'))).toEqual({ invalidFilmDuration: true });
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('filmMinimumAgeValidator', () => {
    const validator = filmMinimumAgeValidator();

    it('should return null for valid ages', () => {
      expect(validator(new FormControl(0))).toBeNull();
      expect(validator(new FormControl(12))).toBeNull();
      expect(validator(new FormControl(21))).toBeNull();
    });

    it('should return invalidFilmMinimumAge for invalid ages', () => {
      expect(validator(new FormControl(-1))).toEqual({ invalidFilmMinimumAge: true });
      expect(validator(new FormControl(22))).toEqual({ invalidFilmMinimumAge: true });
      expect(validator(new FormControl('abc'))).toEqual({ invalidFilmMinimumAge: true });
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('filmActiveDateValidator', () => {
    const validator = filmActiveDateValidator();

    it('should return null for a valid future Wednesday date', () => {
      // Find the next Wednesday in the future
      const today = new Date();
      const nextWednesday = new Date(today);
      nextWednesday.setDate(today.getDate() + ((3 + 7 - today.getDay()) % 7 || 7)); // next Wednesday
      nextWednesday.setHours(12);
      expect(validator(new FormControl(nextWednesday.toISOString()))).toBeNull();
    });

    it('should return notFutureDate for invalid or non-Wednesday dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const nextMonday = new Date();
      nextMonday.setDate(nextMonday.getDate() + ((1 + 7 - nextMonday.getDay()) % 7)); // Monday
      expect(validator(new FormControl(yesterday.toISOString()))).toEqual({ notFutureDate: true });
      expect(validator(new FormControl(nextMonday.toISOString()))).toEqual({ notFutureDate: true });
      expect(validator(new FormControl('invalid-date'))).toEqual({ notFutureDate: true });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('positiveIntegerValidator', () => {
    const validator = positiveIntegerValidator();

    it('should return null for valid positive integers', () => {
      expect(validator(new FormControl(1))).toBeNull();
      expect(validator(new FormControl(50))).toBeNull();
    });

    it('should return notPositiveInteger for invalid values', () => {
      expect(validator(new FormControl(0))).toEqual({ notPositiveInteger: true });
      expect(validator(new FormControl(-5))).toEqual({ notPositiveInteger: true });
      expect(validator(new FormControl(3.5))).toEqual({ notPositiveInteger: true });
      expect(validator(new FormControl('abc'))).toEqual({ notPositiveInteger: true });
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('isIntegerValidator', () => {
    const validator = isIntegerValidator();

    it('should return null for integers', () => {
      expect(validator(new FormControl(10))).toBeNull();
      expect(validator(new FormControl(-3))).toBeNull();
    });

    it('should return notPositiveInteger for non-integers', () => {
      expect(validator(new FormControl(3.5))).toEqual({ notPositiveInteger: true });
      expect(validator(new FormControl('abc'))).toEqual({ notPositiveInteger: true });
      expect(validator(new FormControl(null))).toBeNull();
    });
  });

  describe('isFutureDateValidator', () => {
    const validator = isFutureDateValidator();

    it('should return null for valid future dates', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      expect(validator(new FormControl(futureDate.toISOString()))).toBeNull();
    });

    it('should return notFutureDate for past or invalid dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);
      expect(validator(new FormControl(pastDate.toISOString()))).toEqual({ notFutureDate: true });
      expect(validator(new FormControl('invalid-date'))).toEqual({ notFutureDate: true });
      expect(validator(new FormControl(''))).toBeNull();
      expect(validator(new FormControl(null))).toBeNull();
    });
  });
});
