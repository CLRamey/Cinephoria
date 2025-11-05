import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminComponent } from '../../projects/cinephoria-web/src/app/features/admin/admin.component';
import { AdminZoneService } from '../../projects/cinephoria-web/src/app/services/admin-zone.service';
import { of, throwError } from 'rxjs';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  let mockAdminZoneService: Partial<AdminZoneService>;

  beforeEach(async () => {
    mockAdminZoneService = {
      getAdminDashboardStats: jest.fn().mockReturnValue(of({ statistics: [] })),
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

  it('should initialize the state on init', () => {
    component.ngOnInit();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(false);
    expect(component.employeesLoading).toBe(false);
    expect(component.employeesError).toBe(false);
    expect(component.statistics).toEqual([]);
    expect(component.employees).toEqual([]);
    expect(component.selectedEmployeeId).toBeNull();
  });

  it('should load statistics and employees on init', () => {
    component.ngOnInit();
    expect(mockAdminZoneService.getAdminDashboardStats).toHaveBeenCalled();
    expect(mockAdminZoneService.getAllEmployees).toHaveBeenCalled();
  });

  it('should check the window.addEventListener size on init', () => {
    const spy = jest.spyOn(window, 'addEventListener');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should return the statistics on success loadReservationStatistics', () => {
    jest
      .spyOn(mockAdminZoneService, 'getAdminDashboardStats')
      .mockReturnValue(of({ statistics: [] }));
    component['loadReservationStatistics']();
    expect(component.isLoading).toBe(false);
    expect(component.statistics).toEqual([]);
  });

  it('should handle error on loadReservationStatistics', () => {
    jest
      .spyOn(mockAdminZoneService, 'getAdminDashboardStats')
      .mockReturnValue(throwError(() => new Error('Error')));
    component['loadReservationStatistics']();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(true);
    expect(component.statistics).toEqual([]);
  });

  it('should set the initial state on loadReservationStatistics with no data', () => {
    jest.spyOn(mockAdminZoneService, 'getAdminDashboardStats').mockReturnValue(of());
    component['loadReservationStatistics']();
    expect(component.isLoading).toBe(true);
  });

  it('should return employees on success loadEmployees', () => {
    jest.spyOn(mockAdminZoneService, 'getAllEmployees').mockReturnValue(of({ employees: [] }));
    component['loadEmployees']();
    expect(component.employeesLoading).toBe(false);
    expect(component.employeesError).toBe(false);
    expect(component.employees).toEqual([]);
  });

  it('should handle error on loadEmployees', () => {
    jest
      .spyOn(mockAdminZoneService, 'getAllEmployees')
      .mockReturnValue(throwError(() => new Error('Error')));
    component['loadEmployees']();
    expect(component.employeesLoading).toBe(false);
    expect(component.employeesError).toBe(true);
    expect(component.employees).toEqual([]);
  });

  it('should set the initial state on loadEmployees with no data', () => {
    jest.spyOn(mockAdminZoneService, 'getAllEmployees').mockReturnValue(of());
    component['loadEmployees']();
    expect(component.employeesLoading).toBe(true);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
