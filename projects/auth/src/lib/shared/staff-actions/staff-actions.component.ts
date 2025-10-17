import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDivider } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { VerificationDialogComponent } from '../utils/verification-dialog.component';
import { FilmFormComponent } from '../utils/film-form.component';
import { RoomFormComponent } from '../utils/room-form.component';
import { ScreeningFormComponent } from '../utils/screening-form.component';
import { StaffActionsService } from '../../services/staff-actions.service';
import { Films, Rooms, Screenings, Cinema, Room, Film } from '../../interfaces/staff-interfaces';
import { CinemaInfoService } from '../../../../../cinephoria-web/src/app/services/cinema-info.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'csh-staff-actions',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatDivider,
    MatSelectModule,
    MatProgressSpinner,
    MatTableModule,
    MatNativeDateModule,
    MatDialogModule,
    CommonModule,
  ],
  templateUrl: './staff-actions.component.html',
  styleUrl: './staff-actions.component.scss',
})
export class StaffActionsComponent implements OnInit, OnDestroy {
  // Initial state
  filmsLoading = false;
  filmsError = false;
  showAllFilms = false;
  selectedFilm = false;
  cinemasLoading = false;
  cinemasError = false;
  selectedCinema = false;
  roomsLoading = false;
  roomsError = false;
  selectedRoom = false;
  showAllRooms = false;
  screeningsLoading = false;
  screeningsError = false;
  showAllScreenings = false;
  // Data holders for select options
  cinemas: Cinema[] = [];
  rooms: Room[] = [];
  films: Film[] = [];
  // Selected IDs
  selectedCinemaId: number | null = null;
  selectedRoomId: number | null = null;
  selectedFilmId: number | null = null;
  // Data for tables
  staffFilms: Films[] = [];
  staffRooms: Rooms[] = [];
  staffScreenings: Screenings[] = [];
  // Table columns
  allFilmColumns: string[] = [
    'filmTitle',
    'filmDuration',
    'filmFavorite',
    'filmMinimumAge',
    'filmActiveDate',
    'actions',
  ];
  allRoomColumns: string[] = [
    'roomNumber',
    'roomCapacity',
    'quality.qualityProjectionType',
    'cinema.cinemaName',
    'actions',
  ];
  allScreeningColumns: string[] = [
    'screeningDate',
    'cinema.cinemaName',
    'room.roomNumber',
    'film.filmTitle',
    'actions',
  ];
  filmColumns: string[] = [...this.allFilmColumns];
  roomColumns: string[] = [...this.allRoomColumns];
  screeningColumns: string[] = [...this.allScreeningColumns];

  // Constructor to use services and build forms
  constructor(
    private readonly fb: FormBuilder,
    private readonly staffActionsService: StaffActionsService,
    private readonly cinemaInfoService: CinemaInfoService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar,
    private readonly dialog: MatDialog,
  ) {}

  // Subscription to manage observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifestyle hook to initialize component
  ngOnInit(): void {
    this.loadFilmData();
    this.loadCinemaData();
    window.addEventListener('resize', () => {
      this.updateColumns(window.innerWidth);
    });
  }

  // Method to load staff data
  private loadFilmData(): void {
    this.filmsLoading = true;
    const filmSub = this.staffActionsService.getFilmsList().subscribe({
      next: response => {
        if (!response || !response.Films) {
          this.filmsLoading = false;
          this.filmsError = true;
          return;
        }
        this.staffFilms = response.Films;
        this.filmsLoading = false;
        const filmList = response.Films || [];
        this.films = filmList.map(f => ({ filmId: f.filmId, filmTitle: f.filmTitle }));
        filmList.sort((a, b) => a.filmTitle.localeCompare(b.filmTitle));
      },
      error: () => {
        this.filmsLoading = false;
        this.filmsError = true;
      },
    });
    this.subscriptions.add(filmSub);
  }

