// import { Component, signal, OnInit, OnDestroy, inject } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterLink, Router } from '@angular/router';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { HttpClient } from '@angular/common/http';
// import { finalize } from 'rxjs';
// import { VoiceContextService } from '../../../services/voz/voice-context.service';
// import { VoiceService } from '../../../services/voz/voice.service';

// @Component({
//   selector: 'app-welcome',
//   standalone: true,
//   imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
//   templateUrl: './welcome.component.html',
//   styleUrls: ['./welcome.component.scss']
// })
// export class WelcomeComponent implements OnInit, OnDestroy {
//   private http = inject(HttpClient);
//   private router = inject(Router);
//   private voiceContext = inject(VoiceContextService);
//   private voiceService = inject(VoiceService);

//   slides = signal<string[]>([]);
//   totalDuration = signal<number>(0);

//   private isDestroyed = false;
//   private activationMessageShown = false;
//   private welcomeShown = false;

//   ngOnInit(): void {
//     console.log('✅ WelcomeComponent inicializado (con voz contextual)');

//     this.loadImages();

//     const context = {
//       activationMessage: 'Bienvenido a VozAcción. Puedes decir "Acerca de" o "iniciar sesión".',
//       availableCommands: ['acerca de', 'quiénes somos', 'login', 'iniciar sesión', 'inicio']
//     };
//     this.voiceContext.setContext(context);

//     // Si el micrófono está desactivado, mensaje con speakAlways
//     if (this.voiceService.isCurrentlyMuted() && !this.activationMessageShown) {
//       this.activationMessageShown = true;
//       setTimeout(() => {
//         this.voiceService.speakAlways('Micrófono desactivado. Di "hola" para activarlo.');
//       }, 1000);
//     }

//     // Si el micrófono está activo, bienvenida con speakWhenReady
//     if (!this.voiceService.isCurrentlyMuted() && !this.welcomeShown) {
//       this.welcomeShown = true;
//       this.voiceService.speakWhenReady(context.activationMessage);
//     }
//   }

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

//   goToLogin(): void {
//     this.router.navigate(['/login']);
//   }

//   goToAbout(): void {
//     this.router.navigate(['/about']);
//   }

//   ngOnDestroy(): void {
//     this.isDestroyed = true;
//     this.voiceContext.resetContext();
//     console.log('🧹 WelcomeComponent destruido, contexto reseteado');
//   }
// }



// src/app/features/welcome/welcome.component.ts
import { Component, signal, OnInit, OnDestroy, inject, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { finalize, Subject, takeUntil } from 'rxjs';
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { VoiceService } from '../../../services/voz/voice.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private voiceContext = inject(VoiceContextService);
  private voiceService = inject(VoiceService);
  private ngZone = inject(NgZone);

  // ✅ AÑADIR ESTAS VARIABLES
  private lastProcessedCommand = '';
  private lastProcessedTime = 0;
  private readonly COMMAND_DEBOUNCE = 2000;

  slides = signal<string[]>([]);
  totalDuration = signal<number>(0);

  private isDestroyed = false;
  private activationMessageShown = false;
  private welcomeShown = false;
  private destroy$ = new Subject<void>();

  private lastCommandTime = 0;
  //private readonly COMMAND_DEBOUNCE = 1500;



  ngOnInit(): void {
    console.log('✅ WelcomeComponent inicializado (con voz contextual)');

    this.loadImages();

    const context = {
      activationMessage: 'Bienvenido a VozAcción. Puedes decir "Acerca de" o "iniciar sesión".',
      availableCommands: ['acerca de', 'quiénes somos', 'login', 'iniciar sesión', 'inicio']
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

    this.voiceService.ready$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ready) => {
        if (!ready && !this.isDestroyed) {
          console.log('🔄 [Welcome] Reconocimiento caído, reactivando...');
          setTimeout(() => {
            if (!this.isDestroyed) {
              this.voiceService.startListening();
            }
          }, 500);
        }
      });

    setTimeout(() => {
      if (!this.isDestroyed) {
        if (!this.voiceService.isRecognitionActive()) {
          console.log('🎤 [Welcome] Reconocimiento inactivo, iniciando...');
          this.voiceService.startListening();
        }

        if (this.voiceService.isCurrentlyMuted() && !this.activationMessageShown) {
          this.activationMessageShown = true;
          console.log('🔇 [Welcome] Micrófono muteado, mensaje de activación');
          this.voiceService.speakAlways('Micrófono desactivado. Di "hola" para activarlo.');
        } else if (!this.voiceService.isCurrentlyMuted() && !this.welcomeShown) {
          this.welcomeShown = true;
          console.log('🎤 [Welcome] Micrófono activo, mensaje de bienvenida');
          this.voiceService.speakWhenReady(context.activationMessage);
        }
      }
    }, 800);
  }

  

  // ============================================================
  // ✅ MANEJAR COMANDOS DE VOZ - CORREGIDO
  // ============================================================
  // private handleVoiceCommand(text: string): void {
  //   if (this.isDestroyed) return;
  //   const lower = text.toLowerCase().trim();
  //   console.log(`📝 [Welcome] Comando recibido: "${lower}"`);

  //   const now = Date.now();
  //   if (now - this.lastCommandTime < this.COMMAND_DEBOUNCE) {
  //     console.log(`⏭️ [Welcome] Comando ignorado por debounce: "${lower}"`);
  //     return;
  //   }
  //   this.lastCommandTime = now;

  //   // ✅ COMANDOS DE NAVEGACIÓN (SIN SPEAK INNECESARIO)
  //   if (lower.includes('iniciar sesión') || lower.includes('login') || lower === 'login') {
  //     console.log('🔐 [Welcome] Navegando a login');
  //     // ✅ Sin mensaje de voz - navegación directa
  //     this.router.navigate(['/login']);
  //     return;
  //   }

  //   if (lower.includes('acerca de') || lower.includes('quienes somos') || lower === 'about') {
  //     console.log('ℹ️ [Welcome] Navegando a acerca de');
  //     // ✅ Sin mensaje de voz - navegación directa
  //     this.router.navigate(['/about']);
  //     return;
  //   }

  //   if (lower.includes('ayuda') || lower === 'help') {
  //     console.log('❓ [Welcome] Mostrando ayuda');
  //     this.voiceService.speak('Puedes decir "iniciar sesión" o "acerca de".');
  //     return;
  //   }

  //   console.log(`ℹ️ [Welcome] Comando no reconocido: "${lower}"`);
  // }







  private handleVoiceCommand(text: string): void {
    if (this.isDestroyed) return;
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

    // 🔥 "login" / "iniciar sesión" - navega al login (PRIMERO)
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

    // 🔥 "acerca de" - navega a About (SEGUNDO)
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
      return;
    }

    // 🔥 "activar micrófono" - unmute
    if (lower.includes('activar micrófono') || lower.includes('encender micrófono') || lower.includes('desmutear') || lower.includes('escuchar')) {
      console.log('🔊 [Welcome] Activando micrófono');
      this.voiceService.unmute();
      return;
    }

    // ============================================================
    // 🔥 TODOS LOS DEMÁS COMANDOS SE IGNORAN
    // ============================================================
    console.log(`⏭️ [Welcome] Comando no reconocido: "${lower}"`);
  }










  //
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

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToAbout(): void {
    this.router.navigate(['/about']);
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
    this.voiceContext.resetContext();
    console.log('🧹 WelcomeComponent destruido, contexto reseteado');
  }
}