/// <reference types="cypress" />

describe('Reservation e2e Tests', () => {
  beforeEach(() => {
    // Navigate to the reservation page
    cy.visit('/accueil');
    cy.contains('nav a, button', 'Réservation').click();
    cy.url().should('include', '/reservation');
  });

  it('should display reservation page elements on initialisation', () => {
    cy.contains('h2.title', 'Réservations').should('be.visible');
    cy.contains(
      'p.subtitle',
      'Réservez vos places et profitez des meilleurs moments partager sur le grand écran.',
    ).should('be.visible');
    cy.contains('p', 'Veuillez sélectionner le cinéma et le film souhaités :').should('be.visible');
    cy.contains('mat-form-field', 'Cinéma').should('be.visible');
    cy.contains('mat-form-field', 'Films').should('be.visible');
    cy.contains('h3', 'Séances disponibles').should('be.visible');
    cy.contains(
      'p',
      'Veuillez sélectionner un cinéma et un film pour afficher les séances disponibles.',
    ).should('be.visible');
  });

  it('should detect and advise clients to choose a cinema and film to view the screenings if deselected filters', () => {
    // Select cinema and film
    cy.get('mat-form-field')
      .contains('Cinéma')
      .parent()
      .within(() => {
        cy.get('mat-select').should('exist').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).should('exist').click();

    cy.get('mat-form-field')
      .contains('Films')
      .parent()
      .within(() => {
        cy.get('mat-select').should('exist').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).should('exist').click();

    cy.contains('Séances disponibles').should('be.visible');
    cy.contains(
      'p',
      'Veuillez sélectionner un cinéma et un film pour afficher les séances disponibles.',
    ).should('not.exist');

    // Deselect cinema
    cy.get('mat-form-field')
      .contains('Cinéma')
      .parent()
      .within(() => {
        cy.get('mat-select').should('exist').click();
      });
    cy.get('mat-option').first().should('exist').click();
    // Check for advisory message
    cy.contains(
      'p',
      'Veuillez sélectionner un cinéma et un film pour afficher les séances disponibles.',
    ).should('be.visible');
  });

  it('should manage the seat selection correctly and update the recap accordingly', () => {
    // Select cinema
    cy.get('mat-form-field')
      .contains('Cinéma')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();

    // Select film
    cy.get('mat-form-field')
      .contains('Films')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();

    // Select screening
    cy.contains('Séances disponibles').should('be.visible');
    cy.get('caw-reservation-card').then(cards => {
      if (cards.length > 0) {
        cy.wrap(cards).should('have.length.greaterThan', 0);
        cy.get('.reservation-card button').contains('Réserver').first().click();
      } else {
        cy.contains("Aucune séance disponible pour l'instant.").should('exist');
        return;
      }
    });
    cy.contains('.seating-plan-section').should('not.exist');
    // Select the number of seats
    cy.get('mat-form-field')
      .contains('Nombre de personnes')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click(); //2
    cy.contains('h4.recap', 'Récapitulatif').should('not.exist');

    // Select first available seats
    cy.get('.seating-plan-section').should('be.visible');
    cy.get('.seat.available').first().click();
    cy.get('.seat.available').eq(1).click();
    cy.contains('h4.recap', 'Récapitulatif').should('be.visible');

    // Deselect and change seat selection
    cy.get('.seat.selected').first().click();
    cy.contains('h4.recap', 'Récapitulatif').should('not.exist');
    cy.get('.seat.available').eq(2).click();
    cy.contains('h4.recap', 'Récapitulatif').should('be.visible');

    // Change the number of seats
    cy.get('mat-form-field')
      .contains('Nombre de personnes')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(2).click(); //2
    cy.contains('h4.recap', 'Récapitulatif').should('not.exist');
  });
});

describe('Making reservations', () => {
  beforeEach(() => {
    // Navigate to the reservation page
    cy.visit('/accueil');
    cy.contains('nav a, button', 'Réservation').click();
    cy.url().should('include', '/reservation');

    // Select cinema
    cy.get('mat-form-field')
      .contains('Cinéma')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();

    // Select film
    cy.get('mat-form-field')
      .contains('Films')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();

    // Select screening
    cy.contains('Séances disponibles').should('be.visible');
    cy.get('caw-reservation-card').then(cards => {
      if (cards.length > 0) {
        cy.wrap(cards).should('have.length.greaterThan', 0);
        cy.get('.reservation-card button').contains('Réserver').first().click();
      } else {
        cy.contains("Aucune séance disponible pour l'instant.").should('exist');
        return;
      }
    });

    // Select the number of seats
    cy.get('mat-form-field')
      .contains('Nombre de personnes')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click(); //2

    // Select first available seat
    cy.get('.seating-plan-section').should('be.visible');
    cy.get('.seat.available').first().click();
    cy.get('.seat.available').eq(1).click();
  });

  it('should display recap information correctly', () => {
    // Verify recap information
    cy.contains('h4.recap', 'Récapitulatif').should('be.visible');
    cy.contains('Cinéma :').should('be.visible');
    cy.contains('Film :').should('be.visible');
    cy.contains('Date :').should('be.visible');
    cy.contains('Début :').should('be.visible');
    cy.contains('Fin :').should('be.visible');
    cy.contains('Nombre de places : 2').should('be.visible');
    cy.contains('Sièges sélectionnés :').should('be.visible');
    cy.contains('Qualité :').should('be.visible');
    cy.contains('Prix total :').should('be.visible');
  });

  it("should navigate to login page when clicking on 'Se connecter'", () => {
    cy.contains('Se connecter').should('be.visible');
    cy.contains('Se connecter').click();
    cy.url().should('include', '/login-client');
  });

  it("should navigate to signup page when clicking on 'Créer un compte'", () => {
    cy.contains('Créer un compte').should('be.visible');
    cy.contains('Créer un compte').click();
    cy.url().should('include', '/login-client/register');
  });

  it('should autofill the reservation selection for user to complete once logged in', () => {
    const email = Cypress.env('CYPRESS_CLIENT_TEST_USER_EMAIL');
    const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD');

    cy.contains('Se connecter').click();
    cy.url().should('include', '/login-client');

    // Login test client user
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password, { log: false });
    cy.get('input[formControlName="email"]').focus().blur();
    cy.get('button[type="submit"]').click();
    cy.wait(4000); // Wait for the login to complete
    cy.contains('nav a, button', 'Réservation').click();
    cy.url().should('include', '/reservation');

    // Verify recap information as everything must be filled to make this visible
    cy.contains('h4.recap', 'Récapitulatif').should('be.visible');
    cy.contains('Cinéma :').should('be.visible');
    cy.contains('Film :').should('be.visible');
    cy.contains('Date :').should('be.visible');
    cy.contains('Début :').should('be.visible');
    cy.contains('Fin :').should('be.visible');
    cy.contains('Nombre de places : 2').should('be.visible');
    cy.contains('Sièges sélectionnés :').should('be.visible');
    cy.contains('Qualité :').should('be.visible');
    cy.contains('Prix total :').should('be.visible');

    // Validate reservation
    cy.get('button.validate').click();

    // Wait for the reservation confirmation and redirection
    cy.wait(1000);
    cy.url().should('include', '/client');
  });
});

describe('Reservation when authenticated already', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.contains('button', 'Connexion').click();
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
  });

  it('should allow authenticated user to make a reservation directly', () => {
    const email = Cypress.env('CYPRESS_CLIENT_TEST_USER_EMAIL');
    const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD');

    cy.url().should('include', '/login-client');

    // Login test client user
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password, { log: false });
    cy.get('input[formControlName="email"]').focus().blur();
    cy.get('button[type="submit"]').click();
    cy.wait(4000); // Wait for the login to complete
    cy.contains('nav a, button', 'Réservation').click();
    cy.url().should('include', '/reservation');

    // Select cinema
    cy.get('mat-form-field')
      .contains('Cinéma')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();

    // Select film
    cy.get('mat-form-field')
      .contains('Films')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();

    // Select screening
    cy.contains('Séances disponibles').should('be.visible');
    cy.get('caw-reservation-card').then(cards => {
      if (cards.length > 0) {
        cy.wrap(cards).should('have.length.greaterThan', 0);
        cy.get('.reservation-card button').contains('Réserver').first().click();
      } else {
        cy.contains("Aucune séance disponible pour l'instant.").should('exist');
        return;
      }
    });

    // Select the number of seats
    cy.get('mat-form-field')
      .contains('Nombre de personnes')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click(); //2

    // Select first available seat
    cy.get('.seating-plan-section').should('be.visible');
    cy.get('.seat.available').first().click();
    cy.get('.seat.available').eq(1).click();

    // Verify recap information
    cy.contains('h4.recap', 'Récapitulatif').should('be.visible');
    cy.contains('Cinéma :').should('be.visible');
    cy.contains('Film :').should('be.visible');
    cy.contains('Date :').should('be.visible');
    cy.contains('Début :').should('be.visible');
    cy.contains('Fin :').should('be.visible');
    cy.contains('Nombre de places : 2').should('be.visible');
    cy.contains('Sièges sélectionnés :').should('be.visible');
    cy.contains('Qualité :').should('be.visible');
    cy.contains('Prix total :').should('be.visible');

    // Validate reservation
    cy.get('button.validate').click();

    // Wait for the reservation confirmation and redirection
    cy.wait(1000);
    cy.url().should('include', '/client');

    // Logout
    cy.contains('button', 'Mon Compte').click();
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('button', 'Déconnexion').should('exist').click({ force: true });
      });
    cy.wait(1000); // Wait for the logout to complete
    cy.url().should('include', '/accueil');
  });
});

