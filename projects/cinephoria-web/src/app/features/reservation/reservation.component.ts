import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FilmInfoService } from '../../services/film-info.service';
import { FilmInfo, Screening } from '../../interfaces/film';
import { CinemaInfoService } from '../../services/cinema-info.service';
import { CinemaInfo } from '../../interfaces/cinema';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { ReservationService } from '../../services/reservation.service';
import { ExtendedScreening } from '../../interfaces/screening';
import { Router, ActivatedRoute } from '@angular/router';
import { Seat, SavedReservation } from '../../interfaces/reservation';
import { AuthService } from '../../../../../auth/src/lib/services/auth.service';
import { ReserveResponse } from '../../interfaces/reservation';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'caw-reservation',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.scss'],
})
export class ReservationComponent implements OnInit, OnDestroy {
  // Properties to store the loading state, error state, and whether filters are needed
  isLoading: boolean = false;
  hasError: boolean = false;
  filtersNeeded: boolean = true;
  hasSeatingError: boolean = false;
  screeningSelected: boolean = false;

  isAuthenticated: boolean | null = null;

  // Properties for films, cinemas and screenings
  allFilms: FilmInfo[] = [];
  film?: FilmInfo;
  seances: ExtendedScreening[] = [];
  filteredScreenings: ExtendedScreening[] = [];
  filteredFilms: { id: number; name: string }[] = [];
  cinemas: { id: number; name: string }[] = [];

  // Properties for seat data
  seats: Seat[] = [];
  selectedSeats: Seat[] = [];

  // Properties for seat selection
  seatCountOptions = Array.from({ length: 10 }, (_, i) => i + 1);
  selectedSeatCount: number | null = null;
  showSeatingPlan: boolean = false;
  selectedSeatLabels: string = '';

  // Properties for price calculation
  totalPrice: number = 0;

  // Properties for selected filters
  selectedCinemaId: number | null = null;
  selectedFilmId: number | null = null;
  selectedScreeningId: number | null = null;

  // Add seatSelector property to manage previously selected seats
  seatSelector = { selectedSeatIds: new Set<Seat>() };

  // ViewChild references for scrolling to sections
  @ViewChild('screeningsSection') screeningsSection: ElementRef | null = null;
  @ViewChild('seatCountSection') seatCountSection: ElementRef | null = null;
  @ViewChild('seatingPlanSection') seatingPlanSection: ElementRef | null = null;
  @ViewChild('priceSummarySection') priceSummarySection: ElementRef | null = null;

  // Constructor to inject necessary services and router
  constructor(
    private readonly filmInfoService: FilmInfoService,
    private readonly cinemaInfoService: CinemaInfoService,
    private readonly reservationService: ReservationService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly authService: AuthService,
    private readonly snackBar: MatSnackBar,
  ) {}

  // Subscription to manage multiple observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to initialize component
  ngOnInit(): void {
    const AuthSub = this.authService.isAuthenticated$.pipe(take(1)).subscribe(isAuth => {
      this.isAuthenticated = isAuth;
    });
    const screening = this.reservationService.getSelectedScreening();
    if (this.isAuthenticated) {
      this.restoreReservation();
    } else if (screening) {
      this.filtersNeeded = false;
      this.selectedCinemaId = screening.cinemaId;
      this.selectedFilmId = screening.filmId;
      this.selectedScreeningId = screening.screeningId;
      this.onFilterChange();
      this.screeningSelected = true;
      this.loadSeatSelection();
    } else {
      this.selectedCinemaId = null;
      this.selectedFilmId = null;
      this.seances = [];
      this.filteredScreenings = [];
    }
    this.loadFilters();
    this.subscriptions.add(AuthSub);
  }

  // Method to restore saved reservation progress after authentication/account creation
  private restoreReservation(): void {
    const savedReservation: SavedReservation | null = this.reservationService.getSavedReservation();
    if (!savedReservation) return;
    if (savedReservation) {
      this.filtersNeeded = false;
      this.selectedCinemaId = savedReservation.cinemaId;
      this.selectedFilmId = savedReservation.filmId;
      this.selectedScreeningId = savedReservation.screeningId;
      this.onFilterChange();
      this.screeningSelected = true;
      this.seances = savedReservation.selectedScreening;
      const screening = this.seances[0];
      this.reservationService.setSelectedScreening(screening);
      this.loadSeatSelection();
      this.selectedSeatCount = savedReservation.seatCount;
      this.selectedSeats = savedReservation.selectedSeats;
      savedReservation.selectedSeats.forEach(seat => {
        this.seatSelector.selectedSeatIds.add(seat);
      });
      this.selectedSeatLabels = savedReservation.selectedSeatLabels;
      setTimeout(() => this.scrollToSection(this.priceSummarySection), 1000);
    }
  }

