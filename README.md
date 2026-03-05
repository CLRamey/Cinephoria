# Cinéphoria

## Présentation

Cinéphoria est une plateforme complète composée de trois applications : web, mobile et bureautique. Elle permet aux utilisateurs de consulter les films à l’affiche et de réserver leurs billets, tout en offrant au personnel la possibilité de gérer de manière efficace les films, les salles et les séances.

## Structure du projet

Le projet est organisé dans un workspace Angular, avec un backend (Node.js + Express) et une bibliothèque partagée pour l’authentification et d’autres fonctionnalités communes, utilisés par les trois applications frontend :

* Application web (Angular) : cinephoria-web
* Application mobile (Angular + Ionic) : cinephoria-mobile
* Application bureautique (Angular + Electron) : cinephoria-desktop

## Pré-requis

* Node.js (v20 ou supérieur)
* Node package manager (npm)
* Angular CLI
* Docker et Docker Compose
* MariaDB
* MongoDB

## Installation et déploiement local

### Application Web :

 1. Copier les fichiers .example.env situés à la racine et dans le dossier backend en .env respectifs, puis configurer les variables d’environnement.
 2. Installez les dépendances : npm install (frontend et backend)
 3. Naviguez vers le dossier backend.
 4. Lancez les conteneurs Docker pour les bases de données en exécutant la commande : npm run docker:db
 5. Naviguez vers le dossier racine, puis lancez l’application cinephoria-web en mode développement avec la commande : npm run dev

L’application web sera accessible à l’adresse suivante : http://localhost:4200

### Application Mobile :

 1. Après avoir terminé les étapes listées ci-dessus pour l’application web, copiez les fichiers de cinephoria-mobile si cela n’a pas déjà été fait.
 2. Placez-vous dans le dossier cinephoria-mobile (cd projects/cinephoria-mobile) et installez les dépendances en exécutant la commande : npm install
 3. Lancez l’application mobile avec la commande : ionic serve
 
 L'application mobile sera accesible à l'adresse suivante : http://localhost:8100

### Application Bureautique :

 1. Après avoir terminé les étapes listées ci-dessus pour l’application web, copiez les fichiers de cinephoria-desktop si cela n’a pas déjà été fait.
 2. Lancez l'application desktop avec la commande : npm run desktop:angular

 L'application desktop sera accessible à l'adresse suivante : http://localhost:4201

Optionnel : Une fois les étapes ci-dessus effectuées, ouvrez un nouveau terminal et exécutez les commandes suivantes : npm run desktop:electron:dev. Une fenêtre de l’application Electron s’ouvrira en mode développement.

## Tests

**Configuration des variables d’environnement :**

Avant d’exécuter les tests locaux ou via Docker, assurez-vous de configurer correctement les variables d’environnement dans le fichier .env en fonction de votre objectif :

* Tester en local : Section = DOCKER-DB LOCAL DEV
* Tester avec Docker : Section = DOCKER-TEST

Assurez-vous également que le fichier ./sql/init/02_init_data.sql contient quelques films avec la date du mercredi précédent : Table Film [Ligne 22+], colonne "film_active_date". Si cette étape n’est pas réalisée, certains tests risquent d’échouer.

**Tester en local :** 

1. Déployez localement l’application web en suivant les instructions d’installation et déploiement local (indiquées ci-dessus).
2. Insérez les utilisateurs de test dans la base de données depuis le dossier racine en exécutant la commande: npm run backend:seeder
3. De nombreux scripts de test sont disponibles dans le fichier package.json. Pour exécuter l’ensemble des tests, lancez la commande suivante : npm run test:all
4. Tests E2E avec Cypress : npm run cy:open > cliquez sur E2E Testing > sélectionnez Chrome > Choisissez les tests que vous souhaitez exécuter.
5. Une fois les tests terminés, vous pouvez arrêter et supprimer les conteneurs : npm run docker:db:down

