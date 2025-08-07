import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarModule } from '../../projects/cinephoria-web/src/app/layout/header/navbar.module';
import { NavbarComponent } from '../../projects/cinephoria-web/src/app/layout/header/navbar.component';
import { RouterModule, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describe, beforeEach, afterEach, expect, it, jest } from '@jest/globals';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from '../../projects/auth/src/lib/services/auth.service';
import { Role } from '../../projects/auth/src/lib/interfaces/auth-interfaces';
import { of } from 'rxjs';

describe('NavbarComponent - Unit Tests', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: jest.Mocked<AuthService>;
  let mockRouter: Router;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated$: of(false),
      userRole$: of(null),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [NavbarModule, RouterModule.forRoot([]), NoopAnimationsModule],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    component.drawer = {
      open: jest.fn(),
      close: jest.fn(),
    } as unknown as MatSidenav;
    mockRouter = TestBed.inject(Router);
    jest.spyOn(mockRouter, 'navigate');
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

  describe('when user is authenticated', () => {
    beforeEach(() => {
      mockAuthService = {
        isAuthenticated$: of(true),
        userRole$: of(Role.CLIENT),
        logout: jest.fn(),
      } as unknown as jest.Mocked<AuthService>;
      fixture.detectChanges();
      component.isAuthenticated$ = mockAuthService.isAuthenticated$;
      component.userRole$ = mockAuthService.userRole$;
      component.ngOnInit();
      fixture.detectChanges();
      jest.spyOn(mockAuthService, 'logout');
    });

    it('should show Mon Compte, Mon Espace, and Déconnexion menu items', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Mon Compte');
      expect(compiled.textContent).toContain('Mon Espace');
      expect(compiled.textContent).toContain('Déconnexion');
    });

    it('should change the navbar links based on user role', () => {
      component.userRole = Role.CLIENT;
      fixture.detectChanges();
      expect(component.profileUrl).toBe('/client');

      component.userRole = Role.EMPLOYEE;
      fixture.detectChanges();
      expect(component.profileUrl).toBe('/employee');

      component.userRole = Role.ADMIN;
      fixture.detectChanges();
      expect(component.profileUrl).toBe('/admin');
    });

    it('should open the sidenav when open() is called', () => {
      jest.spyOn(component.drawer, 'open');
      component.open();
      expect(component.drawer.open).toHaveBeenCalled();
    });

    it('should close the sidenav when close() is called', () => {
      jest.spyOn(component.drawer, 'close');
      component.close();
      expect(component.drawer.close).toHaveBeenCalled();
    });

    it('should logout and navigate to /accueil when logout() is called', () => {
      component.logout();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/accueil']);
    });
  });
});
