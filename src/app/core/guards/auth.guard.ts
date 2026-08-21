import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Evaluamos de forma síncrona y reactiva si el usuario está autenticado
  if (authService.isAuthenticated()) {
    console.log('🛡️ Acceso permitido por authGuard a:', state.url);
    return true; // El usuario tiene sesión activa, puede entrar
  }

  // 2. Si no está autenticado, guardamos la ruta de intento y redirigimos al login
  console.warn('🛡️ Acceso denegado por authGuard. Redirigiendo a /login desde:', state.url);
  
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  
  return false; // Bloqueamos la entrada a la ruta protegida
};