  // Method to load cinema data
  private loadCinemaData(): void {
    this.cinemasLoading = true;
    const cinemaSub = this.cinemaInfoService.getCinemaInfo().subscribe({
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

  // Method to add a new film
  onAddFilm(): void {
    this.dialog
      .open(FilmFormComponent, {
        data: null,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const addFilmSub = this.staffActionsService.addFilm(result).subscribe({
            next: (response: { success?: boolean } | boolean) => {
              if (
                response === true ||
                (typeof response === 'object' && response && response.success === true)
              ) {
                this.snackBar.open('Film ajouté avec succès.', 'Fermer', {
                  duration: 3000,
                });
                this.loadFilmData();
              } else {
                this.snackBar.open("Erreur lors de l'ajout du film.", 'Fermer', {
                  duration: 3000,
                });
              }
            },
            error: () => {
              this.snackBar.open("Erreur lors de l'ajout du film.", 'Fermer', {
                duration: 3000,
              });
            },
          });
          this.subscriptions.add(addFilmSub);
        }
      });
  }

  // Method to modify a film
  onModifyFilm(film: Films): void {
    this.dialog
      .open(FilmFormComponent, {
        data: film,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const genreIds = result.genreIds || []; // Ensure genreIds is provided
          const modifyFilmSub = this.staffActionsService
            .updateFilm(film.filmId, result.filmData, genreIds)
            .subscribe({
              next: response => {
                if (response === true) {
                  this.snackBar.open('Film modifié avec succès.', 'Fermer', {
                    duration: 3000,
                  });
                  this.loadFilmData();
                } else {
                  this.snackBar.open('Erreur lors de la modification du film.', 'Fermer', {
                    duration: 3000,
                  });
                }
              },
              error: () => {
                this.snackBar.open('Erreur lors de la modification du film.', 'Fermer', {
                  duration: 3000,
                });
              },
            });
          this.subscriptions.add(modifyFilmSub);
        }
      });
  }

  // Method to deactivate a film with confirmation dialog
  onDeactivateFilm(film: Films): void {
    this.dialog
      .open(VerificationDialogComponent, {
        data: {
          title: 'Désactiver le film',
          message: `Êtes-vous sûr de vouloir désactiver le film "${film.filmTitle}" ?`,
          confirmText: 'Désactiver',
          cancelText: 'Annuler',
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const deactivateFilmSub = this.staffActionsService.deactivateFilm(film.filmId).subscribe({
            next: response => {
              if (response === true) {
                this.snackBar.open(`Film "${film.filmTitle}" désactivé avec succès.`, 'Fermer', {
                  duration: 3000,
                });
                this.loadFilmData();
              } else {
                this.snackBar.open(
                  `Erreur lors de la désactivation du film "${film.filmTitle}".`,
                  'Fermer',
                  {
                    duration: 3000,
                  },
                );
              }
            },
            error: () => {
              this.snackBar.open(
                `Erreur lors de la désactivation du film "${film.filmTitle}".`,
                'Fermer',
                {
                  duration: 3000,
                },
              );
            },
          });
          this.subscriptions.add(deactivateFilmSub);
        }
      });
  }

  // Method to update table columns based on window width
  updateColumns(width: number): void {
    if (width < 768) {
      this.filmColumns = ['filmTitle', 'actions'];
      this.roomColumns = ['roomNumber', 'actions'];
      this.screeningColumns = ['screeningDate', 'film.filmTitle', 'actions'];
    } else {
      this.filmColumns = [...this.allFilmColumns];
      this.roomColumns = [...this.allRoomColumns];
      this.screeningColumns = [...this.allScreeningColumns];
    }
  }

  // Method to handle cinema selection changes
  onCinemaSelect(cinemaId: number | null): void {
    this.selectedCinemaId = cinemaId;
    if (!cinemaId) return;
    else if (cinemaId === 0) {
      this.selectedCinema = false;
      this.staffRooms = [];
      this.staffScreenings = [];
    } else {
      this.selectedCinema = true;
      this.loadRoomData();
    }
  }

  // Method to handle room selection changes
  onRoomSelect(roomId: number | null): void {
    this.selectedRoomId = roomId;
    if (!this.selectedCinemaId) return;
    if (!roomId) return;
    else if (roomId === 0) {
      this.selectedRoom = false;
      this.staffScreenings = [];
    } else {
      this.selectedRoom = true;
      this.loadScreeningData();
    }
  }

  // Method to handle film selection changes
  onFilmSelect(filmId: number | null): void {
    this.selectedFilmId = filmId;
    if (!this.selectedCinemaId || !this.selectedRoomId) return;
    if (!filmId) return;
    else if (filmId === 0) {
      this.selectedFilm = false;
      this.staffScreenings = [];
    } else {
      this.selectedFilm = true;
      this.loadScreeningData();
    }
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
        this.staffRooms = response.Rooms;
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

  // Method to add a new room
  onAddRoom(): void {
    const cinemaId = this.selectedCinemaId;
    const cinemaName = this.cinemas.find(c => c.cinemaId === cinemaId)?.cinemaName || '';
    if (!cinemaId) return;
    this.dialog
      .open(RoomFormComponent, {
        data: { cinemaId, cinemaName },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const addRoomSub = this.staffActionsService.addRoom(result).subscribe({
            next: (response: { success?: boolean } | boolean) => {
              if (
                response === true ||
                (typeof response === 'object' && response && response.success === true)
              ) {
                this.snackBar.open('Salle ajoutée avec succès.', 'Fermer', {
                  duration: 3000,
                });
                this.loadRoomData();
              } else {
                this.snackBar.open("Erreur lors de l'ajout de la salle.", 'Fermer', {
                  duration: 3000,
                });
              }
            },
            error: () => {
              this.snackBar.open("Erreur lors de l'ajout de la salle.", 'Fermer', {
                duration: 3000,
              });
            },
          });
          this.subscriptions.add(addRoomSub);
        }
      });
  }

  // Method to modify a room
  onModifyRoom(room: Rooms): void {
    this.dialog
      .open(RoomFormComponent, {
        data: room,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const roomId = room.roomId;
          const modifyRoomSub = this.staffActionsService
            .updateRoom(roomId, result.roomData, result.numRows, result.seatsPerRow)
            .subscribe({
              next: response => {
                if (response === true) {
                  this.snackBar.open('Salle modifiée avec succès.', 'Fermer', {
                    duration: 3000,
                  });
                  this.loadRoomData();
                } else {
                  this.snackBar.open('Erreur lors de la modification de la salle.', 'Fermer', {
                    duration: 3000,
                  });
                }
              },
              error: () => {
                this.snackBar.open('Erreur lors de la modification de la salle.', 'Fermer', {
                  duration: 3000,
                });
              },
            });
          this.subscriptions.add(modifyRoomSub);
        }
      });
  }

