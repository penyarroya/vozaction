// // src/app/core/guards/guest.guard.ts
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../services/auth.service';

// export const guestGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   // Si el usuario está autenticado, redirigir a la página de inicio
//   if (authService.isAuthenticated()) {
//     console.log('🔍 guestGuard - Usuario autenticado, redirigiendo a: /home');
//     return router.parseUrl('/home'); // 👈 Redirige al WelcomeComponent
//   }

//   // Si NO está autenticado, permitir acceso a la ruta pública
//   console.log('🔍 guestGuard - Usuario NO autenticado, permitiendo acceso');
//   return true;
// };










// src/app/core/guards/guest.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🔥 Verificar si viene de mantenimiento
  const fromMaintenance = route.queryParams['from'] === 'maintenance';

  if (authService.isAuthenticated()) {
    // 🔥 Si viene de mantenimiento, forzar logout y permitir acceso a login
    if (fromMaintenance) {
      console.log('🔄 [guestGuard] Viniendo de mantenimiento, forzando logout y permitiendo login');
      authService.fullLocalLogout();
      return true; // Permitir acceso a login
    }
    
    console.log('🔍 guestGuard - Usuario autenticado, redirigiendo a: /home');
    return router.parseUrl('/home');
  }

  console.log('🔍 guestGuard - Usuario NO autenticado, permitiendo acceso');
  return true;
};