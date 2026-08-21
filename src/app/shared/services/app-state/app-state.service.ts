// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class AppStateService {
  
// }






// src/app/shared/services/app-state/app-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppStateService {
  private welcomeFirstLoadSubject = new BehaviorSubject<boolean>(true);
  public welcomeFirstLoad$ = this.welcomeFirstLoadSubject.asObservable();

  private micInitializedSubject = new BehaviorSubject<boolean>(false);
  public micInitialized$ = this.micInitializedSubject.asObservable();

  private welcomeMessageShownSubject = new BehaviorSubject<boolean>(false);
  public welcomeMessageShown$ = this.welcomeMessageShownSubject.asObservable();

  // ✅ NUEVO: Estado del mensaje de Firefox (visible/cerrado)
  private firefoxMessageVisibleSubject = new BehaviorSubject<boolean>(true);
  public firefoxMessageVisible$ = this.firefoxMessageVisibleSubject.asObservable();

  // ✅ NUEVO: Estado del navegador
  private browserInfo = {
    isFirefox: navigator.userAgent.toLowerCase().includes('firefox'),
    isChrome: navigator.userAgent.toLowerCase().includes('chrome') && 
              !navigator.userAgent.toLowerCase().includes('edge'),
    isEdge: navigator.userAgent.toLowerCase().includes('edge'),
    isSafari: navigator.userAgent.toLowerCase().includes('safari') && 
              !navigator.userAgent.toLowerCase().includes('chrome') &&
              !navigator.userAgent.toLowerCase().includes('edge')
  };

  get isWelcomeFirstLoad(): boolean {
    return this.welcomeFirstLoadSubject.value;
  }

  get isWelcomeMessageShown(): boolean {
    return this.welcomeMessageShownSubject.value;
  }

  // ✅ GETTERS para detección de navegador
  get isFirefox(): boolean {
    return this.browserInfo.isFirefox;
  }

  get isChrome(): boolean {
    return this.browserInfo.isChrome;
  }

  get isEdge(): boolean {
    return this.browserInfo.isEdge;
  }

  get isSafari(): boolean {
    return this.browserInfo.isSafari;
  }

  get browserName(): string {
    if (this.isFirefox) return 'Firefox';
    if (this.isEdge) return 'Edge';
    if (this.isChrome) return 'Chrome';
    if (this.isSafari) return 'Safari';
    return 'Navegador desconocido';
  }

  get isVoiceSupported(): boolean {
    // Firefox no soporta SpeechRecognition
    if (this.isFirefox) return false;
    return !!(window.SpeechRecognitionEvent || (window as any).webkitSpeechRecognition);
  }

  // ✅ NUEVO: Saber si el mensaje de Firefox está visible
  get isFirefoxMessageVisible(): boolean {
    return this.firefoxMessageVisibleSubject.value;
  }

  // ✅ NUEVO: Cerrar el mensaje de Firefox
  closeFirefoxMessage(): void {
    this.firefoxMessageVisibleSubject.next(false);
  }

  getVoiceUnsupportedMessage(): string {
    if (this.isFirefox) {
      return 'El reconocimiento de voz no está disponible en Firefox. Por favor, usa Chrome o Edge para usar comandos de voz.';
    }
    return 'El reconocimiento de voz no está disponible en este navegador.';
  }

  getWelcomeMessageForBrowser(defaultMessage: string): string {
    if (this.isFirefox) {
      // return 'Bienvenido a VoxAcción. El reconocimiento de voz no está disponible en Firefox. Por favor, usa Chrome o Edge para usar comandos de voz.';
      return `Bienvenido a VoxAcción. El reconocimiento de voz no está disponible en Firefox. 
              Puedes usar otro navegador. Edge, Òpera, o Chrome para usar comandos de voz.`;
    }
    return defaultMessage;
  }

  constructor() {
    // ✅ NO usar sessionStorage, solo estado en memoria
  }

  markWelcomeAsShown(): void {
    this.welcomeFirstLoadSubject.next(false);
    this.welcomeMessageShownSubject.next(true);
  }

  resetState(): void {
    this.welcomeFirstLoadSubject.next(true);
    this.micInitializedSubject.next(false);
    this.welcomeMessageShownSubject.next(false);
    this.firefoxMessageVisibleSubject.next(true); // ✅ Resetear mensaje de Firefox
  }
}