export const environment = {
  production: true,
  apiURL: 'https://caw25.dev/api',
  frontendDomain: 'https://caw25.dev',
  enableConsole: false, //Disable console logs in production
};

// PRE-DEPLOY SETUP:
// apiURL: 'http://localhost:3001/api',
// frontendDomain: 'http://localhost:8081',

// PRODUCTION DOMAIN EXAMPLE: NOTE: Replace domain.dev with your domain
// apiURL: 'https://domain.dev/api',
// frontendDomain: 'https://domain.dev',

// DEPLOYMENT EXAMPLE HERE: Use above for private github repo and remove ci angular env step
// apiURL: '${API_URL}',
// frontendDomain: '${FRONTEND_DOMAIN}',
