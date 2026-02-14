import { Component, OnInit, OnDestroy } from '@angular/core';
import { AdminZoneService } from '../../services/admin-zone.service';
import { Subscription } from 'rxjs';
import { ReservationStats } from '../../interfaces/reservation';
import { Employees } from '../../interfaces/staff-interfaces';
import { EmployeeAccountComponent } from './employee-account/employee-account.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

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
  //Data source for employees
  employees: Employees[] = [];
  // Table column definitions
  displayedColumns: string[] = ['filmTitle', 'reservationCount'];
  allEmployeeColumns: string[] = ['userFirstName', 'userLastName', 'userEmail', 'actions'];
  employeeColumns: string[] = [...this.allEmployeeColumns];
  // Selected IDs
  selectedEmployeeId: number | null = null;

  // Constructor to inject necessary services
  constructor(
    private readonly adminZoneService: AdminZoneService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
  ) {}

  // Subscription to manage observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to initialize component
  ngOnInit(): void {
    this.loadReservationStatistics();
    this.loadEmployees();
    this.updateColumns(window.innerWidth);
    window.addEventListener('resize', () => {
      this.updateColumns(window.innerWidth);
    });
  }

  // Method to update table columns based on window width
  updateColumns(width: number): void {
    if (width < 768) {
      this.employeeColumns = ['userLastName', 'userFirstName', 'actions'];
    } else {
      this.employeeColumns = [...this.allEmployeeColumns];
    }
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

  // Method to load all employees
  private loadEmployees(): void {
    this.employeesLoading = true;
    const empSub = this.adminZoneService.getAllEmployees().subscribe({
      next: (response: { employees: Employees[] | null }) => {
        const employeeList = response?.employees ?? [];
        this.employees = employeeList.sort((a, b) => a.userLastName.localeCompare(b.userLastName));
        this.employeesLoading = false;
      },
      error: () => {
        this.employeesLoading = false;
        this.employeesError = true;
      },
    });
    this.subscriptions.add(empSub);
  }

  // Method to handle adding a new employee
  onAddEmployee(): void {
    this.dialog
      .open(EmployeeAccountComponent, {
        data: null,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const addEmployeeSub = this.adminZoneService.addEmployee(result).subscribe({
            next: (response: { success?: boolean } | boolean) => {
              if (
                response === true ||
                (typeof response === 'object' && response && response.success === true)
              ) {
                this.snackBar.open('Employé ajouté avec succès.', 'Fermer', {
                  duration: 3000,
                });
                this.loadEmployees();
              } else {
                this.snackBar.open("Erreur lors de l'ajout de l'employé.", 'Fermer', {
                  duration: 3000,
                });
              }
            },
            error: () => {
              this.snackBar.open("Erreur lors de l'ajout de l'employé.", 'Fermer', {
                duration: 3000,
              });
            },
          });
          this.subscriptions.add(addEmployeeSub);
        }
      });
  }

  onResetPassword(employee: Employees): void {
    this.dialog
      .open(EmployeeAccountComponent, {
        data: employee,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const resetSub = this.adminZoneService
            .resetEmployeePassword({
              userId: employee.userId,
              newPassword: result.resetData.newPassword,
            })
            .subscribe({
              next: response => {
                if (response === true) {
                  this.snackBar.open('Mot de passe réinitialisé avec succès.', 'Fermer', {
                    duration: 3000,
                  });
                  this.loadEmployees();
                } else {
                  this.snackBar.open(
                    'Erreur lors de la réinitialisation du mot de passe.',
                    'Fermer',
                    {
                      duration: 3000,
                    },
                  );
                }
              },
              error: () => {
                this.snackBar.open(
                  'Erreur lors de la réinitialisation du mot de passe.',
                  'Fermer',
                  {
                    duration: 3000,
                  },
                );
              },
            });
          this.subscriptions.add(resetSub);
        }
      });
  }

  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
