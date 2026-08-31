// // src/app/features/welcome/welcome.component.ts
// import { Component, signal, OnInit, OnDestroy, inject, NgZone, ChangeDetectionStrategy } from '@angular/core';

// import { RouterLink, Router } from '@angular/router';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { HttpClient } from '@angular/common/http';
// import { finalize, Subject, takeUntil } from 'rxjs';
// import { VoiceContextService } from '../../../services/voz/voice-context.service';
// import { VoiceService } from '../../../services/voz/voice.service';

// @Component({
//   selector: 'app-welcome',
//   standalone: true,
//   imports: [RouterLink, MatIconModule, MatButtonModule],
//   templateUrl: './welcome.component.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   styleUrls: ['./welcome.component.scss']
// })
// export class WelcomeComponent implements OnInit, OnDestroy {
//   private http = inject(HttpClient);
//   private router = inject(Router);
//   private voiceContext = inject(VoiceContextService);
//   private voiceService = inject(VoiceService);
//   private ngZone = inject(NgZone);

//   // ✅ Variables para control de duplicados
//   private lastProcessedCommand = '';
//   private lastProcessedTime = 0;
//   private readonly COMMAND_DEBOUNCE = 2000;

//   slides = signal<string[]>([]);
//   totalDuration = signal<number>(0);

//   private isDestroyed = false;
//   private welcomeShown = false;
//   private destroy$ = new Subject<void>();

//   private lastCommandTime = 0;

//   ngOnInit(): void {
//     console.log('✅ WelcomeComponent inicializado (con voz contextual)');

//     this.loadImages();

//     const context = {
//       activationMessage: 'Bienvenido a VozAcción. Puedes decir "Acerca de" o "iniciar sesión".',
//       availableCommands: ['acerca de', 'quiénes somos', 'login', 'iniciar sesión', 'inicio'],
//       preventBackend: true
//     };
//     this.voiceContext.setContext(context);

//     this.voiceService
//       .getTranscript()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((text: string) => {
//         this.ngZone.run(() => {
//           if (this.isDestroyed || !text) return;
//           this.handleVoiceCommand(text);
//         });
//       });

//     // ✅ COMPROBAR ESTADO DEL MICRÓFONO AL ENTRAR
//     setTimeout(() => {
//       if (!this.isDestroyed && !this.welcomeShown) {
//         this.welcomeShown = true;
//         this.checkMicrophoneStatus(context);
//       }
//     }, 800);
//   }

//   // ============================================================
//   // 🔥 NUEVO: COMPROBAR ESTADO DEL MICRÓFONO
//   // ============================================================
//   private checkMicrophoneStatus(context: any): void {
//     const isMuted = this.voiceService.isCurrentlyMuted();
//     const isActive = this.voiceService.isRecognitionActive();
    
//     console.log(`🎤 [Welcome] Estado del micrófono: ${isMuted ? '🔇 MUTEADO' : '🔊 ACTIVO'}, Reconocimiento: ${isActive ? '✅ ACTIVO' : '❌ INACTIVO'}`);
    
//     if (isMuted || !isActive) {
//       console.log('🔇 [Welcome] Micrófono desactivado');
      
//       const headphonesMessageShown = (this.voiceService as any).headphonesMessageShown;
      
//       if (!headphonesMessageShown) {
//         console.log('🔇 [Welcome] monitorHeadphones() no ha hablado, anunciando...');
//         // ✅ CAMBIAR: speakAlways → speak
//         this.voiceService.speak('El micrófono está desactivado. Di "hola" para activarlo.');
//       } else {
//         console.log('🔇 [Welcome] monitorHeadphones() ya habló, omitiendo mensaje');
//       }
      
//       this.waitForWakeWord(context);
//     } else {
//       console.log('🎤 [Welcome] Micrófono activo, mensaje de bienvenida');
//       this.voiceService.speakWhenReady(context.activationMessage);
//     }
//   }


