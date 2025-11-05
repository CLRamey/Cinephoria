export interface Employees {
  userId: number;
  userFirstName: string;
  userLastName: string;
  userUsername: string;
  userEmail: string;
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
}

export enum EmployeeRole {
  EMPLOYEE = 'employee',
}

export interface EmployeeResetPassword {
  userId: number;
  newPassword: string;
}
