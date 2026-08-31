import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../../../shared/services/themes/themes.service';
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { VoiceService } from '../../../services/voz/voice.service';
import { VoiceCommandHandlerService } from '../../../services/voz/voice-command-handler.service';
import { PreviousRouteService } from '../../../../shared/services/router/previous-route.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './not-found.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private previousRouteService = inject(PreviousRouteService);
  public themeService = inject(ThemeService);
  private voiceContext = inject(VoiceContextService);
  private voiceService = inject(VoiceService);
  private voiceHandler = inject(VoiceCommandHandlerService);

  readonly currentYear = new Date().getFullYear();
  private welcomeShown = false;
  private contextSubscription?: any;

  ngOnInit(): void {
    console.log('✅ NotFoundComponent inicializado (con voz contextual)');

    const context = {
      activationMessage: 'Página no encontrada. Puedes decir "volver" para regresar, "ayuda" para ir al centro de ayuda, o "reportar" para notificar un error.',
      availableCommands: ['volver', 'atrás', 'regresar', 'ayuda', 'reportar']
    };
    this.voiceContext.setContext(context);

    // ✅ SUSCRIBIRSE A COMANDOS CONTEXTUALES (incluyendo "volver")
    this.contextSubscription = this.voiceHandler.contextCommand$.subscribe(transcript => {
      const lower = transcript.toLowerCase().trim();
      if (lower.includes('volver') || lower.includes('atrás') || lower.includes('regresar')) {
        this.goBack(); // ✅ Ejecuta la misma lógica que el botón
      }
      if (lower.includes('leer') || lower.includes('información')) {
        // No hay función leer en NotFound, pero se puede añadir si se desea
      }
    });

    // ✅ Reproducir bienvenida solo si el micrófono está activo
    if (!this.voiceService.isCurrentlyMuted() && !this.welcomeShown) {
      this.welcomeShown = true;
      this.voiceService.speakWhenReady(context.activationMessage);
    }
  }

  goHome(): void {
    // ✅ Usar Router en lugar de window.location.href
    this.router.navigate(['/']);
  }

  goBack(): void {
    const prevUrl = this.previousRouteService.getPreviousUrl() as unknown as string | null;
    console.log('🔙 URL anterior válida:', prevUrl);

    if (prevUrl && prevUrl !== this.router.url) {
      console.log(`🔜 Navegando a: ${prevUrl}`);
      this.router.navigateByUrl(prevUrl);
      return;
    }

    if (window.history.length > 1) {
      console.log('🔜 Navegando a welcome');
      this.router.navigate(['/welcome']);
    } else {
      console.warn('⚠️ No hay historial, yendo a /');
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.contextSubscription?.unsubscribe();
    this.voiceContext.resetContext();
    console.log('🧹 NotFoundComponent destruido, contexto reseteado');
  }
}
