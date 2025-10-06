import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// 🔽 IMPORTA EL LOCALE ESPAÑOL
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// 🔽 REGISTRA EL LOCALE ESPAÑOL (¡ES CLAVE!)
registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
  ]

};