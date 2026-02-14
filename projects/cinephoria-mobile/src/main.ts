import { bootstrapApplication } from '@angular/platform-browser';
import { provideAppInitializer, inject, LOCALE_ID } from '@angular/core';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
} from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { environment } from './environments/environment';
import { API_URL } from '../../../projects/auth/src/lib/shared/utils/api-url.token';
import { AuthInterceptor } from '../../auth/src/lib/interceptor/auth-interceptor.interceptor';
import { authInitializer } from '../../auth/src/lib/guards/auth-initializer';
import { AuthService } from '../../auth/src/lib/services/auth.service';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { addIcons } from 'ionicons';
import { logOutOutline } from 'ionicons/icons';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

addIcons({
  'log-out-outline': logOutOutline,
});

registerLocaleData(localeFr);

const deactivateLogs = () => {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
};

if (environment.production) {
  deactivateLogs();
}

bootstrapApplication(AppComponent, {
  providers: [
    AuthService,
    { provide: 'AuthService', useExisting: AuthService },
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: API_URL, useValue: (environment as unknown as { apiURL: string }).apiURL },
    provideIonicAngular(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    provideAppInitializer(() => authInitializer(inject(AuthService))()),
  ],
});
