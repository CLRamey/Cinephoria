import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  CanActivateChildFn,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, throwError, of } from 'rxjs';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import {
  AuthTokenGuard,
  AuthTokenGuardChild,
} from '../../projects/auth/src/lib/guards/auth-token-guard.guard';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';

describe('Auth Token Guard', () => {
  let authServiceMock: Partial<AuthService>;
  let isAuthenticatedSubject: BehaviorSubject<boolean>;
  let userRoleSubject: BehaviorSubject<Role | null>;
  let snackBarMock: { open: jest.Mock };
  let mockRouter: { createUrlTree: jest.Mock; navigate: jest.Mock };

  const mockRoute = new ActivatedRouteSnapshot();
  const mockState = { url: '/protected' } as RouterStateSnapshot;

  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => AuthTokenGuard(...guardParameters));
  const executeGuardChild: CanActivateChildFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => AuthTokenGuardChild(...guardParameters));

  beforeEach(() => {
    isAuthenticatedSubject = new BehaviorSubject<boolean>(true);
    userRoleSubject = new BehaviorSubject<Role | null>(Role.ADMIN);
    authServiceMock = {
      isAuthenticated$: isAuthenticatedSubject.asObservable(),
      userRole$: userRoleSubject.asObservable(),
      logout: jest.fn(),
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

  it('should allow access when authenticated with correct role for client route', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = { roles: [Role.CLIENT] };

    const result = executeGuard(mockRoute, mockState);
    // Check if result is an Observable<boolean>
    if (
      result &&
      typeof (result as { subscribe?: (observer: (res: boolean) => void) => void }).subscribe ===
        'function'
    ) {
      (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
        expect(res).toBe(true);
        done();
      });
    } else {
      expect(result).toBe(true);
      done();
    }
  });

  it('should allow access when authenticated with correct role for employee route', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.EMPLOYEE);
    mockRoute.data = { roles: [Role.EMPLOYEE] };

    const result = executeGuard(mockRoute, mockState);
    // Check if result is an Observable<boolean>
    if (
      result &&
      typeof (result as { subscribe?: (observer: (res: boolean) => void) => void }).subscribe ===
        'function'
    ) {
      (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
        expect(res).toBe(true);
        done();
      });
    } else {
      expect(result).toBe(true);
      done();
    }
  });

  it('should allow access when authenticated with correct role for admin route', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.ADMIN);
    mockRoute.data = { roles: [Role.ADMIN] };

    const result = executeGuard(mockRoute, mockState);
    // Check if result is an Observable<boolean>
    if (
      result &&
      typeof (result as { subscribe?: (observer: (res: boolean) => void) => void }).subscribe ===
        'function'
    ) {
      (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
        expect(res).toBe(true);
        done();
      });
    } else {
      expect(result).toBe(true);
      done();
    }
  });

  it('should redirect to login if not authenticated', done => {
    isAuthenticatedSubject.next(false);
    userRoleSubject.next(null);
    mockRoute.data = { roles: [Role.ADMIN] };

    const result = executeGuard(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login-admin'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should show not authorized snack bar and redirection if authenticated but not authorized admin role', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = { roles: [Role.ADMIN] };

    const result = executeGuard(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(snackBarMock.open).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/accueil'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should show not authorized snack bar and redirection if authenticated but not authorized admin role', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = { roles: [Role.ADMIN] };

    const result = executeGuard(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(snackBarMock.open).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/accueil'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should show not authorized snack bar and redirection if authenticated but not authorized client role', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.EMPLOYEE);
    mockRoute.data = { roles: [Role.CLIENT] };

    const result = executeGuard(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(snackBarMock.open).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/accueil'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should allow access to child routes when authenticated with correct client role', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = { roles: [Role.CLIENT] };

    const result = executeGuardChild(mockRoute, mockState);
    if (
      result &&
      typeof (result as { subscribe?: (observer: (res: boolean) => void) => void }).subscribe ===
        'function'
    ) {
      (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
        expect(res).toBe(true);
        done();
      });
    } else {
      expect(result).toBe(true);
      done();
    }
  });

  it('should allow access to child routes when authenticated with correct employee role', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.EMPLOYEE);
    mockRoute.data = { roles: [Role.EMPLOYEE] };

    const result = executeGuardChild(mockRoute, mockState);
    if (
      result &&
      typeof (result as { subscribe?: (observer: (res: boolean) => void) => void }).subscribe ===
        'function'
    ) {
      (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
        expect(res).toBe(true);
        done();
      });
    } else {
      expect(result).toBe(true);
      done();
    }
  });

  it('should allow access to child routes when authenticated with correct admin role', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.ADMIN);
    mockRoute.data = { roles: [Role.ADMIN] };

    const result = executeGuardChild(mockRoute, mockState);
    if (
      result &&
      typeof (result as { subscribe?: (observer: (res: boolean) => void) => void }).subscribe ===
        'function'
    ) {
      (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
        expect(res).toBe(true);
        done();
      });
    } else {
      expect(result).toBe(true);
      done();
    }
  });

  it('should redirect to login if not authenticated for child routes', done => {
    isAuthenticatedSubject.next(false);
    userRoleSubject.next(null);
    mockRoute.data = { roles: [Role.ADMIN] };

    const result = executeGuardChild(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login-admin'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should show not authorized snack bar and redirection for child routes if authenticated but not authorized for client route', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.EMPLOYEE);
    mockRoute.data = { roles: [Role.CLIENT] };

    const result = executeGuardChild(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(snackBarMock.open).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/accueil'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should show not authorized snack bar and redirection for child routes if authenticated but not authorized for employee route', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = { roles: [Role.EMPLOYEE] };

    const result = executeGuardChild(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(snackBarMock.open).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/accueil'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should show not authorized snack bar and redirection for child routes if authenticated but not authorized for admin route', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = { roles: [Role.ADMIN] };

    const result = executeGuardChild(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(snackBarMock.open).toHaveBeenCalled();
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/accueil'], {
        queryParams: { returnUrl: '/protected' },
      });
      done();
    });
  });

  it('should redirect to accueil and logout if an error occurs during access check', done => {
    const erroringService = {
      isAuthenticated$: of(true),
      userRole$: throwError(() => new Error('Simulated role error')),
      logout: jest.fn(() => of(void 0)),
    };
    TestBed.overrideProvider(AuthService, { useValue: erroringService });
    mockRoute.data = { roles: [Role.ADMIN] };
    const result = executeGuard(mockRoute, mockState);
    (result as import('rxjs').Observable<UrlTree>).subscribe((_res: UrlTree) => {
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/accueil']);
      done();
    });
    expect(erroringService.logout).toHaveBeenCalled();
  });

  it('should allow access to public routes that have no need for authentification or authorisation [route guard]', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = {};

    const result = executeGuard(mockRoute, mockState);
    (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
      expect(res).toBe(true);
      done();
    });
  });

  it('should allow access to public routes  that have no need for authentification or authorisation [child route guard]', done => {
    isAuthenticatedSubject.next(true);
    userRoleSubject.next(Role.CLIENT);
    mockRoute.data = {};

    const result = executeGuardChild(mockRoute, mockState);
    (result as import('rxjs').Observable<boolean>).subscribe((res: boolean) => {
      expect(res).toBe(true);
      done();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
