import { Request, Response, NextFunction } from 'express';

type HandlerResponse = {
  success: boolean;
  error?: {
    message?: string;
    code?: string;
  };
};

// This middleware function wraps an asynchronous request handler and handles errors.
// Production-safe adaptation for controlled error responses
export function asyncHandler(fn: (req: Request, res: Response) => Promise<HandlerResponse>) {
  return async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const result = await fn(req, res);

      if (result.success) {
        res.status(200).json(result);
      } else {
        const code = result.error?.code;

        let statusCode = code?.includes('NOT_FOUND')
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

        // Production-safe error responses
        if (process.env.NODE_ENV === 'production' && statusCode >= 500) {
          statusCode = 500;
          res.status(statusCode).json({
            success: false,
            error: { code: 'INTERNAL_SERVER_ERROR' },
          });
          return;
        } else if (process.env.NODE_ENV === 'production' && statusCode >= 400 && statusCode < 500) {
          res.status(statusCode).json({
            success: false,
            error: {},
          });
          return;
        }
        // Development full error responses
        res.status(statusCode).json(result);
      }
    } catch (err) {
      // Production-safe error handling
      if (process.env.NODE_ENV === 'production') {
        res.status(500).json({
          success: false,
          error: { code: 'INTERNAL_SERVER_ERROR' },
        });
      } else {
        // Development-safe error response
        res.status(500).json({
          success: false,
          error: {
            message: String(err),
            code: 'INTERNAL_SERVER_ERROR',
          },
        });
      }
    }
  };
}
