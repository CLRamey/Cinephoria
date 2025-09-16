export interface RegisterUser {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userUsername: string;
  userPassword: string;
  userRole: Role;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
}

export interface RegisterResponse {
  success: boolean;
}

export interface LoginResponse {
  success: boolean;
}

export interface LoginUser {
  userEmail: string;
  userPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    userRole: Role;
  };
}

export interface AuthCookieResponse {
  success: boolean;
  data: {
    userRole: Role;
  };
}

export enum Role {
  CLIENT = 'client',
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}
