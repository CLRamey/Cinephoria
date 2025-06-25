import { getCinemaInfo } from '../../src/services/cinemaInfoService';
import { cinema } from '../../src/models/cinema';

jest.mock('../../src/models/cinema');

describe('getCinemaInfo - Service Unit Test', () => {
  it('should return formatted cinema information', async () => {
    (cinema.findAll as jest.Mock).mockResolvedValue([
      {
        cinemaName: 'Cinéphoria',
        cinemaAddress: '123 rue du cinéma',
        cinemaPostalCode: '75000',
        cinemaCity: 'Paris',
        cinemaCountry: 'France',
        cinemaTelNumber: '0102030405',
        cinemaOpeningHours: '10h-22h',
      },
    ]);

    const result = await getCinemaInfo();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].cinemaName).toBe('Cinéphoria');
    }
  });

  it('should handle the case where no information is found', async () => {
    (cinema.findAll as jest.Mock).mockResolvedValue([]);

    const result = await getCinemaInfo();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CINEMA_INFO_NOT_FOUND');
    }
  });

  it('should handle exceptions and return service error', async () => {
    (cinema.findAll as jest.Mock).mockRejectedValue(new Error('DB error'));

    const result = await getCinemaInfo();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('CINEMA_INFO_SERVICE_ERROR');
    }
  });
});
