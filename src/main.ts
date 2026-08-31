// import { bootstrapApplication } from '@angular/platform-browser';
// import { appConfig } from './app/app.config';
// import { App } from './app/app';

// bootstrapApplication(App, appConfig)
//   .catch((err) => console.error(err));



import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { UserPreferencesService } from './app/shared/services/user-preferences/user-preferences.service';

bootstrapApplication(App, appConfig)
  .then((moduleRef) => {
    // ✅ Exponer UserPreferencesService en la consola
    const injector = moduleRef.injector;
    const userPreferences = injector.get(UserPreferencesService);
    (window as any).userPreferences = userPreferences;
    console.log('✅ UserPreferencesService disponible en consola como window.userPreferences');
    console.log('📦 Preferencias actuales:', userPreferences.getCurrentPreferences());
  })
  .catch((err) => console.error(err));
  