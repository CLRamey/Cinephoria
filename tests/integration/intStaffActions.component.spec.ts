import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { StaffActionsComponent } from '../../projects/auth/src/lib/shared/staff-actions/staff-actions.component';
import { StaffActionsService } from '../../projects/auth/src/lib/services/staff-actions.service';
import { of, throwError } from 'rxjs';
import { CinemaInfoService } from '../../projects/cinephoria-web/src/app/services/cinema-info.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Films, Rooms, Screenings } from '../../projects/auth/src/lib/interfaces/staff-interfaces';
import { VerificationDialogComponent } from '../../projects/auth/src/lib/shared/utils/verification-dialog.component';

// Helper to get the next Wednesday from today
function getNextWednesday(): Date {
  const date = new Date();
  const day = date.getDay(); // Sunday=0 ... Saturday=6
  const diff = (3 - day + 7) % 7 || 7; // 3 = Wednesday
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  console.log('Next Wednesday:', date);
  return date;
}
const nextWednesday = getNextWednesday();
const twoWeeksLater = new Date(nextWednesday);
twoWeeksLater.setDate(twoWeeksLater.getDate() + 14);

describe('StaffActionsComponent', () => {
  let component: StaffActionsComponent;
  let fixture: ComponentFixture<StaffActionsComponent>;

  let mockStaffActionsService: Partial<StaffActionsService>;
  let mockCinemaInfoService: Partial<CinemaInfoService>;
  const mockDialogRef = {
    close: jest.fn(),
  };
  let mockSnackBar: Partial<MatSnackBar>;
  const mockFilmData = {
    filmId: 1,
    filmTitle: 'Test Film',
    filmDescription: 'A film used for testing purposes.',
    filmImg: 'https://example.com/test-film.webp',
    filmDuration: 120,
    filmMinimumAge: 13,
    filmActiveDate: nextWednesday.toISOString(),
    filmFavorite: false,
    genreFilms: [
      { genreId: 1, genreType: 'Action' },
      { genreId: 2, genreType: 'Drama' },
    ],
  } as Films;

  const mockFilmResponseData = {
    filmId: 1,
    filmTitle: 'Test Film',
    filmDescription: 'A film used for testing purposes.',
    filmImg: 'https://example.com/test-film.webp',
    filmDuration: 120,
    filmMinimumAge: 13,
    filmActiveDate: nextWednesday.toISOString(),
    filmFavorite: false,
    genreFilms: [1, 2],
  } as const;

  const mockFilmErrorData = {
    filmId: 1,
    filmTitle: 'Test Film',
    filmDescription: 'A film used for testing purposes.',
    filmImg: 'example.com/test-film.webp',
    filmDuration: 120,
    filmMinimumAge: 13,
    filmActiveDate: nextWednesday.toISOString(),
    filmFavorite: false,
  } as const;

  const mockErrorGenres = {
    genreIds: ['A', 'B'],
  };

  const mockAddGenres = {
    genreIds: [1, 2],
  };

  const mockRoomData = {
    roomId: 1,
    roomCapacity: 80,
    roomNumber: 1,
    numRows: 5,
    seatsPerRow: 8,
    qualityId: 1,
    cinemaId: 1,
    cinemaName: 'Test Cinema',
    cinema: {
      cinemaId: 1,
      cinemaName: 'Test Cinema',
    },
    quality: {
      qualityId: 1,
      qualityProjectionType: '2D',
    },
  } as Rooms;

  const mockModifyRoomData = {
    roomId: 1,
    roomCapacity: 70,
    roomNumber: 1,
    numRows: 7,
    seatsPerRow: 10,
    qualityId: 1,
    cinemaId: 1,
    cinemaName: 'Test Cinema',
    cinema: {
      cinemaId: 1,
      cinemaName: 'Test Cinema',
    },
    quality: {
      qualityId: 1,
      qualityProjectionType: '2D',
    },
  } as Rooms;

  const mockScreeningData = {
    screeningId: 1,
    screeningDate: nextWednesday.toISOString(),
    cinemaId: 1,
    filmId: 1,
    roomId: 1,
    cinema: { cinemaId: 1, cinemaName: 'Test Cinema' },
    film: mockFilmData,
    room: mockRoomData,
  } as Screenings;

  const mockModifyScreeningData = {
    screeningId: 1,
    screeningDate: twoWeeksLater.toISOString(),
    cinemaId: 1,
    filmId: 1,
    roomId: 1,
    cinema: { cinemaId: 1, cinemaName: 'Test Cinema' },
    film: mockFilmData,
    room: mockRoomData,
  };

  const mockCinemaData = {
    cinemaId: 1,
    cinemaName: 'Test Cinema',
  };

  const mockSuccessResponse = true;
  const mockErrorResponse = false;

  beforeEach(async () => {
    mockStaffActionsService = {
      getFilmsList: jest.fn().mockReturnValue(of({ Films: [mockFilmData] })),
      addFilm: jest.fn().mockReturnValue(of()),
      updateFilm: jest.fn().mockReturnValue(of()),
      deactivateFilm: jest.fn().mockReturnValue(of()),
      getRoomsList: jest.fn().mockReturnValue(of({ Rooms: [mockRoomData] })),
      addRoom: jest.fn().mockReturnValue(of()),
      updateRoom: jest.fn().mockReturnValue(of()),
      deactivateRoom: jest.fn().mockReturnValue(of()),
      getScreeningsList: jest.fn().mockReturnValue(of({ Screenings: [mockScreeningData] })),
      addScreening: jest.fn().mockReturnValue(of()),
      updateScreening: jest.fn().mockReturnValue(of()),
      deactivateScreening: jest.fn().mockReturnValue(of()),
    } as unknown as jest.Mocked<StaffActionsService>;
    mockCinemaInfoService = {
      getCinemaInfo: jest.fn().mockReturnValue(of({ CinemaInfo: [mockCinemaData] })),
    } as unknown as jest.Mocked<CinemaInfoService>;
    mockSnackBar = {
      open: jest.fn(),
    } as unknown as MatSnackBar;
    await TestBed.configureTestingModule({
      imports: [StaffActionsComponent, NoopAnimationsModule],
      providers: [
        provideHttpClientTesting(),
        { provide: StaffActionsService, useValue: mockStaffActionsService },
        { provide: CinemaInfoService, useValue: mockCinemaInfoService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        provideHttpClient(withInterceptorsFromDi()),
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(StaffActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create the StaffActionsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should send the addFilm request on onAddFilm and return success snackbar on success', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest
        .fn()
        .mockReturnValue(of({ filmData: mockFilmResponseData, genreIds: mockAddGenres })),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'addFilm')
      .mockReturnValue(of(mockSuccessResponse));
    component.onAddFilm();
    expect(spy).toHaveBeenCalledWith({ filmData: mockFilmResponseData, genreIds: mockAddGenres });
    expect(mockSnackBar.open).toHaveBeenCalledWith('Film ajouté avec succès.', 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the addFilm request on onAddFilm and return error snackbar on failure', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest
        .fn()
        .mockReturnValue(of({ filmData: mockFilmErrorData, genreIds: mockErrorGenres })),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    jest.spyOn(mockStaffActionsService, 'addFilm').mockReturnValue(of(mockErrorResponse));
    component.onAddFilm();
    expect(mockSnackBar.open).toHaveBeenCalledWith("Erreur lors de l'ajout du film.", 'Fermer', {
      duration: 3000,
    });
  });

  it('should show error snackbar if thrown error occur during addFilm request in onAddFilm', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of({ filmData: mockFilmErrorData })),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    jest
      .spyOn(mockStaffActionsService, 'addFilm')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component.onAddFilm();
    expect(mockSnackBar.open).toHaveBeenCalledWith("Erreur lors de l'ajout du film.", 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the updateFilm request on onModifyFilm and return success snackbar on success', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of({ filmData: mockFilmData })),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'updateFilm')
      .mockReturnValue(of(mockSuccessResponse));
    component.onModifyFilm({ ...mockFilmData });
    expect(spy).toHaveBeenCalledWith(mockFilmData.filmId, mockFilmData, []);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Film modifié avec succès.', 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the updateFilm request on onModifyFilm and return error snackbar on failure', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of({ filmData: mockFilmData })),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    jest.spyOn(mockStaffActionsService, 'updateFilm').mockReturnValue(of(mockErrorResponse));
    component.onModifyFilm({ ...mockFilmData });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Erreur lors de la modification du film.',
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during updateFilm request in onModifyFilm', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of({ filmData: mockFilmData })),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    jest
      .spyOn(mockStaffActionsService, 'updateFilm')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component.onModifyFilm({ ...mockFilmData });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Erreur lors de la modification du film.',
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should cancel the request to deactivateFilm on onDeactivateFilm when user declines the confirmation', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(false)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest.spyOn(mockStaffActionsService, 'deactivateFilm');
    component.onDeactivateFilm({ ...mockFilmData });
    expect(spy).not.toHaveBeenCalled();
  });

  it('should show the following text in the confirmation dialog on onDeactivateFilm', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const spy = jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    component.onDeactivateFilm({ ...mockFilmData });
    expect(spy).toHaveBeenCalledWith(
      VerificationDialogComponent,
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Désactiver le film',
          message: `Êtes-vous sûr de vouloir désactiver le film "${mockFilmData.filmTitle}" ?`,
          confirmText: 'Désactiver',
          cancelText: 'Annuler',
        }),
      }),
    );
  });

  it('should send the deactivateFilm request on onDeactivateFilm and return success snackbar on success', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateFilm')
      .mockReturnValue(of(mockSuccessResponse));
    component.onDeactivateFilm({ ...mockFilmData });
    expect(spy).toHaveBeenCalledWith(mockFilmData.filmId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Film "${mockFilmData.filmTitle}" désactivé avec succès.`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the deactivateFilm request on onDeactivateFilm and return error snackbar on failure', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateFilm')
      .mockReturnValue(of(mockErrorResponse));
    component.onDeactivateFilm({ ...mockFilmData });
    expect(spy).toHaveBeenCalledWith(mockFilmData.filmId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Erreur lors de la désactivation du film "${mockFilmData.filmTitle}".`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during deactivateFilm request in onDeactivateFilm', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateFilm')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component.onDeactivateFilm({ ...mockFilmData });
    expect(spy).toHaveBeenCalledWith(mockFilmData.filmId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Erreur lors de la désactivation du film "${mockFilmData.filmTitle}".`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the addRoom request on onAddRoom and return success snackbar on success', () => {
    const cinemaId = 1;
    component['selectedCinemaId'] = cinemaId;
    component['cinemas'] = [{ cinemaId, cinemaName: 'Test Cinema' }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          numRows: mockRoomData.numRows,
          seatsPerRow: mockRoomData.seatsPerRow,
          roomData: mockRoomData,
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'addRoom')
      .mockReturnValue(of(mockSuccessResponse));
    component.onAddRoom();
    expect(spy).toHaveBeenCalledWith({
      numRows: mockRoomData.numRows,
      seatsPerRow: mockRoomData.seatsPerRow,
      roomData: mockRoomData,
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith('Salle ajoutée avec succès.', 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the addRoom request on onAddRoom and return error snackbar on failure', () => {
    const cinemaId = 1;
    component['selectedCinemaId'] = cinemaId;
    component['cinemas'] = [{ cinemaId, cinemaName: 'Test Cinema' }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          numRows: mockRoomData.numRows,
          seatsPerRow: mockRoomData.seatsPerRow,
          roomData: mockRoomData,
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'addRoom')
      .mockReturnValue(of(mockErrorResponse));
    component.onAddRoom();
    expect(spy).toHaveBeenCalledWith({
      numRows: mockRoomData.numRows,
      seatsPerRow: mockRoomData.seatsPerRow,
      roomData: mockRoomData,
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "Erreur lors de l'ajout de la salle.",
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during addRoom request in onAddRoom', () => {
    const cinemaId = 1;
    component['selectedCinemaId'] = cinemaId;
    component['cinemas'] = [{ cinemaId, cinemaName: 'Test Cinema' }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          numRows: mockRoomData.numRows,
          seatsPerRow: mockRoomData.seatsPerRow,
          roomData: mockRoomData,
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'addRoom')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component.onAddRoom();
    expect(spy).toHaveBeenCalledWith({
      numRows: mockRoomData.numRows,
      seatsPerRow: mockRoomData.seatsPerRow,
      roomData: mockRoomData,
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "Erreur lors de l'ajout de la salle.",
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the updateRoom request on onModifyRoom and return success snackbar on success', () => {
    const cinemaId = 1;
    const roomId = mockModifyRoomData.roomId;
    const numRows = 7;
    const seatsPerRow = 10;
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['cinemas'] = [{ cinemaId, cinemaName: 'Test Cinema' }];
    component['rooms'] = [{ ...mockModifyRoomData }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          roomId,
          numRows,
          seatsPerRow,
          roomData: mockModifyRoomData,
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'updateRoom')
      .mockReturnValue(of(mockSuccessResponse));
    component.onModifyRoom(mockModifyRoomData);
    expect(spy).toHaveBeenCalledWith(roomId, { ...mockModifyRoomData }, numRows, seatsPerRow);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Salle modifiée avec succès.', 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the updateRoom request on onModifyRoom and return error snackbar on failure', () => {
    const cinemaId = 1;
    const roomId = mockModifyRoomData.roomId;
    const numRows = 7;
    const seatsPerRow = 10;
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['cinemas'] = [{ cinemaId, cinemaName: 'Test Cinema' }];
    component['rooms'] = [{ ...mockModifyRoomData }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          roomId,
          numRows,
          seatsPerRow,
          roomData: mockModifyRoomData,
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'updateRoom')
      .mockReturnValue(of(mockErrorResponse));
    component.onModifyRoom(mockModifyRoomData);
    expect(spy).toHaveBeenCalledWith(roomId, { ...mockModifyRoomData }, numRows, seatsPerRow);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Erreur lors de la modification de la salle.',
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during updateRoom request in onModifyRoom', () => {
    const cinemaId = 1;
    const roomId = mockModifyRoomData.roomId;
    const numRows = 7;
    const seatsPerRow = 10;
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['cinemas'] = [{ cinemaId, cinemaName: 'Test Cinema' }];
    component['rooms'] = [{ ...mockModifyRoomData }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          roomId,
          numRows,
          seatsPerRow,
          roomData: mockModifyRoomData,
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'updateRoom')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component.onModifyRoom(mockModifyRoomData);
    expect(spy).toHaveBeenCalledWith(roomId, { ...mockModifyRoomData }, numRows, seatsPerRow);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Erreur lors de la modification de la salle.',
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should cancel the request to deactivateRoom on onDeleteRoom when user declines the confirmation', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(false)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateRoom')
      .mockReturnValue(of(mockSuccessResponse));
    component.onDeleteRoom(mockRoomData);
    expect(spy).not.toHaveBeenCalled();
  });

  it('should show the following text in the confirmation dialog on onDeleteRoom', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const spy = jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    component.onDeleteRoom(mockRoomData);
    expect(spy).toHaveBeenCalledWith(
      VerificationDialogComponent,
      expect.objectContaining({
        data: {
          title: 'Supprimer la salle',
          message: `Êtes-vous sûr de vouloir supprimer la salle "${mockRoomData.roomNumber}" ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
        },
      }),
    );
  });

  it('should send the deactivateRoom request on onDeleteRoom and return success snackbar on success', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateRoom')
      .mockReturnValue(of(mockSuccessResponse));
    component.onDeleteRoom(mockRoomData);
    expect(spy).toHaveBeenCalledWith(mockRoomData.roomId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Salle "${mockRoomData.roomNumber}" supprimée avec succès.`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the deactivateRoom request on onDeleteRoom and return error snackbar on failure', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateRoom')
      .mockReturnValue(of(mockErrorResponse));
    component.onDeleteRoom(mockRoomData);
    expect(spy).toHaveBeenCalledWith(mockRoomData.roomId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Erreur lors de la suppression de la salle "${mockRoomData.roomNumber}".`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during deactivateRoom request in onDeleteRoom', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateRoom')
      .mockReturnValue(throwError(() => new Error('Server Error')));
    component.onDeleteRoom(mockRoomData);
    expect(spy).toHaveBeenCalledWith(mockRoomData.roomId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Erreur lors de la suppression de la salle "${mockRoomData.roomNumber}".`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the addScreening request on onAddScreening and return success snackbar on success', () => {
    const cinemaId = 1;
    const roomId = mockRoomData.roomId;
    const filmId = mockFilmData.filmId;
    const screeningDate = nextWednesday.toISOString();
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['selectedFilmId'] = filmId;
    component['cinemas'] = [{ cinemaId, cinemaName: mockCinemaData.cinemaName }];
    component['rooms'] = [{ roomId, roomNumber: mockRoomData.roomNumber }];
    component['films'] = [{ filmId, filmTitle: mockFilmData.filmTitle }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          screeningData: {
            cinemaId,
            roomId,
            filmId,
            screeningDate,
          },
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'addScreening')
      .mockReturnValue(of(mockSuccessResponse));
    component.onAddScreening();
    expect(spy).toHaveBeenCalledWith({
      screeningData: {
        cinemaId,
        roomId,
        filmId,
        screeningDate,
      },
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith('Séance ajoutée avec succès.', 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the addScreening request on onAddScreening and return error snackbar on failure', () => {
    const cinemaId = 1;
    const roomId = mockRoomData.roomId;
    const filmId = mockFilmData.filmId;
    const screeningDate = nextWednesday.toISOString();
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['selectedFilmId'] = filmId;
    component['cinemas'] = [{ cinemaId, cinemaName: mockCinemaData.cinemaName }];
    component['rooms'] = [{ roomId, roomNumber: mockRoomData.roomNumber }];
    component['films'] = [{ filmId, filmTitle: mockFilmData.filmTitle }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          screeningData: {
            cinemaId,
            roomId,
            filmId,
            screeningDate,
          },
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'addScreening')
      .mockReturnValue(of(mockErrorResponse));
    component.onAddScreening();
    expect(spy).toHaveBeenCalledWith({
      screeningData: {
        cinemaId,
        roomId,
        filmId,
        screeningDate,
      },
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "Erreur lors de l'ajout de la séance.",
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during addScreening request in onAddScreening', () => {
    const cinemaId = 1;
    const roomId = mockRoomData.roomId;
    const filmId = mockFilmData.filmId;
    const screeningDate = nextWednesday.toISOString();
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['selectedFilmId'] = filmId;
    component['cinemas'] = [{ cinemaId, cinemaName: mockCinemaData.cinemaName }];
    component['rooms'] = [{ roomId, roomNumber: mockRoomData.roomNumber }];
    component['films'] = [{ filmId, filmTitle: mockFilmData.filmTitle }];
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          screeningData: {
            cinemaId,
            roomId,
            filmId,
            screeningDate,
          },
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'addScreening')
      .mockReturnValue(throwError(() => new Error('Test error')));
    component.onAddScreening();
    expect(spy).toHaveBeenCalledWith({
      screeningData: {
        cinemaId,
        roomId,
        filmId,
        screeningDate,
      },
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      "Erreur lors de l'ajout de la séance.",
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the updateScreening request on onModifyScreening and return error snackbar on failure', () => {
    const cinemaId = mockScreeningData.cinemaId;
    const roomId = mockScreeningData.roomId;
    const filmId = mockScreeningData.filmId;
    const screeningDate = twoWeeksLater.toISOString();
    const screeningId = mockModifyScreeningData.screeningId;
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['selectedFilmId'] = filmId;
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          screeningData: {
            cinemaId,
            roomId,
            filmId,
            screeningDate,
          },
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'updateScreening')
      .mockReturnValue(of(mockSuccessResponse));
    component.onModifyScreening({ ...mockModifyScreeningData });
    expect(spy).toHaveBeenCalledWith(screeningId, {
      screeningData: {
        cinemaId,
        roomId,
        filmId,
        screeningDate,
      },
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith('Séance modifiée avec succès.', 'Fermer', {
      duration: 3000,
    });
  });

  it('should send the updateScreening request on onModifyScreening and return error snackbar on failure', () => {
    const cinemaId = mockScreeningData.cinemaId;
    const roomId = mockScreeningData.roomId;
    const filmId = mockScreeningData.filmId;
    const screeningDate = twoWeeksLater.toISOString();
    const screeningId = mockModifyScreeningData.screeningId;
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['selectedFilmId'] = filmId;
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          screeningData: {
            cinemaId,
            roomId,
            filmId,
            screeningDate,
          },
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'updateScreening')
      .mockReturnValue(of(mockErrorResponse));
    component.onModifyScreening({ ...mockModifyScreeningData });
    expect(spy).toHaveBeenCalledWith(screeningId, {
      screeningData: {
        cinemaId,
        roomId,
        filmId,
        screeningDate,
      },
    });
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Erreur lors de la modification de la séance.',
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during updateScreening request in onModifyScreening', () => {
    const cinemaId = mockScreeningData.cinemaId;
    const roomId = mockScreeningData.roomId;
    const filmId = mockScreeningData.filmId;
    const screeningDate = twoWeeksLater.toISOString();
    const screeningId = mockModifyScreeningData.screeningId;
    component['selectedCinemaId'] = cinemaId;
    component['selectedRoomId'] = roomId;
    component['selectedFilmId'] = filmId;
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(
        of({
          screeningData: {
            cinemaId,
            roomId,
            filmId,
            screeningDate,
          },
        }),
      ),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'updateScreening')
      .mockReturnValue(throwError(() => new Error('Test error')));
    component.onModifyScreening({ ...mockModifyScreeningData });
    expect(spy).toHaveBeenCalledWith(screeningId, {
      screeningData: {
        cinemaId,
        roomId,
        filmId,
        screeningDate,
      },
    });
  });

  it('should cancel the request to deactivateScreening on onDeleteScreening when user declines the confirmation', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(false)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateScreening')
      .mockReturnValue(of(mockSuccessResponse));
    component.onDeleteScreening(mockScreeningData);
    expect(spy).not.toHaveBeenCalled();
  });

  // Helper function to format screening date
  const date = new Date(mockScreeningData.screeningDate);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const localTime = `${hours}:${minutes}`;
  const screeningToDelete = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${localTime}`;

  it('should show the following text in the confirmation dialog on onDeleteScreening', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    const spy = jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    component.onDeleteScreening(mockScreeningData);
    expect(spy).toHaveBeenCalledWith(
      VerificationDialogComponent,
      expect.objectContaining({
        data: {
          title: 'Supprimer la séance',
          message: `Êtes-vous sûr de vouloir supprimer la séance "${screeningToDelete}" ?`,
          confirmText: 'Supprimer',
          cancelText: 'Annuler',
        },
      }),
    );
  });

  it('should send the deactivateScreening request on onDeleteScreening and return success snackbar on success', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateScreening')
      .mockReturnValue(of(mockSuccessResponse));
    component.onDeleteScreening(mockScreeningData);
    expect(spy).toHaveBeenCalledWith(mockScreeningData.screeningId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Séance "${screeningToDelete}" désactivée avec succès.`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should send the deactivateScreening request on onDeleteScreening and return error snackbar on failure', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateScreening')
      .mockReturnValue(of(mockErrorResponse));
    component.onDeleteScreening(mockScreeningData);
    expect(spy).toHaveBeenCalledWith(mockScreeningData.screeningId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Erreur lors de la désactivation de la séance "${screeningToDelete}".`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });

  it('should show error snackbar if thrown error occur during deactivateScreening request in onDeleteScreening', () => {
    const dialogRefSpyObj: Partial<MatDialogRef<unknown>> = {
      afterClosed: jest.fn().mockReturnValue(of(true)),
    };
    jest
      .spyOn(component['dialog'], 'open')
      .mockReturnValue(dialogRefSpyObj as MatDialogRef<unknown>);
    const spy = jest
      .spyOn(mockStaffActionsService, 'deactivateScreening')
      .mockReturnValue(throwError(() => new Error('Test error')));
    component.onDeleteScreening(mockScreeningData);
    expect(spy).toHaveBeenCalledWith(mockScreeningData.screeningId);
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      `Erreur lors de la désactivation de la séance "${screeningToDelete}".`,
      'Fermer',
      {
        duration: 3000,
      },
    );
  });
});
