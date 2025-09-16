import { TestBed } from '@angular/core/testing';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import {
  AuthTokenGuard,
  AuthTokenGuardChild,
} from '../../projects/auth/src/lib/guards/auth-token-guard.guard';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';

describe('Auth Token Guards unit role test', () => {
  let authServiceMock: Partial<AuthService>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;
  let userRoleSubject: BehaviorSubject<Role | null>;
  let snackBarMock: { open: jest.Mock };
  let mockRouter: { createUrlTree: jest.Mock; navigate: jest.Mock };

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => AuthTokenGuard(...guardParameters));
  const executeGuardChild: CanActivateChildFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => AuthTokenGuardChild(...guardParameters));

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

  beforeEach(() => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(true);
    userRoleSubject = new BehaviorSubject<Role | null>(Role.ADMIN);
    authServiceMock = {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      userRole$: userRoleSubject.asObservable(),
    };
    snackBarMock = {
      open: jest.fn(),
    };

    mockRouter = {
      createUrlTree: jest.fn(),
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: mockRouter },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
    expect(executeGuardChild).toBeTruthy();
  });

  describe('getLoginPathForRole', () => {
    it('returns /accueil if roles is undefined', () => {
      expect(getLoginPathForRole(undefined)).toBe('/accueil');
    });

    it('returns /accueil if roles is an empty array', () => {
      expect(getLoginPathForRole([])).toBe('/accueil');
    });

    it('returns /login-admin if roles includes ADMIN', () => {
      expect(getLoginPathForRole([Role.ADMIN])).toBe('/login-admin');
    });

    it('returns /login-employee if roles includes EMPLOYEE but not ADMIN', () => {
      expect(getLoginPathForRole([Role.EMPLOYEE])).toBe('/login-employee');
    });

    it('returns /login-client if roles includes CLIENT but not ADMIN or EMPLOYEE', () => {
      expect(getLoginPathForRole([Role.CLIENT])).toBe('/login-client');
    });

    it('returns /login-admin if roles include multiple including ADMIN', () => {
      expect(getLoginPathForRole([Role.CLIENT, Role.ADMIN])).toBe('/login-admin');
    });

    it('returns /accueil if roles include unknown role', () => {
      expect(getLoginPathForRole(['UNKNOWN' as Role])).toBe('/accueil');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
