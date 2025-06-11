import { defineConfig } from 'cypress';
import * as dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  video: false,
  e2e: {
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
