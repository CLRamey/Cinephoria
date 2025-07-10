import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FilmInfo } from '../../interfaces/film';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'caw-film-card',
  standalone: true,
  imports: [NgIf, NgFor, MatCardModule, MatIconModule, MatBadgeModule, MatDividerModule],
  templateUrl: './film-card.component.html',
  styleUrls: ['./film-card.component.scss'],
})
export class FilmCardComponent implements OnInit {
  // Input property: film data passed from parent component.
  @Input() film!: FilmInfo;
  // Output property: event emitter to notify parent component when a film card is clicked.
  @Output() filmClicked = new EventEmitter<FilmInfo>();
  // Property to hold the star icons based on the film's average rating.
  starIcons: string[] = [];

  // Lifecycle hook that runs when the component is initialized (Initializes the starIcons getStarIcons method).
  ngOnInit() {
    this.starIcons = this.getStarIcons(this.film);
  }

  // Method to generate an array of star icons based on the film's average rating.
  getStarIcons(film: FilmInfo): string[] {
    const icons: string[] = [];
    const rating = Number(film.filmAverageRating) || 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        icons.push('star'); // Full star
      } else if (i - 0.5 <= rating) {
        icons.push('star_half'); // Half star
      } else {
        icons.push('star_border'); // Empty star
      }
    }
    return icons;
  }

  // Method that emits the filmClicked event when the film card is clicked.
  onFilmClick(): void {
    this.filmClicked.emit(this.film);
  }
}
