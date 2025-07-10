import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilmDetailsComponent } from '../../projects/cinephoria-web/src/app/features/films/film-details/film-details.component';
import { FilmInfoService } from '../../projects/cinephoria-web/src/app/services/film-info.service';
import { RoomInfoService } from '../../projects/cinephoria-web/src/app/services/room-info.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { ElementRef } from '@angular/core';
import { of } from 'rxjs';

class SubFilmInfoService {
  getFilmById() {
    return of({
      filmId: 1,
      filmTitle: 'The Great Adventure',
      filmDescription: 'An epic journey of discovery and survival.',
      filmImg: 'great-adventure.webp',
      filmDuration: 120,
      filmMinimumAge: 12,
      filmActiveDate: '2025-07-01',
      filmPublishingState: 'active',
      filmAverageRating: 4.5,
      genreFilms: [
        {
          genreId: 1,
          filmId: 1,
          genre: {
            genreId: 1,
            genreType: 'Adventure',
          },
        },
      ],
      cinemaFilms: [
        {
          cinemaId: 1,
          filmId: 1,
          cinema: {
            cinemaId: 1,
            cinemaName: 'Cinéphoria Central',
          },
        },
      ],
      screenings: [
        {
          screeningId: 10,
          screeningDate: '2025-07-10T15:00:00Z',
          screeningStatus: 'active',
          roomId: 5,
          filmId: 1,
          cinemaId: 1,
        },
      ],
    });
  }
}

class SubRoomInfoService {
  getRoomById() {
    return of([
      {
        roomId: 5,
        roomNumber: 1,
        roomCapacity: 100,
        qualityId: 4,
        cinemaId: 1,
        quality: {
          qualityId: 4,
          qualityProjectionType: 'IMAX',
          qualityProjectionPrice: 15.5,
        },
        cinema: {
          cinemaId: 1,
          cinemaName: 'Cinéphoria Central',
        },
      },
    ]);
  }
}

describe('FilmDetailsComponent (Integration)', () => {
  let fixture: ComponentFixture<FilmDetailsComponent>;
  let component: FilmDetailsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FilmDetailsComponent],
      providers: [
        { provide: FilmInfoService, useClass: SubFilmInfoService },
        { provide: RoomInfoService, useClass: SubRoomInfoService },
        { provide: ActivatedRoute, useValue: { paramMap: of({ get: () => '1' }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ViewportScroller, useValue: { scrollToPosition: jest.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(FilmDetailsComponent);
    component = fixture.componentInstance;
  });

  it('should load film + extended screenings and update seances', () => {
    component.ngOnInit();
    expect(component.film?.filmId).toBe(1);
    expect(component.seances.length).toBe(1);
    expect(component.isLoading).toBe(false);
  });

  it('scrollToSection scrolls the correct section', () => {
    const screeningElem = { nativeElement: { scrollIntoView: jest.fn() } } as ElementRef;
    component.screeningsSection = screeningElem;
    component.scrollToSection('screenings');
    expect(screeningElem.nativeElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});
