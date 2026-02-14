import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeAccountComponent } from '../../projects/cinephoria-web/src/app/features/admin/employee-account/employee-account.component';

const mockDialogRef = {
  close: jest.fn(),
};

describe('EmployeeAccountComponent', () => {
  let component: EmployeeAccountComponent;
  let fixture: ComponentFixture<EmployeeAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeAccountComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EmployeeAccountComponent);
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

  it('should set up the form on initialization', () => {
    expect(component.employeeForm).toBeDefined();
    expect(component.employeeForm.get('firstName')).toBeDefined();
    expect(component.employeeForm.get('lastName')).toBeDefined();
    expect(component.employeeForm.get('username')).toBeDefined();
    expect(component.employeeForm.get('email')).toBeDefined();
    expect(component.employeeForm.get('password')).toBeDefined();
    expect(component.employeeForm.get('confirmPassword')).toBeDefined();
  });

  it('should mark form invalid when empty and not submit', () => {
    component.onSubmit();
    expect(component.employeeForm.invalid).toBe(true);
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