//   /**
//    * Espera a que el usuario diga "hola" para activar el micrófono
//   */
//   private waitForWakeWord(context: any): void {
//     console.log('👂 [Welcome] Esperando "hola" para activar micrófono...');
    
//     const wakeSubscription = this.voiceService
//       .getTranscript()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((text: string) => {
//         if (this.isDestroyed || !text) return;
        
//         const lower = text.toLowerCase().trim();
//         if (lower === 'hola' || lower.includes('hola')) {
//           console.log('🔊 [Welcome] "hola" detectado, activando micrófono...');
          
//           this.voiceService.unmute();
          
//           setTimeout(() => {
//             if (!this.isDestroyed) {
//               // ✅ CAMBIAR: speakWhenReady → speak
//               this.voiceService.speak('Bienvenido a VozAcción. Puedes decir "Acerca de" o "iniciar sesión".');
//             }
//           }, 500);
          
//           wakeSubscription.unsubscribe();
//         }
//       });
//   }



//   // ============================================================
//   // ✅ MANEJAR COMANDOS DE VOZ
//   // ============================================================
//   private handleVoiceCommand(text: string): void {
//     if (this.isDestroyed) return;
    
//     // ✅ NO procesar si el sistema está hablando
//     if (window.speechSynthesis.speaking) {
//       console.log('🔇 [Welcome] Sistema hablando, ignorando comando:', text);
//       return;
//     }
    
//     const lower = text.toLowerCase().trim();
//     console.log(`📝 [Welcome] Comando recibido: "${lower}"`);

//     // Prevenir duplicados
//     const now = Date.now();
//     if (lower === this.lastProcessedCommand && (now - this.lastProcessedTime) < this.COMMAND_DEBOUNCE) {
//       console.log(`⏭️ [Welcome] Comando ignorado por debounce: "${lower}"`);
//       return;
//     }
//     this.lastProcessedCommand = lower;
//     this.lastProcessedTime = now;

//     // ============================================================
//     // COMANDOS RECONOCIDOS EN WELCOME
//     // ============================================================

//     // 🔥 "login" / "iniciar sesión" - navega al login
//     if (lower.includes('login') || 
//         lower.includes('iniciar sesión') || 
//         lower.includes('inicio sesión') || 
//         lower === 'entrar' ||
//         lower.includes('acceder')) {
//       console.log('🔐 [Welcome] Navegando a login');
//       this.router.navigate(['/login']);
//       return;
//     }

//     // 🔥 "registro" / "registrar" - navega al registro
//     if (lower.includes('registro') || lower.includes('registrar') || lower.includes('crear cuenta')) {
//       console.log('📝 [Welcome] Navegando a registro');
//       this.voiceService.speak('Navegando a registro de usuario');
//       this.router.navigate(['/register']);
//       return;
//     }

//     // 🔥 "acerca de" - navega a About
//     if (lower.includes('acerca de') || lower.includes('quienes somos') || lower.includes('qué es') || lower.includes('about')) {
//       console.log('ℹ️ [Welcome] Navegando a About...');
//       this.router.navigate(['/about']);
//       return;
//     }

//     // 🔥 "ayuda" - muestra comandos disponibles
//     if (lower.includes('ayuda') || lower === 'help' || lower.includes('qué puedo decir')) {
//       console.log('❓ [Welcome] Mostrando ayuda');
//       this.voiceService.speak('En la página de inicio puedes decir "acerca de" para más información, "iniciar sesión" para acceder, "registro" para crear una cuenta, o "volver" para ir atrás.');
//       return;
//     }

//     // 🔥 "volver" - navega al login
//     if (lower.includes('volver') || lower.includes('atrás') || lower.includes('regresar')) {
//       console.log('🔙 [Welcome] Ejecutando "volver"');
//       this.router.navigate(['/login']);
//       return;
//     }

