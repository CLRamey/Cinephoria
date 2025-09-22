/// <reference types="cypress" />

describe('Inscription e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.wait(2000);
  });

  it('should access the registration form from the homepage', () => {
    cy.contains('button', 'Connexion').click();
    cy.wait(3000);
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
    cy.contains('button', 'Créer un compte').click();

    cy.url().should('include', '/register');
    cy.contains('Créer un compte').should('be.visible');
  });

  it('should display errors for each required empty field', () => {
    cy.contains('button', 'Connexion').click();
    cy.wait(3000);
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
    cy.contains('button', 'Créer un compte').click();

    cy.get('input[formcontrolname="firstName"]').focus().blur();
    cy.get('input[formcontrolname="lastName"]').focus().blur();
    cy.get('input[formcontrolname="username"]').focus().blur();
    cy.get('input[formcontrolname="email"]').focus().blur();
    cy.get('input[formcontrolname="password"]').focus().blur();
    cy.get('input[formcontrolname="confirmPassword"]').focus().blur();

    cy.contains('Veuillez entrer votre prénom.').should('exist');
    cy.contains('Veuillez entrer votre nom.').should('exist');
    cy.contains("Veuillez entrer un nom d'utilisateur.").should('exist');
    cy.contains('Veuillez entrer une adresse e-mail.').should('exist');
    cy.contains('Veuillez entrer un mot de passe.').should('exist');
    cy.contains('Veuillez confirmer votre mot de passe.').should('exist');
  });

  it('should display errors for each box if checked and then unchecked', () => {
    cy.contains('button', 'Connexion').click();
    cy.wait(3000);
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
    cy.contains('button', 'Créer un compte').click();

    cy.get('mat-checkbox[formcontrolname="agreedPolicy"] input[type="checkbox"]')
      .click({ force: true })
      .click({ force: true });
    cy.get('mat-checkbox[formcontrolname="agreedCgvCgu"] input[type="checkbox"]')
      .click({ force: true })
      .click({ force: true });
    cy.get('input[formcontrolname="firstName"]').focus().blur();

    cy.contains("L'acceptation de la politique de confidentialité est requise").should('exist');
    cy.contains("L'acceptation des CGU/CGV est requise").should('exist');
  });

  it('should display an error if the password is weak or not confirmed correctly', () => {
    cy.contains('button', 'Connexion').click();
    cy.wait(3000);
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
    cy.contains('button', 'Créer un compte').click();

    cy.get('input[formcontrolname="password"]').type('testing');
    cy.get('input[formcontrolname="confirmPassword"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true })
      .type('123');
    cy.get('input[formcontrolname="firstName"]').focus().blur();

    cy.contains('≥12 (majuscule, minuscule, chiffre, spécial)').should('exist');
    cy.contains('Les mots de passe ne correspondent pas.').should('exist');
  });

  it('should disable "Créer votre compte" button when form is empty', () => {
    cy.contains('button', 'Connexion').click();
    cy.wait(3000);
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').click({ force: true });
      });
    cy.contains('button', 'Créer un compte').click();
    cy.contains('button', 'Créer votre compte').should('exist').should('be.disabled');
  });

  it('should display a success snackbar after a successful registration and an error snackbar if the backend returns an error', () => {
    cy.intercept('POST', '/api/register-client', {
      statusCode: 200,
      body: { success: true },
    }).as('registerSuccess');

    const randomId = Date.now(); // or use uuid
    const username = `alicesmith${randomId}`;
    const email = `alice+${randomId}@example.com`;

    cy.contains('button', 'Connexion').click();
    cy.wait(3000);
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
    cy.contains('button', 'Créer un compte').click();

    cy.get('input[formcontrolname="firstName"]').type('Alice');
    cy.get('input[formcontrolname="lastName"]').type('Smith');
    cy.get('input[formcontrolname="username"]').type(username);
    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type('StrongPassword123!');
    cy.get('input[formcontrolname="confirmPassword"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true })
      .type('StrongPassword123!');
    cy.get('mat-checkbox[formcontrolname="agreedPolicy"] input').check({ force: true });
    cy.get('mat-checkbox[formcontrolname="agreedCgvCgu"] input').check({ force: true });

    cy.contains('button', 'Créer votre compte').click();
    cy.wait('@registerSuccess');
    cy.get('simple-snack-bar .mat-mdc-snack-bar-label')
      .should('be.visible')
      .and(
        'contain',
        'Inscription réussie ! Vérifiez votre boîte mail pour confirmer votre compte.',
      );

    // Repeat the registration for an error snackbar
    cy.intercept('POST', '/api/register-client', {
      statusCode: 400,
      body: { success: false },
    }).as('registerFail');

    cy.contains('button', 'Connexion').click();
    cy.wait(3000);
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
    cy.contains('button', 'Créer un compte').click();

    cy.get('input[formcontrolname="firstName"]').type('Alice');
    cy.get('input[formcontrolname="lastName"]').type('Smith');
    cy.get('input[formcontrolname="username"]').type(username);
    cy.get('input[formcontrolname="email"]').type(email);
    cy.get('input[formcontrolname="password"]').type('StrongPassword123!');
    cy.get('input[formcontrolname="confirmPassword"]')
      .should('exist')
      .should('be.visible')
      .should('not.be.disabled')
      .click({ force: true })
      .type('StrongPassword123!');
    cy.get('mat-checkbox[formcontrolname="agreedPolicy"] input').check({ force: true });
    cy.get('mat-checkbox[formcontrolname="agreedCgvCgu"] input').check({ force: true });

    cy.contains('button', 'Créer votre compte').click();
    cy.wait('@registerFail');
    cy.get('simple-snack-bar .mat-mdc-snack-bar-label')
      .should('be.visible')
      .and(
        'contain',
        "Une erreur est survenue lors de l'inscription. Veuillez réessayer plus tard.",
      );
  });
});
