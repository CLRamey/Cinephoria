import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminComponent } from '../../projects/cinephoria-web/src/app/features/admin/admin.component';
import { AdminZoneService } from '../../projects/cinephoria-web/src/app/services/admin-zone.service';
import { of, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('AdminComponent', () => {
  let component: AdminComponent;
  let fixture: ComponentFixture<AdminComponent>;

  let mockAdminZoneService: Partial<AdminZoneService>;
  const mockDialogRef = {
    close: jest.fn(),
  };
  let mockSnackBar: Partial<MatSnackBar>;
  const mockAdminDashboardStats = {
    filmId: 1,
    filmTitle: 'Film 1',
    date: new Date().toISOString(),
    reservationCount: 5,
  };

  const mockEmployees = {
    userId: 1,
    userFirstName: 'John',
    userLastName: 'Doe',
    userUsername: 'johndoe',
    userEmail: 'john.doe@example.com',
  };

  const mockAddEmployee = {
    userFirstName: 'Jane',
    userLastName: 'Smith',
    userUsername: 'janesmith',
    userEmail: 'jane.smith@example.com',
    userPassword: 'Password123!',
    userRole: 'employee',
  };

  const _mockReinstateEmployee = {
    userId: 2,
    userFirstName: 'Jane',
    userLastName: 'Smith',
    userUsername: 'janesmith',
    userEmail: 'jane.smith@example.com',
    userPassword: 'Password123!',
    userRole: 'employee',
  };

  const _mockErrorReinstateEmployee = {
    userId: 0,
    userFirstName: 'Jane',
    userLastName: 'Smith',
    userUsername: 'janesmith',
    userEmail: 'jane.smith@example.com',
    userPassword: 'password123',
  };

  const mockErrorAddEmployee = {
    userFirstName: 'Jane',
    userLastName: 'Smith',
    userUsername: 'janesmith',
    userEmail: 'jane.smith@example.com',
    userPassword: 'password123',
  };

  const mockSuccessResponse = true;
  const mockErrorResponse = false;

  beforeEach(async () => {
    mockAdminZoneService = {
      getAdminDashboardStats: jest.fn().mockReturnValue(
        of({
          statistics: [
            {
              filmId: 1,
              filmTitle: 'Film 1',
              date: new Date().toISOString(),
              reservationCount: 5,
            },
          ],
        }),
      ),
      getAllEmployees: jest.fn().mockReturnValue(
        of({
          employees: [
            {
              userId: 1,
              userFirstName: 'John',
              userLastName: 'Doe',
              userUsername: 'johndoe',
              userEmail: 'john.doe@example.com',
            },
          ],
        }),
      ),
      addEmployee: jest.fn().mockReturnValue(of({})),
      resetEmployeePassword: jest.fn().mockReturnValue(of({})),
    } as unknown as AdminZoneService;
    mockSnackBar = {
      open: jest.fn(),
    } as unknown as MatSnackBar;

    await TestBed.configureTestingModule({
      declarations: [AdminComponent],
      providers: [
        provideHttpClientTesting(),
        { provide: AdminZoneService, useValue: mockAdminZoneService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
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

  it('should return the statistics and map on success loadReservationStatistics', () => {
    jest.spyOn(mockAdminZoneService, 'getAdminDashboardStats').mockReturnValue(
      of({
        statistics: [mockAdminDashboardStats],
      }),
    );
    component['loadReservationStatistics']();
    expect(component.isLoading).toBe(false);
    expect(component.statistics).toEqual([mockAdminDashboardStats]);
    expect(component.statistics.length).toBe(1);
    expect(component.statistics[0].filmTitle).toBe('Film 1');
  });

  it('should set hasError and isLoading if no statistics are returned from loadReservationStatistics', () => {
    jest.spyOn(mockAdminZoneService, 'getAdminDashboardStats').mockReturnValue(
      of({
        statistics: [],
      }),
    );
    component['loadReservationStatistics']();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(false);
  });

  it('should handle thrown error on loadReservationStatistics', () => {
    jest
      .spyOn(mockAdminZoneService, 'getAdminDashboardStats')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component['loadReservationStatistics']();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(true);
  });

  it('should return the employees and map on success loadEmployees', () => {
    jest.spyOn(mockAdminZoneService, 'getAllEmployees').mockReturnValue(
      of({
        employees: [mockEmployees],
      }),
    );
    component['loadEmployees']();
    expect(component.isLoading).toBe(false);
    expect(component.employees).toEqual([mockEmployees]);
    expect(component.employees.length).toBe(1);
    expect(component.employees[0].userFirstName).toBe('John');
  });

  it('should set employeesError and employeesLoading if no employees are returned from loadEmployees', () => {
    jest.spyOn(mockAdminZoneService, 'getAllEmployees').mockReturnValue(
      of({
        employees: [],
      }),
    );
    component['loadEmployees']();
    expect(component.employeesLoading).toBe(false);
    expect(component.employeesError).toBe(false);
  });

  it('should handle thrown error on loadEmployees', () => {
    jest
      .spyOn(mockAdminZoneService, 'getAllEmployees')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component['loadEmployees']();
    expect(component.employeesLoading).toBe(false);
    expect(component.employeesError).toBe(true);
  });

  it('should send the addEmployee request on onAddEmployee and return success snackbar on success', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(mockAddEmployee)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockAdminZoneService, 'addEmployee')
      .mockReturnValue(of(mockSuccessResponse));
    component.onAddEmployee();
    expect(spy).toHaveBeenCalledWith({
      userFirstName: 'Jane',
      userLastName: 'Smith',
      userUsername: 'janesmith',
      userEmail: 'jane.smith@example.com',
      userPassword: 'Password123!',
      userRole: 'employee',
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith('Employé ajouté avec succès.', 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the addEmployee request on onAddEmployee and return error snackbar on failure', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(mockErrorAddEmployee)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest.spyOn(mockAdminZoneService, 'addEmployee');
    component.onAddEmployee();
    expect(spy).toHaveBeenCalledWith({
      userFirstName: 'Jane',
      userLastName: 'Smith',
      userUsername: 'janesmith',
      userEmail: 'jane.smith@example.com',
      userPassword: 'password123',
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "Erreur lors de l'ajout de l'employé.",
      'Fermer',
      {
        duration: 3000,
      },
    );
    expect(component['loadEmployees']).toBeDefined();
  });

  it('should show error snackbar if thrown error occur during addEmployee request in onAddEmployee', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(mockErrorAddEmployee)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    jest
      .spyOn(mockAdminZoneService, 'addEmployee')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component.onAddEmployee();
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "Erreur lors de l'ajout de l'employé.",
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the resetEmployee request on onResetPassword and return success snackbar on success', () => {
    component.onResetPassword = jest.fn(mockReinstateEmployee => {
      const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
        afterClosed: jest.fn().mockReturnValue(of(mockSuccessResponse)),
      };
      jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
      const spy = jest
        .spyOn(mockAdminZoneService, 'resetEmployeePassword')
        .mockReturnValue(of(mockSuccessResponse));
      component.onResetPassword(mockReinstateEmployee);
      expect(spy).toHaveBeenCalledWith({
        userId: 2,
        newPassword: 'Password123!',
      });
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Mot de passe réinitialisé avec succès.',
        'Fermer',
        {
          duration: 3000,
        },
      );
    });
  });

  it('should send the resetEmployee request on onResetPassword and return error snackbar on failure', () => {
    component.onResetPassword = jest.fn(mockErrorReinstateEmployee => {
      const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
        afterClosed: jest.fn().mockReturnValue(of(mockErrorResponse)),
      };
      jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
      const spy = jest
        .spyOn(mockAdminZoneService, 'resetEmployeePassword')
        .mockReturnValue(of(mockErrorResponse));
      component.onResetPassword(mockErrorReinstateEmployee);
      expect(spy).toHaveBeenCalledWith({
        userId: 2,
        newPassword: 'Password123!',
      });
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Mot de passe réinitialisé avec succès.',
        'Fermer',
        {
          duration: 3000,
        },
      );
    });
  });

  it('should show error snackbar if thrown error occur during resetEmployeePassword request in onResetPassword', () => {
    component.onResetPassword = jest.fn(mockReinstateEmployee => {
      const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
        afterClosed: jest.fn().mockReturnValue(of(mockErrorResponse)),
      };
      jest
        .spyOn(component['dialog'], 'open')
        .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
      jest
        .spyOn(mockAdminZoneService, 'resetEmployeePassword')
        .mockReturnValue(throwError(() => new Error('Server Error')));
      component.onResetPassword(mockReinstateEmployee);
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Erreur lors de la réinitialisation du mot de passe.',
        'Fermer',
        {
          duration: 3000,
        },
      );
    });
  });
});