**Tester avec Docker :**

1. Placez-vous à la racine du projet et lancez le docker-compose-test avec la commande : npm run docker:test
2. Une fois les conteneurs démarrés, ouvrez un nouveau terminal et exécutez la commande suivante afin d’entrer dans le conteneur : docker exec -it cinephoria-test bash
3. Depuis l’intérieur du conteneur, lancez ensuite : npm run dev 
4. Patientez le temps que l’application démarre.
5. Ouvrez un nouveau terminal afin de réintégrer le conteneur pour tester l'application dans l'environnement Docker : docker exec -it cinephoria-test bash
6. Ensuite, insérez les utilisateurs de test dans la base de données en exécutant la commande: npm run backend:seeder
7. Vous pouvez désormais exécuter tous les tests avec la commande suivante : npm run test:all
8. Tests E2E avec Cypress (mode headless) : npm run test:e2e:run:headless
9. Une fois les tests terminés, vous pouvez arrêter et supprimer les conteneurs : npm run docker:test:down
10. Lorsque l’opération est terminée, vous pouvez fermer les terminaux.

**Tests CI/CD :**

Dans le cadre de l’intégration continue et du déploiement continu (CI/CD), docker-compose-test.yml a été intégrée aux workflows Github Actions afin de tester automatiquement l’application dans un environnement Docker isolé, garantissant la cohérence, la reproductibilité et la fiabilité des tests.

Options additionnelles de test frontend :
  
  * Tests unitaires uniquement : npm run test:unit
  * Tests d'intégration uniquement: npm run test:integration
  * Tests fonctionnels uniquement : npm run test:functional
  * Tests unitaires, intégration et fonctionnels frontend : npm run test:frontend:all

Options additionnelles de test backend : 

  * Tests unitaires uniquement : npm run test:unit:bk
  * Tests d'intégration uniquement: npm run test:integration:bk
  * Tests fonctionnels uniquement : npm run test:functional:bk
  * Tests unitaires, intégration et fonctionnels backend : npm run test:backend:all

**Note:** Assurez-vous du bon fonctionnement de Docker sur votre machine avant de lancer les tests.

---
<br />

# Cinéphoria

## Presentation

Cinéphoria is a complete platform composed of three applications: web, mobile and desktop. Developed to allow users to consult the movies currently showing and make reservations whilst offering staff the possibility to efficiently manage movies, the rooms and showtimes.

## Project Structure

The project is organised within an Angular workspace, a shared backend (Node.js + Express) and library for authentication and other common features that are used by the three frontend applications:

* Web application (Angular) :  cinephoria-web
* Mobile application (Angular + Ionic) :  cinephoria-mobile
* Desktop application (Angular + Electron) :  cinephoria-desktop

## Prerequisites

* Node.js (v20 or higher)
* Node package manager (npm)
* Angular CLI
* Docker and Docker Compose
* MariaDB
* MongoDB

## Local Installation and Deployment

### Web Application :

1. Copy the .example.env files located at the root and in the backend folder into respective .env files, then configure the environment variables.
2. Install the dependencies: npm install (frontend and backend).
3. Navigate to the backend folder.
4. Start the Docker containers for the databases by running the command: npm run docker:db
5. Navigate to the root folder, then start the cinephoria-web application in development mode with the command: npm run dev

The web application will be accessible at the following address: http://localhost:4200

### Mobile Application :

1. After completing the steps listed above for the web application, copy the cinephoria-mobile files if this has not already been done.
2. Go to the cinephoria-mobile folder (cd projects/cinephoria-mobile) and install the dependencies by running the command: npm install
3. Start the mobile application with the command: ionic serve

The mobile application will be accessible at the following address: http://localhost:8100

### Desktop Application :

1. After completing the steps listed above for the web application, copy the cinephoria-desktop files if this has not already been done.
2. Start the desktop application with the command: npm run desktop:angular

