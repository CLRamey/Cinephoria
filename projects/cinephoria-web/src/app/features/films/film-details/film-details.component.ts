import { Component, OnInit, OnDestroy, Input, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { FilmInfoService } from '../../../services/film-info.service';
import { FilmInfo, Screening } from '../../../interfaces/film';
import { ExtendedScreening } from '../../../interfaces/screening';
import { QualityInfo } from '../../../interfaces/quality';
import { RoomInfoService } from '../../../services/room-info.service';
import { RoomInfo } from '../../../interfaces/room';

@Component({
  selector: 'caw-film-details',
  templateUrl: './film-details.component.html',
  styleUrls: ['./film-details.component.scss'],
})
export class FilmDetailsComponent implements OnInit, OnDestroy {
  // Inputs to control loading state and error messages
  @Input() isLoading: boolean = false;
  @Input() hasError: string | null = null;

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
    private readonly roomInfoService: RoomInfoService,
    private readonly router: Router,
    private viewportScroller: ViewportScroller,
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
            console.log('Film ID from route:', this.filmId);
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
            setTimeout(() => this.scrollToScreenings(), 3000);
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
      this.getExtendedScreening(screening, filmDuration),
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
        this.seances = (extendedScreenings as (ExtendedScreening | null)[]).filter(
          (screening): screening is ExtendedScreening => screening !== null,
        );
        this.isLoading = false;
      });
  }

  // Method to get extended screening information including room quality and timings
  getExtendedScreening(screening: Screening, filmDuration: number) {
    const startDate = new Date(screening.screeningDate);
    const endDate = new Date(startDate.getTime() + filmDuration * 60000);

    return this.roomInfoService.getRoomById(screening.roomId).pipe(
      map((rooms: RoomInfo[] | null) => {
        const room = Array.isArray(rooms) && rooms.length > 0 ? rooms[0] : null;
        if (!room || !room.quality) return null;

        return this.createExtendedScreening(screening, startDate, endDate, room.quality);
      }),
      catchError(() => of(null)),
    );
  }

  // Method to create an extended screening object with all necessary details
  createExtendedScreening(
    screening: Screening,
    startDate: Date,
    endDate: Date,
    quality: QualityInfo,
  ): ExtendedScreening {
    return {
      screeningId: screening.screeningId,
      screeningDate: new Date(screening.screeningDate),
      screeningStatus: screening.screeningStatus ?? 'active',
      cinemaId: screening.cinemaId,
      filmId: screening.filmId,
      roomId: screening.roomId,
      startTime: startDate.toLocaleTimeString(['fr-FR'], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      endTime: endDate.toLocaleTimeString(['fr-FR'], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      quality: quality.qualityProjectionType ?? '',
      price: quality.qualityProjectionPrice ?? 0,
    };
  }

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
    this.router.navigate(['/reservation'], {
      queryParams: {
        screeningId: screening.screeningId,
        screeningDate: screening.screeningDate.toISOString(),
        filmId: screening.filmId,
        cinemaId: screening.cinemaId,
        roomId: screening.roomId,
        startTime: screening.startTime,
        endTime: screening.endTime,
        quality: screening.quality,
        price: screening.price,
      },
    });
  }

  // Method to handle the subscription cleanup to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
