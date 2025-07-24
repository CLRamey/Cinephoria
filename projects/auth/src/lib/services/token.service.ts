import { Injectable } from '@angular/core';
import { Role } from '../interfaces/auth-interfaces';

// Interface for the JWT payload structure.
// It includes standard fields like exp (expiration time) and custom fields like email and role.
export interface JwtPayload {
  userId: number;
  userRole?: Role;
  isVerified?: boolean;
  iat?: number;
  exp?: number;
}

// This service manages the JWT token used for authentication in the application.
// It provides methods to get, set, clear, and validate the token, as well as to retrieve the payload from the token.
@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private readonly TOKEN_KEY: string = 'auth_cinephoria_token';
  // Sets the token in local storage.
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  // Retrieves the token from local storage.
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Clears the token from local storage.
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  // Checks if a valid token exists in local storage.
  hasToken(): boolean {
    const payload = this.getPayload();
    return !!payload && typeof payload.exp === 'number' && payload.exp > Date.now() / 1000; // Validates the token by checking if it has not expired.
  }

  // Retrieves the payload from the JWT token.
  // It decodes the token and parses the payload JSON, if the token is invalid or cannot be decoded, it returns null.
  getPayload(): JwtPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      return JSON.parse(payloadJson) as JwtPayload;
    } catch (error) {
      console.error('Token decoding failed', error);
      return null;
    }
  }
}
