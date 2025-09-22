// auth-initializer.ts
import { AuthService } from '../services/auth.service';

// This function initializes the authentication state when the application starts for cookies
export function authInitializer(authService: AuthService): () => Promise<void> {
  return () => authService.checkAuthPromise();
}

// This function initializes the authentication state when the application starts for tokens
export function authTokenInitializer(authService: AuthService): () => Promise<void> {
  return () =>
    new Promise(resolve => {
      authService.refreshAuthState().then(() => resolve());
    });
}
