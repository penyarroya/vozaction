// src/app/core/interceptor/auth.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError, switchMap } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 🟢 ENDPOINTS PÚBLICOS
  const publicEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/user-info',
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/actuator/health',
    '/actuator/info'
  ];

  const isPublic = publicEndpoints.some(endpoint => req.url.includes(endpoint));

  // ✅ CLONAR CON withCredentials: true (CRUCIAL PARA COOKIES)
  const reqWithCreds = req.clone({
    withCredentials: true
  });

  if (isPublic) {
    return next(reqWithCreds);
  }

  return next(reqWithCreds).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/refresh')) {
        console.warn('🔴 Access token expirado, intentando refresh...');
        
        return authService.refreshToken().pipe(
          switchMap(() => {
            console.log('✅ Token renovado, reintentando petición:', req.url);
            // ✅ Reintentar CON withCredentials
            return next(reqWithCreds);
          }),
          catchError((refreshError) => {
            console.warn('🔴 Refresh token expirado, redirigiendo a login');
            authService.fullLocalLogout();
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }
      
      return throwError(() => error);
    })
  );
};
