import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface VoiceContext {
  /** Mensaje que se reproduce al activar el micrófono */
  activationMessage: string;
  /** Lista de comandos disponibles en esta página */
  availableCommands: string[];
  /** Si es true, el orquestador NO enviará comandos al backend */
  preventBackend?: boolean; // ← NUEVA PROPIEDAD (opcional)
}

@Injectable({
  providedIn: 'root',
})
export class VoiceContextService {
  private contextSubject = new BehaviorSubject<VoiceContext>({
    activationMessage: 'Micrófono activado. Puedes usar comandos de voz.',
    availableCommands: []
  });

  public context$ = this.contextSubject.asObservable();

  /**
   * Establece el contexto de voz para la página actual
   */
  setContext(context: VoiceContext): void {
    this.contextSubject.next(context);
  }

  /**
   * Obtiene el contexto actual
   */
  getContext(): VoiceContext {
    return this.contextSubject.value;
  }

  /**
   * Resetea el contexto al valor por defecto
   */
  resetContext(): void {
    this.contextSubject.next({
      activationMessage: 'Micrófono activado. Puedes usar comandos de voz.',
      availableCommands: []
    });
  }
}
