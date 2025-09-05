// Utility logger functions to manage logging based on the environment

// Ensure console logs are not visible in production
export const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(...args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2))));
  }
};

// Ensure console errors are not visible in production
export const logerror = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(
      ...args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2))),
    );
  }
};

// Ensure console warnings are not visible in production
export const logwarn = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      ...args.map(arg => (typeof arg === 'string' ? arg : JSON.stringify(arg, null, 2))),
    );
  }
};
