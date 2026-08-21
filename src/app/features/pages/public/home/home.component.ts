// src/app/features/pages/home/home.component.ts
import { Component, inject, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// ✅ ANGULAR MATERIAL
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { Location } from '@angular/common'; // ✅ AÑADIR IMPORT

import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../shared/services/themes/themes.service';
import { VoiceCommandHandlerService } from '../../../services/voz/voice-command-handler.service';
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { VoiceService } from '../../../services/voz/voice.service';
import { TransparentToolbarComponent } from "../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    TransparentToolbarComponent
],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private voiceService = inject(VoiceService);
  private voiceContext = inject(VoiceContextService);
  private voiceHandler = inject(VoiceCommandHandlerService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  private destroy$ = new Subject<void>();
  private welcomeShown = false;
  private isDestroyed = false;

  private location = inject(Location);

  // ✅ GETTER para el tema oscuro
  get isDarkTheme(): boolean {
    return this.themeService.currentTheme() === 'dark';
  }

  // ✅ Estado del micrófono
  readonly isMicActive = this.voiceService.isCurrentlyMuted();

  // ✅ Año actual para el footer
  readonly currentYear = new Date().getFullYear();

  // ✅ Usuario autenticado
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    return this.authService.getUserName() || 'Usuario';
  }

  ngOnInit(): void {
    console.log('✅ HomeComponent inicializado (con voz)');

    const context = {
      activationMessage: 'Bienvenido a la página principal de VozAcción. Puedes decir "iniciar sesión", "registrar", "acerca de", "ayuda" o "comandos" para ver las opciones disponibles.',
      availableCommands: [
        'iniciar sesión', 'registrar', 'acerca de', 'ayuda', 
        'comandos', 'volver', 'inicio', 'servicios', 'contacto'
      ],
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

    setTimeout(() => {
      if (!this.isDestroyed && !this.voiceService.isCurrentlyMuted() && !this.welcomeShown) {
        this.welcomeShown = true;
        if (!this.voiceService.hasWelcomeBeenShown('home')) {
          this.voiceService.markWelcomeAsShown('home');
          this.voiceService.speakWhenReady(context.activationMessage);
        }
      }
    }, 1000);
  }

  // ============================================================
  // HANDLE VOICE COMMAND
  // ============================================================

  private handleVoiceCommand(text: string): void {
    if (this.isDestroyed) return;
    const lower = text.toLowerCase().trim();

    console.log(`📝 [Home] Comando recibido: "${lower}"`);

    if (lower.includes('iniciar sesión') || lower.includes('login') || lower.includes('entrar')) {
      this.voiceService.clearTranscript();
      this.voiceService.speak('Navegando a inicio de sesión.');
      this.router.navigate(['/login']);
      return;
    }

    if (lower.includes('registrar') || lower.includes('registro') || lower.includes('crear cuenta')) {
      this.voiceService.clearTranscript();
      this.voiceService.speak('Navegando a registro.');
      this.router.navigate(['/register']);
      return;
    }

    if (lower.includes('acerca de') || lower.includes('sobre') || lower.includes('información')) {
      this.voiceService.speak('Navegando a Acerca de.');
      this.router.navigate(['/about']);
      return;
    }

    if (lower.includes('ayuda') || lower.includes('help')) {
      this.showHelp();
      return;
    }

    if (lower.includes('comandos') || lower.includes('opciones')) {
      this.showCommands();
      return;
    }

    if (lower.includes('volver') || lower.includes('atrás')) {
      this.voiceService.speak('Ya estás en la página principal.');
      return;
    }

    if (lower.includes('silenciar micrófono') || lower.includes('silenciar')) {
      this.voiceService.mute();
      return;
    }

    if (lower.includes('activar micrófono') || lower.includes('desmutear') || lower.includes('escuchar')) {
      this.voiceService.unmute();
      return;
    }

    if (lower.includes('hola') || lower.includes('buenos días') || lower.includes('buenas')) {
      const greeting = this.isAuthenticated 
        ? `¡Hola ${this.userName}! ¿En qué puedo ayudarte?`
        : '¡Hola! Bienvenido a VozAcción. ¿Qué deseas hacer?';
      this.voiceService.speak(greeting);
      return;
    }

    console.log(`⏭️ [Home] Comando no reconocido: "${lower}"`);
  }

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================

  showHelp(): void {
    const message = 
      'En la página principal puedes decir: "iniciar sesión" para acceder a tu cuenta, ' +
      '"registrar" para crear una cuenta nueva, ' +
      '"acerca de" para conocer más sobre VozAcción, ' +
      '"comandos" para ver todas las opciones disponibles, ' +
      '"hola" para saludar, o "ayuda" para repetir este mensaje.';
    this.voiceService.speak(message);
  }

  showCommands(): void {
    const commands = [
      'Comandos disponibles:',
      '• "iniciar sesión" o "login" - Accede a tu cuenta',
      '• "registrar" o "registro" - Crea una nueva cuenta',
      '• "acerca de" - Información sobre VozAcción',
      '• "ayuda" - Muestra este mensaje de ayuda',
      '• "comandos" - Lista todos los comandos',
      '• "hola" - Saludo personalizado',
      '• "silenciar micrófono" - Apaga el micrófono',
      '• "activar micrófono" - Enciende el micrófono'
    ];
    this.voiceService.speak(commands.join(' '));
  }

  goToLogin(): void {
    this.voiceService.clearTranscript();
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.voiceService.clearTranscript();
    this.router.navigate(['/register']);
  }

  goToAbout(): void {
    this.router.navigate(['/about']);
  }

  // ✅ MÉTODO goBack
  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/']);
    }
  }

    // ✅ Método para cerrar sesión
    logout(): void {
      this.authService.logout().subscribe({
        next: () => {
          this.voiceService.clearTranscript();
          this.voiceService.speak('Sesión cerrada correctamente.');
          this.router.navigate(['/login']);
        },
        error: () => {
          // Si falla el logout, limpiar localmente igual
          this.authService.fullLocalLogout();
          this.voiceService.clearTranscript();
          this.router.navigate(['/login']);
        }
      });
    }

  // ✅ Método para ir al dashboard (si existe)
  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  // ============================================================
  // DESTRUCTOR
  // ============================================================

  ngOnDestroy(): void {
    console.log('🧹 HomeComponent destruido');
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
    this.voiceContext.resetContext();
    window.speechSynthesis.cancel();
  }
}