// import { 
//   Component, 
//   inject, 
//   signal, 
//   input, 
//   effect, 
//   ViewEncapsulation
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { VoiceService } from '../../../features/services/voz/voice.service';
// import { AppStateService } from '../../services/app-state/app-state.service';
// import { Router } from '@angular/router';

// export type MicState = 'idle' | 'listening' | 'error';

// @Component({
//   selector: 'app-voice-toggle',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     MatIconModule, 
//     MatButtonModule,
//     MatTooltipModule
//   ],
//   templateUrl: './app-voice-toggle.component.html',
//   styleUrl: './app-voice-toggle.component.scss',
//   encapsulation: ViewEncapsulation.Emulated
// })
// export class VoiceToggleComponent {
//   private voiceService = inject(VoiceService);
//   private appState = inject(AppStateService);
//   private router = inject(Router);
  
//   showStatusLabel = input<boolean>(true);
//   size = input<'small' | 'medium' | 'large'>('medium');
//   position = input<'fixed' | 'relative'>('fixed');
//   showTooltip = input<boolean>(true);
  
//   public isMuted = signal(false);
//   private isListening = signal(false);
//   private hasError = signal(false);
//   micState = signal<MicState>('idle');
  
//   // ✅ Signal para saber si el reconocimiento está listo
//   private _isReady = signal(false);
  
//   private activationMessageShown = signal(false);
//   private lastActivationTime = 0;
//   private readonly DEBOUNCE_TIME = 5000;
  
//   // Flag para ignorar reinicios automáticos
//   private ignoreNextActivation = false;

//   constructor() {
//     effect(() => {
//       const muted = this.isMuted();
//       const listening = this.isListening();
//       const hasError = this.hasError();
      
//       this.micState.set(
//         hasError ? 'error' :
//         (listening && !muted) ? 'listening' :
//         'idle'
//       );
//     });

//     // ✅ Suscripción a ready$ para saber cuándo el micrófono está listo
//     this.voiceService.ready$.pipe(takeUntilDestroyed()).subscribe(ready => {
//       console.log('🔍 [VoiceToggle] ready$ cambió:', { ready, timestamp: new Date().toISOString() });
//       this._isReady.set(ready);
//     });

//     // Suscripción a autoRestart$ para detectar reinicios automáticos
//     this.voiceService.autoRestart$.pipe(takeUntilDestroyed()).subscribe(isAutoRestart => {
//       console.log('🔍 [VoiceToggle] autoRestart$ cambió:', { 
//         isAutoRestart, 
//         timestamp: new Date().toISOString() 
//       });
//       if (isAutoRestart) {
//         this.ignoreNextActivation = true;
//         console.log('🔍 [VoiceToggle] → ignoreNextActivation = true (por auto-restart)');
//       }
//     });

//     // Suscripción al estado de mute - SOLO ACTUALIZA UI, NO REPRODUCE VOZ
//     this.voiceService.muted$.pipe(takeUntilDestroyed()).subscribe(muted => {
//       const wasMuted = this.isMuted();
//       console.log('🔍 [VoiceToggle] muted$ cambió:', { muted, wasMuted, timestamp: new Date().toISOString() });
//       this.isMuted.set(muted);
      
//       if (muted) {
//         this.isListening.set(false);
//         this.activationMessageShown.set(false);
//       } else if (wasMuted) {
//         this.ignoreNextActivation = false;
//         window.speechSynthesis.cancel();
//         this.playActivationMessage();
//       }
//     });

//     // Suscripción al estado de escucha - CON IGNORE FLAG
//     this.voiceService.listening$.pipe(takeUntilDestroyed()).subscribe(listening => {
//       const wasListening = this.isListening();
//       console.log('🔍 [VoiceToggle] listening$ cambió:', { 
//         de: wasListening, 
//         a: listening,
//         isMuted: this.isMuted(),
//         ignoreNextActivation: this.ignoreNextActivation,
//         timestamp: new Date().toISOString()
//       });
      
//       this.isListening.set(listening);
      