describe('Confirmed Reservations', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.contains('button', 'Connexion').click();
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Client').should('exist').click({ force: true });
      });
  });

  it('should be seen in the client dedicated space', () => {
    const email = Cypress.env('CYPRESS_CLIENT_TEST_USER_EMAIL');
    const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD');

    cy.url().should('include', '/login-client');
    // Login test client user
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password, { log: false });
    cy.get('input[formControlName="email"]').focus().blur();
    cy.get('button[type="submit"]').click();
    cy.wait(4000); // Wait for the login to complete
    cy.url().should('include', '/client');

    cy.contains('h1', 'Commande').should('be.visible');
    cy.contains('p', 'Voici la liste de toutes vos commandes récentes.').should('be.visible');

    cy.contains('mat-panel-title', 'Réservation #').should('be.visible');
    cy.get('mat-accordion.reservation-list').should('be.visible');
    cy.get('mat-expansion-panel-header').first().click();
    cy.contains('mat-list-item', 'Cinéma:').should('be.visible');
    cy.contains('mat-list-item', 'Salle:').should('be.visible');
    cy.contains('mat-list-item', 'Nombre de places:').should('be.visible');
    cy.contains('mat-list-item', 'Sièges sélectionnés:').should('be.visible');
    cy.contains('mat-list-item', 'Total:').should('be.visible');
    cy.contains('mat-list-item', 'Statut:').should('be.visible');
    cy.contains('div.reservation-note', 'Paiement à régler au cinéma avant la séance.').should(
      'be.visible',
    );
    // Close reservation details
    cy.get('mat-expansion-panel-header').first().click();
  });
});
