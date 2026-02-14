import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RoomFormComponent } from '../../projects/auth/src/lib/shared/utils/room-form.component';
import { QualityInfoService } from '../../projects/cinephoria-web/src/app/services/quality-info.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { QualityInfo } from '../../projects/auth/src/lib/interfaces/staff-interfaces';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const mockDialogRef = {
  close: jest.fn(),
};

const mockQualityInfoService = {
  getQualityInfo: jest.fn().mockReturnValue(
    of<QualityInfo[]>([
      { qualityId: 1, qualityProjectionType: '2D' },
      { qualityId: 2, qualityProjectionType: 'IMAX' },
    ]),
  ),
};

describe('RoomFormComponent', () => {
  let component: RoomFormComponent;
  let fixture: ComponentFixture<RoomFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomFormComponent, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
        { provide: QualityInfoService, useValue: mockQualityInfoService },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(RoomFormComponent);
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

  it('should call ngOnInit and initialize qualities from QualityInfoService', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockQualityInfoService.getQualityInfo).toHaveBeenCalled();
    expect(component.qualities.length).toBe(2);
    expect(component.qualities[0].qualityProjectionType).toBe('2D');
  });

  it('should calculate total capacity correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();
    component.roomForm.patchValue({ numRows: 5, seatsPerRow: 10 });
    expect(component.calculateTotalCapacity()).toBe(50);
    component.roomForm.patchValue({ numRows: 0, seatsPerRow: 0 });
    expect(component.calculateTotalCapacity()).toBe(0);
  });

  it('should close dialog with room data when form is valid and submitted', () => {
    component.roomForm.setValue({
      roomNumber: 1,
      numRows: 5,
      seatsPerRow: 10,
      qualityId: 1,
      cinemaId: 1,
    });
    expect(component.roomForm.valid).toBe(true);
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      roomData: expect.objectContaining({
        roomNumber: 1,
        qualityId: 1,
        cinemaId: 1,
      }),
      numRows: 5,
      seatsPerRow: 10,
    });
  });

  it('should close dialog with null when cancelled', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('should update totalCapacity when numRows or seatsPerRow change', () => {
    component.roomForm.patchValue({ numRows: 4, seatsPerRow: 5 });
    fixture.detectChanges();
    expect(component.totalCapacity).toBe(20);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subs'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
