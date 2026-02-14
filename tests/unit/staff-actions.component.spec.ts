import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StaffActionsComponent } from '../../projects/auth/src/lib/shared/staff-actions/staff-actions.component';
import { StaffActionsService } from '../../projects/auth/src/lib/services/staff-actions.service';
import { of, throwError } from 'rxjs';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('StaffActionsComponent', () => {
  let component: StaffActionsComponent;
  let fixture: ComponentFixture<StaffActionsComponent>;

  let mockStaffActionsService: jest.Mocked<StaffActionsService>;
  let mockCinemaInfoService: jest.Mocked<CinemaInfoService>;

  beforeEach(async () => {
    mockStaffActionsService = {
      getFilmsList: jest.fn().mockReturnValue(of({ Films: [] })),
      addFilm: jest.fn().mockReturnValue(of()),
      updateFilm: jest.fn().mockReturnValue(of()),
      deactivateFilm: jest.fn().mockReturnValue(of()),
      getRoomsList: jest.fn().mockReturnValue(of({ Rooms: [] })),
      addRoom: jest.fn().mockReturnValue(of()),
      updateRoom: jest.fn().mockReturnValue(of()),
      deactivateRoom: jest.fn().mockReturnValue(of()),
      getScreeningsList: jest.fn().mockReturnValue(of({ Screenings: [] })),
      addScreening: jest.fn().mockReturnValue(of()),
      updateScreening: jest.fn().mockReturnValue(of()),
      deactivateScreening: jest.fn().mockReturnValue(of()),
    } as unknown as jest.Mocked<StaffActionsService>;
    mockCinemaInfoService = {
      getCinemaInfo: jest.fn().mockReturnValue(of({ CinemaInfo: [] })),
    } as unknown as jest.Mocked<CinemaInfoService>;
    await TestBed.configureTestingModule({
      imports: [StaffActionsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: StaffActionsService, useValue: mockStaffActionsService },
        { provide: CinemaInfoService, useValue: mockCinemaInfoService },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StaffActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the StaffActionsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component state on ngOnInit', () => {
    fixture = TestBed.createComponent(StaffActionsComponent);
    expect(component.filmsLoading).toBe(false);
    expect(component.filmsError).toBe(false);
    expect(component.showAllFilms).toBe(false);
    expect(component.selectedFilm).toBe(false);
    expect(component.cinemasLoading).toBe(false);
    expect(component.cinemasError).toBe(false);
    expect(component.selectedCinema).toBe(false);
    expect(component.roomsLoading).toBe(false);
    expect(component.roomsError).toBe(false);
    expect(component.selectedRoom).toBe(false);
    expect(component.showAllRooms).toBe(false);
    expect(component.screeningsLoading).toBe(false);
    expect(component.screeningsError).toBe(false);
    expect(component.showAllScreenings).toBe(false);
  });

  it('should call loadFilmData and loadCinemaData on ngOnInit', () => {
    const loadFilmDataSpy = jest.spyOn(
      component as unknown as { loadFilmData: jest.Mock },
      'loadFilmData',
    );
    const loadCinemaDataSpy = jest.spyOn(
      component as unknown as { loadCinemaData: jest.Mock },
      'loadCinemaData',
    );
    component.ngOnInit();
    expect(loadFilmDataSpy).toHaveBeenCalled();
    expect(loadCinemaDataSpy).toHaveBeenCalled();
  });

  it('should check the window.addEventListener size on init', () => {
    const spy = jest.spyOn(window, 'addEventListener');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should set the initial state on loadFilmData', () => {
    jest.spyOn(mockStaffActionsService, 'getFilmsList').mockReturnValue(of());
    component['loadFilmData']();
    expect(component.filmsLoading).toBe(true);
  });

  it('should return films on success loadFilmData', () => {
    jest.spyOn(mockStaffActionsService, 'getFilmsList').mockReturnValue(of({ Films: [] }));
    component['loadFilmData']();
    expect(component.filmsLoading).toBe(false);
    expect(component.filmsError).toBe(false);
    expect(component.films).toEqual([]);
  });

  it('should handle no films found loadFilmData', () => {
    jest.spyOn(mockStaffActionsService, 'getFilmsList').mockReturnValue(of(null));
    component['loadFilmData']();
    expect(component.filmsLoading).toBe(false);
    expect(component.filmsError).toBe(true);
  });

  it('should handle an error when loading films', () => {
    jest
      .spyOn(mockStaffActionsService, 'getFilmsList')
      .mockReturnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.filmsLoading).toBe(false);
    expect(component.filmsError).toBe(true);
    expect(component.films).toEqual([]);
  });

  it('should set the initial state on loadCinemaData', () => {
    jest.spyOn(mockCinemaInfoService, 'getCinemaInfo').mockReturnValue(of());
    component['loadCinemaData']();
    expect(component.cinemasLoading).toBe(true);
  });

  it('should return cinemas on success loadCinemaData', () => {
    jest.spyOn(mockCinemaInfoService, 'getCinemaInfo').mockReturnValue(of({ CinemaInfo: [] }));
    component['loadCinemaData']();
    expect(component.cinemasLoading).toBe(false);
    expect(component.cinemasError).toBe(false);
    expect(component.cinemas).toEqual([]);
  });

  it('should handle an error when loading cinemas', () => {
    jest
      .spyOn(mockCinemaInfoService, 'getCinemaInfo')
      .mockReturnValue(throwError(() => new Error('Error')));
    component['loadCinemaData']();
    expect(component.cinemasLoading).toBe(false);
    expect(component.cinemasError).toBe(true);
    expect(component.cinemas).toEqual([]);
  });

  it('should set the selectedCinemaId OnCinemaSelect', () => {
    const loadRoomDataSpy = jest.spyOn(
      component as unknown as { loadRoomData: jest.Mock },
      'loadRoomData',
    );
    const onRoomSelectSpy = jest.spyOn(component, 'onRoomSelect');
    const onFilmSelectSpy = jest.spyOn(component, 'onFilmSelect');
    component.onCinemaSelect(1);
    expect(component.selectedCinemaId).toBe(1);
    expect(component.selectedCinema).toBe(true);
    expect(onRoomSelectSpy).toHaveBeenCalledWith(null);
    expect(onFilmSelectSpy).toHaveBeenCalledWith(null);
    expect(loadRoomDataSpy).toHaveBeenCalled();
  });

  it('should handle if OnCinemaSelect is called with 0', () => {
    const loadRoomDataSpy = jest.spyOn(
      component as unknown as { loadRoomData: jest.Mock },
      'loadRoomData',
    );
    component.onCinemaSelect(0);
    expect(component.selectedCinema).toBe(false);
    expect(component.selectedCinemaId).toBe(0);
    expect(component.staffRooms).toEqual([]);
    expect(component.staffScreenings).toEqual([]);
    expect(component.selectedRoomId).toBe(null);
    expect(component.selectedFilmId).toBe(null);
    expect(loadRoomDataSpy).not.toHaveBeenCalled();
  });

  it('should set the selectedRoomId OnRoomSelect', () => {
    const loadScreeningDataSpy = jest.spyOn(
      component as unknown as { loadScreeningData: jest.Mock },
      'loadScreeningData',
    );
    component.onCinemaSelect(1);
    component.onRoomSelect(1);
    expect(component.selectedRoomId).toBe(1);
    expect(component.selectedRoom).toBe(true);
    expect(loadScreeningDataSpy).toHaveBeenCalled();
  });

  it('should return if OnRoomSelect is called with no cinemaId', () => {
    const loadScreeningDataSpy = jest.spyOn(
      component as unknown as { loadScreeningData: jest.Mock },
      'loadScreeningData',
    );
    component.onCinemaSelect(null);
    component.onRoomSelect(0);
    expect(component.selectedRoom).toBe(false);
    expect(component.selectedRoomId).toBe(0);
    expect(component.staffScreenings).toEqual([]);
    expect(loadScreeningDataSpy).not.toHaveBeenCalled();
  });

  it('should handle if OnRoomSelect is called with 0', () => {
    const loadScreeningDataSpy = jest.spyOn(
      component as unknown as { loadScreeningData: jest.Mock },
      'loadScreeningData',
    );
    component.onCinemaSelect(1);
    component.onRoomSelect(0);
    expect(component.selectedRoom).toBe(false);
    expect(component.selectedRoomId).toBe(0);
    expect(component.staffScreenings).toEqual([]);
    expect(loadScreeningDataSpy).not.toHaveBeenCalled();
  });

  it('should set the selectedFilmId OnFilmSelect', () => {
    const loadScreeningDataSpy = jest.spyOn(
      component as unknown as { loadScreeningData: jest.Mock },
      'loadScreeningData',
    );
    component.onCinemaSelect(1);
    component.onRoomSelect(1);
    component.onFilmSelect(1);
    expect(component.selectedFilmId).toBe(1);
    expect(component.selectedFilm).toBe(true);
    expect(loadScreeningDataSpy).toHaveBeenCalled();
  });

  it('should return if OnFilmSelect is called with no cinemaId', () => {
    const loadScreeningDataSpy = jest.spyOn(
      component as unknown as { loadScreeningData: jest.Mock },
      'loadScreeningData',
    );
    const onRoomSelectSpy = jest.spyOn(component, 'onRoomSelect');
    component.onCinemaSelect(null);
    component.onRoomSelect(1);
    component.onFilmSelect(0);
    expect(component.selectedFilm).toBe(false);
    expect(component.selectedFilmId).toBe(0);
    expect(onRoomSelectSpy).toHaveBeenCalledWith(1);
    expect(loadScreeningDataSpy).not.toHaveBeenCalled();
  });

  it('should return if OnFilmSelect is called with no cinemaId or roomId', () => {
    const loadScreeningDataSpy = jest.spyOn(
      component as unknown as { loadScreeningData: jest.Mock },
      'loadScreeningData',
    );
    const onRoomSelectSpy = jest.spyOn(component, 'onRoomSelect');
    component.onCinemaSelect(null);
    component.onRoomSelect(null);
    component.onFilmSelect(0);
    expect(component.selectedFilm).toBe(false);
    expect(component.selectedFilmId).toBe(0);
    expect(onRoomSelectSpy).toHaveBeenCalledWith(null);
    expect(loadScreeningDataSpy).not.toHaveBeenCalled();
  });

  it('should return rooms on success loadRoomData', () => {
    jest.spyOn(mockStaffActionsService, 'getRoomsList').mockReturnValue(of({ Rooms: [] }));
    component.selectedCinemaId = 1;
    fixture.detectChanges();
    component['loadRoomData']();
    expect(component.roomsLoading).toBe(false);
    expect(component.roomsError).toBe(false);
    expect(component.rooms).toEqual([]);
  });

  it('should handle no rooms found loadRoomData', () => {
    jest.spyOn(mockStaffActionsService, 'getRoomsList').mockReturnValue(of(null));
    component.selectedCinemaId = 1;
    fixture.detectChanges();
    component['loadRoomData']();
    expect(component.roomsLoading).toBe(false);
    expect(component.roomsError).toBe(true);
  });

  it('should handle an error when loading rooms', () => {
    component.onCinemaSelect(1);
    jest
      .spyOn(mockStaffActionsService, 'getRoomsList')
      .mockReturnValue(throwError(() => new Error('Error')));
    component.ngOnInit();
    expect(component.roomsLoading).toBe(false);
    expect(component.rooms).toEqual([]);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
