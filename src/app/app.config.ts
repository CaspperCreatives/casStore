import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideFirebase } from './core/firebase';
import { TENANT_CONTEXT, detectTenantFromHost } from './core/host-routing';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    { provide: TENANT_CONTEXT, useValue: detectTenantFromHost() },
    provideRouter(routes),
    ...provideFirebase()
  ]
};
