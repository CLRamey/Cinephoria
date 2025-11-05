import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ScreeningFormComponent } from '../../projects/auth/src/lib/shared/utils/screening-form.component';
import { Screenings } from '../../projects/auth/src/lib/interfaces/staff-interfaces';
import { MatNativeDateModule } from '@angular/material/core';

const mockDialogRef = {
  close: jest.fn(),
};

const mockData: Screenings = {
  screeningId: 1,
  screeningDate: '2025-12-10T14:30:00',
  cinemaId: 1,
  filmId: 1,
  roomId: 1,
  cinema: { cinemaId: 1, cinemaName: 'CineMax' },
  room: { roomId: 1, roomNumber: 5 },
  film: { filmId: 1, filmTitle: 'Avatar' },
};

describe('Integration ScreeningFormComponent', () => {
  let component: ScreeningFormComponent;
  let fixture: ComponentFixture<ScreeningFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreeningFormComponent, NoopAnimationsModule, MatNativeDateModule],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ScreeningFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should use the data cinemaId, roomId, and filmId if present on NgOnInit', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.data?.screeningDate).toBe('2025-12-10T14:30:00');
    expect(component.data?.cinemaId).toBe(1);
    expect(component.data?.roomId).toBe(1);
    expect(component.data?.filmId).toBe(1);
    expect(component.cinemaSelected).toBe('CineMax');
    expect(component.roomSelected).toBe(5);
    expect(component.filmSelected).toBe('Avatar');
  });
});
