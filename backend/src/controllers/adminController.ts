import { Request } from 'express';
import { asyncHandler } from '../middlewares/asyncHandler';
import { errorResponse } from '../interfaces/serviceResponse';
import { Role, validateRegisterInput } from '../validators/userValidator';
import { logerror } from '../utils/logger';
import * as adminDashboardService from '../services/adminService';
import { sanitizeEmployeeInput } from '../utils/sanitize';
import { registerEmployee, resetPassword } from '../services/registerUserService';

export const adminReservationsController = asyncHandler(adminReservationsHandler);
// Function to handle admin reservation stats requests
export async function adminReservationsHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || req.user.userRole !== Role.ADMIN) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }

    // Call the admin dashboard service to get reservation stats
    const response = await adminDashboardService.getReservationStats();
    if (!response.success) {
      return errorResponse(response.error.message, response.error.code);
    }

    // Return appropriate responses or catch any errors
    const reservationStats = response.data;
    return {
      success: true,
      data: reservationStats,
    };
  } catch (error) {
    logerror('Error handling admin reservations:', error);
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}

// Method to create employee accounts (employee only)
export const createEmployeeAccountController = asyncHandler(createEmployeeAccountHandler);
export async function createEmployeeAccountHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || req.user.userRole !== Role.ADMIN) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    const { employeeData } = req.body;

    // Set default agreements for employees
    employeeData.agreedPolicy = true;
    employeeData.agreedCgvCgu = true;

    // Ensure all required fields are present
    const {
      userFirstName,
      userLastName,
      userUsername,
      userEmail,
      userPassword,
      userRole,
      agreedPolicy,
      agreedCgvCgu,
    } = employeeData || {};
    if (
      !userFirstName ||
      !userLastName ||
      !userUsername ||
      !userEmail ||
      !userPassword ||
      !userRole ||
      agreedPolicy === undefined ||
      agreedCgvCgu === undefined
    ) {
      return errorResponse('Missing employee attribute', 'BAD_REQUEST');
    }

    // Validate input
    const sanitized = sanitizeEmployeeInput(employeeData);
    // Ensure the role is EMPLOYEE
    if (employeeData.userRole === 'employee') {
      employeeData.userRole = Role.EMPLOYEE;
    } else {
      return errorResponse('Invalid role for employee account', 'BAD_REQUEST');
    }
    const validatedData = await validateRegisterInput(sanitized);

    // Create employee in DB
    const response = await registerEmployee(validatedData);
    if (!response.success || !response.data) {
      return {
        success: false,
        error: {
          message: 'Employee registration failed',
          code: 'REGISTRATION_ERROR',
        },
      };
    }

    // Always return success to frontend if user is created
    return {
      success: true,
      data: {
        message: 'Employee registration successful.',
      },
    };
  } catch (error) {
    logerror('Employee registration error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred during employee registration',
        code: 'REGISTRATION_ERROR',
      },
    };
  }
}

// List employee accounts (employee only)
export const listEmployeeAccountsController = asyncHandler(listEmployeeAccountsHandler);
export async function listEmployeeAccountsHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || req.user.userRole !== Role.ADMIN) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }

    // Call the admin dashboard service to list employee accounts
    const response = await adminDashboardService.listEmployees();
    if (!response.success) {
      return errorResponse(response.error.message, response.error.code);
    }

    // Return appropriate responses or catch any errors
    const employeeAccounts = response.data;
    return {
      success: true,
      data: employeeAccounts,
    };
  } catch (error) {
    logerror('Error handling employee accounts listing:', error);
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}

// Modify employee password (employee only)
export const modifyEmployeePasswordController = asyncHandler(modifyEmployeePasswordHandler);
export async function modifyEmployeePasswordHandler(req: Request) {
  try {
    // Double check authentication and authorization
    if (!req.user || !req.user.userId) {
      return errorResponse('User not authenticated', 'UNAUTHORIZED');
    }
    if (req.user.userRole !== Role.ADMIN) {
      return errorResponse('User not authorized', 'UNAUTHORIZED');
    }
    // Extract reset data from request body
    const { resetData } = req.body;
    const { userId, newPassword } = resetData || {};

    // Ensure all required fields are present
    if (!userId || !newPassword) {
      return errorResponse('Missing required fields', 'BAD_REQUEST');
    }

    // Call the register user service to reset employee password
    const response = await resetPassword(userId, newPassword);
    if (!response.success) {
      return errorResponse(response.error.message, response.error.code);
    }

    // Return appropriate responses or catch any errors
    return {
      success: true,
      data: {
        message: 'Employee password reset successfully.',
      },
    };
  } catch (error) {
    logerror('Error handling employee password reset:', error);
    return {
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
      },
    };
  }
}
