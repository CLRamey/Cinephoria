import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Seat } from '../../interfaces/reservation';

@Component({
  selector: 'caw-seat-selection',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './seat-selection.component.html',
  styleUrl: './seat-selection.component.scss',
})
export class SeatSelectionComponent {
  // Input property: list of seats to display.
  @Input({ required: true }) seats: Seat[] = [];
  // Input property: maximum number of seats that can be selected.
  @Input() maxSeats: number | null = null;
  // Input property: list of pre-selected seats.
  @Input() set preSelectedSeats(seats: Seat[]) {
    this.selectedSeatIds = new Set(seats.map(seat => seat.seatId));
  }
  // Output property: event emitter to notify parent component when seat selection changes.
  @Output() seatSelectionChange = new EventEmitter<Seat[]>();

  // Property to hold the currently selected seat IDs.
  selectedSeatIds: Set<number> = new Set();

  // Method to toggle seat selection
  toggleSeat(seat: Seat): void {
    if (seat.isReserved) return; // Prevent selection of reserved seats
    const isSelected = this.selectedSeatIds.has(seat.seatId);
    if (!isSelected) {
      if (this.maxSeats !== null && this.selectedSeatIds.size >= this.maxSeats) {
        return; // Prevent selecting more than maxSeats
      }
      this.selectedSeatIds.add(seat.seatId);
    } else {
      this.selectedSeatIds.delete(seat.seatId);
    }
    this.emitSeatSelection();
  }

  // Method to emit the current seat selection
  private emitSeatSelection(): void {
    const selectedSeats = this.seats.filter(seat => this.selectedSeatIds.has(seat.seatId));
    this.seatSelectionChange.emit(selectedSeats);
  }

  // Method to get the CSS class for a seat
  getSeatClassification(seat: Seat): string {
    if (seat.isReserved) {
      return 'reserved';
    }
    if (this.selectedSeatIds.has(seat.seatId)) {
      return 'selected';
    }
    if (seat.pmrSeat) {
      return 'pmr';
    }
    if (this.selectedLimitReached) {
      return 'disabled';
    }
    return 'available';
  }

  // Getter method to check if the selected seat limit has been reached
  private get selectedLimitReached(): boolean {
    return this.maxSeats !== null && this.selectedSeatIds.size >= this.maxSeats;
  }

  // Getter method to retrieve the seat rows
  get seatRows(): Seat[][] {
    const rows: Record<string, Seat[]> = {};
    this.seats.forEach(seat => {
      if (!rows[seat.seatRow]) rows[seat.seatRow] = [];
      rows[seat.seatRow].push(seat);
    });
    // Sort rows alphabetically and seats by number
    return Object.keys(rows)
      .sort()
      .map(rowKey => rows[rowKey].sort((a, b) => a.seatNumber - b.seatNumber));
  }
}
