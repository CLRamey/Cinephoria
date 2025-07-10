import { getGenreInfo } from '../../src/services/genreInfoService';
import { genre } from '../../src/models/init-models';

jest.mock('../../src/models/init-models');

afterEach(() => {
  jest.clearAllMocks();
});

const baseMockGenreData = [
  {
    toJSON: () => ({
      genreId: 1,
      genreType: 'Adventure',
    }),
  },
  {
    toJSON: () => ({
      genreId: 2,
      genreType: 'Comedy',
    }),
  },
];

describe('getGenreInfo', () => {
  it('should return genre data successfully', async () => {
    (genre.findAll as jest.Mock).mockResolvedValue(baseMockGenreData);
    const result = await getGenreInfo();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].genreType).toBe('Adventure');
      expect(result.data?.[1].genreType).toBe('Comedy');
    }
  });

  it('should return error if no genre data is found', async () => {
    (genre.findAll as jest.Mock).mockResolvedValue([]);
    const result = await getGenreInfo();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('GENRE_INFO_NOT_FOUND');
      expect(result.error.message).toBe('Genre information not found');
    }
  });

  it('should handle exceptions and return service error', async () => {
    (genre.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
    const result = await getGenreInfo();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('GENRE_INFO_SERVICE_ERROR');
    }
  });
});
