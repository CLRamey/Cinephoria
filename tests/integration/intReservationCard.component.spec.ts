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

  it('should render the correct content in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Salle');
    expect(compiled.textContent).toContain('5');
    expect(compiled.textContent).toContain('Début:');
    expect(compiled.textContent).toContain('14:00');
    expect(compiled.textContent).toContain('Fin:');
    expect(compiled.textContent).toContain('16:10');
    expect(compiled.textContent).toContain('Qualité:');
    expect(compiled.textContent).toContain('IMAX');
    expect(compiled.textContent).toContain('Prix:');
    expect(compiled.textContent).toContain('€12.50');
  });
});
