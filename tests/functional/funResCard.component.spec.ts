import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservationCardComponent } from '../../projects/cinephoria-web/src/app/utils/reservation-card/reservation-card.component';

describe('ReservationCardComponent', () => {
  let component: ReservationCardComponent;
  let fixture: ComponentFixture<ReservationCardComponent>;

  const mockScreening = {
    screeningId: 1,
    cinemaId: 1,
    filmId: 1,
    roomId: 1,
    screeningDate: new Date('2025-07-15'),
    startTime: '14:00',
    endTime: '16:10',
    quality: 'IMAX',
    price: 12.5,
    screeningStatus: 'active',
    room: { roomId: 1, roomNumber: 5 },
  } as const;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReservationCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservationCardComponent);
    component = fixture.componentInstance;
    component.screening = mockScreening;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit reserveScreening when "Réserver" button is clicked', () => {
    jest.spyOn(component.reserveScreening, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.reserveScreening.emit).toHaveBeenCalledWith(mockScreening);
  });
});
