import { Component, OnInit, OnDestroy } from '@angular/core';
import { FilmInfoService } from '../../services/film-info.service';
import { FilmInfo } from '../../interfaces/film';
import { CinemaInfoService } from '../../services/cinema-info.service';
import { CinemaInfo } from '../../interfaces/cinema';
import { GenreInfoService } from '../../services/genre-info.service';
import { GenreInfo } from '../../interfaces/genre';
import { Subscription } from 'rxjs';

import { Router } from '@angular/router';

@Component({
  selector: 'caw-films',
  templateUrl: './films.component.html',
  styleUrl: './films.component.scss',
})
export class FilmsComponent implements OnInit, OnDestroy {
  // Properties to store the loading state, errors and data
  isLoading: boolean = false;
  hasError: string | null = null;

  films: FilmInfo[] = [];
  filteredFilms: FilmInfo[] = [];
  cinemas: { id: number; name: string }[] = [];
  genres: { id: number; name: string }[] = [];

  // Properties for selected filters
  selectedCinemaId: number | null = null;
  selectedGenreId: number | null = null;
  selectedDate: Date | null = null;

  // Constructor to inject services and router
  constructor(
    private readonly filmInfoService: FilmInfoService,
    private readonly cinemaInfoService: CinemaInfoService,
    private readonly genreInfoService: GenreInfoService,
    private readonly router: Router,
  ) {}

  // Subscription to manage multiple observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to load filters and films when the component initializes
  ngOnInit(): void {
    this.loadFilters();
    this.loadFilms();
  }

  // Method to load cinema and genre filters
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

    const genreSub = this.genreInfoService.getGenreInfo().subscribe({
      next: (data: GenreInfo[] | null) => {
        const genresData = data ?? [];
        this.genres = genresData
          .sort((a, b) => a.genreType.localeCompare(b.genreType))
          .map(g => ({ id: g.genreId, name: g.genreType }));
      },
      error: err => console.error('Failed to load genres', err),
    });
    this.subscriptions.add(cinemaSub);
    this.subscriptions.add(genreSub);
  }

  // Method to load films and apply filters
  private loadFilms(): void {
    this.isLoading = true;
    this.hasError = null;

    const filmsSub = this.filmInfoService.getFilmInfo().subscribe({
      next: data => {
        this.films = data?.FilmInfo ?? [];
        this.applyFilters();
        this.filteredFilms = [...this.films];
        this.isLoading = false;
      },
      error: err => {
        console.error('Failed to load films', err);
        this.hasError = 'Erreur lors du chargement des films';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
    this.subscriptions.add(filmsSub);
  }

  // Method to handle filter changes (when a user selects a cinema, genre, or date)
  applyFilters(): void {
    this.filteredFilms = this.films.filter(film => {
      if (this.selectedCinemaId) {
        const hasCinema = film.cinemaFilms?.some(cf => cf.cinemaId === this.selectedCinemaId);
        if (!hasCinema) {
          return false;
        }
      }
      if (this.selectedGenreId) {
        const hasGenre = film.genreFilms?.some(gf => gf.genreId === this.selectedGenreId);
        if (!hasGenre) {
          return false;
        }
      }
      if (this.selectedDate) {
        if (
          !Array.isArray(film.screenings) ||
          !film.screenings.some(s => {
            const screeningDate = new Date(s.screeningDate);
            return screeningDate.toDateString() === this.selectedDate!.toDateString();
          })
        ) {
          return false;
        }
      }
      return true;
    });
  }

  // Method to track films by their ID for performance optimization
  trackByFilmId(index: number, film: FilmInfo): number {
    return film.filmId;
  }

  // Method to handle film selection and navigate to the film details page
  onFilmSelected(film: FilmInfo): void {
    this.router.navigate([`/films/${film.filmId}`]);
  }

  // Lifecycle hook to clean up subscriptions to avoid memory leaks
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
