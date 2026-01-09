import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Cinema, Room } from '../../../../../auth/src/lib/interfaces/staff-interfaces';
import {
  Incident,
  IncidentForm,
  IncidentsWithRoom,
} from '../../../../../auth/src/lib/interfaces/employee-interfaces';
import { StaffActionsService } from '../../../../../auth/src/lib/services/staff-actions.service';
import { IncidentsService } from '../../service/incidents.service';
import { FormBuilder } from '@angular/forms';
import { IncidentFormComponent } from '../../utils/incident-form.component';
import { VerificationDialogComponent } from '../../../../../auth/src/lib/shared/utils/verification-dialog.component';

@Component({
  selector: 'cad-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent implements OnInit, OnDestroy {
  // Initial state
  cinemasLoading = false;
  cinemasError = false;
  selectedCinema = false;
  roomsLoading = false;
  roomsError = false;
  selectedRoom = false;
  incidentsLoading = false;
  incidentsError = false;
  selectedIncident = false;
  // Data holders for select options
  cinemas: Cinema[] = [];
  rooms: Room[] = [];
  incidents: Incident[] = [];
  incidentsWithRoom: IncidentsWithRoom[] = [];
  // Selected IDs
  selectedCinemaId: number | null = null;
  selectedRoomId: number | null = null;
  // Data for tables
  staffIncidents: IncidentsWithRoom[] = [];
  // Columns for incident table
  incidentColumns: string[] = [
    'room.roomNumber',
    'incidentEquipment',
    'incidentDescription',
    'incidentStatus',
    'actions',
  ];

  // Constructor to inject necessary services
  constructor(
    private readonly fb: FormBuilder,
    private readonly staffActionsService: StaffActionsService,
    private readonly incidentsService: IncidentsService,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
  ) {}

  // Subscription to manage observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to initialize component
  ngOnInit(): void {
    this.loadCinemaData();
  }

  // Method to load cinema data
  private loadCinemaData(): void {
    this.cinemasLoading = true;
    const cinemaSub = this.incidentsService.getCinemaInfo().subscribe({
      next: (response: { CinemaInfo: Cinema[] } | null) => {
        const cinemaList = response?.CinemaInfo ?? [];
        this.cinemas = cinemaList.sort((a, b) => a.cinemaName.localeCompare(b.cinemaName));
        this.cinemasLoading = false;
      },
      error: err => {
        this.cinemasLoading = false;
        this.cinemasError = true;
        console.error('Erreur lors du chargement des cinémas:', err);
      },
    });
    this.subscriptions.add(cinemaSub);
  }

  // Method to handle cinema selection changes
  onCinemaSelect(cinemaId: number | null): void {
    this.selectedCinemaId = cinemaId;
    if (!cinemaId) return;
    else if (cinemaId === 0) {
      this.selectedCinema = false;
      this.selectedCinemaId = null;
      this.rooms = [];
      this.selectedRoomId = null;
    } else {
      this.selectedCinema = true;
      this.onRoomSelect(null);
      this.loadRoomData();
      this.loadIncidentData();
    }
  }

  // Method to load incident data based on selected cinema
  private loadIncidentData(): void {
    const cinemaId = this.selectedCinemaId;
    if (!cinemaId) return;
    this.incidentsLoading = true;
    if (!this.selectedRoomId) {
      this.selectedRoomId = 0;
    }
    const roomId = this.selectedRoomId;
    const incidentSub = this.incidentsService.getIncidentList(cinemaId, roomId).subscribe({
      next: response => {
        if (!response || !response.Incidents) {
          this.incidentsLoading = false;
          this.incidentsError = true;
          return;
        }
        this.staffIncidents = response.Incidents;
        this.incidents = this.staffIncidents.sort((a, b) =>
          a.incidentStatus.localeCompare(b.incidentStatus),
        );
        this.incidentsLoading = false;
      },
      error: () => {
        this.incidentsLoading = false;
        this.incidentsError = true;
      },
    });
    this.subscriptions.add(incidentSub);
  }

  // Method to load room data based on selected cinema
  private loadRoomData(): void {
    const cinemaId = this.selectedCinemaId;
    if (!cinemaId) return;
    this.roomsLoading = true;
    const roomSub = this.staffActionsService.getRoomsList(cinemaId).subscribe({
      next: response => {
        if (!response || !response.Rooms) {
          this.roomsLoading = false;
          this.roomsError = true;
          return;
        }
        this.roomsLoading = false;
        const roomList = response.Rooms || [];
        this.rooms = roomList.map(r => ({ roomId: r.roomId, roomNumber: r.roomNumber }));
        roomList.sort((a, b) => a.roomNumber - b.roomNumber);
      },
      error: () => {
        this.roomsLoading = false;
        this.roomsError = true;
      },
    });
    this.subscriptions.add(roomSub);
  }
  // Method to handle room selection changes
  onRoomSelect(roomId: number | null): void {
    this.selectedRoomId = roomId;
    if (!this.selectedCinemaId) return;
    if (!roomId) return;
    else if (roomId === 0 || this.selectedRoomId === null) {
      this.selectedRoom = false;
      this.selectedRoomId = null;
    } else {
      this.selectedRoom = true;
      this.loadIncidentData();
    }
  }

  // Method to create a new incident
  onAddIncident(): void {
    const cinemaId = this.selectedCinemaId;
    const cinemaName = this.cinemas.find(c => c.cinemaId === cinemaId)?.cinemaName || '';
    if (!cinemaId) return;
    const roomId = this.selectedRoomId;
    const roomNumber = this.rooms.find(r => r.roomId === roomId)?.roomNumber || '';
    if (!roomId) return;
    this.dialog
      .open(IncidentFormComponent, {
        data: {
          cinema: { cinemaId, cinemaName },
          room: { roomId, roomNumber },
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const addIncidentSub = this.incidentsService
            .addIncident(cinemaId, roomId, result)
            .subscribe({
              next: (response: { success?: boolean } | boolean) => {
                if (
                  response === true ||
                  (typeof response === 'object' && response && response.success === true)
                ) {
                  this.snackBar.open('Incident ajouté avec succès.', 'Fermer', {
                    duration: 3000,
                  });
                  this.loadIncidentData();
                } else {
                  this.snackBar.open("Erreur lors de l'ajout de l'incident.", 'Fermer', {
                    duration: 3000,
                  });
                }
              },
              error: () => {
                this.snackBar.open("Erreur lors de l'ajout de l'incident.", 'Fermer', {
                  duration: 3000,
                });
              },
            });
          this.subscriptions.add(addIncidentSub);
        }
      });
  }

  // Method to modify an existing incident
  onModifyIncident(incident: IncidentForm): void {
    this.selectedIncident = true;
    if (!this.selectedCinemaId || !incident.incidentId) return;
    const incidentId = incident.incidentId;
    const cinemaId = this.selectedCinemaId;
    const cinemaName = this.cinemas.find(c => c.cinemaId === cinemaId)?.cinemaName || '';
    const roomId = incident.roomId || this.selectedRoomId;
    const roomNumber = this.rooms.find(r => r.roomId === roomId)?.roomNumber || '';
    if (!roomId) return;
    this.dialog
      .open(IncidentFormComponent, {
        data: {
          ...incident,
          cinema: { cinemaId, cinemaName },
          room: { roomId, roomNumber },
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const modifyIncidentSub = this.incidentsService
            .updateIncident(incidentId, result, roomId)
            .subscribe({
              next: (response: { success?: boolean } | boolean) => {
                if (response === true) {
                  this.snackBar.open('Incident modifié avec succès.', 'Fermer', {
                    duration: 3000,
                  });
                  this.loadIncidentData();
                } else {
                  this.snackBar.open("Erreur lors de la modification de l'incident.", 'Fermer', {
                    duration: 3000,
                  });
                }
              },
              error: () => {
                this.snackBar.open("Erreur lors de la modification de l'incident.", 'Fermer', {
                  duration: 3000,
                });
              },
            });
          this.subscriptions.add(modifyIncidentSub);
        }
      });
  }

  // Method to delete an existing incident
  onDeleteIncident(incident: IncidentForm): void {
    this.selectedIncident = true;
    const incidentId = incident.incidentId;
    const incidentTitle = incident.incidentEquipment;
    const roomRef = incident.room?.roomNumber;
    if (!this.selectedCinemaId || !incidentId) return;
    this.dialog
      .open(VerificationDialogComponent, {
        data: {
          title: "Suppression de l'incident",
          message: `Êtes-vous sûr de vouloir supprimer l'incident "${incidentTitle}" pour la salle ${roomRef}" ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const deactivateRoomSub = this.incidentsService.deleteIncident(incidentId).subscribe({
            next: response => {
              if (response === true) {
                this.snackBar.open(
                  `
                  Incident "${incidentTitle}" supprimé avec succès.`,
                  'Fermer',
                  { duration: 3000 },
                );
                this.loadIncidentData();
              } else {
                this.snackBar.open(
                  `Erreur lors de la suppression de l'incident "${incidentTitle}".`,
                  'Fermer',
                  {
                    duration: 3000,
                  },
                );
              }
            },
            error: () => {
              this.snackBar.open(
                `Erreur lors de la suppression de l'incident "${incidentTitle}".`,
                'Fermer',
                {
                  duration: 3000,
                },
              );
            },
          });
          this.subscriptions.add(deactivateRoomSub);
        }
      });
  }
  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
