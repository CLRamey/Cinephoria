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

  it('should render seat rows in the template', () => {
    fixture.detectChanges();
    const rowElements = fixture.nativeElement.querySelectorAll('.seat-row');
    expect(rowElements.length).toBe(2);
  });

  it('should render PMR icons correctly', () => {
    const seatElements = fixture.nativeElement.querySelectorAll('.seat');
    mockSeats.forEach((seat, index) => {
      const seatElement = seatElements[index];
      expect(seatElement.title).toBe(seat.label);
      if (seat.pmrSeat) {
        expect(seatElement.querySelector('.pmr-icon')).toBeTruthy();
      } else {
        expect(seatElement.querySelector('.pmr-icon')).toBeFalsy();
      }
    });
  });

  it('should render the seat labels correctly - A1, A2 and A3', () => {
    const seatElements = fixture.nativeElement.querySelectorAll('.seat');
    expect(seatElements[0].textContent).toContain('A1');
    expect(seatElements[1].textContent).toContain('A2');
    expect(seatElements[2].textContent).toContain('A3');
  });

  it('should emit seatSelectionChange when a seat is clicked', () => {
    jest.spyOn(component.seatSelectionChange, 'emit');
    const seatElements = fixture.nativeElement.querySelectorAll('.seat');
    seatElements[0].click();
    expect(component.seatSelectionChange.emit).toHaveBeenCalledWith([mockSeats[0]]);
  });

  it('should not select reserved seats when clicked', () => {
    jest.spyOn(component.seatSelectionChange, 'emit');
    const seatElements = fixture.nativeElement.querySelectorAll('.seat');
    seatElements[2].click(); // Attempt to click the reserved seat (A3)
    expect(component.seatSelectionChange.emit).not.toHaveBeenCalled();
  });

  it('should display the seat legend with reserved/selected/available', () => {
    const legend = fixture.nativeElement.querySelector('.seat-legend');
    expect(legend.textContent).toContain('Réservé');
    expect(legend.textContent).toContain('Sélectionné');
    expect(legend.textContent).toContain('Disponible');
  });
});
