import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Layout modules
import { NavbarModule } from './layout/header/navbar.module';
import { FooterModule } from './layout/footer/footer.module';

// Feature modules
import { HomeModule } from './features/home/home.module';
import { FilmsModule } from './features/films/films.module';
import { ReservationModule } from './features/reservation/reservation.module';
import { LoginClientModule } from './features/auth/login-client/login-client.module';
import { AdminModule } from './features/admin/admin.module';
import { EmployeeModule } from './features/employee/employee.module';
import { ClientModule } from './features/client/client.module';
import { ContactModule } from './features/contact/contact.module';
import { LoginEmployeeModule } from './features/auth/login-employee/login-employee.module';
import { LoginAdminModule } from './features/auth/login-admin/login-admin.module';
import { FilmCardComponent } from './utils/film-card/film-card.component';
import { ScreeningCardComponent } from './utils/screening-card/screening-card.component';

// Locale configuration
import { LOCALE_ID } from '@angular/core';
import { environment } from '../environments/environment';
import { CguCgvComponent } from './utils/dialogs/cgu-cgv/cgu-cgv.component';
import { PrivacyPolicyComponent } from './utils/dialogs/privacy-policy/privacy-policy.component';

// Interceptor
import { authInterceptorInterceptor } from '../../../auth/src/lib/interceptor/auth-interceptor.interceptor';
import { authInitializer } from '../../../auth/src/lib/guards/auth-initializer';
import { AuthService } from 'projects/auth/src/lib/services/auth.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NavbarModule,
    FooterModule,
    HomeModule,
    FilmsModule,
    ReservationModule,
    LoginClientModule,
    LoginEmployeeModule,
    LoginAdminModule,
    AdminModule,
    EmployeeModule,
    ClientModule,
    ContactModule,
    FilmCardComponent,
    ScreeningCardComponent,
    CguCgvComponent,
    PrivacyPolicyComponent,
    MatProgressSpinnerModule,
  ],
  providers: [
    AuthService,
    { provide: 'AuthService', useExisting: AuthService },
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: 'API_URL', useValue: environment.apiURL },
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: 'HTTP_INTERCEPTORS', useValue: authInterceptorInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: authInitializer, deps: ['AuthService'], multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
