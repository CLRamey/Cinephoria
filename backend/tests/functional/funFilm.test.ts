import {
  publicFilmInfoController,
  publicFilmInfoByIdController,
} from '../../src/controllers/filmInfoController';
import { getFilmInfo, getFilmInfoById } from '../../src/services/filmInfoService';

jest.mock('../../src/services/filmInfoService');

import { Request, Response } from 'express';

afterEach(() => {
  jest.clearAllMocks();
});

describe('publicFilmInfoController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 200 and film data on success', async () => {
    (getFilmInfo as jest.Mock).mockResolvedValue({
      success: true,
      data: [
        {
          filmId: 1,
          filmTitle: 'Test Film',
        },
      ],
    });
    await publicFilmInfoController(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [
        {
          filmId: 1,
          filmTitle: 'Test Film',
        },
      ],
    });
  });

  it('should return 404 if no film data is found', async () => {
    (getFilmInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: { message: 'Cinema information not found.', code: 'FILM_INFO_NOT_FOUND' },
    });
    await publicFilmInfoController(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: { message: 'Cinema information not found.', code: 'FILM_INFO_NOT_FOUND' },
    });
  });

  it('should return 500 on service error', async () => {
    (getFilmInfo as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'An error occurred while retrieving film information.',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    });
    await publicFilmInfoController(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'An error occurred while retrieving film information.',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    });
  });
});

describe('publicFilmInfoByIdController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {
      params: {
        filmId: '1',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it('should return 200 and film data on success', async () => {
    (getFilmInfoById as jest.Mock).mockResolvedValue({
      success: true,
      data: [{ filmTitle: 'Test Film' }],
    });
    await publicFilmInfoByIdController(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ filmTitle: 'Test Film' }],
    });
  });

  it('should return 404 if film not found', async () => {
    (getFilmInfoById as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'Film not found',
        code: 'NOT_FOUND',
      },
    });
    await publicFilmInfoByIdController(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Film not found',
        code: 'NOT_FOUND',
      },
    });
  });

  it('should return 500 on internal error', async () => {
    (getFilmInfoById as jest.Mock).mockResolvedValue({
      success: false,
      error: {
        message: 'Internal error',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    });
    await publicFilmInfoByIdController(req as Request, res as Response, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: {
        message: 'Internal error',
        code: 'FILM_INFO_SERVICE_ERROR',
      },
    });
  });
});
