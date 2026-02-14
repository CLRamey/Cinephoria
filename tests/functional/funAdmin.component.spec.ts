import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminComponent } from '../../projects/cinephoria-web/src/app/features/admin/admin.component';
import { AdminZoneService } from '../../projects/cinephoria-web/src/app/services/admin-zone.service';
import { of } from 'rxjs';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  let mockAdminZoneService: Partial<AdminZoneService>;

  beforeEach(async () => {
    mockAdminZoneService = {
      getAdminDashboardStats: jest.fn().mockReturnValue(
        of({
          statistics: [
            {
              filmId: 1,
              filmTitle: 'Film 1',
              date: new Date(),
              reservationCount: 5,
            },
          ],
        }),
      ),
      getAllEmployees: jest.fn().mockReturnValue(of({ employees: [] })),
      addEmployee: jest.fn().mockReturnValue(of({})),
      resetEmployeePassword: jest.fn().mockReturnValue(of({})),
    } as unknown as AdminZoneService;
    await TestBed.configureTestingModule({
      declarations: [AdminComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: AdminZoneService, useValue: mockAdminZoneService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminComponent);
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

  it('should updateColumns based on width', () => {
    component.updateColumns(500);
    expect(component.employeeColumns).toEqual(['userLastName', 'userFirstName', 'actions']);
    component.updateColumns(800);
    expect(component.employeeColumns).toEqual(component['allEmployeeColumns']);
  });
});
