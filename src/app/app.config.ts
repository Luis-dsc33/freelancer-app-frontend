// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { ENVIRONMENT } from './core/config/environment.token';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    { provide: ENVIRONMENT, useValue: environment },
    // "LEDSC: se declara que cuando alguien pida ENVIRONMENT, se le entrega este objeto"
  ],
};