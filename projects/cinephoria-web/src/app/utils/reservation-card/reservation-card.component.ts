import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ExtendedScreening } from '../../interfaces/screening';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'caw-reservation-card',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, CommonModule],
  templateUrl: './reservation-card.component.html',
  styleUrl: './reservation-card.component.scss',
})
export class ReservationCardComponent {
  // Input property: screening data passed from parent component.
  @Input() screening!: ExtendedScreening;
  // Output property: event emitter to notify parent component when a seance is selected.
  @Output() reserveScreening = new EventEmitter<ExtendedScreening>();
  // Property to hold the list of extended screenings (seances).
  seances: ExtendedScreening[] = [];

  // Getter methods to access properties of the extended screening object.
  get roomNumber() {
    return this.screening.room?.roomNumber;
  }
  get startTime() {
    return this.screening.startTime;
  }
  get endTime() {
    return this.screening.endTime;
  }
  get quality() {
    return this.screening.quality;
  }
  get price() {
    return this.screening.price;
  }
  get screeningStatus() {
    return this.screening.screeningStatus;
  }

  // Method for the reserve button click event.
  reserve() {
    this.reserveScreening.emit(this.screening);
  }
}
