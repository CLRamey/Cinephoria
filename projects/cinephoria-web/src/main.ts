import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';

const deactivateLogs = () => {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
};

if (environment.production) {
  deactivateLogs();
}

registerLocaleData(localeFr, 'fr');

platformBrowserDynamic()
  .bootstrapModule(AppModule, {
    ngZoneEventCoalescing: true,
  })
  .catch(err => console.error(err));
