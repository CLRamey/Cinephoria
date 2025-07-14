/// <reference types="cypress" />

describe('Home e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil');
    cy.url().should('include', '/accueil');
  });

  it('should display the home page welcome message', () => {
    cy.get('h1').contains('Bienvenue chez Cinéphoria');
  });

  it('should navigate to films page upon clicking the end of page button', () => {
    cy.contains('button', 'Voir tous les films').click();
    cy.url().should('include', '/films');
  });

  it('should display the latest films or show no films message', () => {
    cy.get('caw-film-card').then(filmCards => {
      if (filmCards.length > 0) {
        cy.wrap(filmCards).should('be.visible');
      } else {
        cy.get('p[role="status"]').should(
          'contain.text',
          "Aucun film récent à afficher pour l'instant.",
        );
      }
    });
  });

  it('should show scroll buttons only if more than one film', () => {
    cy.get('caw-film-card').then(films => {
      if (films.length > 1) {
        cy.get('button.scroll-btn.left').should('be.visible').click();
        cy.get('button.scroll-btn.right').should('be.visible').click();
      } else {
        cy.get('button.scroll-btn.left').should('not.exist');
        cy.get('button.scroll-btn.right').should('not.exist');
      }
    });
  });

  it('should navigate to film details when selecting a film card', () => {
    cy.get('.film-card-container').first().click();
    cy.url().should('match', /\/films\/\d+$/);
    cy.get('h1').should('not.be.empty');
  });
});