//       if (listening && !wasListening && !this.isMuted()) {
//         if (this.ignoreNextActivation) {
//           console.log('🔍 [VoiceToggle] → Ignorando activación (reinicio automático)');
//           this.ignoreNextActivation = false;
//           return;
//         }
//         console.log('🔍 [VoiceToggle] → Micrófono activado (solo log, sin voz)');
//         this.playActivationMessage();
//       } else {
//         console.log('🔍 [VoiceToggle] → Estado de escucha actualizado', {
//           listening,
//           wasListening,
//           isMuted: this.isMuted()
//         });
//       }
//     });

//     // Suscripción a errores
//     this.voiceService.error$.pipe(takeUntilDestroyed()).subscribe(error => {
//       const recoverableErrors = ['no-speech', 'network', 'audio-capture'];
//       if (recoverableErrors.includes(error)) {
//         console.log('🔄 Error recuperable ignorado en UI:', error);
//         return;
//       }
//       this.hasError.set(!!error);
//     });

//     this.isMuted.set(this.voiceService.isCurrentlyMuted());
//     this.isListening.set(this.voiceService.isListeningActive());
//     console.log('🔍 [VoiceToggle] Estado inicial:', {
//       isMuted: this.isMuted(),
//       isListening: this.isListening(),
//       isReady: this._isReady(),
//       timestamp: new Date().toISOString()
//     });
//   }

//   // ✅ playActivationMessage - SOLO ACTUALIZA ESTADO, NO REPRODUCE VOZ
//   private playActivationMessage(): void {
//     const now = Date.now();
//     const diff = now - this.lastActivationTime;
    
//     console.log('🔍 [VoiceToggle] playActivationMessage() llamado:', {
//       activationMessageShown: this.activationMessageShown(),
//       isMuted: this.isMuted(),
//       diff,
//       DEBOUNCE_TIME: this.DEBOUNCE_TIME,
//       timestamp: new Date().toISOString()
//     });
    
//     if (!this.activationMessageShown() && 
//         !this.isMuted() && 
//         diff > this.DEBOUNCE_TIME) {
      
//       console.log('🔊 [VoiceToggle] → Micrófono activado (solo log, sin voz)');
//       window.speechSynthesis.cancel();
//       this.activationMessageShown.set(true);
//       this.lastActivationTime = now;
      
//       setTimeout(() => {
//         this.activationMessageShown.set(false);
//         console.log('🔍 [VoiceToggle] → Flag activationMessageShown resetado');
//       }, 1000);
//     } else {
//       console.log('🔍 [VoiceToggle] → NO reproduce (condiciones no cumplidas)', {
//         activationMessageShown: this.activationMessageShown(),
//         isMuted: this.isMuted(),
//         diffMayor: diff > this.DEBOUNCE_TIME
//       });
//     }
//   }

//   // ✅ Getters
//   get micIcon(): string {
//     const state = this.micState();
//     if (state === 'error') return 'mic_off';
//     if (state === 'listening') return 'mic';
//     return this.isMuted() ? 'mic_off' : 'mic';
//   }

//   get tooltipText(): string {
//     const state = this.micState();
//     if (state === 'error') return 'Error en el micrófono. Haz clic para reiniciar';
//     if (state === 'listening') return 'Escuchando... Haz clic para silenciar';
//     return this.isMuted() ? 'Activar micrófono' : 'Silenciar micrófono';
//   }

//   get statusText(): string {
//     const state = this.micState();
//     if (state === 'error') return '❌ Error';
//     if (state === 'listening') return '🎤 Escuchando...';
//     return this.isMuted() ? '🔇 Apagado' : '🎤 Activo';
//   }

//   get isPulsing(): boolean {
//     return this.micState() === 'listening';
//   }

//   get buttonSize(): string {
//     const sizes = {
//       small: '36px',
//       medium: '48px',
//       large: '56px'
//     };
//     return sizes[this.size()] || sizes['medium'];
//   }

//   get iconSize(): string {
//     const sizes = {
//       small: '20px',
//       medium: '24px',
//       large: '28px'
//     };
//     return sizes[this.size()] || sizes['medium'];
//   }

//   // ✅ Navegador
//   get isFirefox(): boolean {
//     return this.appState.isFirefox;
//   }

