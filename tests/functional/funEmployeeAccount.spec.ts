import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeAccountComponent } from '../../projects/cinephoria-web/src/app/features/admin/employee-account/employee-account.component';

const mockDialogRef = {
  close: jest.fn(),
};

const mockFormValue = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'john.doe@example.com',
  password: 'Password123!',
  confirmPassword: 'Password123!',
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

  it('should populate form values correctly', () => {
    component.employeeForm.setValue(mockFormValue);
    expect(component.employeeForm.value).toEqual(mockFormValue);
    expect(component.employeeForm.valid).toBe(true);
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      employeeData: {
        userEmail: 'john.doe@example.com',
        userFirstName: 'John',
        userLastName: 'Doe',
        userPassword: 'Password123!',
        userRole: 'employee',
        userUsername: 'johndoe',
      },
    });
  });
});
