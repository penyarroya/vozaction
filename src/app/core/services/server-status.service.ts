// // src/app/core/services/server-status.service.ts
// import { Injectable, inject, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';   // 👈 AÑADIR
// import { environment } from '../../../environments/environment';
// import { interval, switchMap, catchError, of, startWith, firstValueFrom } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class ServerStatusService {
//   private http = inject(HttpClient);
//   private router = inject(Router);        // 👈 INYECTAR Router

//   // 🔥 Inicializar a true (asumimos que el servidor está UP al inicio)
//   isServerUp = signal<boolean>(true);     // 👈 CAMBIADO: ya no es null

//   private readonly healthUrl = environment.healthUrl;
//   private readonly CHECK_INTERVAL = 15000;
//   private isMonitoring = false;

//   constructor() {
//     console.log('🏗️ ServerStatusService constructor');
//   }

//   startMonitoring(): void {
//     if (this.isMonitoring) return;
//     this.isMonitoring = true;
//     console.log(`🔄 Iniciando monitoreo de salud cada ${this.CHECK_INTERVAL / 1000}s`);

//     interval(this.CHECK_INTERVAL)
//       .pipe(
//         startWith(0),
//         switchMap(() => {
//           return this.http.get(this.healthUrl, { timeout: 5000 }).pipe(
//             catchError((error) => {
//               console.warn('❌ Servidor no responde:', error.status || error.message);
//               return of(null);
//             })
//           );
//         })
//       )
//       .subscribe((response: any) => {
//         const up = response && response.status === 'UP';
//         console.log(`📡 Estado: ${up ? '🟢 UP' : '🔴 DOWN'}`);
        
//         // 🔥 Actualizar la señal
//         this.isServerUp.set(up);

//         // 🔥 SI el servidor está DOWN y NO estamos ya en /server-down → REDIRIGIR
//         if (!up && this.router.url !== '/server-down') {
//           console.warn('🚨 Servidor caído detectado. Redirigiendo a /server-down');
//           this.router.navigate(['/server-down']);
//         }
//       });
//   }

//   // ✅ Método corregido con firstValueFrom
//   async checkOnce(): Promise<boolean> {
//     try {
//       const response = await firstValueFrom(
//         this.http.get(this.healthUrl, { timeout: 5000 })
//       );
//       const up = response && (response as any).status === 'UP';
//       this.isServerUp.set(up);
//       return up;
//     } catch {
//       this.isServerUp.set(false);
//       return false;
//     }
//   }
// }







// src/app/core/services/server-status.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { interval, switchMap, catchError, of, startWith, firstValueFrom, timeout } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerStatusService {
  private http = inject(HttpClient);
  private router = inject(Router);

  isServerUp = signal<boolean>(true);

  private readonly healthUrl = environment.healthUrl;
  private readonly CHECK_INTERVAL = 15000;
  private readonly HEALTH_TIMEOUT = 10000; // ✅ Aumentado a 10 segundos
  private readonly MAX_CONSECUTIVE_FAILURES = 2; // ✅ Número de fallos consecutivos antes de redirigir
  private consecutiveFailures = 0;
  private isMonitoring = false;

  constructor() {
    console.log('🏗️ ServerStatusService constructor');
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;
    this.isMonitoring = true;
    console.log(`🔄 Iniciando monitoreo de salud cada ${this.CHECK_INTERVAL / 1000}s`);

    interval(this.CHECK_INTERVAL)
      .pipe(
        startWith(0),
        switchMap(() => {
          return this.http.get(this.healthUrl, { timeout: this.HEALTH_TIMEOUT }).pipe(
            catchError((error) => {
              console.warn('❌ Servidor no responde:', error.status || error.message);
              return of(null);
            })
          );
        })
      )
      .subscribe((response: any) => {
        const up = response && response.status === 'UP';
        console.log(`📡 Estado: ${up ? '🟢 UP' : '🔴 DOWN'}`);
        
        // ✅ Actualizar la señal
        this.isServerUp.set(up);

        // ✅ Gestionar fallos consecutivos
        if (up) {
          this.consecutiveFailures = 0; // Resetear contador
        } else {
          this.consecutiveFailures++;
          console.log(`⚠️ Fallo consecutivo #${this.consecutiveFailures}/${this.MAX_CONSECUTIVE_FAILURES}`);
          
          // ✅ Solo redirigir después de varios fallos consecutivos
          if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES && this.router.url !== '/server-down') {
            console.warn('🚨 Servidor caído detectado (varios fallos consecutivos). Redirigiendo a /server-down');
            this.router.navigate(['/server-down']);
          }
        }
      });
  }

  // ✅ Método para comprobar el estado una sola vez
  async checkOnce(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get(this.healthUrl, { timeout: this.HEALTH_TIMEOUT })
      );
      const up = response && (response as any).status === 'UP';
      this.isServerUp.set(up);
      if (up) {
        this.consecutiveFailures = 0;
      }
      return up;
    } catch {
      this.isServerUp.set(false);
      this.consecutiveFailures++;
      return false;
    }
  }

  // ✅ Método para resetear el estado
  reset(): void {
    this.consecutiveFailures = 0;
    this.isServerUp.set(true);
  }
}