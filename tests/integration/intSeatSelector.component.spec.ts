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

  it('should emit seatSelectionChange when reserve() is triggered via toggleSeat', () => {
    jest.spyOn(component.seatSelectionChange, 'emit');
    component.toggleSeat(mockSeats[0]);
    expect(component.seatSelectionChange.emit).toHaveBeenCalledWith([mockSeats[0]]);
  });
});
