# Cinéphoria

## Présentation

Cinéphoria est une plateforme complète composée de trois applications : web, mobile et bureautique. Elle permet aux utilisateurs de consulter les films à l’affiche et de réserver leurs billets, tout en offrant au personnel la possibilité de gérer de manière efficace les films, les salles et les séances.

Liens des documents :

Documentation technique :
[Cinéphoria - Documentation technique](documentation/Documentation_Technique%20_Cinéphoria.pdf)

Transaction SQL :
[Transaction.sql](sql/transaction/transaction.sql)
[Cinéphoria - Transaction](documentation/Transaction_Cinéphoria.pdf)

Manuel d'utilisation : 
[Cinéphoria - Manuel d'utilisation](documentation/Manuel_d'utilisation_Cinéphoria.pdf)

Gestion de projet :
[Cinéphoria - Gestion de projet](documentation/Gestion_de_Projet_Cinéphoria.pdf)

Charte graphique : 
[Cinéphoria - Charte graphique](documentation/Charte_graphique_Cinéphoria.pdf)

Maquettes :
[Cinéphoria - Maquettes](documentation/Cinéphoria_Maquette_Desktop.pdf)

Wireframes :
[Cinéphoria - Wireframes]

## Structure du projet

Le projet est organisé dans un workspace Angular, avec un backend (Node.js + Express) et une bibliothèque partagée pour l’authentification et d’autres fonctionnalités communes, utilisés par les trois applications frontend :

* cinephoria-web/ : Application web (Angular)
* cinephoria-mobile/ : Application mobile (Angular + Ionic)
* cinephoria-desktop/ : Application bureautique (Angular + Electron)

## Pré-requis

* Node.js (v20 ou supérieur)
* Node package manager (npm)
* Angular CLI
* Docker et Docker Compose
* MariaDB
* MongoDB

## Installation et déploiement local

### Application Web

 1. Copier les fichiers .example.env situés à la racine et dans le dossier backend en .env respectifs, puis configurer les variables d’environnement.
 2. Installez les dépendances : npm install (frontend et backend)
 3. Naviguez vers le dossier backend 
 4. Lancez les conteneurs Docker pour les bases de données en exécutant la commande : npm run docker:db
 5. Naviguez vers le dossier racine, puis lancez l’application cinephoria-web en mode développement avec la commande : npm run dev

L’application web sera accessible à l’adresse suivante : http://localhost:4200

### Application Mobile

### Application Bureautique

## Tests

Configuration des variables d’environnement :

Avant d’exécuter les tests locaux ou via Docker, assurez-vous de configurer correctement les variables d’environnement dans le fichier .env en fonction de votre objectif :

* Tester en local : Section = DOCKER-DB LOCAL DEV
* Tester avec Docker : Section = DOCKER-TEST

Assurez-vous également que le fichier ./sql/init/02_init_data.sql contient quelques films avec la date du mercredi précédent : Table Film [Ligne 22+], colonne "film_active_date". Si cette étape n’est pas réalisée, certains tests risquent d’échouer.

Tester en local : 

1. Déployez localement l’application web en suivant les instructions d’installation et déploiement local (indiquées ci-dessus).
2. Insérez les utilisateurs de test dans la base de données depuis le dossier racine en exécutant la commande: npm run backend:seeder
3. De nombreux scripts de test sont disponibles dans le fichier package.json. Pour exécuter l’ensemble des tests, lancez la commande suivante : npm run test:all
4. Tests E2E avec Cypress : npm run cy:open > cliquez sur E2E Testing > sélectionnez Chrome > Choisissez les tests que vous souhaitez exécuter.
5. Une fois les tests terminés, vous pouvez arrêter et supprimer les conteneurs : npm run docker:db:down

Tester avec Docker :

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

Tests CI/CD :

Dans le cadre de l’intégration continue et du déploiement continu (CI/CD), docker-compose-test a été intégrée aux workflows Github Actions afin de tester automatiquement l’application dans un environnement Docker isolé, garantissant la cohérence, la reproductibilité et la fiabilité des tests.

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

Note: Assurez-vous du bon fonctionnement de Docker sur votre machine avant de lancer les tests.