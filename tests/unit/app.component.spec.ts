import { TestBed, ComponentFixture } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { AppComponent } from '../../projects/cinephoria-web/src/app/app.component';
import { describe, beforeEach, expect, it } from '@jest/globals';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ApiService } from '../../projects/cinephoria-web/src/app/services/api.service';
import { of, throwError } from 'rxjs';

describe('AppComponent', () => {
  let apiServiceMock: Partial<ApiService>;
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    apiServiceMock = {
      getStatus: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([])],
      declarations: [AppComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        { provide: ApiService, useValue: apiServiceMock },
      ],
      teardown: { destroyAfterEach: false },
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call getStatus on init', () => {
    (apiServiceMock.getStatus as jest.Mock).mockReturnValue(of({ status: 'OK' }));
    component.ngOnInit();
    expect(apiServiceMock.getStatus).toHaveBeenCalled();
  });

  it('should set status from API on success', () => {
    const mockResponse = { status: 'OK' };
    (apiServiceMock.getStatus as jest.Mock).mockReturnValue(of(mockResponse));
    component.ngOnInit();
    expect(apiServiceMock.getStatus).toHaveBeenCalled();
    expect(component.status).toBe('OK');
  });

  it('should set status to "Error" on API failure', () => {
    (apiServiceMock.getStatus as jest.Mock).mockReturnValue(
      throwError(() => new Error('Network error')),
    );
    component.ngOnInit();
    expect(apiServiceMock.getStatus).toHaveBeenCalled();
    expect(component.status).toBe('Error');
  });

  it('should clean up subscriptions on destroy', () => {
    const unsubscribeSpy = jest.spyOn(component['subscriptions'], 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubscribeSpy).toHaveBeenCalled();
  });
});
