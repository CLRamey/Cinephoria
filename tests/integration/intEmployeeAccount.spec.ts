import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmployeeAccountComponent } from '../../projects/cinephoria-web/src/app/features/admin/employee-account/employee-account.component';

const mockDialogRef = {
  close: jest.fn(),
};

const mockEmployeeData = {
  userId: 1,
  userFirstName: 'John',
  userLastName: 'Doe',
  userUsername: 'johndoe',
  userEmail: 'john.doe@example.com',
};

const mockEmployeePasswordDataValue = {
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
        { provide: MAT_DIALOG_DATA, useValue: mockEmployeeData },
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

  it('should initialize form with provided employee data', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.data).toEqual(mockEmployeeData);
    expect(component.firstName).toBe('John');
    expect(component.lastName).toBe('Doe');
    expect(component.username).toBe('johndoe');
    expect(component.email).toBe('john.doe@example.com');
    expect(component.employeeForm.get('password')).toBeDefined();
    expect(component.employeeForm.get('confirmPassword')).toBeDefined();
  });

  it('should populate form values correctly', () => {
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.data).toEqual(mockEmployeeData);
    component.employeeForm.get('password')!.setValue('Password123!');
    component.employeeForm.get('confirmPassword')!.setValue('Password123!');
    expect(component.employeeForm.value).toEqual(mockEmployeePasswordDataValue);
    component.onSubmit();
    expect(mockDialogRef.close).toHaveBeenCalledWith({
      resetData: {
        userId: 1,
        newPassword: 'Password123!',
      },
    });
  });
});
