import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  video: false,
  e2e: {
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/e2e.{js,jsx,ts,tsx}',
    fixturesFolder: 'tests/cypress/fixtures',
    screenshotsFolder: 'tests/cypress/screenshots',
    videosFolder: 'tests/cypress/videos',
    downloadsFolder: 'tests/cypress/downloads',
    baseUrl: process.env['BASE_URL'] || 'http://localhost:4200',
    setupNodeEvents(on, config) {
      // modify config here as required
      config.env = {
        API_URL: process.env['API_URL'] || 'http://localhost:3000',
        FRONTEND_DOMAIN: process.env['FRONTEND_DOMAIN'] || 'http://localhost:4200',
      };
      return config;
    },
  },
});
