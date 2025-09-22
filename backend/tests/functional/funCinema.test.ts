import { publicCinemaInfoController } from '../../src/controllers/cinemaInfoController';
import { getCinemaInfo } from '../../src/services/cinemaInfoService';

jest.mock('../../src/services/cinemaInfoService');

import { Request, Response } from 'express';

afterEach(() => {
  jest.clearAllMocks();
});

describe('cinemaInfoController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  it('should return 200 and data on success', async () => {
    (getCinemaInfo as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ cinemaName: 'Test Cinema' }],
    });
    await publicCinemaInfoController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ cinemaName: 'Test Cinema' }],
    });
  });

  it('should return 404 if cinema info not found', async () => {
    (getCinemaInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Not found', code: 'CINEMA_INFO_NOT_FOUND' },
    });
    await publicCinemaInfoController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Not found', code: 'CINEMA_INFO_NOT_FOUND' },
    });
  });

  it('should return 500 on service error', async () => {
    (getCinemaInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Error', code: 'CINEMA_INFO_SERVICE_ERROR' },
    });
    await publicCinemaInfoController(req as Request, res as Response);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Error', code: 'CINEMA_INFO_SERVICE_ERROR' },
    });
  });
});
