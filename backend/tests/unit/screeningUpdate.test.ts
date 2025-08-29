import { isScreeningActive } from '../../src/utils/screeningUpdate';
import { screening } from '../../src/models/init-models';
import { successResponse, errorResponse } from '../../src/interfaces/serviceResponse';

jest.mock('../../src/models/init-models', () => ({
  screening: {
    findByPk: jest.fn(),
    update: jest.fn(),
  },
}));

describe('isScreeningActive', () => {
  const mockScreeningId = 1;

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should return NOT_FOUND if screening does not exist', async () => {
    (screening.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await isScreeningActive(mockScreeningId);
    expect(screening.findByPk).toHaveBeenCalledWith(mockScreeningId);
    expect(result).toEqual(errorResponse('Screening not found', 'NOT_FOUND'));
  });

  it('should return NOT_FOUND if screening is deleted', async () => {
    (screening.findByPk as jest.Mock).mockResolvedValue({
      screeningStatus: 'deleted',
      screeningDate: new Date(Date.now() + 1000 * 60 * 60),
    });
    const result = await isScreeningActive(mockScreeningId);
    expect(result).toEqual(errorResponse('Screening is deleted', 'NOT_FOUND'));
  });

  it('should update status to ended if screening is active but in the past', async () => {
    const pastDate = new Date(Date.now() - 1000 * 60 * 60);
    (screening.findByPk as jest.Mock).mockResolvedValue({
      screeningStatus: 'active',
      screeningDate: pastDate,
    });
    (screening.update as jest.Mock).mockResolvedValue([1]);
    const result = await isScreeningActive(mockScreeningId);
    expect(screening.update).toHaveBeenCalledWith(
      { screeningStatus: 'ended' },
      { where: { screeningId: mockScreeningId } },
    );
    expect(result).toEqual(errorResponse('Screening has ended', 'SCREENING_EXPIRED'));
  });

  it('should return success if screening is active and in the future', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60); // 1 hour later
    (screening.findByPk as jest.Mock).mockResolvedValue({
      screeningStatus: 'active',
      screeningDate: futureDate,
    });
    const result = await isScreeningActive(mockScreeningId);
    expect(screening.update).not.toHaveBeenCalled();
    expect(result).toEqual(
      successResponse({
        success: true,
        message: 'Screening is active',
      }),
    );
  });

  it('should return INTERNAL_SERVER_ERROR if an exception is thrown', async () => {
    (screening.findByPk as jest.Mock).mockRejectedValue(new Error('DB error'));
    const result = await isScreeningActive(mockScreeningId);
    expect(result).toEqual(errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR'));
  });
});
