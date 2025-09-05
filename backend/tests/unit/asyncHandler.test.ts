import { asyncHandler } from '../../src/middlewares/asyncHandler';
import { Request, Response } from 'express';

describe('asyncHandler Unit Tests', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    req = {};
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    res = { status: statusMock } as unknown as Response;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  const mockEnv = (env: string) => {
    Object.defineProperty(process, 'env', {
      value: { NODE_ENV: env },
      configurable: true,
    });
  };

  it('should return 200 when success is true', async () => {
    mockEnv('development');
    const handler = asyncHandler(async () => ({ success: true, data: { here: 'now' } }));
    await handler(req as Request, res as Response, jest.fn());
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ success: true, data: { here: 'now' } });
  });

  it('should handle 404 NOT_FOUND in production', async () => {
    mockEnv('production');
    const handler = asyncHandler(async () => ({ success: false, error: { code: 'NOT_FOUND' } }));
    await handler(req as Request, res as Response, jest.fn());
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({ success: false, error: {} });
  });

  it('should handle 500 ERROR in production', async () => {
    mockEnv('production');
    const handler = asyncHandler(async () => ({
      success: false,
      error: { code: 'ERROR', message: 'oops' },
    }));
    await handler(req as Request, res as Response, jest.fn());
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: { message: undefined, code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('should return full error message in development', async () => {
    mockEnv('development');
    const handler = asyncHandler(async () => ({
      success: false,
      error: { code: 'ERROR', message: 'oops' },
    }));
    await handler(req as Request, res as Response, jest.fn());
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: { message: 'oops', code: 'ERROR' },
    });
  });

  it('should handle thrown exceptions in production', async () => {
    mockEnv('production');
    const handler = asyncHandler(async () => {
      throw new Error('boom');
    });
    await handler(req as Request, res as Response, jest.fn());
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: { message: undefined, code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('should handle thrown exceptions in development', async () => {
    mockEnv('development');
    const handler = asyncHandler(async () => {
      throw new Error('boom');
    });

    await handler(req as Request, res as Response, jest.fn());

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Error: boom', code: 'INTERNAL_SERVER_ERROR' },
    });
  });
});
