import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { FilmInfoService } from '../../../services/film-info.service';
import { FilmInfo, Screening } from '../../../interfaces/film';
import { ExtendedScreening } from '../../../interfaces/screening';
import { ReservationService } from '../../../services/reservation.service';

@Component({
  selector: 'caw-film-details',
  templateUrl: './film-details.component.html',
  styleUrls: ['./film-details.component.scss'],
})
export class FilmDetailsComponent implements OnInit, OnDestroy {
  // Loading state and error messages
  isLoading: boolean = false;
  hasError: string | null = null;

  // Film details, screenings and reviews
  film?: FilmInfo;
  filmId?: number;
  screenings: Screening[] = [];
  seances: ExtendedScreening[] = [];
  review: string = '';

  // Constructor to inject necessary services and router
  constructor(
    private readonly route: ActivatedRoute,
    private readonly filmInfoService: FilmInfoService,
    private readonly reservationService: ReservationService,
    private readonly router: Router,
  ) {}

  // Subscription to manage multiple observables
  private readonly subscriptions: Subscription = new Subscription();

  // Scroll to screening section
  @ViewChild('screeningsSection') screeningsSection!: ElementRef;

  scrollToSection(section: 'screenings') {
    const map = {
      screenings: this.screeningsSection,
    };

    map[section]?.nativeElement.scrollIntoView({ behavior: 'smooth' });
  }

  // Lifecycle hook to initialize the component and load film details
  ngOnInit(): void {
    if (this.film) {
      this.filmId = this.film.filmId;
      this.loadFilm(this.filmId);
    } else {
      this.subscriptions.add(
        this.route.paramMap.subscribe(params => {
          const id = params.get('filmId');
          if (id) {
            this.filmId = +id; // convert string to number
            this.loadFilm(this.filmId);
          }
        }),
      );
    }
  }

  // Method to load film details and the linked screenings by ID
  private loadFilm(filmId: number): void {
    this.isLoading = true;
    this.hasError = null;

    const filmSub = this.filmInfoService
      .getFilmById(filmId)
      .pipe(
        catchError(err => {
          console.error('Error loading films:', err);
          this.hasError = 'Erreur lors du chargement du film.';
          this.isLoading = false;
          return of(null);
        }),
      )
      .subscribe(response => {
        this.film = Array.isArray(response) ? response[0] : (response ?? undefined);
        if (this.film) {
          const screenings = this.film.screenings ?? [];
          if (screenings && screenings.length > 0) {
            this.loadExtendedScreenings(screenings, this.film.filmDuration);
            setTimeout(() => this.scrollToScreenings(), 2000);
          } else {
            this.isLoading = false;
          }
        } else {
          this.isLoading = false;
        }
      });
    this.subscriptions.add(filmSub);
  }

  // Method to load extended screenings with room information and film duration
  private loadExtendedScreenings(screenings: Screening[], filmDuration: number): void {
    const extendedScreenings$ = screenings.map(screening =>
      this.reservationService.getExtendedScreening(screening, filmDuration),
    );

    forkJoin(extendedScreenings$)
      .pipe(
        catchError(err => {
          console.error('Error loading screenings:', err);
          this.hasError = 'Erreur lors du chargement des séances.';
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

  // Method to scroll to the screenings section after loading
  scrollToScreenings(): void {
    if (this.screeningsSection?.nativeElement) {
      this.screeningsSection.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }

  // Method to handle navigation to the reservation page for a selected film screening
  onReserveScreening(screening: ExtendedScreening) {
    this.reservationService.setSelectedScreening(screening);
    this.router.navigate(['/reservation']);
  }

  // Method to handle the subscription cleanup to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