//   get showFirefoxMessage(): boolean {
//     return this.appState.isFirefoxMessageVisible && this.isWelcomePage;
//   }

//   get isWelcomePage(): boolean {
//     return this.router.url === '/' || this.router.url === '/welcome';
//   }

//   get browserSupportMessage(): string {
//     return this.appState.getVoiceUnsupportedMessage();
//   }

//   // ✅ Micrófono listo (para mostrar indicador de carga)
//   get isReady(): boolean {
//     return this._isReady();
//   }

//   closeFirefoxMessage(): void {
//     this.appState.closeFirefoxMessage();
//   }

//   toggleMic(): void {
//     if (this.appState.isFirefox) {
//       console.warn('🦊 Firefox: Reconocimiento de voz no soportado');
//       return;
//     }

//     if (this.hasError()) {
//       this.hasError.set(false);
//       this.voiceService.startListening();
//       return;
//     }
    
//     const wasMuted = this.isMuted();
//     console.log('🔍 [VoiceToggle] toggleMic() llamado:', { wasMuted, timestamp: new Date().toISOString() });
    
//     if (wasMuted) {
//       window.speechSynthesis.cancel();
//       this.activationMessageShown.set(false);
//       this.ignoreNextActivation = false;
//     }
    
//     this.voiceService.toggleMute();
    
//     if (wasMuted) {
//       setTimeout(() => this.playActivationMessage(), 200);
//     }
//   }

//   isVoiceSupported(): boolean {
//     return this.appState.isVoiceSupported && 
//            this.voiceService.isSpeechSynthesisSupported();
//   }
// }










// import { 
//   Component, 
//   inject, 
//   signal, 
//   input, 
//   effect, 
//   ViewEncapsulation
// } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// import { VoiceService } from '../../../features/services/voz/voice.service';
// import { AppStateService } from '../../services/app-state/app-state.service';
// import { Router } from '@angular/router';
// import { VoiceContextService } from '../../../features/services/voz/voice-context.service';

// export type MicState = 'idle' | 'listening' | 'error';

// @Component({
//   selector: 'app-voice-toggle',
//   standalone: true,
//   imports: [
//     CommonModule, 
//     MatIconModule, 
//     MatButtonModule,
//     MatTooltipModule
//   ],
//   templateUrl: './app-voice-toggle.component.html',
//   styleUrl: './app-voice-toggle.component.scss',
//   encapsulation: ViewEncapsulation.Emulated
// })
// export class VoiceToggleComponent {
//   private voiceService = inject(VoiceService);
//   private appState = inject(AppStateService);
//   private router = inject(Router);
//   //
//   private voiceContext = inject(VoiceContextService);
  
//   showStatusLabel = input<boolean>(true);
//   size = input<'small' | 'medium' | 'large'>('medium');
//   position = input<'fixed' | 'relative'>('fixed');
//   showTooltip = input<boolean>(true);
  
//   public isMuted = signal(false);
//   private isListening = signal(false);
//   private hasError = signal(false);
//   micState = signal<MicState>('idle');
  
//   private _isReady = signal(false);
  
//   private activationMessageShown = signal(false);
//   private lastActivationTime = 0;
//   private readonly DEBOUNCE_TIME = 5000;
  
//   private ignoreNextActivation = false;

//   constructor() {
//     effect(() => {
//       const muted = this.isMuted();
//       const listening = this.isListening();
//       const hasError = this.hasError();
      
//       this.micState.set(
//         hasError ? 'error' :
//         (listening && !muted) ? 'listening' :
//         'idle'
//       );
//     });

//     this.voiceService.ready$.pipe(takeUntilDestroyed()).subscribe(ready => {
//       console.log('🔍 [VoiceToggle] ready$ cambió:', { ready, timestamp: new Date().toISOString() });
//       this._isReady.set(ready);
//     });

//     this.voiceService.autoRestart$.pipe(takeUntilDestroyed()).subscribe(isAutoRestart => {
//       console.log('🔍 [VoiceToggle] autoRestart$ cambió:', { 
//         isAutoRestart, 
//         timestamp: new Date().toISOString() 
//       });
//       if (isAutoRestart) {
//         this.ignoreNextActivation = true;
//         console.log('🔍 [VoiceToggle] → ignoreNextActivation = true (por auto-restart)');
//       }
//     });

