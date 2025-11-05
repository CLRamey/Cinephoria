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
  cinemaId: 1,
  filmId: 1,
  roomId: 1,
  cinema: { cinemaId: 1, cinemaName: 'CineMax' },
  room: { roomId: 1, roomNumber: 5 },
  film: { filmId: 1, filmTitle: 'Avatar' },
  screeningDate: '2025-12-10T14:30:00',
};

describe('ScreeningFormComponent', () => {
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

  it('should prefill date and time if screeningDate is provided', () => {
    component.ngOnInit();
    fixture.detectChanges();
    const dateValue = component.screeningForm.get('date')?.value;
    const timeValue = component.screeningForm.get('time')?.value;
    const hoursValue = String(dateValue.getHours()).padStart(2, '0');
    const minutesValue = String(dateValue.getMinutes()).padStart(2, '0');
    expect(hoursValue).toBe('14');
    expect(minutesValue).toBe('30');
    expect(dateValue).toBeInstanceOf(Date);
    expect(timeValue).toBe('14:30');
  });

  it('should block past dates in pastDateFilter', () => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - 1);
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + 1);
    expect(component.pastDateFilter(pastDate)).toBe(false);
    expect(component.pastDateFilter(today)).toBe(true);
    expect(component.pastDateFilter(futureDate)).toBe(true);
  });

  it('should close dialog with formatted screeningData when form is valid and submitted', () => {
    component.screeningForm.setValue({
      date: new Date('2025-12-10'),
      time: '14:30',
    });
    component.onSubmit();
    expect(component.data?.cinemaId).toBe(1);
    expect(component.data?.roomId).toBe(1);
    expect(component.data?.filmId).toBe(1);
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      screeningData: {
        cinemaId: 1,
        roomId: 1,
        filmId: 1,
        screeningDate: '2025-12-10 14:30:00',
      },
    });
  });

  it('should close dialog with null when cancelled', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subs'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
