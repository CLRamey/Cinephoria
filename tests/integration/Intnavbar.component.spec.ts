import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from '../../projects/cinephoria-web/src/app/layout/header/navbar.component';
import { NavbarModule } from '../../projects/cinephoria-web/src/app/layout/header/navbar.module';
import { RouterModule, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { of } from 'rxjs';
import { ReservationService } from '../../projects/cinephoria-web/src/app/services/reservation.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: Partial<AuthService>;
  let reservationServiceMock: Partial<ReservationService>;
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      isAuthenticated$: of(false),
      userRole$: of(null),
      logout: jest.fn(),
    } as unknown as AuthService;

    reservationServiceMock = {
      clearStoredReservation: jest.fn(),
    } as unknown as ReservationService;

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [NavbarModule, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: ReservationService, useValue: reservationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    component.drawer = {
      open: jest.fn(),
      close: jest.fn(),
    } as unknown as MatSidenav;
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate');
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
    TestBed.resetTestingModule();
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should create the navbar component', () => {
    expect(component).toBeTruthy();
  });

  it('should render the logo image with correct alt text and have correct link to /accueil', () => {
    const logoImage: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(logoImage).toBeTruthy();
    expect(logoImage.src).toContain('/assets/cinephoria-logo.webp');
    expect(logoImage.alt).toBe('Cinéphoria Logo');

    const logoLink: HTMLAnchorElement = fixture.nativeElement.querySelector('a.logo');
    expect(logoLink).toBeTruthy();
    expect(logoLink.getAttribute('routerLink')).toBe('/accueil');
  });

  it('should have desktop navigation links with correct routerLinks', () => {
    const navLinks = fixture.nativeElement.querySelectorAll('nav.nav-links.desktop a[mat-button]');
    expect(navLinks.length).toBeGreaterThan(0);

    const expectedLinks = [
      { text: 'Accueil', routerLink: '/accueil' },
      { text: 'Films', routerLink: '/films' },
      { text: 'Réservation', routerLink: '/reservation' },
      { text: 'Contact', routerLink: '/contact' },
    ];

    expectedLinks.forEach((link, index) => {
      expect(navLinks[index].textContent.trim()).toBe(link.text);
      expect(navLinks[index].getAttribute('routerLink')).toBe(link.routerLink);
    });
  });

  it('should render desktop Connexion mat-menu with correct links', async () => {
    const triggerButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Ouvrir le menu de connexion"]',
    );
    expect(triggerButton).toBeTruthy();
    // Click to open the mat-menu
    triggerButton.click();
    fixture.detectChanges();
    await fixture.whenStable(); // Wait for the menu to stabilize

    const menuItems: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[mat-menu-item]');
    expect(menuItems.length).toBe(3);

    const expectedLinks = [
      { text: 'Espace Client', routerLink: '/login-client' },
      { text: 'Espace Employé', routerLink: '/login-employee' },
      { text: 'Espace Administrateur', routerLink: '/login-admin' },
    ];

    expectedLinks.forEach((item, index) => {
      const menuItem = menuItems[index];
      expect(menuItem.textContent?.trim()).toBe(item.text);
      expect(menuItem.getAttribute('ng-reflect-router-link')).toBe(item.routerLink);
    });
  });

  it('should have mobile navigation links with correct routerLinks', () => {
    const mobileNavLinks = fixture.nativeElement.querySelectorAll(
      'mat-nav-list.nav-links.mobile a[mat-list-item]',
    );
    expect(mobileNavLinks.length).toBeGreaterThan(0);

    const expectedMobileLinks = [
      { text: 'Accueil', routerLink: '/accueil' },
      { text: 'Films', routerLink: '/films' },
      { text: 'Réservation', routerLink: '/reservation' },
      { text: 'Contact', routerLink: '/contact' },
      { text: 'Espace Client', routerLink: '/login-client' },
      { text: 'Espace Employé', routerLink: '/login-employee' },
      { text: 'Espace Administrateur', routerLink: '/login-admin' },
    ];

    expectedMobileLinks.forEach((link, index) => {
      expect(mobileNavLinks[index].textContent.trim()).toBe(link.text);
      expect(mobileNavLinks[index].getAttribute('routerLink')).toBe(link.routerLink);
    });
  });

  it('should open the drawer when the menu button is clicked', () => {
    jest.spyOn(component.drawer, 'open');
    const menuButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Ouvrir le menu mobile"]',
    );
    menuButton.click();
    expect(component.drawer.open).toHaveBeenCalled();
  });

  it('should close the drawer when the close button is clicked', () => {
    const closeButton: HTMLButtonElement = fixture.nativeElement.querySelector(
      'button[aria-label="Fermer le menu mobile"]',
    );
    jest.spyOn(component.drawer, 'close');
    closeButton.click();
    expect(component.drawer.close).toHaveBeenCalled();
  });
});
