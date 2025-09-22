import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginEmployeeComponent } from '../../projects/cinephoria-web/src/app/features/auth/login-employee/login-employee.component';

describe('LoginEmployeeComponent', () => {
  let component: LoginEmployeeComponent;
  let fixture: ComponentFixture<LoginEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginEmployeeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the employee login component', () => {
    expect(component).toBeTruthy();
  });
});
