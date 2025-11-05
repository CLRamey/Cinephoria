import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { VerificationDialogComponent } from '../../projects/auth/src/lib/shared/utils/verification-dialog.component';

describe('VerificationDialogComponent', () => {
  const mockDialogRef = { close: jest.fn() };
  let component: VerificationDialogComponent;
  let fixture: ComponentFixture<VerificationDialogComponent>;

  const mockData = {
    title: 'Test Title',
    message: 'Are you sure you want to proceed?',
    confirmText: 'Yes',
    cancelText: 'No',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerificationDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VerificationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog with true on confirm', () => {
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });

  it('should close the dialog with false on cancel', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
