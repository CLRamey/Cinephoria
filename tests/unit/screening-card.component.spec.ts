import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScreeningCardComponent } from '../../projects/cinephoria-web/src/app/utils/screening-card/screening-card.component';

describe('ScreeningCardComponent', () => {
  let component: ScreeningCardComponent;
  let fixture: ComponentFixture<ScreeningCardComponent>;

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
  } as const;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScreeningCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ScreeningCardComponent);
    component = fixture.componentInstance;
    component.screening = mockScreening;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return correct screening details via getters', () => {
    expect(component.startTime).toBe('14:00');
    expect(component.endTime).toBe('16:10');
    expect(component.quality).toBe('IMAX');
    expect(component.price).toBe(12.5);
    expect(component.screeningStatus).toBe('active');
  });
});