//     // ============================================================
//     // 🔁 SUSCRIPCIÓN A muted$ - CON MENSAJE DE VOZ AL ACTIVAR
//     // ============================================================
    
//     this.voiceService.muted$.pipe(takeUntilDestroyed()).subscribe(muted => {
//       const wasMuted = this.isMuted();
//       console.log('🔍 [VoiceToggle] muted$ cambió:', { muted, wasMuted, timestamp: new Date().toISOString() });
//       this.isMuted.set(muted);
      
//       if (muted) {
//         this.isListening.set(false);
//         this.activationMessageShown.set(false);
//       } else if (wasMuted) {
//         this.ignoreNextActivation = false;

//         if (!this.ignoreNextActivation) {
//           const contextMsg = this.voiceContext.getContext().activationMessage ||
//                             'Micrófono activado. Di "silenciar" para desactivarlo.';
//           const utterance = new SpeechSynthesisUtterance(contextMsg);
//           utterance.lang = 'es-ES';
//           utterance.rate = 1.0;
//           utterance.pitch = 1.0;
//           utterance.volume = 1;
//           window.speechSynthesis.speak(utterance);
//         }

//         this.playActivationMessage();
//       }
//     });

//     this.voiceService.listening$.pipe(takeUntilDestroyed()).subscribe(listening => {
//       const wasListening = this.isListening();
//       console.log('🔍 [VoiceToggle] listening$ cambió:', { 
//         de: wasListening, 
//         a: listening,
//         isMuted: this.isMuted(),
//         ignoreNextActivation: this.ignoreNextActivation,
//         timestamp: new Date().toISOString()
//       });
      
//       this.isListening.set(listening);
      
//       if (listening && !wasListening && !this.isMuted()) {
//         if (this.ignoreNextActivation) {
//           console.log('🔍 [VoiceToggle] → Ignorando activación (reinicio automático)');
//           this.ignoreNextActivation = false;
//           return;
//         }
//         console.log('🔍 [VoiceToggle] → Micrófono activado (solo log, sin voz)');
//         this.playActivationMessage();
//       } else {
//         console.log('🔍 [VoiceToggle] → Estado de escucha actualizado', {
//           listening,
//           wasListening,
//           isMuted: this.isMuted()
//         });
//       }
//     });

//     this.voiceService.error$.pipe(takeUntilDestroyed()).subscribe(error => {
//       const recoverableErrors = ['no-speech', 'network', 'audio-capture'];
//       if (recoverableErrors.includes(error)) {
//         console.log('🔄 Error recuperable ignorado en UI:', error);
//         return;
//       }
//       this.hasError.set(!!error);
//     });

//     this.isMuted.set(this.voiceService.isCurrentlyMuted());
//     this.isListening.set(this.voiceService.isListeningActive());
//     console.log('🔍 [VoiceToggle] Estado inicial:', {
//       isMuted: this.isMuted(),
//       isListening: this.isListening(),
//       isReady: this._isReady(),
//       timestamp: new Date().toISOString()
//     });
//   }

//   // ✅ playActivationMessage - SOLO ACTUALIZA ESTADO, NO REPRODUCE VOZ Y NO CANCELA
//   private playActivationMessage(): void {
//     const now = Date.now();
//     const diff = now - this.lastActivationTime;
    
//     console.log('🔍 [VoiceToggle] playActivationMessage() llamado:', {
//       activationMessageShown: this.activationMessageShown(),
//       isMuted: this.isMuted(),
//       diff,
//       DEBOUNCE_TIME: this.DEBOUNCE_TIME,
//       timestamp: new Date().toISOString()
//     });
    
//     if (!this.activationMessageShown() && 
//         !this.isMuted() && 
//         diff > this.DEBOUNCE_TIME) {
      
//       // ⚠️ ELIMINAMOS window.speechSynthesis.cancel() PARA NO INTERRUMPIR
//       this.activationMessageShown.set(true);
//       this.lastActivationTime = now;
      
