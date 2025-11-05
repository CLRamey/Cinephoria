import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AdminZoneService } from '../../projects/cinephoria-web/src/app/services/admin-zone.service';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';
import {
  Employees,
  EmployeeRole,
  CreateEmployee,
} from '../../projects/cinephoria-web/src/app/interfaces/staff-interfaces';
import { ReservationStats } from '../../projects/cinephoria-web/src/app/interfaces/reservation';

describe('AdminZoneService', () => {
  let service: AdminZoneService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminZoneService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AdminZoneService);
    httpMock = TestBed.inject(HttpTestingController);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAdminDashboardStats', () => {
    it('should return statistics on success', () => {
      const mockStats: ReservationStats[] = [
        { filmId: 1, filmTitle: 'Inception', date: '2025-10-31', reservationCount: 30 },
      ];
      const mockResponse = { success: true, data: mockStats };
      service.getAdminDashboardStats().subscribe(result => {
        expect(result.statistics).toEqual(mockStats);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/reservation-stats`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush(mockResponse);
    });

    it('should return empty statistics array on failure', () => {
      const mockResponse = { success: false, message: 'Error' };
      service.getAdminDashboardStats().subscribe(result => {
        expect(result.statistics).toEqual([]);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/reservation-stats`);
      req.flush(mockResponse);
    });

    it('should handle error gracefully', () => {
      service.getAdminDashboardStats().subscribe(result => {
        expect(result.statistics).toEqual([]);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/reservation-stats`);
      req.error(new ProgressEvent('network error'));
    });

    it('should catch errors and return empty statistics', () => {
      service.getAdminDashboardStats().subscribe(result => {
        expect(result.statistics).toEqual([]);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/reservation-stats`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('getAllEmployees', () => {
    it('should return list of employees on success', () => {
      const mockEmployees: Employees[] = [
        {
          userId: 1,
          userFirstName: 'Alice',
          userLastName: 'Smith',
          userUsername: 'alice',
          userEmail: 'alice@example.com',
        },
      ];
      const mockResponse = { success: true, data: mockEmployees };
      service.getAllEmployees().subscribe(result => {
        expect(result.employees).toEqual(mockEmployees);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employees`);
      expect(req.request.method).toBe('GET');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush(mockResponse);
    });

    it('should return empty employee list on failure', () => {
      const mockResponse = { success: false, message: 'Error' };
      service.getAllEmployees().subscribe(result => {
        expect(result.employees).toEqual([]);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employees`);
      req.flush(mockResponse);
    });

    it('should handle error gracefully in getAllEmployees', () => {
      service.getAllEmployees().subscribe(result => {
        expect(result.employees).toEqual([]);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employees`);
      req.error(new ProgressEvent('network error'));
    });

    it('should catch errors and return empty employee list', () => {
      service.getAllEmployees().subscribe(result => {
        expect(result.employees).toEqual([]);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employees`);
      req.flush('Error', { status: 500, statusText: 'Server Error' });
      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('addEmployee', () => {
    it('should return true if employee added successfully', () => {
      const mockEmployee = {
        userFirstName: 'John',
        userLastName: 'Doe',
        userUsername: 'jdoe',
        userEmail: 'jdoe@example.com',
        userPassword: 'Pass123Long!',
        userRole: EmployeeRole.EMPLOYEE,
      };
      service.addEmployee(mockEmployee).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employee`);
      expect(req.request.method).toBe('POST');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false if employee addition fails', () => {
      const mockEmployee = { userFirstName: 'Jane', userLastName: 'Doe' };
      service.addEmployee(mockEmployee as CreateEmployee).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employee`);
      req.flush({ success: false });
    });

    it('should return false and log error on network failure', () => {
      const spy = jest.spyOn(console, 'error');
      service.addEmployee({} as CreateEmployee).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employee`);
      req.error(new ProgressEvent('network error'));
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('resetEmployeePassword', () => {
    it('should return true if password reset successful', () => {
      const resetData = { userId: 1, newPassword: 'NewPass123!' };
      service.resetEmployeePassword(resetData).subscribe(result => {
        expect(result).toBe(true);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employee/password`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.withCredentials).toBe(true);
      expect(req.request.responseType).toBe('json');
      req.flush({ success: true });
    });

    it('should return false if password reset fails', () => {
      const resetData = { userId: 1, newPassword: 'NewPass123!' };
      service.resetEmployeePassword(resetData).subscribe(result => {
        expect(result).toBe(false);
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employee/password`);
      req.flush({ success: false });
    });

    it('should return false and log error on password reset network failure', () => {
      const spy = jest.spyOn(console, 'error');
      const resetData = { userId: 1, newPassword: 'NewPass123!' };
      service.resetEmployeePassword(resetData).subscribe(result => {
        expect(result).toBe(false);
        expect(spy).toHaveBeenCalled();
      });
      const req = httpMock.expectOne(`${environment.apiURL}/employee/password`);
      req.error(new ProgressEvent('network error'));
      expect(spy).toHaveBeenCalled();
    });
  });
});
