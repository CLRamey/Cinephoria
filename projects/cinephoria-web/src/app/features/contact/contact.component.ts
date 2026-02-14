import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  nameValidator,
  textValidator,
} from '../../../../../auth/src/lib/validators/auth-validators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'caw-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  contactForm: FormGroup;

  constructor(
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
  ) {
    this.contactForm = this.fb.group({
      name: [
        '',
        [Validators.required, Validators.minLength(2), Validators.maxLength(50), nameValidator()],
      ],
      email: ['', [Validators.required, Validators.email]],
      message: [
        '',
        [Validators.required, Validators.minLength(10), Validators.maxLength(500), textValidator()],
      ],
    });
  }
  // Method to handle form submission
  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      console.warn(
        'Formulaire de contact invalide. Veuillez corriger les erreurs avant de soumettre.',
      );
      return;
    }
    try {
      // Simulate form submission (e.g., send data to backend)
      this.contactForm.reset();
      // reset form state and deactivate button
      Object.keys(this.contactForm.controls).forEach(key => {
        const control = this.contactForm.get(key);
        control?.setErrors(null);
        control?.markAsUntouched();
      });
      this.snackBar.open(
        'Message envoyé avec succès ! Nous vous remercions de nous avoir contactés et répondrons à votre message dans les plus brefs délais.',
        'Fermer',
        {
          duration: 5000,
        },
      );
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire de contact:', error);
      this.snackBar.open(
        `Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer plus tard.`,
        'Fermer',
        {
          duration: 5000,
        },
      );
    }
  }
}