  // Method to load cinema and film filters
  private loadFilters(): void {
    const cinemaSub = this.cinemaInfoService.getCinemaInfo().subscribe({
      next: (data: { CinemaInfo: CinemaInfo[] } | null) => {
        const cinemasData = data?.CinemaInfo ?? [];
        this.cinemas = cinemasData
          .sort((a, b) => a.cinemaName.localeCompare(b.cinemaName))
          .map(c => ({ id: c.cinemaId, name: c.cinemaName }));
      },
      error: err => console.error('Failed to load cinemas', err),
    });

    const filmSub = this.filmInfoService.getFilmInfo().subscribe({
      next: (data: { FilmInfo: FilmInfo[] } | null) => {
        const filmsData = data?.FilmInfo ?? [];
        this.filteredFilms = filmsData
          .sort((a, b) => a.filmTitle.localeCompare(b.filmTitle))
          .map(f => ({ id: f.filmId, name: f.filmTitle }));
      },
      error: err => console.error('Failed to load films', err),
    });
    this.subscriptions.add(cinemaSub);
    this.subscriptions.add(filmSub);
  }

  // Method to handle filter changes and load screenings based on selected filters
  onFilterChange(): void {
    if (this.selectedCinemaId && this.selectedFilmId) {
      this.filtersNeeded = false;
      this.resetSeatSelection();
      this.loadFilteredScreenings();
    } else {
      this.filtersNeeded = true;
      this.seances = [];
      this.filteredScreenings = [];
    }
  }

  // Method to load screenings based on selected cinema and film
  private loadFilteredScreenings(): void {
    this.filteredScreenings = [];
    this.seances = [];
    this.hasError = false;
    this.isLoading = true;
    const screeningSub = this.filmInfoService
      .getFilmById(this.selectedFilmId!)
      .pipe(
        take(1),
        catchError(err => {
          console.error('Error loading film details:', err);
          this.hasError = true;
          this.isLoading = false;
          return of(null);
        }),
      )
      .subscribe(response => {
        this.film = Array.isArray(response) ? response[0] : (response ?? undefined);
        if (!this.film || !this.film.screenings?.length) {
          this.isLoading = false;
          console.warn('No screenings found for the selected film.');
          return;
        }
        const screenings = this.film.screenings ?? [];
        if (screenings && screenings.length > 0) {
          const filteredScreenings = screenings.filter(
            screening =>
              screening.cinemaId === this.selectedCinemaId &&
              screening.filmId === this.selectedFilmId,
          );
          this.isLoading = false;
          this.hasError = false;
          this.loadExtendedScreenings(filteredScreenings, this.film.filmDuration);
        } else {
          this.isLoading = false;
          this.hasError = false;
          this.seances = [];
          this.filteredScreenings = [];
        }
      });
    this.subscriptions.add(screeningSub);
  }

  // Method to load extended screenings with room information and film duration
  private loadExtendedScreenings(screenings: Screening[], filmDuration: number): void {
    const extendedScreenings$ = screenings.map(screening =>
      this.reservationService.getExtendedScreening(screening, filmDuration),
    );
    forkJoin(extendedScreenings$)
      .pipe(
        take(1),
        catchError(err => {
          console.error('Error loading screenings:', err);
          this.hasError = true;
          return of([]);
        }),
      )
      .subscribe(extendedScreenings => {
        this.seances = (extendedScreenings as (ExtendedScreening | null)[])
          .filter((screening): screening is ExtendedScreening => screening !== null)
          .filter(screening => screening.screeningDate >= new Date())
          .sort((a, b) => a.screeningDate.getTime() - b.screeningDate.getTime());
        this.isLoading = false;
      });
  }

  // Method to set the screening selected and pass onto the next seat selection step
  onSelectedScreening(screening: ExtendedScreening) {
    this.reservationService.setSelectedScreening(screening);
    this.selectedScreeningId = screening.screeningId;
    this.resetSeatSelection();
    this.screeningSelected = true;
    this.loadSeatSelection();
  }

  // Method to load seat selection based on the selected screening
  loadSeatSelection(): void {
    const screening = this.reservationService.getSelectedScreening();
    if (!screening) {
      console.warn('No screening selected for seat selection.');
      return;
    }
    const seatSub = this.reservationService.getScreeningSeats(screening.screeningId!).subscribe({
      next: seats => {
        if (seats && seats.length > 0) {
          this.hasSeatingError = false;
          this.seats = seats;
          this.scrollToSection(this.seatCountSection);
          if (this.selectedSeatCount) {
            this.onSeatCountChange();
          }
          if (this.selectedSeats?.length) {
            this.onSeatsSelected(this.selectedSeats);
          }
        } else {
          console.warn('No seats available for the selected screening.');
          this.hasSeatingError = true;
          this.seats = [];
        }
      },
      error: err => {
        console.error('Error loading screening seats:', err);
        this.hasSeatingError = true;
      },
    });
    this.subscriptions.add(seatSub);
  }

  // Method to reset seat selection
  resetSeatSelection(): void {
    this.selectedSeatCount = null;
    this.selectedSeats = [];
    this.showSeatingPlan = false;
    this.totalPrice = 0;
  }