//       setTimeout(() => {
//         this.activationMessageShown.set(false);
//         console.log('🔍 [VoiceToggle] → Flag activationMessageShown resetado');
//       }, 1000);
//     } else {
//       console.log('🔍 [VoiceToggle] → NO reproduce (condiciones no cumplidas)', {
//         activationMessageShown: this.activationMessageShown(),
//         isMuted: this.isMuted(),
//         diffMayor: diff > this.DEBOUNCE_TIME
//       });
//     }
//   }

//   // Getters
//   get micIcon(): string {
//     const state = this.micState();
//     if (state === 'error') return 'mic_off';
//     if (state === 'listening') return 'mic';
//     return this.isMuted() ? 'mic_off' : 'mic';
//   }

//   get tooltipText(): string {
//     const state = this.micState();
//     if (state === 'error') return 'Error en el micrófono. Haz clic para reiniciar';
//     if (state === 'listening') return 'Escuchando... Haz clic para silenciar';
//     return this.isMuted() ? 'Activar micrófono' : 'Silenciar micrófono';
//   }

//   get statusText(): string {
//     const state = this.micState();
//     if (state === 'error') return '❌ Error';
//     if (state === 'listening') return '🎤 Escuchando...';
//     return this.isMuted() ? '🔇 Apagado' : '🎤 Activo';
//   }

//   get isPulsing(): boolean {
//     return this.micState() === 'listening';
//   }

//   get buttonSize(): string {
//     const sizes = {
//       small: '36px',
//       medium: '48px',
//       large: '56px'
//     };
//     return sizes[this.size()] || sizes['medium'];
//   }

//   get iconSize(): string {
//     const sizes = {
//       small: '20px',
//       medium: '24px',
//       large: '28px'
//     };
//     return sizes[this.size()] || sizes['medium'];
//   }

//   get isFirefox(): boolean {
//     return this.appState.isFirefox;
//   }

//   get showFirefoxMessage(): boolean {
//     return this.appState.isFirefoxMessageVisible && this.isWelcomePage;
//   }

//   get isWelcomePage(): boolean {
//     return this.router.url === '/' || this.router.url === '/welcome';
//   }

//   get browserSupportMessage(): string {
//     return this.appState.getVoiceUnsupportedMessage();
//   }

//   get isReady(): boolean {
//     return this._isReady();
//   }

//   closeFirefoxMessage(): void {
//     this.appState.closeFirefoxMessage();
//   }

//   toggleMic(): void {
//     if (this.appState.isFirefox) {
//       console.warn('🦊 Firefox: Reconocimiento de voz no soportado');
//       return;
//     }

//     if (this.hasError()) {
//       this.hasError.set(false);
//       this.voiceService.startListening();
//       return;
//     }
    
//     const wasMuted = this.isMuted();
//     console.log('🔍 [VoiceToggle] toggleMic() llamado:', { wasMuted, timestamp: new Date().toISOString() });
    
//     if (wasMuted) {
//       window.speechSynthesis.cancel();
//       this.activationMessageShown.set(false);
//       this.ignoreNextActivation = false;
//     }
    
//     this.voiceService.toggleMute();
    
//     if (wasMuted) {
//       setTimeout(() => this.playActivationMessage(), 200);
//     }
//   }

//   isVoiceSupported(): boolean {
//     return this.appState.isVoiceSupported && 
//            this.voiceService.isSpeechSynthesisSupported();
//   }
// }












import {
  Component,
  inject,
  signal,
  input,
  effect,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VoiceService } from '../../../features/services/voz/voice.service';
import { AppStateService } from '../../services/app-state/app-state.service';
import { Router } from '@angular/router';
import { VoiceContextService } from '../../../features/services/voz/voice-context.service';

export type MicState = 'idle' | 'listening' | 'error';

