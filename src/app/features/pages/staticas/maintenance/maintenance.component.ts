// import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { Router } from '@angular/router';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { CommonModule } from '@angular/common';
// import { isPlatformBrowser } from '@angular/common';
// import { environment } from '../../../../../environments/environment';
// import { Subscription, interval, switchMap, startWith, catchError, of } from 'rxjs';
// import { ThemeService } from '../../../../shared/services/themes/themes.service'; // 👈 IMPORTAR

// @Component({
//   selector: 'app-maintenance',
//   standalone: true,
//   imports: [MatButtonModule, MatIconModule, CommonModule],
//   templateUrl: './maintenance.component.html',
//   styleUrl: './maintenance.component.scss',
// })
// export class MaintenanceComponent implements OnInit, OnDestroy {
//   public Math = Math;
  
//   private http = inject(HttpClient);
//   private router = inject(Router);
//   private platformId = inject(PLATFORM_ID);
//   private cdr = inject(ChangeDetectorRef);
//   private themeService = inject(ThemeService); // 👈 INYECTAR
  
//   private autoCheckSub?: Subscription;
//   private isBrowser = isPlatformBrowser(this.platformId);
//   private readonly healthUrl = environment.healthUrl;
  
//   // 🔥 Estados UI
//   public showServerDown = true;
//   public showEurekaTimer = false;
//   public isChecking = true;
  
//   public readonly EUREKA_WAIT_SECONDS = 15; 
//   private eurekaEndTime: number = 0;
//   public remainingSeconds = this.EUREKA_WAIT_SECONDS;
//   public progressPercent = 0;
//   private countdownInterval?: any;
  
//   public isRetrying = false;
//   public statusMessage = 'Verificando servidor...';

//   // 🔥 Getter para el tema actual (se usa en el HTML)
//   get currentTheme() {
//     return this.themeService.currentTheme();
//   }

//   ngOnInit() {
//     if (this.isBrowser) {
//       this.startHealthCheck();
//     } else {
//       console.log('🔧 SSR: Componente de mantenimiento renderizado en servidor');
//     }
//   }

//   // ============================================================
//   // 🔥 LÓGICA DE MONITOREO (SIN CAMBIOS)
//   // ============================================================

