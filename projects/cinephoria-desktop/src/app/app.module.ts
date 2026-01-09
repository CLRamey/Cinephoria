import { APP_INITIALIZER, NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
// Layout modules
import { HeaderModule } from './layout/header/header.module';

// Feature modules
import { HomeModule } from './features/home/home.module';
import { LoginEmployeeModule } from './features/login-employee/login-employee.module';
import { EmployeeModule } from './features/employee/employee.module';

// Utils and shared components
import { environment } from '../environments/environment';
import { API_URL } from '../../../../projects/auth/src/lib/shared/utils/api-url.token';

// Interceptor
import { AuthInterceptor } from '../../../auth/src/lib/interceptor/auth-interceptor.interceptor';
import { authInitializer } from '../../../auth/src/lib/guards/auth-initializer';
import { AuthService } from '../../../../projects/auth/src/lib/services/auth.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HeaderModule,
    HomeModule,
    LoginEmployeeModule,
    EmployeeModule,
  ],
  providers: [
    AuthService,
    { provide: 'AuthService', useExisting: AuthService },
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: API_URL, useValue: environment.apiURL },
    provideAnimationsAsync(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: APP_INITIALIZER, useFactory: authInitializer, deps: ['AuthService'], multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
