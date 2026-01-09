import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function incidentEquipmentValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const valid = /^[A-Za-z0-9À-ÿ\s.,-]{3,100}$/.test(value);
    return valid ? null : { invalidIncidentEquipment: true };
  };
}

export function incidentDescriptionValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const valid = /^[A-Za-zÀ-ÿ\s.,-]{10,255}$/.test(value);
    return valid ? null : { invalidIncidentDescription: true };
  };
}
