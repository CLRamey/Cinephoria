export interface Employees {
  userId: number;
  userFirstName: string;
  userLastName: string;
  userEmail: string;
  userRole: string;
}

export interface EmployeeSuccessResponse {
  success: true;
  data: Employees[];
}

export interface EmployeeErrorResponse {
  success: false;
  error: { message: string; code?: string };
}

export interface CreateEmployee {
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userUsername: string;
  userPassword: string;
  userRole: EmployeeRole.EMPLOYEE;
  agreedPolicy: boolean;
  agreedCgvCgu: boolean;
}

export enum EmployeeRole {
  EMPLOYEE = 'employee',
}

export interface EmployeeCreationResponse {
  success: boolean;
}
