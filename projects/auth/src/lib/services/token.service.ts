import { Injectable } from '@angular/core';
import { Role } from '../interfaces/auth-interfaces';

// Interface for the JWT payload structure.
// It includes standard fields like exp (expiration time) and custom fields like email and role.
export interface JwtPayload {
  userId: number;
  userRole: Role;
  iat: number;
  exp: number;
}

// This service manages the JWT token used for authentication in the application.
// It provides methods to get, set, clear, and validate the token, as well as to retrieve the payload from the token.
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  // Key used to store the token in session storage.
  private readonly TOKEN_KEY: string = 'auth_cinephoria_token';
  // Sets the token in session storage.
  setToken(token: string): void {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  }

  // Retrieves the token from session storage.
  getToken(): string | null {
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  // Checks if a valid token exists in session storage.
  hasToken(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Checks if the token is expired.
  isTokenExpired(token?: string): boolean {
    try {
      if (!token) {
        token = this.getToken() ?? undefined;
        if (!token) {
          return true;
        }
      }
      const payload = this.getPayload();
      if (!payload || typeof payload.exp !== 'number') {
        return true;
      }
      return payload.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error('Token exp error', error);
      return true;
    }
  }

  // Retrieves the payload from the JWT token.
  // It decodes the token and parses the payload JSON, if the token is invalid or cannot be decoded, it returns null.
  getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      this.clearToken();
      return null;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson) as JwtPayload;
      if (!payload) {
        this.clearToken();
        return null;
      }
      return payload;
    } catch (error) {
      // this.clearToken();
      console.error('Token decoding failed', error);
      return null;
    }
  }

  // Clears the token from session storage.
  clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
  }
}
