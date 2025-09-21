import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { FilmInfoService } from '../../services/film-info.service';
import { FilmInfo } from '../../interfaces/film';

@Component({
  selector: 'caw-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('carousel', { read: ElementRef }) carousel!: ElementRef<HTMLDivElement>;
  isLoading: boolean = false;
  hasError: string | null = null;

  // Properties to store films and latest films
  films: FilmInfo[] = [];
  latestFilms: FilmInfo[] = [];
  selectedFilm: FilmInfo | null = null;

  // Constructor to inject services and router
  constructor(
    private readonly filmInfoService: FilmInfoService,
    private readonly router: Router,
  ) {}

  // Subscription to manage observables
  private readonly subscriptions: Subscription = new Subscription();

  // Lifecycle hook to load films when the component initializes
  ngOnInit(): void {
    this.loadFilms();
  }

  // Method to load films and filter latest films
  private loadFilms(): void {
    this.isLoading = true;
    this.hasError = null;
    const lastWednesday = this.getLastWednesday();

    const filmsSub = this.filmInfoService.getFilmInfo().subscribe({
      next: data => {
        this.films = data?.FilmInfo ?? [];
        this.isLoading = false;
        this.latestFilms = this.films.filter(film => {
          const activeDate = new Date(film.filmActiveDate);
          activeDate.setHours(0, 0, 0, 0);
          return (
            activeDate.getFullYear() === lastWednesday.getFullYear() &&
            activeDate.getMonth() === lastWednesday.getMonth() &&
            activeDate.getDate() === lastWednesday.getDate()
          );
        });
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

  // Method to get the last Wednesday date
  private getLastWednesday(): Date {
    const today = new Date();
    const day = today.getDay();
    const daysSinceWednesday = day >= 3 ? day - 3 : 7 - (3 - day);
    today.setDate(today.getDate() - daysSinceWednesday);
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Methods to scroll the carousel left or right
  scrollLeft() {
    this.carousel.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
  }
  scrollRight() {
    this.carousel.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
  }

  // Method to navigate to the film details page when a film card is clicked
  showFilmDetails(film: FilmInfo): void {
    this.router.navigate([`/films/${film.filmId}`]);
  }

  // Method to navigate to the films page when the button is clicked
  goToAllFilms(): void {
    this.router.navigate(['/films']);
  }

  // Lifecycle hook to clean up subscriptions
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
