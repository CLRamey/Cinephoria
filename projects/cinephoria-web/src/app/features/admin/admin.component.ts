import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminZoneService } from '../../services/admin-zone.service';
import { Subscription } from 'rxjs';
import { ReservationStats } from '../../interfaces/reservation';
import { Employees } from '../../interfaces/staff-interfaces';

@Component({
  selector: 'caw-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit, OnDestroy {
  // Loading and error states
  isLoading: boolean = false;
  hasError: boolean = false;
  employeesLoading: boolean = false;
  employeesError: boolean = false;

  // Statistics
  statistics: ReservationStats[] = [];
  employees: Employees[] = [];
  displayedColumns: string[] = ['filmTitle', 'reservationCount'];
  employeeColumns: string[] = ['userFirstName', 'userLastName', 'userEmail', 'actions'];

  // Constructor to inject necessary services
  constructor(private readonly adminZoneService: AdminZoneService) {}

  // Subscription to manage observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to initialize component
  ngOnInit(): void {
    this.loadReservationStatistics();
    this.loadEmployees();
  }

  // Method to load reservation statistics
  private loadReservationStatistics(): void {
    this.isLoading = true;
    const statSub = this.adminZoneService.getAdminDashboardStats().subscribe({
      next: response => {
        if (!response || !response.statistics) {
          this.isLoading = false;
          return;
        }
        this.statistics = response.statistics;
        this.isLoading = false;
      },
      error: () => {
        this.hasError = true;
        this.isLoading = false;
      },
    });
    this.subscriptions.add(statSub);
  }

  private loadEmployees(): void {
    this.employeesLoading = true;
    const empSub = this.adminZoneService.getAllEmployees().subscribe({
      next: response => {
        if (!response || !response.employees) {
          this.employeesLoading = false;
          return;
        }
        this.employees = response.employees;
        this.employeesLoading = false;
      },
      error: () => {
        this.employeesError = true;
        this.employeesLoading = false;
      },
    });
    this.subscriptions.add(empSub);
  }

  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
