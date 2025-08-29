import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeatSelectionComponent } from '../../projects/cinephoria-web/src/app/utils/seat-selection/seat-selection.component';
import { Seat } from '../../projects/cinephoria-web/src/app/interfaces/reservation';

describe('SeatSelectionComponent', () => {
  let component: SeatSelectionComponent;
  let fixture: ComponentFixture<SeatSelectionComponent>;

  const mockSeats: Seat[] = [
    {
      seatId: 1,
      seatRow: 'A',
      seatNumber: 1,
      pmrSeat: false,
      roomId: 101,
      isReserved: false,
      label: 'A1',
    },
    {
      seatId: 2,
      seatRow: 'A',
      seatNumber: 2,
      pmrSeat: false,
      roomId: 101,
      isReserved: false,
      label: 'A2',
    },
    {
      seatId: 3,
      seatRow: 'A',
      seatNumber: 3,
      pmrSeat: false,
      roomId: 101,
      isReserved: true,
      label: 'A3',
    },
    {
      seatId: 4,
      seatRow: 'B',
      seatNumber: 1,
      pmrSeat: true,
      roomId: 101,
      isReserved: false,
      label: 'B1',
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatSelectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatSelectionComponent);
    component = fixture.componentInstance;
    component.seats = [...mockSeats];
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct initial seat selection', () => {
    expect(component.seats).toEqual(mockSeats);
  });

  it('should preselect seats via @Input', () => {
    component.preSelectedSeats = [mockSeats[0], mockSeats[1]];
    expect(component.selectedSeatIds.has(1)).toBe(true);
    expect(component.selectedSeatIds.has(2)).toBe(true);
    expect(component.selectedSeatIds.size).toBe(2);
  });

  it('should select a seat when clicked', () => {
    const seatElement = fixture.nativeElement.querySelector('.seat');
    seatElement.click();
    expect(component.selectedSeatIds.has(1)).toBe(true);
  });

  it('should not select a reserved seat when clicked', () => {
    const reservedSeatElement = fixture.nativeElement.querySelectorAll('.seat')[2];
    reservedSeatElement.click();
    expect(component.selectedSeatIds.has(3)).toBe(false);
  });

  it('should deselect a seat when clicked if it is already selected', () => {
    const seatElement = fixture.nativeElement.querySelector('.seat');
    seatElement.click();
    expect(component.selectedSeatIds.has(1)).toBe(true);
    seatElement.click();
    expect(component.selectedSeatIds.has(1)).toBe(false);
  });

  it('should not allow selecting more than maxSeats', () => {
    component.maxSeats = 2;
    const seatElements = fixture.nativeElement.querySelectorAll('.seat');
    seatElements[0].click();
    seatElements[1].click();
    seatElements[3].click();
    expect(component.selectedSeatIds.size).toBe(2);
    expect(component.selectedSeatIds.has(4)).toBe(false);
  });

  it('should return correct seat classification', () => {
    expect(component.getSeatClassification(mockSeats[2])).toBe('reserved');
    component.toggleSeat(mockSeats[0]);
    expect(component.getSeatClassification(mockSeats[0])).toBe('selected');
    expect(component.getSeatClassification(mockSeats[3])).toBe('pmr');
    expect(component.getSeatClassification(mockSeats[1])).toBe('available');
    component.maxSeats = 1;
    expect(component.getSeatClassification(mockSeats[1])).toBe('disabled');
  });

  it('should group and sort seats by row and number', () => {
    const rows = component.seatRows;
    expect(rows.length).toBe(2);
    expect(rows[0].map(s => s.label)).toEqual(['A1', 'A2', 'A3']);
    expect(rows[1].map(s => s.label)).toEqual(['B1']);
  });

  it('should toggle seat selection on click', () => {
    jest.spyOn(component['seatSelectionChange'], 'emit');
    const seat = mockSeats[0];
    component.toggleSeat(seat);
    expect(component.selectedSeatIds.has(seat.seatId)).toBe(true);
    expect(component['seatSelectionChange'].emit).toHaveBeenCalledWith([seat]);
    component.toggleSeat(seat);
    expect(component.selectedSeatIds.has(seat.seatId)).toBe(false);
  });
});
