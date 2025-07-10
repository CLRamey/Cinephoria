import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { RoomInfoService } from '../../projects/cinephoria-web/src/app/services/room-info.service';
import { environment } from '../../projects/cinephoria-web/src/environments/environment';
import {
  RoomInfo,
  RoomInfoResponse,
  RoomInfoErrorResponse,
} from '../../projects/cinephoria-web/src/app/interfaces/room';

describe('RoomInfoService', () => {
  let service: RoomInfoService;
  let httpMock: HttpTestingController;
  const mockRoomData: RoomInfo[] = [
    {
      roomId: 1,
      roomNumber: 1,
      roomCapacity: 100,
      qualityId: 10,
      cinemaId: 5,
      quality: {
        qualityId: 10,
        qualityProjectionType: 'IMAX',
        qualityProjectionPrice: 15.5,
      },
      cinema: {
        cinemaId: 5,
        cinemaName: 'Main Cinema',
      },
    },
  ];

  const mockSuccessResponse: RoomInfoResponse = {
    success: true,
    data: mockRoomData,
  };

  const mockErrorResponse: RoomInfoErrorResponse = {
    success: false,
    error: { message: 'Error fetching rooms' },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoomInfoService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(RoomInfoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  describe('getRoomInfo', () => {
    it('should fetch room info successfully', () => {
      service.getRoomInfo().subscribe(result => {
        expect(result).toBeTruthy();
        expect(result?.RoomInfo.length).toBe(1);
        expect(result?.RoomInfo[0].roomNumber).toBe(1);
        expect(result?.RoomInfo[0].quality?.qualityProjectionType).toBe('IMAX');
        expect(result?.RoomInfo[0].cinema?.cinemaName).toBe('Main Cinema');
      });

      const req = httpMock.expectOne(`${environment.apiURL}/rooms`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should return null on API error response', () => {
      service.getRoomInfo().subscribe(result => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiURL}/rooms`);
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getRoomInfo().subscribe(result => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiURL}/rooms`);
      req.error(new ProgressEvent('error'));
    });
  });

  describe('getRoomById', () => {
    const roomId = 1;

    it('should fetch room by ID successfully', () => {
      service.getRoomById(roomId).subscribe(result => {
        expect(result).toBeTruthy();
        expect(Array.isArray(result)).toBe(true);
        expect(result?.[0].roomNumber).toBe(1);
        expect(result?.[0].quality?.qualityProjectionType).toBe('IMAX');
        expect(result?.[0].cinema?.cinemaName).toBe('Main Cinema');
      });

      const req = httpMock.expectOne(`${environment.apiURL}/rooms/${roomId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockSuccessResponse);
    });

    it('should return null on API error response', () => {
      service.getRoomById(roomId).subscribe(result => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiURL}/rooms/${roomId}`);
      req.flush(mockErrorResponse);
    });

    it('should return null on network/server error', () => {
      service.getRoomById(roomId).subscribe(result => {
        expect(result).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiURL}/rooms/${roomId}`);
      req.error(new ProgressEvent('error'));
    });
  });
});
