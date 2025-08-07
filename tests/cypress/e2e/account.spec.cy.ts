/// <reference types="cypress" />
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' });

describe('Client login e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.contains('button', 'Connexion').click();
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
  });

  it('should display the login form correctly with disabled connection button', () => {
    cy.get('h2').contains('Connexion');
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should display errors for each required empty field', () => {
    cy.get('input[formControlName="email"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer une adresse e-mail.');
    cy.get('input[formControlName="password"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer votre mot de passe.');
  });

  it('should show validation error for invalid email address', () => {
    cy.get('input[formControlName="email"]').type('not-an-email');
    cy.get('input[formControlName="password"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer une adresse e-mail valide.');
  });

  it('should show an error message for incorrect credentials', () => {
    cy.get('input[formcontrolname="email"]').type('testingrandomemailaddress@madeupadress.com');
    cy.get('input[formcontrolname="password"]').type('StrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('mat-error').contains(
      "Nom d'utilisateur ou mot de passe incorrect, veuillez corriger les informations saisies.",
    );
    cy.url().should('include', '/login-client');
  });

  it('should empty the password field after a failed login and disable the submit button', () => {
    cy.get('input[formControlName="email"]').type('testingrandomemailaddress@madeupadress.com');
    cy.get('input[formControlName="password"]').type('StrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('input[formControlName="password"]').should('have.value', '');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should navigate to register page when button clicked', () => {
    cy.contains('Créer un compte').click();
    cy.url().should('include', '/register');
  });

  it('should toggle password visibility', () => {
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Afficher/Masquer mot de passe"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Afficher/Masquer mot de passe"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
  });
});

describe('Employee login e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.contains('button', 'Connexion').click();
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Employé').should('exist').click({ force: true });
      });
  });

  it('should display the login form correctly with disabled connection button', () => {
    cy.get('h2').contains('Connexion');
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should display errors for each required empty field', () => {
    cy.get('input[formControlName="email"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer une adresse e-mail.');
    cy.get('input[formControlName="password"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer votre mot de passe.');
  });

  it('should show validation error for invalid email address', () => {
    cy.get('input[formControlName="email"]').type('not-an-email');
    cy.get('input[formControlName="password"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer une adresse e-mail valide.');
  });

  it('should show an error message for incorrect credentials', () => {
    cy.get('input[formcontrolname="email"]').type('testingrandomemailaddress@madeupadress.com');
    cy.get('input[formcontrolname="password"]').type('StrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('mat-error').contains(
      "Nom d'utilisateur ou mot de passe incorrect, veuillez corriger les informations saisies.",
    );
    cy.url().should('include', '/login-employee');
  });

  it('should empty the password field after a failed login and disable the submit button', () => {
    cy.get('input[formControlName="email"]').type('testingrandomemailaddress@madeupadress.com');
    cy.get('input[formControlName="password"]').type('StrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('input[formControlName="password"]').should('have.value', '');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should toggle password visibility', () => {
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Afficher/Masquer mot de passe"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Afficher/Masquer mot de passe"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
  });
});

describe('Admin login e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.contains('button', 'Connexion').click();
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Administrateur').should('exist').click({ force: true });
      });
  });

  it('should display the login form correctly with disabled connection button', () => {
    cy.get('h2').contains('Connexion');
    cy.get('input[formControlName="email"]').should('be.visible');
    cy.get('input[formControlName="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should display errors for each required empty field', () => {
    cy.get('input[formControlName="email"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer une adresse e-mail.');
    cy.get('input[formControlName="password"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer votre mot de passe.');
  });

  it('should show validation error for invalid email address', () => {
    cy.get('input[formControlName="email"]').type('not-an-email');
    cy.get('input[formControlName="password"]').focus().blur();
    cy.get('mat-error').should('contain', 'Veuillez entrer une adresse e-mail valide.');
  });

  it('should show an error message for incorrect credentials', () => {
    cy.get('input[formcontrolname="email"]').type('testingrandomemailaddress@madeupadress.com');
    cy.get('input[formcontrolname="password"]').type('StrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('mat-error').contains(
      "Nom d'utilisateur ou mot de passe incorrect, veuillez corriger les informations saisies.",
    );
    cy.url().should('include', '/login-admin');
  });

  it('should empty the password field after a failed login and disable the submit button', () => {
    cy.get('input[formControlName="email"]').type('testingrandomemailaddress@madeupadress.com');
    cy.get('input[formControlName="password"]').type('StrongPassword123!');
    cy.get('button[type="submit"]').click();
    cy.get('input[formControlName="password"]').should('have.value', '');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should toggle password visibility', () => {
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
    cy.get('button[aria-label="Afficher/Masquer mot de passe"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'text');
    cy.get('button[aria-label="Afficher/Masquer mot de passe"]').click();
    cy.get('input[formControlName="password"]').should('have.attr', 'type', 'password');
  });
});
