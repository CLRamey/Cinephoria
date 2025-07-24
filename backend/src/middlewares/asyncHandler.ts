import { Request, Response, NextFunction } from 'express';

type HandlerResponse = {
  success: boolean;
  error?: {
    message?: string;
    code?: string;
  };
};

// This middleware function wraps an asynchronous request handler and handles errors.
export function asyncHandler(fn: (req: Request) => Promise<HandlerResponse>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await fn(req);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const code = result.error?.code;

        const statusCode = code?.includes('NOT_FOUND')
          ? 404
          : code?.includes('EXPIRED')
            ? 410
            : code?.includes('UNAUTHORIZED')
              ? 401
              : code?.includes('FORBIDDEN')
                ? 403
                : code?.includes('BAD_REQUEST')
                  ? 400
                  : code?.includes('ERROR')
                    ? 500
                    : 500;

        res.status(statusCode).json(result);
      }
    } catch (err) {
      next(err);
    }
  };
}