The desktop application will be accessible at the following address: http://localhost:4201

Optional: Once the above steps have been completed, open a new terminal and run the following command: npm run desktop:electron:dev. An Electron application window will open in development mode.

## Tests

**Environment variables configuration:**

Before running the tests locally or via Docker, make sure to correctly configure the environment variables in the .env file according to your objective:

* Test locally: Section = DOCKER-DB LOCAL DEV
* Test with Docker: Section = DOCKER-TEST

Also make sure that the file ./sql/init/02_init_data.sql contains a few movies with the date of the previous Wednesday: Table Film [Line 22+], column "film_active_date". If this step is not carried out, some tests may fail.

**Test locally:**

1. Deploy the web application locally by following the local installation and deployment instructions (indicated above).
2. Insert the test users into the database from the root folder by running the command: npm run backend:seeder
3. Many test scripts are available in the package.json file. To run all the tests, run the following command: npm run test:all
4. E2E tests with Cypress: npm run cy:open > click on E2E Testing > select Chrome > Choose the tests you wish to execute.
5. Once the tests are finished, you can stop and remove the containers: npm run docker:db:down

**Test with Docker:**

1. Go to the root of the project and start docker-compose-test with the command: npm run docker:test
2. Once the containers have started, open a new terminal and run the following command in order to enter the container: docker exec -it cinephoria-test bash
3. From inside the container, then run: npm run dev
4. Wait while the application starts.
5. Open a new terminal in order to re-enter the container to test the application in the Docker environment: docker exec -it cinephoria-test bash
6. Then, insert the test users into the database by running the command: npm run backend:seeder
7. You can now run all the tests with the following command: npm run test:all
8. E2E tests with Cypress (headless mode): npm run test:e2e:run:headless
9. Once the tests are finished, you can stop and remove the containers: npm run docker:test:down
10. When the operation is completed, you can close the terminals.

**CI/CD Tests:**

As part of continuous integration and continuous deployment (CI/CD), docker-compose-test.yml has been integrated into GitHub Actions workflows in order to automatically test the application in an isolated Docker environment, guaranteeing consistency, reproducibility and reliability of the tests.

Additional frontend test options: 

* Unit tests only: npm run test:unit
* Integration tests only: npm run test:integration
* Functional tests only: npm run test:functional
* Unit, integration and functional frontend tests: npm run test:frontend:all

Additional backend test options:

* Unit tests only: npm run test:unit:bk
* Integration tests only: npm run test:integration:bk
* Functional tests only: npm run test:functional:bk
* Unit, integration and functional backend tests: npm run test:backend:all

**Note:** please ensure Docker is running correctly on your machine prior to running the tests.
<br />

---

## Liens des documents | Documentation links :

> **Manuel d'utilisation** (User manual) : 
[Cinéphoria - Manuel d'utilisation](documentation/Manuel_d'utilisation_Cinéphoria.pdf)

> **Gestion de projet** (Project Management) :
[Cinéphoria - Gestion de projet](documentation/Gestion_de_Projet_Cinéphoria.pdf)

> **Documentation technique** (Technical Documentation) :
[Cinéphoria - Documentation technique](documentation/Documentation_Technique_Cinéphoria.pdf)

> **Transaction SQL** (SQL Transaction) :
[Transaction.sql](sql/transaction/transaction.sql)
[Cinéphoria - Transaction](documentation/Transaction_Cinéphoria.pdf)

> **Charte graphique** (Brand style guide) : 
[Cinéphoria - Charte graphique](documentation/Charte_graphique_Cinéphoria.pdf)

> Maquettes (Mockups) :
> 1. [Cinéphoria web](documentation/Cinéphoria_Web.pdf)
> 2. [Cinéphoria mobille](documentation/Cinéphoria_Mobile.pdf)
> 3. [Cinéphoria desktop](documentation/Cinéphoria_Desktop.pdf) 


---