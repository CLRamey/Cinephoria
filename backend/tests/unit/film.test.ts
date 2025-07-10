import { getFilmInfo, getFilmInfoById } from '../../src/services/filmInfoService';
import { film } from '../../src/models/init-models';

jest.mock('../../src/models/init-models');

afterEach(() => {
  jest.clearAllMocks();
});

const baseMockFilmData = [
  {
    toJSON: () => ({
      filmId: 1,
      filmTitle: 'The Great Adventure',
      filmDescription: 'An epic journey of discovery and survival.',
      filmImg: 'great-adventure.webp',
      filmDuration: 120,
      filmMinimumAge: 12,
      filmActiveDate: '2025-07-01',
      filmPublishingState: 'active',
      filmAverageRating: 4.5,
      genreFilms: [
        {
          genreId: 1,
          filmId: 1,
          genre: {
            genreId: 1,
            genreType: 'Adventure',
          },
        },
      ],
      cinemaFilms: [
        {
          cinemaId: 1,
          filmId: 1,
          cinema: {
            cinemaId: 1,
            cinemaName: 'Cinéphoria Central',
          },
        },
      ],
      screenings: [
        {
          screeningId: 10,
          screeningDate: '2025-07-10T15:00:00Z',
          screeningStatus: 'active',
          roomId: 5,
          filmId: 1,
          cinemaId: 1,
        },
      ],
    }),
  },
];

describe('getFilmInfo', () => {
  it('should return film data successfully', async () => {
    (film.findAll as jest.Mock).mockResolvedValue(baseMockFilmData);
    const result = await getFilmInfo();
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].filmTitle).toBe('The Great Adventure');
    }
  });

  it('should return error if no films found', async () => {
    (film.findAll as jest.Mock).mockResolvedValue([]);
    const result = await getFilmInfo();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('FILM_INFO_NOT_FOUND');
    }
  });

  it('should handle exceptions and return service error', async () => {
    (film.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));
    const result = await getFilmInfo();
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('FILM_INFO_SERVICE_ERROR');
    }
  });
});

describe('getFilmInfoById', () => {
  it('should return specific film by ID', async () => {
    (film.findByPk as jest.Mock).mockResolvedValue(baseMockFilmData[0]);
    const result = await getFilmInfoById(1);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.[0].filmTitle).toBe('The Great Adventure');
    }
  });

  it('should return NOT_FOUND error for invalid ID', async () => {
    (film.findByPk as jest.Mock).mockResolvedValue(null);
    const result = await getFilmInfoById(999);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error?.code).toBe('NOT_FOUND');
    }
  });
});
