import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, map, catchError, of, take } from 'rxjs';
import {
  ReservationStats,
  StatisticsSuccessResponse,
  StatisticsErrorResponse,
} from '../interfaces/reservation';
import {
  Employees,
  CreateEmployee,
  EmployeeSuccessResponse,
  EmployeeErrorResponse,
  EmployeeRole,
  EmployeeResetPassword,
} from '../interfaces/staff-interfaces';

@Injectable({
  providedIn: 'root',
})
export class AdminZoneService {
  // Base URL for the API, taken from environment configuration.
  private readonly baseUrl = environment.apiURL;

  // Constructor for the AdminZoneService
  constructor(private readonly http: HttpClient) {}

  // Method to get admin dashboard statistics
  getAdminDashboardStats(): Observable<{ statistics: ReservationStats[] }> {
    return this.http
      .get<
        StatisticsSuccessResponse | StatisticsErrorResponse
      >(`${this.baseUrl}/reservation-stats`, { responseType: 'json', withCredentials: true })
      .pipe(
        take(1),
        map((response: StatisticsSuccessResponse | StatisticsErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as StatisticsSuccessResponse).data;
            let statistics: ReservationStats[] = [];
            if (Array.isArray(data)) {
              statistics = (data as ReservationStats[]).map(stat => ({
                filmId: stat.filmId,
                filmTitle: stat.filmTitle,
                date: stat.date,
                reservationCount: stat.reservationCount,
              }));
            }
            return { statistics };
          }
          return { statistics: [] };
        }),
        catchError(() => of({ statistics: [] })),
      );
  }

  // Method to get all employees
  getAllEmployees(): Observable<{ employees: Employees[] }> {
    return this.http
      .get<
        EmployeeSuccessResponse | EmployeeErrorResponse
      >(`${this.baseUrl}/employees`, { responseType: 'json', withCredentials: true })
      .pipe(
        take(1),
        map((response: EmployeeSuccessResponse | EmployeeErrorResponse) => {
          if ('success' in response && response.success && 'data' in response) {
            const data = (response as EmployeeSuccessResponse).data;
            let employees: Employees[] = [];
            if (Array.isArray(data)) {
              employees = (data as Employees[]).map(emp => ({
                userId: emp.userId,
                userFirstName: emp.userFirstName,
                userLastName: emp.userLastName,
                userUsername: emp.userUsername,
                userEmail: emp.userEmail,
                userRole: EmployeeRole.EMPLOYEE,
              }));
            }
            return { employees };
          }
          return { employees: [] };
        }),
        catchError(() => of({ employees: [] })),
      );
  }

  // Method to add a new employee
  addEmployee(employeeData: CreateEmployee): Observable<boolean> {
    return this.http
      .post<{ success: boolean }>(`${this.baseUrl}/employee`, employeeData, {
        responseType: 'json',
        withCredentials: true,
      })
      .pipe(
        take(1),
        map(response => {
          if (response.success === true) {
            return true;
          }
          return false;
        }),
        catchError(err => {
          console.error('Error adding employee:', err);
          return of(false);
        }),
      );
  }

  // Method to reset an employee's password
  resetEmployeePassword(resetData: EmployeeResetPassword): Observable<boolean> {
    return this.http
      .put<{ success: boolean }>(
        `${this.baseUrl}/employee/password`,
        { resetData },
        {
          responseType: 'json',
          withCredentials: true,
        },
      )
      .pipe(
        take(1),
        map(response => {
          if (response.success === true) {
            return true;
          }
          return false;
        }),
        catchError(err => {
          console.error('Error resetting password:', err);
          return of(false);
        }),
      );
  }
}
