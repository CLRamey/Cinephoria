import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StaffActionsComponent } from '../../projects/auth/src/lib/shared/staff-actions/staff-actions.component';
import { StaffActionsService } from '../../projects/auth/src/lib/services/staff-actions.service';
import { of } from 'rxjs';

describe('StaffActionsComponent', () => {
  let component: StaffActionsComponent;
  let fixture: ComponentFixture<StaffActionsComponent>;

  let mockStaffActionsService: jest.Mocked<StaffActionsService>;

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
    await TestBed.configureTestingModule({
      imports: [StaffActionsComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: StaffActionsService, useValue: mockStaffActionsService },
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

  it('should updateColumns based on width', () => {
    component.updateColumns(500);
    expect(component.filmColumns).toEqual(['filmTitle', 'actions']);
    expect(component.roomColumns).toEqual(['roomNumber', 'actions']);
    expect(component.screeningColumns).toEqual(['screeningDate', 'film.filmTitle', 'actions']);
    component.updateColumns(800);
    expect(component.filmColumns).toEqual(component['allFilmColumns']);
    expect(component.roomColumns).toEqual(component['allRoomColumns']);
    expect(component.screeningColumns).toEqual(component['allScreeningColumns']);
  });
});
