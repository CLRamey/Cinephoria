import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { TokenService } from './token.service';
import {
  RegisterUser,
  LoginUser,
  AuthResponse,
  RegisterResponse,
} from '../interfaces/auth-interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Auth state observable (true = logged in, false = not logged in).
  private readonly isAuthenticatedSubject: BehaviorSubject<boolean>;
  public isAuthenticated$: Observable<boolean>;
  // Constructor that injects the HttpClient for making HTTP requests.
  constructor(
    private readonly http: HttpClient,
    private readonly tokenService: TokenService,
    @Inject('API_URL') private readonly baseUrl: string,
  ) {
    this.isAuthenticatedSubject = new BehaviorSubject<boolean>(this.tokenService.hasToken());
    this.isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  }

  // Method to register a new user, POST request to the API, saving the token if successful.
  register(user: RegisterUser): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register-client`, user);
  }

  // Method to log in a user, POST request to the API, saving the token if successful.
  login(user: LoginUser): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login-client`, user).pipe(
      tap((response: AuthResponse) => {
        if (response.accessToken) {
          this.tokenService.setToken(response.accessToken);
          this.isAuthenticatedSubject.next(true);
        }
      }),
    );
  }
}
