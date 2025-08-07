// auth-initializer.ts
import { AuthService } from '../services/auth.service';

// This function initializes the authentication state when the application starts
export function authInitializer(authService: AuthService): () => Promise<void> {
  return () =>
    new Promise(resolve => {
      authService.refreshAuthState().then(() => resolve());
    });
}
