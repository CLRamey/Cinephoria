import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function filmTitleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const valid = /^[A-Za-z0-9À-ÿ\s'.,!?-]{3,100}$/.test(value);
    return valid ? null : { invalidFilmTitle: true };
  };
}

export function filmDescriptionValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const valid = /^[A-Za-zÀ-ÿ\s'.,!?-]{10,255}$/.test(value);
    return valid ? null : { invalidFilmDescription: true };
  };
}

export function filmImgValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;
    const minLength = 11;
    const maxLength = 255;
    const permittedCharacters = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|svg|webp))$/i.test(value);
    const valid = value.length >= minLength && value.length <= maxLength && permittedCharacters;
    return valid ? null : { invalidFilmImg: true };
  };
}

export function filmDurationValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) return null;

    const valid = !isNaN(value) && Number.isInteger(value) && value > 20 && value <= 500;
    return valid ? null : { invalidFilmDuration: true };
  };
}

export function filmMinimumAgeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) return null;
    const valid = !isNaN(value) && Number.isInteger(value) && value >= 0 && value <= 21;
    return valid ? null : { invalidFilmMinimumAge: true };
  };
}

// Validator to ensure the date is in the future and a Wednesday
export function filmActiveDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const date = new Date(value);
    const isValidDate = !isNaN(date.getTime());
    const isWednesday = isValidDate && date.getDay() === 3; // 3 represents Wednesday
    const isFutureDate = isValidDate && date > new Date();
    return isFutureDate && isWednesday ? null : { notFutureDate: true };
  };
}

export function positiveIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) return null;

    const valid = !isNaN(value) && Number.isInteger(value) && value > 0;
    return valid ? null : { notPositiveInteger: true };
  };
}

export function isIntegerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (value === null || value === undefined) return null;

    const valid = !isNaN(value) && Number.isInteger(value);
    return valid ? null : { notPositiveInteger: true };
  };
}

export function isFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const date = new Date(value);
    const isValidDate = !isNaN(date.getTime());
    const isFutureDate = isValidDate && date > new Date();

    return isFutureDate ? null : { notFutureDate: true };
  };
}
