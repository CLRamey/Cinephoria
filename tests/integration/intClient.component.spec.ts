import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ClientReservationsService } from '../../projects/auth/src/lib/services/clientReservations.service';
import { ClientComponent } from '../../projects/cinephoria-web/src/app/features/client/client.component';
import { of, throwError } from 'rxjs';

describe('ClientComponent', () => {
  let component: ClientComponent;
  let fixture: ComponentFixture<ClientComponent>;

  let mockClientReservationsService: Partial<ClientReservationsService>;

  const mockReservations = [
    { id: 1, date: new Date('2023-01-01') },
    { id: 2, date: new Date('2023-01-03') },
    { id: 3, date: new Date('2023-01-02') },
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

  it('should retrieve the user reservations on init', () => {
    (mockClientReservationsService.getUserReservations as jest.Mock).mockReturnValue(
      of({ reservations: mockReservations }),
    );
    component.ngOnInit();
    expect(component.reservations).toEqual([
      { id: 1, date: new Date('2023-01-01') },
      { id: 2, date: new Date('2023-01-03') },
      { id: 3, date: new Date('2023-01-02') },
    ]);
    expect(component.reservations.length).toBe(3);
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(false);
  });

  it('should handle errors gracefully when the API call fails', () => {
    (mockClientReservationsService.getUserReservations as jest.Mock).mockReturnValue(
      throwError(() => new Error('API error')),
    );
    component.ngOnInit();
    expect(component.reservations).toEqual([]);
    expect(component.isLoading).toBe(false);
    expect(component.hasError).toBe(true);
  });
});
