// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { AuthService } from '../services/auth.service';
// import { catchError, throwError } from 'rxjs';

// export const authInterceptor: HttpInterceptorFn = (req, next) => {
//   const authService = inject(AuthService);

//   // Dejamos pasar la petición (el navegador le pondrá las cookies automáticamente)
//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       // Si el API Gateway responde 401, significa que la cookie expiró o es inválida
//       if (error.status === 401) {
//         console.warn('🔴 Sesión expirada (401 detectado por el Interceptor). Limpiando estado local.');
//         authService.fullLocalLogout();
//       }
//       return throwError(() => error);
//     })
//   );
// };




// src/app/core/interceptor/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 🟢 ENDPOINTS PÚBLICOS - No requieren autenticación
  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/user-info',    // ← ¡ESTE ES EL CLAVE!
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/actuator/health',
    '/actuator/info'
  ];

  // Verificar si la URL actual es un endpoint público
  const isPublic = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // Si es público, pasar sin interceptar errores 401
  if (isPublic) {
    return next(req);
  }

  // Para endpoints protegidos, pasar la petición
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // SOLO manejar 401 en endpoints NO públicos
      if (error.status === 401) {
        console.warn('🔴 Sesión expirada en endpoint protegido:', req.url);
        authService.fullLocalLogout();
      }
      return throwError(() => error);
    })
  );
};