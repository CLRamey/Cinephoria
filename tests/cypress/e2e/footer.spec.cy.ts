/// <reference types="cypress" />

describe('Footer e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil');
  });

  const pages = [
    '/accueil',
    '/films',
    '/reservation',
    '/contact',
    '/login-client',
    '/login-employee',
    '/login-admin',
  ];

  const sizes = [
    { device: 'mobile', width: 375, height: 667 },
    { device: 'tablet', width: 768, height: 1024 },
    { device: 'desktop', width: 1280, height: 800 },
  ];

  it('The footer is responsive and visible on mobile, tablet, and desktop', () => {
    sizes.forEach(({ device: _device, width, height }) => {
      cy.viewport(width, height);

      pages.forEach(page => {
        cy.visit(page);
        cy.get('footer.footer').should('be.visible');
      });
    });
  });

  it('should display the cinema information', () => {
    cy.visit('/accueil');
    cy.get('footer', { timeout: 10000 }).should('be.visible');

    cy.get('footer').within(() => {
      cy.contains('Cinémas').should('exist');
      cy.contains('Cinéphoria Bordeaux', { timeout: 5000 }).should('exist');
      cy.contains('8 place du Palais', { timeout: 5000 }).should('exist');
      cy.contains('33000 Bordeaux', { timeout: 5000 }).should('exist');
      cy.contains('France', { timeout: 5000 }).should('exist');
      cy.contains('Téléphone : +33 5 56 00 00 02', { timeout: 5000 }).should('exist');
      cy.contains('Lundi - Samedi : 10h00 - 23h00', { timeout: 5000 }).should('exist');
      cy.contains('© 2025 Cinéphoria. Tous droits réservés.', { timeout: 5000 }).should('exist');
    });
  });
});
