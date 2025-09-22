import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from './token.service';
import {
  RegisterUser,
  LoginUser,
  AuthResponse,
  AuthCookieResponse,
  RegisterResponse,
  Role,
} from '../interfaces/auth-interfaces';
import { API_URL } from '../shared/utils/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Auth state observable (true = logged in, false = not logged in).
  private readonly isAuthenticatedSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false,
  );
  // User role observable (role of the authenticated user or null)
  private readonly userRoleSubject: BehaviorSubject<Role | null> = new BehaviorSubject<Role | null>(
    null,
  );

  // Observable to expose the authentication state.
  public readonly isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable();
  // Observable to expose the user role.
  public readonly userRole$: Observable<Role | null> = this.userRoleSubject.asObservable();
  // Property to store the user role, initialized to null.
  private userRole: Role | null = null;

  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
    @Inject(API_URL) private readonly baseUrl: string,
  ) {}

  // Method to register a new user, POST request to the API, saving the token if successful.
  register(user: RegisterUser): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register-client`, user);
  }

  // Method to log in a user, POST request to the API, saving the token if successful.
  loginClient(user: LoginUser): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login-client`, user).pipe(
      tap((response: AuthResponse) => {
        if (response.data.accessToken) {
          this.tokenService.setToken(response.data.accessToken);
          this.isAuthenticatedSubject.next(true);
          this.updateUserRoleFromLogin();
        }
      }),
    );
  }

  // Method to log in an employee, POST request to the API, saving the token if successful.
  loginEmployee(user: LoginUser): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login-employee`, user).pipe(
      tap((response: AuthResponse) => {
        if (response.data && response.data.accessToken) {
          this.tokenService.setToken(response.data.accessToken);
          this.isAuthenticatedSubject.next(true);
          this.updateUserRoleFromLogin();
        }
      }),
    );
  }

  // Method to log in an admin, POST request to the API, saving the token if successful.
  loginAdmin(user: LoginUser): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login-admin`, user).pipe(
      tap((response: AuthResponse) => {
        if (response.data && response.data.accessToken) {
          this.tokenService.setToken(response.data.accessToken);
          this.isAuthenticatedSubject.next(true);
          this.updateUserRoleFromLogin();
        }
      }),
    );
  }

  // Method to check if the user is authenticated by checking the token.
  isAuthenticated(): boolean {
    return this.tokenService.hasToken();
  }

  // Method to check the user's role based on the token.
  getUserRole(): Role | null {
    let roleString: string | null = null;
    if (this.tokenService.hasToken()) {
      const payload = this.tokenService.getPayload();
      roleString = (payload?.userRole as string)?.toUpperCase() ?? null;
    } else if (this.userRole) {
      roleString = this.userRole.toString().toUpperCase();
    }
    switch (roleString) {
      case 'CLIENT':
        return Role.CLIENT;
      case 'EMPLOYEE':
        return Role.EMPLOYEE;
      case 'ADMIN':
        return Role.ADMIN;
      default:
        return null;
    }
  }

  // Update the user role based on the token.
  updateUserRoleFromLogin(): void {
    const role = this.getUserRole();
    this.userRole = role;
    this.userRoleSubject.next(role);
  }

  // Method to refresh the authentication state and user role for tokens.
  refreshAuthState(): Promise<void> {
    return new Promise<void>(resolve => {
      const hasToken = this.tokenService.hasToken();
      const hasRole = this.userRole !== null;
      const isAuth = hasToken || hasRole;
      this.isAuthenticatedSubject.next(!!isAuth);
      if (hasToken || hasRole) {
        this.updateUserRoleFromLogin();
      }
      resolve();
    });
  }

  // Method to log out the user, clearing the token and updating the auth state.
  logout(): void {
    this.tokenService.clearToken();
    this.isAuthenticatedSubject.next(false);
    this.userRole = null;
    this.refreshAuthState();
  }

  // Method to log in a client via cookies.
  loginCookieClient(user: LoginUser): Observable<AuthCookieResponse> {
    return this.http
      .post<AuthCookieResponse>(`${this.baseUrl}/login-client`, user, { withCredentials: true })
      .pipe(
        tap((response: AuthCookieResponse) => {
          if (response.success && response.data.userRole) {
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(response.data.userRole);
            this.userRole = response.data.userRole;
          }
        }),
      );
  }

  // Method to log in an employee, POST request to the API, saving the token if successful.
  loginCookieEmployee(user: LoginUser): Observable<AuthCookieResponse> {
    return this.http
      .post<AuthCookieResponse>(`${this.baseUrl}/login-employee`, user, { withCredentials: true })
      .pipe(
        tap((response: AuthCookieResponse) => {
          if (response.success && response.data.userRole) {
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(response.data.userRole);
            this.userRole = response.data.userRole;
          }
        }),
      );
  }

  // Method to log in an admin, POST request to the API, saving the token if successful.
  loginCookieAdmin(user: LoginUser): Observable<AuthCookieResponse> {
    return this.http
      .post<AuthCookieResponse>(`${this.baseUrl}/login-admin`, user, { withCredentials: true })
      .pipe(
        tap((response: AuthCookieResponse) => {
          if (response.success && response.data.userRole) {
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(response.data.userRole);
            this.userRole = response.data.userRole;
          }
        }),
      );
  }

  // Check if user is still authenticated (to call on app init or guard) via cookies.
  checkAuth(): Observable<AuthCookieResponse> {
    return this.http
      .get<AuthCookieResponse>(`${this.baseUrl}/cookie-check`, { withCredentials: true })
      .pipe(
        tap((response: AuthCookieResponse) => {
          if (response.success && response.data.userRole) {
            this.isAuthenticatedSubject.next(true);
            this.userRoleSubject.next(response.data.userRole);
            this.userRole = response.data.userRole;
          } else {
            this.isAuthenticatedSubject.next(false);
            this.userRoleSubject.next(null);
            this.userRole = null;
          }
        }),
        catchError(_err => {
          this.isAuthenticatedSubject.next(false);
          this.userRoleSubject.next(null);
          this.userRole = null;
          return of({ success: false } as AuthCookieResponse);
        }),
      );
  }

  // Method to check authentication status as a promise for the initializer
  checkAuthPromise(): Promise<void> {
    return new Promise<void>(resolve => {
      this.checkAuth().subscribe({
        next: () => resolve(),
        error: () => resolve(), // resolve anyway to not block app init
      });
    });
  }

  // Method to log out the user securely via cookies.
  logoutSecurely(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.isAuthenticatedSubject.next(false);
        this.userRoleSubject.next(null);
        this.userRole = null;
      }),
    );
  }
}
