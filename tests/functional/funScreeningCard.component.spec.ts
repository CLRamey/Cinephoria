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

  it('should emit reserveScreening event when reserve() is triggered via button click', () => {
    jest.spyOn(component.reserveScreening, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.reserveScreening.emit).toHaveBeenCalledWith(mockScreening);
  });
});
