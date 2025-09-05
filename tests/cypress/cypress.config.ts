import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../../.env' });

export default defineConfig({
  video: false,
  e2e: {
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/e2e.{js,jsx,ts,tsx}',
    fixturesFolder: false,
    screenshotsFolder: 'tests/cypress/screenshots',
    videosFolder: 'tests/cypress/videos',
    downloadsFolder: 'tests/cypress/downloads',
    baseUrl: process.env['BASE_URL'] || 'http://localhost:4200',
    env: {
      CYPRESS_TEST_USER_PASSWORD: process.env['TEST_USER_PASSWORD'] || 'Passw0rd4312!Now',
      CYPRESS_CLIENT_TEST_USER_EMAIL:
        process.env['CLIENT_TEST_USER_EMAIL'] || 'test-client-email-address01@fortesting.com',
      CYPRESS_EMPLOYEE_TEST_USER_EMAIL:
        process.env['EMPLOYEE_TEST_USER_EMAIL'] || 'test-employee-email-address01@fortesting.com',
      CYPRESS_ADMIN_TEST_USER_EMAIL:
        process.env['ADMIN_TEST_USER_EMAIL'] || 'test-admin-email-address01@fortesting.com',
    },
    setupNodeEvents(on, config) {
      // modify config here as required
      config.env = {
        API_URL: process.env['API_URL'] || 'http://localhost:3000/api',
        FRONTEND_DOMAIN: process.env['FRONTEND_DOMAIN'] || 'http://localhost:4200',
      };
      return config;
    },
  },
});
// apiURL: 'http://localhost:3000/api' -local, http://localhost:3001/api - docker-test //
