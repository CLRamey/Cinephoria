// Interface for responses
export type ServiceResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { message: string; code: string } };

export function successResponse<T>(data: T): ServiceResponse<T> {
  return { success: true, data };
}

export function errorResponse(message: string, code: string): ServiceResponse<never> {
  return { success: false, error: { message, code } };
}
