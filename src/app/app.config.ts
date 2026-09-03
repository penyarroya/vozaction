import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { healthInterceptor } from './core/interceptors/health.interceptor';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideNoopAnimations(),
    provideZonelessChangeDetection(), // Motor Zoneless nativo de Angular 20.3
    provideRouter(routes, withComponentInputBinding()), 
    provideHttpClient(withXhr(), 
      withInterceptors([healthInterceptor,
                        authInterceptor
                       ]
                      ) // Capturará cierres de sesión del backend
    )
  ]  
};