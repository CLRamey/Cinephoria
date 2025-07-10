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
        const statusCode = result.error?.code?.includes('NOT_FOUND') ? 404 : 500;
        res.status(statusCode).json(result);
      }
    } catch (err) {
      next(err);
    }
  };
}