  // Method to handle seat count changes
  onSeatCountChange(): void {
    if (!this.selectedSeatCount) return;
    const availableSeats = this.seats.filter(seat => !seat.isReserved);
    if (availableSeats.length >= this.selectedSeatCount) {
      this.showSeatingPlan = true;
      this.scrollToSection(this.seatingPlanSection);
    } else {
      this.showSeatingPlan = false;
      this.snackBar.open(
        'Le nombre de places disponibles est insuffisant pour votre sélection. Veuillez choisir une autre séance.',
        'Fermer',
        {
          duration: 3000,
        },
      );
      setTimeout(() => {
        this.scrollToSection(this.screeningsSection);
      }, 3000);
    }
  }

  // Method to manage the seat selections prior to moving onto the summary overview
  onSeatsSelected(selectedSeats: Seat[]): void {
    this.selectedSeats = selectedSeats;
    this.selectedSeatLabels = this.selectedSeats.map(seat => seat.label).join(', ');
    this.seats = this.seats.map(seat => ({
      ...seat,
      isSelected: selectedSeats.some(selected => selected.seatId === seat.seatId),
    }));
    if (this.selectedSeats.length === this.selectedSeatCount) {
      this.totalPrice = this.selectedSeats.length * this.getSeatPrice();
      setTimeout(() => {
        this.scrollToSection(this.priceSummarySection);
      }, 3000);
    }
  }

  // Method to get the price of a seat from backend data
  private getSeatPrice(): number {
    const screening = this.reservationService.getSelectedScreening();
    return screening?.price ?? 0;
  }

  // Gets the cinema, film, and screening details selected prior to the reservation for the recap
  get recapDetails(): {
    cinema: string | undefined;
    film: string | undefined;
    quality: string | undefined;
    seance: string | undefined;
    startTime: string | undefined;
    endTime: string | undefined;
    duration: number | undefined;
  } {
    const screening = this.reservationService.getSelectedScreening();
    const cinema = this.cinemas.find(c => c.id === this.selectedCinemaId);
    const film = this.filteredFilms.find(f => f.id === this.selectedFilmId);
    const screeningDate = screening?.screeningDate
      ? new Date(screening.screeningDate).toLocaleDateString('fr-FR')
      : undefined;
    return {
      cinema: cinema?.name,
      film: film?.name,
      quality: this.reservationService.getSelectedScreening()?.quality,
      seance: screeningDate,
      startTime: screening?.startTime,
      endTime: screening?.endTime,
      duration: this.film?.filmDuration,
    };
  }

  // Method to scroll to a specific section using ElementRef
  scrollToSection(section: ElementRef | null): void {
    if (section && section.nativeElement) {
      section.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    }
  }

  // Method to accumulate data for storage temporarily
  private accumulateDataToStore(): void {
    const screening = this.reservationService.getSelectedScreening();
    this.reservationService.saveCurrentReservation({
      cinemaId: this.selectedCinemaId,
      filmId: this.selectedFilmId,
      screeningId: this.selectedScreeningId,
      seatCount: this.selectedSeatCount ?? 0,
      selectedSeats: this.selectedSeats,
      selectedSeatLabels: this.selectedSeatLabels,
      selectedScreening: screening ? [screening as ExtendedScreening] : [],
    });
    this.reservationService.clearSelectedScreening();
  }

  // Method to redirect to login
  redirectToLogin(): void {
    this.accumulateDataToStore();
    this.router.navigate(['/login-client'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  // Method to redirect to signup
  redirectToSignup(): void {
    this.accumulateDataToStore();
    this.router.navigate(['/login-client/register'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  // Method to confirm reservation
  confirmReservation(): void {
    if (!this.isAuthenticated) {
      this.redirectToLogin();
      return;
    }
    if (!this.selectedScreeningId || this.selectedSeats.length === 0) {
      this.snackBar.open(
        'Veuillez sélectionner une séance et des sièges avant de confirmer la réservation.',
        'Fermer',
        {
          duration: 3000,
        },
      );
      return;
    }
    this.isLoading = true;
    const seatIds = this.selectedSeats.map(seat => seat.seatId);
    const reserveSub = this.reservationService
      .makeReservation(this.selectedScreeningId, seatIds)
      .subscribe({
        next: (response: ReserveResponse) => {
          this.isLoading = false;
          if (response.success) {
            this.snackBar.open(
              "Votre réservation est confirmée ! Le paiement s'effectuera directement sur place.",
              'Fermer',
              {
                duration: 7000,
                verticalPosition: 'top',
              },
            );
            this.router.navigate(['/client']);
          } else {
            this.snackBar.open('Échec de la réservation. Veuillez réessayer.', 'Fermer', {
              duration: 7000,
              verticalPosition: 'top',
            });
          }
        },
        error: (err: unknown) => {
          this.isLoading = false;
          console.error('Error confirming reservation:', err);
          this.snackBar.open(
            'Une erreur est survenue lors de la confirmation de la réservation. Veuillez réessayer plus tard.',
            'Fermer',
            {
              duration: 3000,
              verticalPosition: 'top',
            },
          );
        },
      });
    this.subscriptions.add(reserveSub);
  }

  // Lifecycle hook to clean up subscriptions when the component is destroyed
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