//     // 🔥 "silenciar micrófono" - mute
//     if (lower.includes('silenciar micrófono') || lower.includes('dejar de escuchar') || lower.includes('silenciar')) {
//       console.log('🔇 [Welcome] Silenciando micrófono');
//       this.voiceService.mute();
//       return;
//     }

//     // 🔥 "activar micrófono" - unmute
//     if (lower.includes('activar micrófono') || lower.includes('encender micrófono') || lower.includes('desmutear') || lower.includes('escuchar')) {
//       console.log('🔊 [Welcome] Activando micrófono');
//       this.voiceService.unmute();
//       return;
//     }

//     // ============================================================
//     // 🔥 TODOS LOS DEMÁS COMANDOS SE IGNORAN
//     // ============================================================
//     console.log(`⏭️ [Welcome] Comando no reconocido: "${lower}"`);
//   }

//   // ============================================================
//   // CARGAR IMÁGENES
//   // ============================================================
//   private loadImages(): void {
//     this.http.get<string[]>('img/images.json')
//       .pipe(finalize(() => {
//         if (this.slides().length === 0) {
//           this.slides.set(['img/carrusel/FondoConBarco.webp']);
//           this.totalDuration.set(5);
//         }
//       }))
//       .subscribe({
//         next: (data) => {
//           if (this.isDestroyed) return;
//           if (data && data.length > 0) {
//             this.slides.set(data);
//             this.totalDuration.set(data.length * 5);
//           }
//         },
//         error: () => {
//           console.warn('⚠️ Error cargando imágenes, usando respaldo.');
//           this.slides.set(['img/carrusel/FondoConBarco.webp']);
//           this.totalDuration.set(5);
//         }
//       });
//   }

//   // ============================================================
//   // NAVEGACIÓN
//   // ============================================================
//   goToLogin(): void {
//     this.router.navigate(['/login']);
//   }

//   goToAbout(): void {
//     this.router.navigate(['/about']);
//   }

//   // ============================================================
//   // DESTRUCCIÓN
//   // ============================================================
//   ngOnDestroy(): void {
//     this.isDestroyed = true;
//     this.destroy$.next();
//     this.destroy$.complete();
//     this.voiceContext.resetContext();
//     console.log('🧹 WelcomeComponent destruido, contexto reseteado');
//   }
// }














// src/app/features/welcome/welcome.component.ts

import { Component, signal, OnInit, OnDestroy, inject, NgZone, ChangeDetectionStrategy } from '@angular/core';