//   private startHealthCheck() {    
//     console.log('🔍 Iniciando monitoreo de salud en:', this.healthUrl);
//     this.autoCheckSub = interval(5000)
//       .pipe(
//         startWith(0),
//         switchMap(() => {
//           return this.http.get(this.healthUrl, { timeout: 10000 }).pipe(
//             catchError((error) => {
//               console.log('❌ Backend no disponible:', error.status || error.message);
//               if (this.showEurekaTimer) this.cancelEurekaTimer();
//               this.showServerDown = true;
//               this.showEurekaTimer = false;
//               this.statusMessage = 'Servidor no disponible. Reintentando en 5 segundos...';
//               this.cdr.detectChanges();
//               return of(null);
//             })
//           );
//         })
//       )
//       .subscribe((response: any) => {
//         if (response && response.status === 'UP') {
//           console.log('✅ Servidor detectado. Iniciando temporizador de Eureka...');
//           if (this.showServerDown || !this.showEurekaTimer) {
//             this.startEurekaTimer();
//           }
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   private startEurekaTimer() {
//     this.showServerDown = false;
//     this.showEurekaTimer = true;
//     this.isRetrying = false;
//     this.eurekaEndTime = Date.now() + (this.EUREKA_WAIT_SECONDS * 1000);
//     this.remainingSeconds = this.EUREKA_WAIT_SECONDS;
//     this.progressPercent = 0;
//     console.log(`⏳ Eureka iniciando. Esperando ${this.EUREKA_WAIT_SECONDS} segundos...`);
//     if (this.countdownInterval) clearInterval(this.countdownInterval);
//     this.countdownInterval = setInterval(() => {
//       const remaining = Math.max(0, Math.ceil((this.eurekaEndTime - Date.now()) / 1000));
//       this.remainingSeconds = remaining;
//       this.progressPercent = ((this.EUREKA_WAIT_SECONDS - remaining) / this.EUREKA_WAIT_SECONDS) * 100;
//       if (remaining === 0) {
//         clearInterval(this.countdownInterval);
//         console.log('✅ Eureka listo. Redirigiendo a login...');
//         this.router.navigate(['/login']);
//       }
//       this.cdr.detectChanges();
//     }, 1000);
//   }

//   private cancelEurekaTimer() {
//     if (this.countdownInterval) {
//       clearInterval(this.countdownInterval);
//       this.countdownInterval = undefined;
//     }
//     this.showEurekaTimer = false;
//     console.log('❌ Temporizador de Eureka cancelado');
//   }

//   retry() {
//     if (!this.isBrowser) return;
//     console.log('🔄 Reintento manual solicitado');
//     this.isRetrying = true;
//     this.statusMessage = 'Reintentando conexión...';
//     this.cdr.detectChanges();
//     this.http.get(this.healthUrl, { timeout: 10000 }).subscribe({
//       next: (response: any) => {
//         if (response && response.status === 'UP') {
//           console.log('✅ Backend disponible. Iniciando temporizador de Eureka...');
//           this.startEurekaTimer();
//         } else {
//           this.statusMessage = 'El servidor respondió pero no está listo. Reintentando...';
//           this.isRetrying = false;
//           this.cdr.detectChanges();
//         }
//       },
//       error: () => {
//         this.statusMessage = 'Servidor no disponible. Reintentando en 5 segundos...';
//         this.isRetrying = false;
//         this.cdr.detectChanges();
//       }
//     });
//   }

//   ngOnDestroy() {
//     if (this.isBrowser && this.autoCheckSub) {
//       this.autoCheckSub.unsubscribe();
//     }
//     if (this.countdownInterval) {
//       clearInterval(this.countdownInterval);
//     }
//   }
// }















import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { Subscription, interval, switchMap, startWith, catchError, of } from 'rxjs';
import { ThemeService } from '../../../../shared/services/themes/themes.service';
import { VoiceService } from '../../../services/voz/voice.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss',
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  public Math = Math;
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService);
  private voiceService = inject(VoiceService);
 private  authService = inject(AuthService);
  
  private autoCheckSub?: Subscription;
  private isBrowser = isPlatformBrowser(this.platformId);
  private readonly healthUrl = environment.healthUrl;
  private voiceAnnounced = false;
  
  // 🔥 Estados UI
  public showServerDown = true;
  public showEurekaTimer = false;
  public isChecking = true;
  
  public readonly EUREKA_WAIT_SECONDS = 15; 
  private eurekaEndTime: number = 0;
  public remainingSeconds = this.EUREKA_WAIT_SECONDS;
  public progressPercent = 0;
  private countdownInterval?: any;
  
  public isRetrying = false;
  public statusMessage = 'Verificando servidor...';

  // 🔥 Getter para el tema actual
  get currentTheme() {
    return this.themeService.currentTheme();
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.startHealthCheck();
      // Anunciar estado inicial después de un breve delay
      setTimeout(() => {
        this.announceVoiceMessage(
          'Bienvenido. Estamos verificando la conexión con el servidor. Por favor, espera unos segundos mientras comprobamos que todo está funcionando correctamente.'
        );
      }, 1500);
    } else {
      console.log('🔧 SSR: Componente de mantenimiento renderizado en servidor');
    }
  }

  // ============================================================
  // 🗣️ FUNCIONES DE VOZ PARA ACCESIBILIDAD
  // ============================================================

  /**
   * Anuncia un mensaje de voz usando el VoiceService
   */
  private announceVoiceMessage(message: string, priority: boolean = true): void {
    if (!this.isBrowser) return;
    
    // Evitar anuncios repetidos en el mismo estado
    if (this.voiceAnnounced && !priority) return;
    
    console.log(`🗣️ [Accesibilidad] Anunciando: "${message}"`);
    
    // Usar speakAlways para que el mensaje se reproduzca incluso si el micrófono está muteado
    this.voiceService.speakAlways(message);
    
    // Marcar que ya se anunció (excepto para mensajes prioritarios)
    if (!priority) {
      this.voiceAnnounced = true;
    }
  }

  /**
   * Anuncia el estado actual del servidor con mensajes más explícitos
   */
  private announceServerStatus(status: 'up' | 'down' | 'reconnecting' | 'ready'): void {
    const messages = {
      'up': '¡Buenas noticias! El servidor ya está disponible. Estamos preparando todos los servicios para que puedas continuar.',
      'down': 'Lo sentimos, el servidor no está disponible en este momento. No te preocupes, estamos intentando reconectar automáticamente. Puedes esperar o pulsar el botón de reintentar.',
      'reconnecting': 'Estamos intentando reconectar con el servidor. Por favor, espera un momento mientras verificamos la conexión.',
      'ready': '¡Todo listo! El servidor ya está funcionando correctamente. Serás redirigido a la página de inicio de sesión en unos segundos para que puedas entrar con tu cuenta.'
    };
    
    const message = messages[status] || 'Estado del servidor desconocido. Por favor, espera un momento.';
    this.announceVoiceMessage(message, true);
  }

  // ============================================================
  // 🔥 LÓGICA DE MONITOREO (MODIFICADA CON VOZ)
  // ============================================================

  private startHealthCheck() {    
    console.log('🔍 Iniciando monitoreo de salud en:', this.healthUrl);
    this.autoCheckSub = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => {
          return this.http.get(this.healthUrl, { timeout: 10000 }).pipe(
            catchError((error) => {
              console.log('❌ Backend no disponible:', error.status || error.message);
              
              // Solo anunciar si cambia el estado
              if (this.showEurekaTimer) {
                this.cancelEurekaTimer();
              }
              if (!this.showServerDown) {
                this.showServerDown = true;
                this.showEurekaTimer = false;
                this.statusMessage = 'Servidor no disponible. Reintentando en 5 segundos...';
                this.voiceAnnounced = false;
                this.announceServerStatus('down');
                this.cdr.detectChanges();
              }
              return of(null);
            })
          );
        })
      )
      .subscribe((response: any) => {
        if (response && response.status === 'UP') {
          console.log('✅ Servidor detectado. Iniciando temporizador de Eureka...');
          
          // Anunciar que el servidor está disponible
          if (this.showServerDown || !this.showEurekaTimer) {
            this.voiceAnnounced = false;
            this.announceServerStatus('up');
            this.startEurekaTimer();
          }
          this.cdr.detectChanges();
        }
      });
  }

  // maintenance.component.ts
  private startEurekaTimer() {
    this.showServerDown = false;
    this.showEurekaTimer = true;
    this.isRetrying = false;
    this.eurekaEndTime = Date.now() + (this.EUREKA_WAIT_SECONDS * 1000);
    this.remainingSeconds = this.EUREKA_WAIT_SECONDS;
    this.progressPercent = 0;
    
    // ✅ Inicio - claro y conciso
    this.announceVoiceMessage(`Servidor disponible. Espera ${this.EUREKA_WAIT_SECONDS} segundos.`, true);
    
    console.log(`⏳ Eureka iniciando. Esperando ${this.EUREKA_WAIT_SECONDS} segundos...`);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.eurekaEndTime - Date.now()) / 1000));
      this.remainingSeconds = remaining;
      this.progressPercent = ((this.EUREKA_WAIT_SECONDS - remaining) / this.EUREKA_WAIT_SECONDS) * 100;
      
      // ✅ Solo un mensaje a mitad del proceso
      if (remaining === 7) {
        this.announceVoiceMessage('Preparando servicios. Un momento por favor.', false);
      }
      
      if (remaining === 0) {
        clearInterval(this.countdownInterval);
        console.log('✅ Eureka listo. Redirigiendo a login...');
        
        // ✅ Final - claro, completo y en ~10 segundos
        // this.announceVoiceMessage('Servidor listo. Ya puedes iniciar sesión.', true);
        // ✅ Mensaje final - más corto y directo
        this.announceVoiceMessage('Listo para iniciar sesión.', true);

        this.authService.fullLocalLogout();
        
        setTimeout(() => {
          this.router.navigate(['/login'], { queryParams: { from: 'maintenance' } });
        }, 2000);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  //
  private cancelEurekaTimer() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
    this.showEurekaTimer = false;
    console.log('❌ Temporizador de Eureka cancelado');
  }

  retry() {
    if (!this.isBrowser) return;
    console.log('🔄 Reintento manual solicitado');
    this.isRetrying = true;
    this.statusMessage = 'Reintentando conexión...';
    this.voiceAnnounced = false;
    
    // Mensaje más explícito para el reintento manual
    this.announceVoiceMessage(
      'Estás intentando reconectar manualmente. Vamos a verificar el estado del servidor. Por favor, espera un momento.',
      true
    );
    
    this.cdr.detectChanges();
    
    this.http.get(this.healthUrl, { timeout: 10000 }).subscribe({
      next: (response: any) => {
        if (response && response.status === 'UP') {
          console.log('✅ Backend disponible. Iniciando temporizador de Eureka...');
          this.voiceAnnounced = false;
          this.announceServerStatus('up');
          this.startEurekaTimer();
        } else {
          this.statusMessage = 'El servidor respondió pero no está listo. Reintentando...';
          this.isRetrying = false;
          this.announceVoiceMessage(
            'El servidor ha respondido, pero aún no está completamente listo. Vamos a seguir intentando automáticamente.',
            true
          );
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.statusMessage = 'Servidor no disponible. Reintentando en 5 segundos...';
        this.isRetrying = false;
        this.announceServerStatus('down');
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.isBrowser && this.autoCheckSub) {
      this.autoCheckSub.unsubscribe();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    // Cancelar cualquier voz en curso
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}