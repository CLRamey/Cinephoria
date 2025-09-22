import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanActivateChildFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../interfaces/auth-interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable, of } from 'rxjs';
import { map, take, catchError } from 'rxjs/operators';
import { notAuthorizedSnackBar } from '../shared/utils/shared-responses';

// Function to get the login path based on user roles
function getLoginPathForRole(roles?: Role[]): string {
  if (!roles || roles.length === 0) {
    return '/accueil';
  }
  if (roles.includes(Role.ADMIN)) {
    return '/login-admin';
  }
  if (roles.includes(Role.EMPLOYEE)) {
    return '/login-employee';
  }
  if (roles.includes(Role.CLIENT)) {
    return '/login-client';
  }
  return '/accueil';
}

// Function to check access based on authentication and role with error handling and redirection
function checkAccess(route: ActivatedRouteSnapshot, url: string): Observable<boolean | UrlTree> {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const requiredRole = route.data['roles'] as Role[] | undefined;
  const loginPath = getLoginPathForRole(requiredRole);

  return combineLatest([authService.isAuthenticated$, authService.userRole$]).pipe(
    take(1),
    map(([isAuthenticated, userRole]) => {
      if (!isAuthenticated) {
        return router.createUrlTree([loginPath], {
          queryParams: { returnUrl: url },
        });
      }
      if (!userRole || (requiredRole && !requiredRole.includes(userRole as Role))) {
        notAuthorizedSnackBar(snackBar);
        authService.logout();
        return router.createUrlTree(['/accueil'], {
          queryParams: { returnUrl: url },
        });
      }
      return true;
    }),
    catchError(err => {
      authService.logout();
      console.error('Error checking access:', err);
      return of(router.createUrlTree(['/accueil']));
    }),
  );
}

// AuthGuard function to be used in routing
export const AuthTokenGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean | UrlTree> => {
  return checkAccess(route, state.url);
};

// AuthGuardChild function to be used for child routes
export const AuthTokenGuardChild: CanActivateChildFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): Observable<boolean | UrlTree> => {
  return checkAccess(route, state.url);
};
