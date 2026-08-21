// // src/app/core/interceptor/health.interceptor.ts
// import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
// import { inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { catchError, throwError } from 'rxjs';

// export const healthInterceptor: HttpInterceptorFn = (req, next) => {
//   const router = inject(Router);

//   // 🚫 Excluir peticiones que no deben ser interceptadas
//   const isExcluded =
//     req.url.includes('/actuator/health') ||   // Health checks (evita bucles)
//     req.url.includes('.json') ||              // Archivos JSON
//     req.url.includes('/menus/') ||            // Menús
//     req.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|map)$/i); // Archivos estáticos

//   if (isExcluded) {
//     return next(req);
//   }

//   // 🚫 Excluir peticiones de autenticación (para que el authInterceptor las maneje)
//   const isAuthRequest =
//     req.url.includes('/auth/login') ||
//     req.url.includes('/auth/register') ||
//     req.url.includes('/auth/refresh') ||
//     req.url.includes('/auth/forgot-password') ||
//     req.url.includes('/auth/reset-password');

//   if (isAuthRequest) {
//     return next(req);
//   }

//   // ⚠️ Si ya estamos en la página de servidor caído, no redirigir de nuevo (evita bucles)
//   if (router.url === '/server-down') {
//     return next(req);
//   }

//   return next(req).pipe(
//     catchError((error: HttpErrorResponse) => {
//       // Solo consideramos críticos: 0 (sin conexión) o 5xx (error del servidor)
//       const isCritical = error.status === 0 || error.status >= 500;
//       if (isCritical) {
//         console.error('🚨 [HealthInterceptor] Backend caído o error crítico:', error.status);
//         router.navigate(['/server-down']);
//       }
//       // Re-lanzamos el error para que otros interceptores o el código también lo vean
//       return throwError(() => error);
//     })
//   );
// };









// src/app/core/interceptor/health.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const healthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  // 🚫 Excluir peticiones que no deben ser interceptadas
  const isExcluded =
    req.url.includes('/actuator/health') ||
    req.url.includes('/actuator/info') ||    // ← Añadir info
    req.url.includes('.json') ||
    req.url.includes('/menus/') ||
    req.url.match(/\.(jpg|jpeg|png|gif|webp|svg|ico|woff|woff2|ttf|eot|css|js|map)$/i);

  if (isExcluded) {
    return next(req);
  }

  // 🚫 Excluir peticiones de autenticación (el authInterceptor las maneja)
  const isAuthRequest =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/user-info') ||   // ← Añadir user-info
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/forgot-password') ||
    req.url.includes('/auth/reset-password');

  if (isAuthRequest) {
    return next(req);
  }

  // ⚠️ Si ya estamos en la página de servidor caído, no redirigir
  if (router.url === '/server-down') {
    return next(req);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Solo considerar críticos: 0 (sin conexión) o 5xx (error del servidor)
      const isCritical = error.status === 0 || error.status >= 500;
      
      // ⚠️ NO tratar 401 como error crítico (el authInterceptor lo maneja)
      if (isCritical) {
        console.error('🚨 Backend caído o error crítico:', error.status);
        router.navigate(['/server-down']);
      }
      
      return throwError(() => error);
    })
  );
};