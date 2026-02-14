/// <reference types="cypress" />

describe('Admin zone e2e Tests', () => {
  beforeEach(() => {
    const email = Cypress.env('CYPRESS_ADMIN_TEST_USER_EMAIL');
    const password = Cypress.env('CYPRESS_TEST_USER_PASSWORD');
    cy.visit('/accueil');
    cy.contains('button', 'Connexion').click();
    cy.get('div.mat-mdc-menu-content')
      .should('be.visible')
      .within(() => {
        cy.contains('a', 'Espace Administrateur').should('exist').click({ force: true });
      });
    cy.get('input[formControlName="email"]').type(email);
    cy.get('input[formControlName="password"]').type(password, { log: false });
    cy.get('input[formControlName="email"]').focus().blur();
    cy.get('button[type="submit"]').click();
    cy.wait(3000); // Wait for the login to complete
    cy.url().should('include', '/admin');
  });

  it('should display the admin dashboard title and reservation stats section', () => {
    cy.contains('h1', 'Administration').should('be.visible');
    cy.contains('h2', 'Réservations récentes').should('be.visible');
    cy.contains(
      'Veuillez trouver ci-dessous le nombre total de réservations par film au cours des 7 derniers jours :',
    ).should('be.visible');
  });

  // Film section
  it('should display films table with correct headers and add film buttons', () => {
    cy.get('.film-section h2').should('contain.text', 'Les Films');
    cy.contains('Veuillez trouver ci-dessous les films actifs :').should('be.visible');
    cy.get('.film-section .add-film-button button')
      .should('contain.text', 'Ajouter un Film')
      .and('be.visible');

    cy.get('[data-cy="film-table"]').within(() => {
      cy.get('th').eq(0).should('contain.text', 'Film');
      cy.get('th').eq(1).should('contain.text', 'Durée');
      cy.get('th').eq(2).should('contain.text', 'Favori');
      cy.get('th').eq(3).should('contain.text', 'Âge Minimum');
      cy.get('th').eq(4).should('contain.text', 'Date de Sortie');
      cy.get('th').eq(5).should('contain.text', 'Actions');

      cy.get('td.action-buttons button[aria-label="Modifier"]').first().should('exist');
      cy.get('td.action-buttons button[aria-label="Désactiver"]').first().should('exist');
    });
  });

  it('should have all the required fields to create a new film', () => {
    cy.get('.film-section .add-film-button button')
      .should('contain.text', 'Ajouter un Film')
      .and('be.visible')
      .click();
    cy.get('h3').contains('Ajouter un film').should('be.visible');
    cy.get('input[formControlName="filmTitle"]').should('exist');
    cy.get('textarea[formControlName="filmDescription"]').should('exist');
    cy.get('input[formControlName="filmImg"]').should('exist');
    cy.contains('mat-hint', 'https://example.com/img.webp').should('exist');
    cy.get('input[formControlName="filmDuration"]').should('exist');
    cy.get('input[formControlName="filmMinimumAge"]').should('exist');
    cy.get('input[formControlName="filmActiveDate"]').should('exist');
    cy.get('mat-select[formControlName="genre1"]').should('exist');
    cy.get('mat-select[formControlName="genre2"]').should('exist');
    cy.get('mat-checkbox[formControlName="filmFavorite"]').should('exist');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should create a new film when the form is valid', () => {
    cy.get('.film-section .add-film-button button')
      .should('contain.text', 'Ajouter un Film')
      .and('be.visible')
      .click();
    // calculate next wednesday and then type it in the date box
    const today = new Date();
    const daysUntilWednesday = (3 - today.getDay() + 7) % 7 || 7;
    const nextWednesday = new Date(today);
    nextWednesday.setDate(today.getDate() + daysUntilWednesday);
    const formattedDate = nextWednesday.toISOString().split('T')[0];
    const now = new Date();
    const newDay = now.toISOString().split('T')[0];
    cy.get('input[formControlName="filmTitle"]').type(`Nouveau Film ${newDay}`);
    cy.get('textarea[formControlName="filmDescription"]').type('Description du nouveau film.');
    cy.get('input[formControlName="filmImg"]').type('https://example.com/nouveau-film.webp');
    cy.get('input[formControlName="filmDuration"]').clear().type('120');
    cy.get('input[formControlName="filmMinimumAge"]').clear().type('13');
    cy.get('input[formControlName="filmActiveDate"]').click();
    cy.get('input[formControlName="filmActiveDate"]').type(formattedDate);
    cy.get('mat-select[formControlName="genre1"]').click();
    cy.get('mat-option').contains('Aventure').click();
    cy.get('mat-checkbox[formControlName="filmFavorite"] input[type="checkbox"]').click({
      force: true,
    });
    cy.wait(1000); // Wait for form validations to complete
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait(1000);
    cy.get('form.film-dialog-form').should('not.exist');
    cy.get('[data-cy="film-table"]').contains('td', `Nouveau Film ${newDay}`).should('be.visible');
  });

  it('should open modify film dialog with pre-filled data and make change to an element', () => {
    //just month and day to avoid issues with characters
    const now = new Date();
    const newDay = now.toISOString().split('T')[0];
    cy.get('[data-cy="film-table"] tbody tr')
      .filter((_, row) => row.innerText.includes(`Nouveau Film ${newDay}`))
      .within(() => {
        cy.get('button[aria-label="Modifier"]').click();
      });
    cy.get('h3').contains('Modifier un film').should('be.visible');
    cy.get('input[formControlName="filmTitle"]').should('have.value', `Nouveau Film ${newDay}`);
    cy.get('textarea[formControlName="filmDescription"]').should(
      'have.value',
      'Description du nouveau film.',
    );
    cy.get('input[formControlName="filmImg"]').should(
      'have.value',
      'https://example.com/nouveau-film.webp',
    );
    cy.get('input[formControlName="filmDuration"]').should('have.value', '120');
    cy.get('input[formControlName="filmMinimumAge"]').should('have.value', '13');
    cy.get('input[formControlName="filmActiveDate"]').should('exist');
    cy.get('mat-select[formControlName="genre1"]').should('contain.text', 'Aventure');
    cy.get('mat-checkbox[formControlName="filmFavorite"] input[type="checkbox"]').should(
      'be.checked',
    );
    cy.get('textarea[formControlName="filmDescription"]')
      .clear()
      .type('Description du nouveau film encore plus détaillée.')
      .blur();
    cy.wait(1000);
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait(1000);
    cy.get('form.film-dialog-form').should('not.exist');
  });

  it('should delete the film created in the test', () => {
    const now = new Date();
    const newDay = now.toISOString().split('T')[0];
    cy.get('[data-cy="film-table"] tbody tr')
      .filter((_, row) => row.innerText.includes(`Nouveau Film ${newDay}`))
      .within(() => {
        cy.get('button[aria-label="Désactiver"]').click();
      });
    cy.get('mat-dialog-container').within(() => {
      cy.contains('h2', 'Désactiver le film').should('be.visible');
      cy.contains(`Êtes-vous sûr de vouloir désactiver le film "Nouveau Film ${newDay}" ?`).should(
        'be.visible',
      );
      cy.contains('button', 'Désactiver').click();
    });
  });

  // Cinema section
  it('should display cinema selection dropdown and load rooms and screenings after selecting a cinema', () => {
    cy.get('.cinema-section h2').should('contain.text', 'Sélectionnez un Cinéma');
    cy.contains('Veuillez sélectionner un cinéma pour voir les salles et les séances :').should(
      'be.visible',
    );
    cy.contains('Veuillez sélectionner un cinéma pour voir les salles disponibles.').should(
      'be.visible',
    );
    cy.contains('Veuillez sélectionner un cinéma pour voir les séances programmées :').should(
      'be.visible',
    );
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.room-section h2').should('contain.text', 'Les Salles');
    cy.contains('Veuillez trouver ci-dessous les salles disponibles dans le cinéma :').should(
      'be.visible',
    );
    cy.get('.add-room-button button').should('contain.text', 'Ajouter une Salle').and('be.visible');

    cy.get('.screening-section h2').should('contain.text', 'Les Séances');
    cy.contains('Veuillez sélectionner une salle pour voir les séances programmées.').should(
      'be.visible',
    );
    cy.get('.screening-section mat-form-field').contains('Choisir une salle').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.contains(
      'Si vous aimeriez consulter les séances pour un film spécifique ou créer un film, veuillez sélectionner le film :',
    ).should('be.visible');
    cy.contains(
      'Veuillez trouver ci-dessous les séances programmées dans le cinéma sélectionnés :',
    ).should('be.visible');
    cy.get('.screening-section mat-form-field').contains('Choisir un film').should('exist').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('.add-screening-button button')
      .should('contain.text', 'Ajouter une Séance')
      .and('be.visible');
  });

  // Room section
  it('all the required fields to create a new room are present and button not active', () => {
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.add-room-button button').should('contain.text', 'Ajouter une Salle').and('be.visible');
    cy.get('.add-room-button button').click();
    cy.get('h3').contains('Créer une salle').should('be.visible').click();
    cy.contains('div.cinema-header', 'Cinéma :').should('be.visible');
    cy.contains(
      'span.subtitle',
      'Veuillez compléter les champs ci-dessous pour créer une nouvelle salle.',
    ).should('be.visible');
    cy.get('input[formControlName="roomNumber"]').should('exist');
    cy.get('input[formControlName="numRows"]').should('exist');
    cy.get('input[formControlName="seatsPerRow"]').should('exist');
    cy.get('mat-select[formControlName="qualityId"]').should('exist');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should create a new room when the form is valid', () => {
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.add-room-button button').should('contain.text', 'Ajouter une Salle').and('be.visible');
    cy.get('.add-room-button button').click();
    const roomNum = 19;
    cy.get('input[formControlName="roomNumber"]').clear().type(roomNum.toString());
    cy.contains(
      'Veuillez spécifier le nombre de rangées et le nombre de sièges par rangée (une capacité minimale de 20 sièges est requise pour créer une salle avec succès.)',
    ).should('be.visible');
    cy.get('input[formControlName="numRows"]').clear().type('5');
    cy.get('input[formControlName="seatsPerRow"]').clear().type('10');
    cy.contains('div.capacity-info', 'Nouvelle capacité totale :').should('be.visible');
    cy.get('div.capacity-info').contains('50').should('be.visible');
    cy.get('mat-select[formControlName="qualityId"]').click();
    cy.get('mat-option').first().click();
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait(1000);
    cy.get('form.room-dialog-form').should('not.exist');
  });

  it('should display room table with correct headers when rooms are loaded', () => {
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('[data-cy="room-table"]').within(() => {
      cy.get('th').eq(0).should('contain.text', 'Numéro');
      cy.get('th').eq(1).should('contain.text', 'Capacité Totale');
      cy.get('th').eq(2).should('contain.text', 'Qualité');
      cy.get('th').eq(3).should('contain.text', 'Cinéma');
      cy.get('th').eq(4).should('contain.text', 'Actions');
      cy.get('td.action-buttons button[aria-label="Modifier"]').first().should('exist');
      cy.get('td.action-buttons button[aria-label="Désactiver"]').first().should('exist');
    });
  });

  it('should open modify room dialog with pre-filled data and allow editing', () => {
    const roomNum = 19;
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(3000); // Wait for rooms and screenings to load
    cy.get('[data-cy="room-table"] tbody tr')
      .filter((_, row) => row.innerText.includes(`${roomNum}`))
      .within(() => {
        cy.get('button[aria-label="Modifier"]').click();
      });
    cy.get('h3').contains('Modifier une salle').should('be.visible');
    cy.get('input[formControlName="roomNumber"]').should('be.disabled');
    cy.get('input[formControlName="numRows"]').clear().type('6');
    cy.get('input[formControlName="seatsPerRow"]').clear().type('12');
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait(1000);
    cy.get('form.room-dialog-form').should('not.exist');
  });

  it('should delete the room created in the test', () => {
    const roomNum = 19;
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('[data-cy="room-table"] tbody tr')
      .filter((_, row) => row.innerText.includes(`${roomNum}`))
      .within(() => {
        cy.get('button[aria-label="Désactiver"]').click();
      });
    cy.get('mat-dialog-container').within(() => {
      cy.contains('h2', 'Supprimer la salle').should('be.visible');
      cy.contains(`Êtes-vous sûr de vouloir supprimer la salle "${roomNum}" ?`).should(
        'be.visible',
      );
      cy.contains('button', 'Supprimer').click();
    });
    cy.contains(`Salle "${roomNum}" supprimée avec succès.`, { timeout: 5000 }).should(
      'be.visible',
    );
    cy.contains('[data-cy="room-table"] tbody tr', roomNum.toString()).should('not.exist');
  });

  // Screening section
  it('should display screening table with correct headers when screenings are loaded', () => {
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir une salle').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('[data-cy="screening-table"]').within(() => {
      cy.get('th').eq(0).should('contain.text', 'Date & Heure');
      cy.get('th').eq(1).should('contain.text', 'Cinéma');
      cy.get('th').eq(2).should('contain.text', 'Salle');
      cy.get('th').eq(3).should('contain.text', 'Film');
      cy.get('th').eq(4).should('contain.text', 'Actions');
    });
  });

  it('all the required fields to create a new screening are present and button not active', () => {
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir une salle').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir un film').should('exist').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('.add-screening-button button')
      .should('contain.text', 'Ajouter une Séance')
      .and('be.visible')
      .click();
    cy.get('h3').contains('Créer une séance').should('be.visible');
    cy.get('input[formControlName="date"]').should('exist');
    cy.get('input[formControlName="time"]').should('exist');
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('should create a new screening when the form is valid', () => {
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir une salle').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir un film').should('exist').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('.add-screening-button button')
      .should('contain.text', 'Ajouter une Séance')
      .and('be.visible')
      .click();
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    cy.get('input[formControlName="date"]').clear().type(tomorrow.toISOString().slice(0, 10));
    cy.get('input[formControlName="time"]').clear().type('22:00');
    cy.get('button[type="submit"]').should('not.be.disabled').click();
    cy.wait(1000);
    cy.get('form.screening-dialog-form').should('not.exist');
  });

  it('should modify an existing screening', () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    // format tomorrow to dd/mm/yyyy
    const formattedDate = tomorrow.toISOString().slice(0, 10).split('-').reverse().join('/');
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir une salle').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir un film').should('exist').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    // filter screenings to find the one made in the previous test
    cy.get('[data-cy="screening-table"] tbody tr')
      .filter((_, row) => row.innerText.includes(`${formattedDate} 22:00`))
      .within(() => {
        cy.get('button[aria-label="Modifier"]').click();
      });
    cy.get('input[formControlName="date"]').clear().type(tomorrow.toISOString().slice(0, 10));
    cy.get('input[formControlName="time"]').clear().type('23:00');
    cy.contains('button', 'Mettre à jour').should('not.be.disabled').click();
    cy.wait(1000);
    cy.get('form.screening-dialog-form').should('not.exist');
  });

  it('should delete the screening created in the test', () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    // format tomorrow to dd/mm/yyyy
    const formattedDate = tomorrow.toISOString().slice(0, 10).split('-').reverse().join('/');
    cy.get('.cinema-section mat-form-field').contains('Choisir un cinéma').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for rooms and screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir une salle').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    cy.get('.screening-section mat-form-field').contains('Choisir un film').should('exist').click();
    cy.get('mat-option').not('[aria-disabled="true"]').eq(1).click();
    cy.wait(2000); // Wait for screenings to load
    // filter screenings to find the one made in the previous test
    cy.get('[data-cy="screening-table"] tbody tr')
      .filter((_, row) => row.innerText.includes(`${formattedDate} 23:00`))
      .within(() => {
        cy.get('button[aria-label="Supprimer"]').click();
      });
    cy.get('mat-dialog-container').within(() => {
      cy.contains(
        `Êtes-vous sûr de vouloir supprimer la séance "${tomorrow.toISOString().slice(0, 10)} 23:00" ?`,
      ).should('be.visible');
      cy.get('button').contains('Supprimer').click();
      cy.wait(1000);
    });
  });

  // Admin employee management tests
  it('should open employee creation dialog and show validation messages for fields with errors', () => {
    cy.contains('button', 'Créer un compte employé').click();
    cy.get('h3').contains('Créer un compte employé').should('be.visible');

    cy.get('input[formControlName="firstName"]').focus().blur();
    cy.contains('Veuillez entrer votre prénom.').should('be.visible');
    cy.get('input[formControlName="lastName"]').focus().blur();
    cy.contains('Veuillez entrer votre nom.').should('be.visible');
    cy.get('input[formControlName="username"]').focus().blur();
    cy.contains("Veuillez entrer un nom d'utilisateur.").should('be.visible');
    cy.get('input[formControlName="email"]').type('invalidemail').focus().blur();
    cy.contains("Format d'adresse e-mail invalide.").should('be.visible');
    cy.get('input[formControlName="password"]').type('Weak123').focus().blur();
    cy.contains('≥12 (majuscule, minuscule, chiffre, spécial).').should('be.visible');
    cy.get('input[formControlName="confirmPassword"]').type('DifferentPassword').focus().blur();
    cy.contains('Les mots de passe ne correspondent pas.').should('be.visible');
  });

  it('should enable the button to create a new employee when the form is valid', () => {
    cy.contains('button', 'Créer un compte employé').click();
    cy.get('input[formControlName="firstName"]').type('Claire');
    cy.get('input[formControlName="lastName"]').type('Durand');
    cy.get('input[formControlName="username"]').type('claireD');
    cy.get('input[formControlName="email"]').type('claire@cinephoria.com');
    cy.get('input[formControlName="password"]').type('StrongPass123!');
    cy.get('input[formControlName="confirmPassword"]').type('StrongPass123!');

    cy.get('button[type="submit"]').should('not.be.disabled');
  });

  it('should open password reset dialog and show validation messages for fields with errors', () => {
    cy.wait(3000); // Ensure the page is fully loaded
    cy.get('table').should('exist');
    cy.get('table tr').last().should('have.length.greaterThan', 0);
    cy.get('table tr')
      .last()
      .within(() => {
        cy.get('button[aria-label="Réinitialiser le mot de passe"]').first().click();
      });
    cy.contains('Modifier le mot de passe').should('be.visible');
    cy.get('input[formControlName="password"]').type('weak').focus().blur();
    cy.contains('≥12 (majuscule, minuscule, chiffre, spécial).').should('be.visible');
  });

  it('should enable the submit button to reset the employee password successfully', () => {
    cy.wait(3000); // Ensure the page is fully loaded
    cy.get('table').should('exist');
    cy.get('table tbody tr').should('have.length.greaterThan', 0);
    cy.get('table tbody tr')
      .last()
      .within(() => {
        cy.get('button[aria-label="Réinitialiser le mot de passe"]').first().click();
      });
    cy.get('input[formControlName="password"]').type('StrongPass123!');
    cy.get('input[formControlName="confirmPassword"]').type('StrongPass123!').focus().blur();
    cy.get('button[type="submit"]').should('not.be.disabled');
  });
});