import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { VoiceService } from '../../../services/voz/voice.service';
// ✅ CAMBIO 1: AÑADIR IMPORTACIÓN
import { UserPreferencesService } from '../../../../shared/services/user-preferences/user-preferences.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './welcome.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private voiceContext = inject(VoiceContextService);
  private voiceService = inject(VoiceService);
  private ngZone = inject(NgZone);
  // ✅ CAMBIO 2: AÑADIR INYECCIÓN
  private userPreferences = inject(UserPreferencesService);

  // ✅ Variables para control de duplicados
  private lastProcessedCommand = '';
  private lastProcessedTime = 0;
  private readonly COMMAND_DEBOUNCE = 2000;

  slides = signal<string[]>([]);
  totalDuration = signal<number>(0);

  private isDestroyed = false;
  private welcomeShown = false;
  private destroy$ = new Subject<void>();

  private lastCommandTime = 0;

  ngOnInit(): void {
    console.log('✅ WelcomeComponent inicializado (con voz contextual)');

    this.loadImages();

    const context = {
      activationMessage: 'Bienvenido a VozAcción. Puedes decir "Acerca de" o "iniciar sesión".',
      availableCommands: ['acerca de', 'quiénes somos', 'login', 'iniciar sesión', 'inicio'],
      preventBackend: true
    };
    this.voiceContext.setContext(context);

    this.voiceService
      .getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.ngZone.run(() => {
          if (this.isDestroyed || !text) return;
          this.handleVoiceCommand(text);
        });
      });

    // ✅ COMPROBAR ESTADO DEL MICRÓFONO AL ENTRAR
    setTimeout(() => {
      if (!this.isDestroyed && !this.welcomeShown) {
        this.welcomeShown = true;
        this.checkMicrophoneStatus(context);
      }
    }, 800);
  }

  // ============================================================
  // 🔥 COMPROBAR ESTADO DEL MICRÓFONO
  // ============================================================
  private checkMicrophoneStatus(context: any): void {
    // ✅ CAMBIO 3: LEER PREFERENCIAS
    const prefs = this.userPreferences.getCurrentPreferences();
    const isMuted = this.voiceService.isCurrentlyMuted();
    const isActive = this.voiceService.isRecognitionActive();
    
    console.log(`🎤 [Welcome] Estado del micrófono: ${isMuted ? '🔇 MUTEADO' : '🔊 ACTIVO'}, Reconocimiento: ${isActive ? '✅ ACTIVO' : '❌ INACTIVO'}`);
    
    // ✅ CAMBIO 3: Si preferencia dice desactivado, muteamos
    if (prefs.micEnabled === false && !isMuted) {
      this.voiceService.mute();
    }
    
    if (isMuted || !isActive) {
      console.log('🔇 [Welcome] Micrófono desactivado');
      
      const headphonesMessageShown = (this.voiceService as any).headphonesMessageShown;
      
      if (!headphonesMessageShown) {
        console.log('🔇 [Welcome] monitorHeadphones() no ha hablado, anunciando...');
        this.voiceService.speak('El micrófono está desactivado. Di "hola" para activarlo.');
      } else {
        console.log('🔇 [Welcome] monitorHeadphones() ya habló, omitiendo mensaje');
      }
      
      this.waitForWakeWord(context);
    } else {
      console.log('🎤 [Welcome] Micrófono activo, mensaje de bienvenida');
      this.voiceService.speakWhenReady(context.activationMessage);
    }
  }


  /**
   * Espera a que el usuario diga "hola" para activar el micrófono
  */
  private waitForWakeWord(context: any): void {
    console.log('👂 [Welcome] Esperando "hola" para activar micrófono...');
    
    const wakeSubscription = this.voiceService
      .getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        if (this.isDestroyed || !text) return;
        
        const lower = text.toLowerCase().trim();
        if (lower === 'hola' || lower.includes('hola')) {
          console.log('🔊 [Welcome] "hola" detectado, activando micrófono...');
          
          this.voiceService.unmute();
          
          // ✅ CAMBIO 4: GUARDAR PREFERENCIA AL DECIR "HOLA"
          this.userPreferences.updatePreference('micEnabled', true).subscribe();
          
          setTimeout(() => {
            if (!this.isDestroyed) {
              this.voiceService.speak('Bienvenido a VozAcción. Puedes decir "Acerca de" o "iniciar sesión".');
            }
          }, 500);
          
          wakeSubscription.unsubscribe();
        }
      });
  }



  // ============================================================
  // ✅ MANEJAR COMANDOS DE VOZ
  // ============================================================
  private handleVoiceCommand(text: string): void {
    if (this.isDestroyed) return;
    
    // ✅ NO procesar si el sistema está hablando
    if (window.speechSynthesis.speaking) {
      console.log('🔇 [Welcome] Sistema hablando, ignorando comando:', text);
      return;
    }
    
    const lower = text.toLowerCase().trim();
    console.log(`📝 [Welcome] Comando recibido: "${lower}"`);

    // Prevenir duplicados
    const now = Date.now();
    if (lower === this.lastProcessedCommand && (now - this.lastProcessedTime) < this.COMMAND_DEBOUNCE) {
      console.log(`⏭️ [Welcome] Comando ignorado por debounce: "${lower}"`);
      return;
    }
    this.lastProcessedCommand = lower;
    this.lastProcessedTime = now;

    // ============================================================
    // COMANDOS RECONOCIDOS EN WELCOME
    // ============================================================

    // 🔥 "login" / "iniciar sesión" - navega al login
    if (lower.includes('login') || 
        lower.includes('iniciar sesión') || 
        lower.includes('inicio sesión') || 
        lower === 'entrar' ||
        lower.includes('acceder')) {
      console.log('🔐 [Welcome] Navegando a login');
      this.router.navigate(['/login']);
      return;
    }

    // 🔥 "registro" / "registrar" - navega al registro
    if (lower.includes('registro') || lower.includes('registrar') || lower.includes('crear cuenta')) {
      console.log('📝 [Welcome] Navegando a registro');
      this.voiceService.speak('Navegando a registro de usuario');
      this.router.navigate(['/register']);
      return;
    }

    // 🔥 "acerca de" - navega a About
    if (lower.includes('acerca de') || lower.includes('quienes somos') || lower.includes('qué es') || lower.includes('about')) {
      console.log('ℹ️ [Welcome] Navegando a About...');
      this.router.navigate(['/about']);
      return;
    }

    // 🔥 "ayuda" - muestra comandos disponibles
    if (lower.includes('ayuda') || lower === 'help' || lower.includes('qué puedo decir')) {
      console.log('❓ [Welcome] Mostrando ayuda');
      this.voiceService.speak('En la página de inicio puedes decir "acerca de" para más información, "iniciar sesión" para acceder, "registro" para crear una cuenta, o "volver" para ir atrás.');
      return;
    }

    // 🔥 "volver" - navega al login
    if (lower.includes('volver') || lower.includes('atrás') || lower.includes('regresar')) {
      console.log('🔙 [Welcome] Ejecutando "volver"');
      this.router.navigate(['/login']);
      return;
    }

    // 🔥 "silenciar micrófono" - mute
    if (lower.includes('silenciar micrófono') || lower.includes('dejar de escuchar') || lower.includes('silenciar')) {
      console.log('🔇 [Welcome] Silenciando micrófono');
      this.voiceService.mute();
      // ✅ CAMBIO 5: GUARDAR PREFERENCIA AL SILENCIAR
      this.userPreferences.updatePreference('micEnabled', false).subscribe();
      return;
    }

    // 🔥 "activar micrófono" - unmute
    if (lower.includes('activar micrófono') || lower.includes('encender micrófono') || lower.includes('desmutear') || lower.includes('escuchar')) {
      console.log('🔊 [Welcome] Activando micrófono');
      this.voiceService.unmute();
      // ✅ CAMBIO 5: GUARDAR PREFERENCIA AL ACTIVAR
      this.userPreferences.updatePreference('micEnabled', true).subscribe();
      return;
    }

    // ============================================================
    // 🔥 TODOS LOS DEMÁS COMANDOS SE IGNORAN
    // ============================================================
    console.log(`⏭️ [Welcome] Comando no reconocido: "${lower}"`);
  }

  // ============================================================
  // CARGAR IMÁGENES
  // ============================================================
  private loadImages(): void {
    this.http.get<string[]>('img/images.json')
      .pipe(finalize(() => {
        if (this.slides().length === 0) {
          this.slides.set(['img/carrusel/FondoConBarco.webp']);
          this.totalDuration.set(5);
        }
      }))
      .subscribe({
        next: (data) => {
          if (this.isDestroyed) return;
          if (data && data.length > 0) {
            this.slides.set(data);
            this.totalDuration.set(data.length * 5);
          }
        },
        error: () => {
          console.warn('⚠️ Error cargando imágenes, usando respaldo.');
          this.slides.set(['img/carrusel/FondoConBarco.webp']);
          this.totalDuration.set(5);
        }
      });
  }

  // ============================================================
  // NAVEGACIÓN
  // ============================================================
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToAbout(): void {
    this.router.navigate(['/about']);
  }

  // ============================================================
  // DESTRUCCIÓN
  // ============================================================
  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
    this.voiceContext.resetContext();
    console.log('🧹 WelcomeComponent destruido, contexto reseteado');
  }
}