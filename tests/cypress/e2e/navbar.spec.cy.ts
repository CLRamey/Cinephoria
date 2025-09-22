/// <reference types="cypress" />

describe('Navbar e2e Tests', () => {
  beforeEach(() => {
    cy.visit('/accueil'); // Start on the home page before each test
    cy.wait(3000);
  });

  it('clicks on each link from the desktop menu and redirects to the correct page', () => {
    const links = [
      { text: 'Accueil', url: '/accueil' },
      { text: 'Films', url: '/films' },
      { text: 'Réservation', url: '/reservation' },
      { text: 'Contact', url: '/contact' },
    ];

    links.forEach(link => {
      cy.get('nav.desktop').contains(link.text).click(); // Upon clicking on each link in the desktop menu
      cy.url().should('include', link.url); // Verify that the URL includes the expected path
      cy.visit('/accueil'); // Returns to the home page after each link test
    });
  });

  it('uses the dropdown connection links correctly (desktop)', () => {
    cy.viewport(1280, 800); // Desktop

    cy.get('button[aria-label*="connexion"]').click();

    const dropdownLinks = [
      { text: 'Espace Client', url: '/login-client' },
      { text: 'Espace Employé', url: '/login-employee' },
      { text: 'Espace Administrateur', url: '/login-admin' },
    ];

    dropdownLinks.forEach(link => {
      cy.visit('/accueil');
      cy.get('button[aria-label="Ouvrir le menu de connexion"]').should('exist').click();
      cy.get('div.mat-mdc-menu-content')
        .should('be.visible')
        .within(() => {
          cy.contains(link.text).should('exist').click();
        });
      cy.url().should('include', link.url); // Verify that the URL includes the expected path
    });
  });

  it('has responsive menu displays and works correctly on mobile, tablet, and desktop', () => {
    const sizes = [
      { device: 'mobile', width: 375, height: 667 },
      { device: 'tablet', width: 768, height: 1024 },
      { device: 'desktop', width: 1280, height: 800 },
    ];

    const routes = [
      { text: 'Accueil', url: '/accueil' },
      { text: 'Films', url: '/films' },
      { text: 'Réservation', url: '/reservation' },
      { text: 'Contact', url: '/contact' },
      { text: 'Espace Client', url: '/login-client' },
      { text: 'Espace Employé', url: '/login-employee' },
      { text: 'Espace Administrateur', url: '/login-admin' },
    ];

    sizes.forEach(({ device, width, height }) => {
      cy.viewport(width, height);

      if (device === 'mobile' || device === 'tablet') {
        cy.get('button.mobile-toggle').should('be.visible').click(); // Verify that the mobile menu button is visible and can be clicked upon
        cy.get('mat-drawer.mobile-drawer').should('have.class', 'mat-drawer-opened'); // Confirm that the sidenav/mobile drawer opens

        routes.forEach(link => {
          cy.get('mat-drawer a').contains(link.text).click();
          cy.url().should('include', link.url);
          cy.visit('/accueil');
          cy.get('button.mobile-toggle').click();
        });
        cy.visit('/accueil'); // Return to the home page
      } else {
        cy.get('nav.desktop').should('be.visible'); // Desktop : Verify that the nav desktop is visible
      }
    });
  });

  it('has the navigation bar displayed and functional on all pages', () => {
    const pages = [
      '/accueil',
      '/films',
      '/reservation',
      '/contact',
      '/login-client',
      '/login-employee',
      '/login-admin',
    ];

    pages.forEach(page => {
      cy.visit(page);
      cy.get('header.navbar-header').should('be.visible');
      cy.get('nav.desktop').should('be.visible');
      // Verify that the logo is visible and clickable
      cy.get('a.logo').should('be.visible').click();
      cy.url().should('include', '/accueil');
    });
  });
});
