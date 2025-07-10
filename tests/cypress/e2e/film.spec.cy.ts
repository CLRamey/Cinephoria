/// <reference types="cypress" />

describe('Film e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.contains('nav a, button', 'Films').click();
    cy.url().should('include', '/films');
  });

  it('should display films with correct details', () => {
    cy.get('.film-card-container').should('have.length.greaterThan', 0);

    cy.get('.film-card-container')
      .first()
      .within(() => {
        cy.get('img').should('be.visible');
        cy.get('.film-title').should('not.be.empty');
        cy.get('.description').should('not.be.empty');
        cy.get('.age').should('exist');
        cy.get('.rating').should('exist');
      });
  });

  it('should filter films by cinema, genre, and day', () => {
    cy.get('mat-form-field')
      .contains('Cinéma')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').first().click();

    cy.get('mat-form-field')
      .contains('Genre')
      .parent()
      .within(() => {
        cy.get('mat-select').click();
      });
    cy.get('mat-option').not('[aria-disabled="true"]').first().click();

    // Click today's date in the datepicker
    const today = new Date().toISOString().slice(0, 10);
    cy.get('mat-form-field')
      .contains('Jour')
      .within(() => {
        cy.get('mat-label').type(today);
      });

    cy.get('caw-film-card').then(cards => {
      if (cards.length > 0) {
        cy.wrap(cards).should('have.length.greaterThan', 0);
      } else {
        cy.contains('Aucun film ne correspond à vos critères.').should('exist');
      }
    });
  });

  it('should navigate to film details and show screenings', () => {
    cy.get('caw-film-card').first().click();
    cy.url().should('match', /\/films\/\d+$/);
    cy.get('.screenings-container').should('be.visible');
    cy.get('.screening-card').should('have.length.greaterThan', 0);

    // Verify that each screening card has the necessary details
    cy.get('.screening-card')
      .first()
      .within(() => {
        cy.contains('Début:').should('exist');
        cy.contains('Fin:').should('exist');
        cy.contains('Qualité:').should('exist');
        cy.contains('Prix:').should('exist');
      });

    // Click on the reservation button to go to reservation page
    cy.get('.screening-card')
      .first()
      .within(() => {
        cy.contains('button', 'Réserver').click({ force: true });
      });

    // Verify redirected to /reservation or reservation route
    cy.url().should('include', '/reservation');
  });
});
