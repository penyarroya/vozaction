import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

// ============================================================
// 🔧 MOCKS GLOBALES PARA PRUEBAS
// ============================================================

// Mock para SpeechSynthesis (necesario para VoiceService)
Object.defineProperty(window, 'speechSynthesis', {
  value: {
    speak: () => {},
    cancel: () => {},
    getVoices: () => [],
  },
  writable: true,
});

// Mock para SpeechRecognition (necesario para VoiceService)
Object.defineProperty(window, 'SpeechRecognition', {
  value: class {
    continuous = false;
    interimResults = false;
    lang = 'es-ES';
    maxAlternatives = 1;
    start = () => {};
    stop = () => {};
    abort = () => {};
    onresult = () => {};
    onerror = () => {};
    onend = () => {};
    onstart = () => {};
  },
  writable: true,
});

// Mock para webkitSpeechRecognition (para compatibilidad)
Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: window.SpeechRecognition,
  writable: true,
});

// ============================================================
// 📦 PROVIDERS BASE PARA PRUEBAS
// ============================================================

export const baseTestProviders = [
  provideRouter([]),
  provideHttpClient(),
  provideHttpClientTesting(),
];