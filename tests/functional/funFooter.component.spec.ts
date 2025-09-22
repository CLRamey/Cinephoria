import { FooterComponent } from '../../projects/cinephoria-web/src/app/layout/footer/footer.component';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { render, screen } from '@testing-library/angular';
import { MatToolbarModule } from '@angular/material/toolbar';
import '@testing-library/jest-dom';
import { of } from 'rxjs';

describe('FooterComponent', () => {
  const mockCinemaInfoService = {
    getCinemaInfo: jest.fn().mockReturnValue(
      of({
        CinemaInfo: [
          {
            cinemaName: 'Cinéphoria',
            cinemaAddress: '123 rue du cinéma',
            cinemaPostalCode: '75000',
            cinemaCity: 'Paris',
            cinemaCountry: 'France',
            cinemaTelNumber: '0102030405',
            cinemaOpeningHours: '10h-22h',
          },
        ],
      }),
    ),
  };

  it('should display the cinema information', async () => {
    await render(FooterComponent, {
      providers: [{ provide: CinemaInfoService, useValue: mockCinemaInfoService }],
      imports: [MatToolbarModule],
    });

    expect(screen.getByText('Cinéphoria')).toBeTruthy();
    expect(screen.getByText('123 rue du cinéma')).toBeTruthy();
    expect(screen.getByText('75000 Paris')).toBeTruthy();
    expect(screen.getByText('France')).toBeTruthy();
    expect(screen.getByText(/0102030405/)).toBeTruthy();
    expect(screen.getByText(/10h-22h/)).toBeTruthy();
  });
});