@Component({
  selector: 'app-voice-toggle',
  standalone: true,
  imports: [
    CommonModule, 
    MatIconModule, 
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './app-voice-toggle.component.html',
  styleUrl: './app-voice-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated
})
export class VoiceToggleComponent {
  private voiceService = inject(VoiceService);
  private appState = inject(AppStateService);
  private router = inject(Router);
  private voiceContext = inject(VoiceContextService);
  
  showStatusLabel = input<boolean>(true);
  size = input<'small' | 'medium' | 'large'>('medium');
  position = input<'fixed' | 'relative'>('fixed');
  showTooltip = input<boolean>(true);
  
  public isMuted = signal(false);
  private isListening = signal(false);
  private hasError = signal(false);
  micState = signal<MicState>('idle');
  
  private _isReady = signal(false);
  
  private activationMessageShown = signal(false);
  private lastActivationTime = 0;
  private readonly DEBOUNCE_TIME = 5000;
  
  private ignoreNextActivation = false;

  constructor() {
    effect(() => {
      const muted = this.isMuted();
      const listening = this.isListening();
      const hasError = this.hasError();
      
      this.micState.set(
        hasError ? 'error' :
        (listening && !muted) ? 'listening' :
        'idle'
      );
    });

    this.voiceService.ready$.pipe(takeUntilDestroyed()).subscribe(ready => {
      console.log('🔍 [VoiceToggle] ready$ cambió:', { ready, timestamp: new Date().toISOString() });
      this._isReady.set(ready);
    });

    this.voiceService.autoRestart$.pipe(takeUntilDestroyed()).subscribe(isAutoRestart => {
      console.log('🔍 [VoiceToggle] autoRestart$ cambió:', { 
        isAutoRestart, 
        timestamp: new Date().toISOString() 
      });
      if (isAutoRestart) {
        this.ignoreNextActivation = true;
        console.log('🔍 [VoiceToggle] → ignoreNextActivation = true (por auto-restart)');
      }
    });

    // ============================================================
    // 🔁 SUSCRIPCIÓN A muted$ - CON MENSAJE DE VOZ AL ACTIVAR
    // ============================================================
    
    this.voiceService.muted$.pipe(takeUntilDestroyed()).subscribe(muted => {
      const wasMuted = this.isMuted();
      console.log('🔍 [VoiceToggle] muted$ cambió:', { muted, wasMuted, timestamp: new Date().toISOString() });
      this.isMuted.set(muted);
      
      if (muted) {
        this.isListening.set(false);
        this.activationMessageShown.set(false);
      } else if (wasMuted) {
        this.ignoreNextActivation = false;

        if (!this.ignoreNextActivation) {
          const contextMsg = this.voiceContext.getContext().activationMessage ||
                            'Micrófono activado. Di "silenciar" para desactivarlo.';
          // ✅ Usar speakWhenReady para esperar a que el reconocimiento esté listo
          this.voiceService.speakWhenReady(contextMsg);
        }

        this.playActivationMessage();
      }
    });

    this.voiceService.listening$.pipe(takeUntilDestroyed()).subscribe(listening => {
      const wasListening = this.isListening();
      console.log('🔍 [VoiceToggle] listening$ cambió:', { 
        de: wasListening, 
        a: listening,
        isMuted: this.isMuted(),
        ignoreNextActivation: this.ignoreNextActivation,
        timestamp: new Date().toISOString()
      });
      
      this.isListening.set(listening);
      
      if (listening && !wasListening && !this.isMuted()) {
        if (this.ignoreNextActivation) {
          console.log('🔍 [VoiceToggle] → Ignorando activación (reinicio automático)');
          this.ignoreNextActivation = false;
          return;
        }
        console.log('🔍 [VoiceToggle] → Micrófono activado (solo log, sin voz)');
        this.playActivationMessage();
      } else {
        console.log('🔍 [VoiceToggle] → Estado de escucha actualizado', {
          listening,
          wasListening,
          isMuted: this.isMuted()
        });
      }
    });

    this.voiceService.error$.pipe(takeUntilDestroyed()).subscribe(error => {
      const recoverableErrors = ['no-speech', 'network', 'audio-capture'];
      if (recoverableErrors.includes(error)) {
        console.log('🔄 Error recuperable ignorado en UI:', error);
        return;
      }
      this.hasError.set(!!error);
    });

    this.isMuted.set(this.voiceService.isCurrentlyMuted());
    this.isListening.set(this.voiceService.isListeningActive());
    console.log('🔍 [VoiceToggle] Estado inicial:', {
      isMuted: this.isMuted(),
      isListening: this.isListening(),
      isReady: this._isReady(),
      timestamp: new Date().toISOString()
    });
  }

  // ✅ playActivationMessage - SOLO ACTUALIZA ESTADO, NO REPRODUCE VOZ Y NO CANCELA
  private playActivationMessage(): void {
    const now = Date.now();
    const diff = now - this.lastActivationTime;
    
    console.log('🔍 [VoiceToggle] playActivationMessage() llamado:', {
      activationMessageShown: this.activationMessageShown(),
      isMuted: this.isMuted(),
      diff,
      DEBOUNCE_TIME: this.DEBOUNCE_TIME,
      timestamp: new Date().toISOString()
    });
    
    if (!this.activationMessageShown() && 
        !this.isMuted() && 
        diff > this.DEBOUNCE_TIME) {
      
      // ⚠️ ELIMINAMOS window.speechSynthesis.cancel() PARA NO INTERRUMPIR
      this.activationMessageShown.set(true);
      this.lastActivationTime = now;
      
      setTimeout(() => {
        this.activationMessageShown.set(false);
        console.log('🔍 [VoiceToggle] → Flag activationMessageShown resetado');
      }, 1000);
    } else {
      console.log('🔍 [VoiceToggle] → NO reproduce (condiciones no cumplidas)', {
        activationMessageShown: this.activationMessageShown(),
        isMuted: this.isMuted(),
        diffMayor: diff > this.DEBOUNCE_TIME
      });
    }
  }

  // Getters
  get micIcon(): string {
    const state = this.micState();
    if (state === 'error') return 'mic_off';
    if (state === 'listening') return 'mic';
    return this.isMuted() ? 'mic_off' : 'mic';
  }

  get tooltipText(): string {
    const state = this.micState();
    if (state === 'error') return 'Error en el micrófono. Haz clic para reiniciar';
    if (state === 'listening') return 'Escuchando... Haz clic para silenciar';
    return this.isMuted() ? 'Activar micrófono' : 'Silenciar micrófono';
  }

  get statusText(): string {
    const state = this.micState();
    if (state === 'error') return '❌ Error';
    if (state === 'listening') return '🎤 Escuchando...';
    return this.isMuted() ? '🔇 Apagado' : '🎤 Activo';
  }

  get isPulsing(): boolean {
    return this.micState() === 'listening';
  }

  get buttonSize(): string {
    const sizes = {
      small: '36px',
      medium: '48px',
      large: '56px'
    };
    return sizes[this.size()] || sizes['medium'];
  }

  get iconSize(): string {
    const sizes = {
      small: '20px',
      medium: '24px',
      large: '28px'
    };
    return sizes[this.size()] || sizes['medium'];
  }

  get isFirefox(): boolean {
    return this.appState.isFirefox;
  }

  get showFirefoxMessage(): boolean {
    return this.appState.isFirefoxMessageVisible && this.isWelcomePage;
  }

  get isWelcomePage(): boolean {
    return this.router.url === '/' || this.router.url === '/welcome';
  }

  get browserSupportMessage(): string {
    return this.appState.getVoiceUnsupportedMessage();
  }

  get isReady(): boolean {
    return this._isReady();
  }

  closeFirefoxMessage(): void {
    this.appState.closeFirefoxMessage();
  }

  toggleMic(): void {
    if (this.appState.isFirefox) {
      console.warn('🦊 Firefox: Reconocimiento de voz no soportado');
      return;
    }

    if (this.hasError()) {
      this.hasError.set(false);
      this.voiceService.startListening();
      return;
    }
    
    const wasMuted = this.isMuted();
    console.log('🔍 [VoiceToggle] toggleMic() llamado:', { wasMuted, timestamp: new Date().toISOString() });
    
    if (wasMuted) {
      window.speechSynthesis.cancel();
      this.activationMessageShown.set(false);
      this.ignoreNextActivation = false;
    }
    
    this.voiceService.toggleMute();
    
    if (wasMuted) {
      setTimeout(() => this.playActivationMessage(), 200);
    }
  }

  isVoiceSupported(): boolean {
    return this.appState.isVoiceSupported && 
           this.voiceService.isSpeechSynthesisSupported();
  }
}