import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientReservationsService } from '../../projects/auth/src/lib/services/clientReservations.service';
import { ClientComponent } from '../../projects/cinephoria-web/src/app/features/client/client.component';
import { of } from 'rxjs';

describe('ClientComponent', () => {
  let component: ClientComponent;
  let fixture: ComponentFixture<ClientComponent>;

  let mockClientReservationsService: Partial<ClientReservationsService>;

  const unsortedReservations = [
    { id: 1, screening: { screeningDate: '2023-01-01' } },
    { id: 2, screening: { screeningDate: '2023-01-03' } },
    { id: 3, screening: { screeningDate: '2023-01-02' } },
  ];

  beforeEach(async () => {
    mockClientReservationsService = {
      getUserReservations: jest.fn().mockReturnValue(of([])),
    } as unknown as ClientReservationsService;

    await TestBed.configureTestingModule({
      declarations: [ClientComponent],
      providers: [
        { provide: ClientReservationsService, useValue: mockClientReservationsService },
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the state on init', () => {
    component.ngOnInit();
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(false);
  });

  it('should sort reservations by screeningDate in descending order', () => {
    (mockClientReservationsService.getUserReservations as jest.Mock).mockReturnValue(
      of({ reservations: unsortedReservations }),
    );
    component.ngOnInit();
    expect(component.reservations).toEqual([
      { id: 2, screening: { screeningDate: '2023-01-03' } },
      { id: 3, screening: { screeningDate: '2023-01-02' } },
      { id: 1, screening: { screeningDate: '2023-01-01' } },
    ]);
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
