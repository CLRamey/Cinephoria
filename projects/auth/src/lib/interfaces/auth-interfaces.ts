export interface RegisterUser {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userUsername: string;
  userPassword: string;
  userRole?: Role;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
}

export interface RegisterResponse {
  success: boolean;
}

export interface LoginUser {
  userEmail: string;
  userPassword: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  message?: string;
}

export enum Role {
  CLIENT = 'client',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}
