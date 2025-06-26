import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { FooterComponent } from '../../projects/cinephoria-web/src/app/layout/footer/footer.component';
import { of, throwError } from 'rxjs';

// Jest globals are available automatically in Jest, so explicit import is not needed and can cause issues in some setups.

describe('FooterComponent', () => {
  let component: FooterComponent;
  let fixture: ComponentFixture<FooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FooterComponent],
      providers: [
        {
          provide: CinemaInfoService,
          useValue: {
            getCinemaInfo: jest.fn().mockReturnValue(of({ CinemaInfo: [] })),
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FooterComponent);
    component = fixture.componentInstance;
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize cinemaInfo on ngOnInit', () => {
    const mockCinemaInfoService = TestBed.inject(CinemaInfoService);
    jest.spyOn(mockCinemaInfoService, 'getCinemaInfo').mockReturnValue(
      of({
        CinemaInfo: [
          {
            id: 1,
            cinemaName: 'Cinéphoria',
            cinemaAddress: '123 Rue du Cinéma',
            cinemaPostalCode: '75000',
            cinemaCity: 'Paris',
            cinemaPhone: '0123456789',
            cinemaCountry: 'France',
            cinemaTelNumber: '0123456789',
            cinemaOpeningHours: '10:00-22:00',
          },
        ],
      }),
    );
    component.ngOnInit();
    fixture.detectChanges();

    expect(component.cinemaInfo.length).toBeGreaterThan(0);
    expect(component.cinemaInfo[0].cinemaName).toBe('Cinéphoria');
  });

  it('should handle error on ngOnInit', () => {
    const mockCinemaInfoService = TestBed.inject(CinemaInfoService);
    (mockCinemaInfoService.getCinemaInfo as jest.Mock).mockReturnValue(
      throwError(() => new Error('Service error')),
    );
    jest.spyOn(console, 'error').mockImplementation(() => {});
    component.ngOnInit();
    fixture.detectChanges();

    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors de la récupération des informations cinéma:',
      expect.any(Error),
    );
  });

  it('should warn when no cinema info is available', () => {
    const mockCinemaInfoService = TestBed.inject(CinemaInfoService);
    jest.spyOn(mockCinemaInfoService, 'getCinemaInfo').mockReturnValue(of({ CinemaInfo: [] }));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    component.ngOnInit();
    fixture.detectChanges();

    expect(console.warn).toHaveBeenCalledWith('Aucune information de cinéma disponible.');
  });

  it('should return the current year', () => {
    const currentYear = new Date().getFullYear();
    expect(component.getCurrentYear()).toBe(currentYear);
  });
});
