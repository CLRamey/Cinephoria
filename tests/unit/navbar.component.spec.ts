import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderModule } from '../../projects/cinephoria-web/src/app/layout/header/header.module';
import { NavbarComponent } from '../../projects/cinephoria-web/src/app/layout/header/navbar.component';
import { RouterModule } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, beforeEach, afterEach, expect, it, jest } from '@jest/globals';
import { MatSidenav } from '@angular/material/sidenav';

describe('NavbarComponent - Unit Tests', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [
        HeaderModule,
        RouterModule.forRoot([]),
        NoopAnimationsModule, // Import NoopAnimationsModule to avoid animation errors in tests
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    component.drawer = {
      open: jest.fn(),
      close: jest.fn(),
    } as unknown as MatSidenav;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should have a logo element', () => {
    const logo = fixture.nativeElement.querySelector('a.logo img.cinephoria-logo');
    expect(logo).toBeTruthy();
    expect(logo.alt).toBe('Cinéphoria Logo');
  });

  it('should display Accueil, Films, Réservation, Contact, and Connexion menu items', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Accueil');
    expect(compiled.textContent).toContain('Films');
    expect(compiled.textContent).toContain('Réservation');
    expect(compiled.textContent).toContain('Contact');
    expect(compiled.textContent).toContain('Connexion');
  });

  it('should open the drawer when open() is called', () => {
    jest.spyOn(component.drawer, 'open');
    component.open();
    expect(component.drawer.open).toHaveBeenCalled();
  });

  it('should close the drawer when close() is called', () => {
    jest.spyOn(component.drawer, 'close');
    component.close();
    expect(component.drawer.close).toHaveBeenCalled();
  });
});
