import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
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

const mockData = {
  roomId: 1,
  roomCapacity: 50,
  roomNumber: 1,
  numRows: 0,
  seatsPerRow: 0,
  qualityId: 1,
  cinemaId: 1,
  cinemaName: 'Cinema Test',
  cinema: { cinemaId: 1, cinemaName: 'Cinema Test' },
  quality: { qualityId: 1, qualityProjectionType: '2D' },
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
        { provide: MAT_DIALOG_DATA, useValue: mockData },
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

  it('should initialize form with provided data', () => {
    expect(component.cinemaName).toBe('Cinema Test');
    expect(component.cinemaSelected).toBe('Cinema Test');
    expect(component.roomForm.get('roomNumber')?.value).toBe(1);
    expect(component.roomForm.get('numRows')?.value).toBe(0);
    expect(component.roomForm.get('seatsPerRow')?.value).toBe(0);
    expect(component.roomForm.get('qualityId')?.value).toBe(1);
    expect(component.roomForm.get('cinemaId')?.value).toBe(1);
    if (component.roomForm.get('roomNumber')) {
      expect(component.roomForm.get('roomNumber')?.disabled).toBe(true);
    }
    expect(component.roomCapacity).toBe(50);
  });

  it('should call QualityInfoService and set qualities correctly on ngOnInit', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockQualityInfoService.getQualityInfo).toHaveBeenCalled();
    expect(component.qualities.map(q => q.qualityProjectionType)).toEqual(['2D', 'IMAX']);
  });

  it('should handle QualityInfoService error gracefully', () => {
    mockQualityInfoService.getQualityInfo.mockReturnValueOnce(
      throwError(() => new Error('Service error')),
    );
    component.ngOnInit();
    fixture.detectChanges();
    expect(mockQualityInfoService.getQualityInfo).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith(
      'Erreur lors du chargement des qualités :',
      expect.any(Error),
    );
  });
});
