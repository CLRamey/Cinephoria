// electron logger.ts
// Utility functions for logging based on environment
export const isProd = process.env.NODE_ENV === 'production';

// Log messages only in non-production environments
export function log(message: string) {
  if (!isProd) {
    console.log(message);
  }
}
// Log errors only in non-production environments
export function logerror(message: string) {
  if (!isProd) {
    console.error(message);
  }
}
// Log warnings only in non-production environments
export function logwarn(message: string) {
  if (!isProd) {
    console.warn(message);
  }
}
