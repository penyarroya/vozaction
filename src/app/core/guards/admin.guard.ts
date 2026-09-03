// import { CanActivateFn } from '@angular/router';

// export const adminGuard: CanActivateFn = (route, state) => {
//   return true;
// };




// src/app/core/guards/admin.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, take } from 'rxjs/operators';
import { of } from 'rxjs';  // 👈 AÑADIR ESTA IMPORTACIÓN
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  
  console.log('🔍 [AdminGuard] Verificando acceso...');
  
  // ✅ Usar isSessionReady() (NO isSessionRestored)
 return authService.checkSession().pipe(
    take(1),
    map((isReady) => {
      if (!isReady) {
        console.warn('❌ [AdminGuard] No se pudo restaurar sesión');
        snackBar.open('Debes iniciar sesión', 'Cerrar', { duration: 3000 });
        router.navigate(['/login']);
        return false;
      }
      
      const user = authService.currentUser();
      console.log('🔍 [AdminGuard] Usuario:', user);
      console.log('🔍 [AdminGuard] Roles:', user?.roles);
      
      if (!user) {
        console.warn('❌ [AdminGuard] Usuario no autenticado');
        snackBar.open('Debes iniciar sesión', 'Cerrar', { duration: 3000 });
        router.navigate(['/login']);
        return false;
      }
      
      const isAdmin = user.roles?.some((role: string) => 
        role === 'SUPER_ADMIN' || role === 'ADMIN'
      );
      
      console.log(`🔍 [AdminGuard] ¿Es admin? ${isAdmin}`);
      
      if (isAdmin) {
        console.log('✅ [AdminGuard] Acceso permitido');
        return true;
      }

      console.warn('❌ [AdminGuard] Acceso denegado - No tiene permisos de admin');
      snackBar.open('No tienes permisos de administrador', 'Cerrar', { duration: 3000 });
      router.navigate(['/dashboard']);
      return false;
    })
  );
};