  // Method to deactivate a room with confirmation dialog
  onDeleteRoom(room: Rooms): void {
    this.dialog
      .open(VerificationDialogComponent, {
        data: {
          title: 'Supprimer la salle',
          message: `Êtes-vous sûr de vouloir supprimer la salle "${room.roomNumber}" ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const deactivateRoomSub = this.staffActionsService.deactivateRoom(room.roomId).subscribe({
            next: response => {
              if (response === true) {
                this.snackBar.open(`Salle "${room.roomNumber}" désactivée avec succès.`, 'Fermer', {
                  duration: 3000,
                });
                this.loadRoomData();
              } else {
                this.snackBar.open(
                  `Erreur lors de la désactivation de la salle "${room.roomNumber}".`,
                  'Fermer',
                  {
                    duration: 3000,
                  },
                );
              }
            },
            error: () => {
              this.snackBar.open(
                `Erreur lors de la désactivation de la salle "${room.roomNumber}".`,
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

  // Method to load screening data based on selected cinema
  private loadScreeningData(): void {
    const cinemaId = this.selectedCinemaId;
    const roomId = this.selectedRoomId;
    if (!cinemaId || !roomId) return;
    const filmId = this.selectedFilmId || 0;
    this.screeningsLoading = true;
    const screeningSub = this.staffActionsService
      .getScreeningsList(cinemaId, roomId, filmId)
      .subscribe({
        next: response => {
          if (!response || !response.Screenings) {
            this.screeningsLoading = false;
            return;
          }
          this.staffScreenings = response.Screenings;
          this.screeningsLoading = false;
        },
        error: () => {
          this.screeningsLoading = false;
          this.screeningsError = true;
        },
      });
    this.subscriptions.add(screeningSub);
  }

  // Method to add a new screening
  onAddScreening(): void {
    const cinemaId = this.selectedCinemaId;
    const cinemaName = this.cinemas.find(c => c.cinemaId === cinemaId)?.cinemaName || '';
    if (!cinemaId) return;
    const roomId = this.selectedRoomId;
    const roomNumber = this.rooms.find(r => r.roomId === roomId)?.roomNumber || '';
    if (!roomId) return;
    const filmId = this.selectedFilmId;
    const filmTitle = this.films.find(f => f.filmId === filmId)?.filmTitle || '';
    if (!filmId) return;
    this.dialog
      .open(ScreeningFormComponent, {
        data: {
          cinema: { cinemaId, cinemaName },
          room: { roomId, roomNumber },
          film: { filmId, filmTitle },
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const addScreeningSub = this.staffActionsService.addScreening(result).subscribe({
            next: (response: { success?: boolean } | boolean) => {
              if (
                response === true ||
                (typeof response === 'object' && response && response.success === true)
              ) {
                this.snackBar.open('Séance ajoutée avec succès.', 'Fermer', {
                  duration: 3000,
                });
                this.loadScreeningData();
              } else {
                this.snackBar.open("Erreur lors de l'ajout de la séance.", 'Fermer', {
                  duration: 3000,
                });
              }
            },
            error: () => {
              this.snackBar.open("Erreur lors de l'ajout de la séance.", 'Fermer', {
                duration: 3000,
              });
            },
          });
          this.subscriptions.add(addScreeningSub);
        }
      });
  }

  // Method to modify a screening
  onModifyScreening(screening: Screenings): void {
    console.log('Modifying screening:', screening);
    this.dialog
      .open(ScreeningFormComponent, {
        data: screening,
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const modifyScreeningSub = this.staffActionsService
            .updateScreening(screening.screeningId, result)
            .subscribe({
              next: response => {
                if (response === true) {
                  this.snackBar.open('Séance modifiée avec succès.', 'Fermer', {
                    duration: 3000,
                  });
                  this.loadScreeningData();
                } else {
                  this.snackBar.open('Erreur lors de la modification de la séance.', 'Fermer', {
                    duration: 3000,
                  });
                }
              },
              error: () => {
                this.snackBar.open('Erreur lors de la modification de la séance.', 'Fermer', {
                  duration: 3000,
                });
              },
            });
          this.subscriptions.add(modifyScreeningSub);
        }
      });
  }

  // Method to delete a screening with confirmation dialog
  onDeleteScreening(screening: Screenings): void {
    let screeningToDelete = '';
    if (screening?.screeningDate) {
      const date = new Date(screening?.screeningDate);
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const localTime = `${hours}:${minutes}`;
      screeningToDelete = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${localTime}`;
    }
    this.dialog
      .open(VerificationDialogComponent, {
        data: {
          title: 'Supprimer la séance',
          message: `Êtes-vous sûr de vouloir supprimer la séance "${screeningToDelete}" ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
        },
      })
      .afterClosed()
      .subscribe(result => {
        if (result) {
          const deactivateScreeningSub = this.staffActionsService
            .deactivateScreening(screening.screeningId)
            .subscribe({
              next: response => {
                if (response === true) {
                  this.snackBar.open(
                    `Séance "${screening.screeningDate}" désactivée avec succès.`,
                    'Fermer',
                    {
                      duration: 3000,
                    },
                  );
                  this.loadScreeningData();
                } else {
                  this.snackBar.open(
                    `Erreur lors de la désactivation de la séance "${screening.screeningDate}".`,
                    'Fermer',
                    {
                      duration: 3000,
                    },
                  );
                }
              },
              error: () => {
                this.snackBar.open(
                  `Erreur lors de la désactivation de la séance "${screening.screeningDate}".`,
                  'Fermer',
                  {
                    duration: 3000,
                  },
                );
              },
            });
          this.subscriptions.add(deactivateScreeningSub);
        }
      });
  }

  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
