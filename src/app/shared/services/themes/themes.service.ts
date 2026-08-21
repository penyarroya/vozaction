import { Injectable, signal, computed } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // 1. Reemplazamos los BehaviorSubjects por Signals reactivos
  private themeSignal = signal<Theme>('light');
  private visibilitySignal = signal<boolean>(false);

  // 2. Exponemos Signals de solo lectura para los componentes (Zoneless friendly)
  public readonly currentTheme = computed(() => this.themeSignal());
  public readonly isButtonVisible = computed(() => this.visibilitySignal());

  constructor() {
    // Validamos que exista localStorage (útil por si en el futuro activas SSR)
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved) {
        this.setTheme(saved);
      }
    }
  }

  toggleTheme(): void {
    const next = this.themeSignal() === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: Theme): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    
    // Sincronizamos exactamente con tus clases de themes.scss
    if (theme === 'dark') {
      html.classList.add('dark-theme');
    } else {
      html.classList.remove('dark-theme');
    }

    localStorage.setItem('theme', theme);
    this.themeSignal.set(theme); // Actualiza el estado reactivo
  }

  /**
   * Controla la visibilidad del botón de tema de forma global
   */
  setVisibility(visible: boolean): void {
    this.visibilitySignal.set(visible);
  }
}
