import { Location } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { MaterialModules } from '../../../../shared/materials/material.collection';
import { ThemeService } from '../../../../shared/services/themes/themes.service';
import { VoiceCommandHandlerService } from '../../../services/voz/voice-command-handler.service';
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { VoiceService } from '../../../services/voz/voice.service';

@Component({
  selector: 'app-about',
  imports: [RouterModule, ...MaterialModules],
  templateUrl: './about.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './about.component.scss',
})
export class AboutComponent implements OnInit, OnDestroy {
  private readonly location = inject(Location);
  private ngZone = inject(NgZone);
  public themeService = inject(ThemeService);
  private voiceContext = inject(VoiceContextService);
  private voiceService = inject(VoiceService);
  private voiceHandler = inject(VoiceCommandHandlerService);

  private isNavigating = false;
  private welcomeShown = false;
  private isDestroyed = false;
  private destroy$ = new Subject<void>();

  // ✅ Variables para control de duplicados
  private lastProcessedCommand = '';
  private lastProcessedTime = 0;
  private readonly COMMAND_DEBOUNCE = 2000;

  // ✅ Control de reintentos (igual que Welcome y Login)
  private noSpeechAttempts = 0;
  private readonly MAX_NO_SPEECH_ATTEMPTS = 3;

  ngOnInit(): void {
    console.log('✅ AboutComponent inicializado (con voz contextual)');

    // ✅ REACTIVAR MICRÓFONO AL ENTRAR
    if (!this.voiceService.isRecognitionActive()) {
      console.log('🎤 [About] Reconocimiento inactivo, iniciando...');
      this.voiceService.startListening();
    }

    const context = {
      activationMessage: 'Bienvenido a la página Acerca de. Puedes decir "volver" para regresar o "leer" para escuchar la información.',
      availableCommands: ['atrás', 'regresar', 'inicio', 'leer', 'información', 'volver'],
      preventBackend: true
    };
    this.voiceContext.setContext(context);

    // ✅ SUSCRIPCIÓN AL TRANSCRIPT
    this.voiceService
      .getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.ngZone.run(() => {
          if (this.isDestroyed || !text) return;
          this.handleVoiceCommand(text);
        });
      });

    // ✅ CONTROL DE CAÍDAS DEL RECONOCIMIENTO (con límite de intentos)
    this.voiceService.ready$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ready) => {
        if (ready) {
          // Si está listo, resetear el contador
          this.noSpeechAttempts = 0;
          return;
        }

        if (!ready && !this.isDestroyed) {
          this.noSpeechAttempts++;
          
          // ✅ Si supera el límite, pausar el micrófono
          if (this.noSpeechAttempts >= this.MAX_NO_SPEECH_ATTEMPTS) {
            console.warn('🔇 [About] Demasiados errores de no-speech, pausando micrófono');
            this.voiceService.mute();
            this.voiceService.speak('He pausado el micrófono por inactividad. Di "hola" para reactivarlo.');
            this.noSpeechAttempts = 0;
            return;
          }

          console.log(`🔄 [About] Reconocimiento caído, reintento ${this.noSpeechAttempts}...`);
          setTimeout(() => {
            if (!this.isDestroyed) {
              this.voiceService.startListening();
            }
          }, 500);
        }
      });

    // ✅ Mensaje de bienvenida (solo una vez por sesión, usando markWelcomeAsShown)
    setTimeout(() => {
      if (!this.isDestroyed) {
        if (!this.voiceService.isRecognitionActive()) {
          this.voiceService.startListening();
        }
        if (!this.voiceService.isCurrentlyMuted() && !this.welcomeShown) {
          this.welcomeShown = true;
          // ✅ Solo reproducir si no se ha mostrado antes
          if (!this.voiceService.hasWelcomeBeenShown('about')) {
            this.voiceService.markWelcomeAsShown('about');
            this.voiceService.speakWhenReady(context.activationMessage);
          }
        }
      }
    }, 800);
  }

  // ============================================================
  // HANDLE VOICE COMMAND
  // ============================================================

  private handleVoiceCommand(text: string): void {
    if (this.isDestroyed) return;
    const lower = text.toLowerCase().trim();

    console.log(`📝 [About] Comando recibido: "${lower}"`);

    // ✅ Prevenir duplicados
    const now = Date.now();
    if (lower === this.lastProcessedCommand && (now - this.lastProcessedTime) < this.COMMAND_DEBOUNCE) {
      console.log(`⏭️ [About] Comando ignorado por debounce: "${lower}"`);
      return;
    }
    this.lastProcessedCommand = lower;
    this.lastProcessedTime = now;

    // 🔥 "volver" / "atrás" / "regresar" / "inicio"
    if (lower.includes('volver') || lower.includes('atrás') || lower.includes('regresar') || lower.includes('inicio')) {
      console.log('🔙 [About] Ejecutando "volver"');
      this.goBack();
      return;
    }

    // 🔥 "leer" / "información"
    if (lower.includes('leer') || lower.includes('información')) {
      console.log('📖 [About] Ejecutando "leer"');
      this.readInfo();
      return;
    }

    // 🔥 "silenciar micrófono"
    if (lower.includes('silenciar micrófono') || lower.includes('dejar de escuchar') || lower.includes('silenciar')) {
      console.log('🔇 [About] Silenciando micrófono');
      this.voiceService.mute();
      return;
    }

    // 🔥 "activar micrófono"
    if (lower.includes('activar micrófono') || lower.includes('encender micrófono') || lower.includes('desmutear') || lower.includes('escuchar')) {
      console.log('🔊 [About] Activando micrófono');
      this.voiceService.unmute();
      return;
    }

    console.log(`⏭️ [About] Comando no reconocido: "${lower}"`);
  }

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================

  goBack(): void {
    if (this.isNavigating) return;
    this.isNavigating = true;
    this.location.back();
  }

  readInfo(): void {
    const message = `
      VozAcción, el universo de la palabra. 
      Comandos de voz para todos. 
      Permite interactuar con la tecnología usando solo la voz, facilitando el acceso a personas con diversas capacidades. 
      Control total por voz, sin necesidad de clics. 
      Diseñado para personas con movilidad reducida. 
      Asistente inteligente que entiende comandos naturales. 
      Versión 1.0, proyecto de accesibilidad.
    `;
    this.voiceService.speak(message);
  }

  // ============================================================
  // DESTRUCTOR
  // ============================================================

  ngOnDestroy(): void {
    console.log('🧹 AboutComponent destruido, contexto reseteado');
    this.isDestroyed = true;
    this.noSpeechAttempts = 0;
    this.destroy$.next();
    this.destroy$.complete();
    this.voiceContext.resetContext();
    window.speechSynthesis.cancel();
  }
}