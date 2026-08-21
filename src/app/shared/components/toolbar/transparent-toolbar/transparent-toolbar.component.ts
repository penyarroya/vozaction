// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-transparent-toolbar',
//   imports: [],
//   templateUrl: './transparent-toolbar.component.html',
//   styleUrl: './transparent-toolbar.component.scss',
// })
// export class TransparentToolbarComponent {

// }




// src/app/shared/components/transparent-toolbar/transparent-toolbar.component.ts
import { Component, inject, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../../../core/services/auth.service';
import { VoiceService } from '../../../../features/services/voz/voice.service';
import { ThemeService } from '../../../services/themes/themes.service';
import { MatDivider } from "@angular/material/divider";

export interface ToolbarConfig {
  /** Título de la aplicación */
  title?: string;
  /** Mostrar logo */
  showLogo?: boolean;
  /** Mostrar botón de tema */
  showThemeToggle?: boolean;
  /** Mostrar botón de micrófono */
  showMicToggle?: boolean;
  /** Mostrar avatar de usuario */
  showUserAvatar?: boolean;
  /** Mostrar botón de volver */
  showBackButton?: boolean;
  /** Mostrar botón de ayuda */
  showHelp?: boolean;
  /** Enlaces de navegación (solo para escritorio) */
  navLinks?: Array<{ label: string; route: string; icon?: string }>;
  /** Color de fondo personalizado */
  backgroundColor?: string;
  /** Posición (fixed, sticky, relative) */
  position?: 'fixed' | 'sticky' | 'relative';
  /** Opacidad del fondo (0-1) */
  backgroundOpacity?: number;
}

@Component({
  selector: 'app-transparent-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDivider
],
  templateUrl: './transparent-toolbar.component.html',
  styleUrls: ['./transparent-toolbar.component.scss']
})
export class TransparentToolbarComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private voiceService = inject(VoiceService);

  // ============================================================
  // INPUTS (configuración)
  // ============================================================
  
  @Input() config: ToolbarConfig = {};
  @Input() title = 'VozAcción';
  @Input() showLogo = true;
  @Input() showThemeToggle = true;
  @Input() showMicToggle = true;
  @Input() showUserAvatar = true;
  @Input() showBackButton = false;
  @Input() showHelp = false;
  @Input() navLinks: Array<{ label: string; route: string; icon?: string }> = [];
  @Input() backgroundColor = 'transparent';
  @Input() position: 'fixed' | 'sticky' | 'relative' = 'fixed';
  @Input() backgroundOpacity = 0.8;

  // ============================================================
  // OUTPUTS (eventos)
  // ============================================================
  
  @Output() back = new EventEmitter<void>();
  @Output() help = new EventEmitter<void>();
  @Output() themeToggled = new EventEmitter<string>();
  @Output() micToggled = new EventEmitter<boolean>();
  @Output() login = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  // ============================================================
  // ESTADO
  // ============================================================
  
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly userName = computed(() => this.authService.getUserName());
  readonly isMicActive = signal(!this.voiceService.isCurrentlyMuted());
  readonly isDarkTheme = computed(() => this.themeService.currentTheme() === 'dark');

  // ============================================================
  // MÉTODOS
  // ============================================================

  get isLightTheme(): boolean {
    return !this.isDarkTheme;
  }

  get backgroundColorStyle(): string {
    if (this.backgroundColor === 'transparent') {
      return `rgba(var(--bg-rgb, 255, 255, 255), ${this.backgroundOpacity})`;
    }
    return this.backgroundColor;
  }

  get toolbarClasses(): string {
    const classes = [
      `position-${this.position}`,
      this.isDarkTheme() ? 'dark' : 'light'
    ];
    if (this.backgroundColor === 'transparent') {
      classes.push('transparent');
    }
    return classes.join(' ');
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.themeToggled.emit(this.themeService.currentTheme());
  }

  toggleMic(): void {
    this.voiceService.toggleMute();
    this.isMicActive.set(!this.voiceService.isCurrentlyMuted());
    this.micToggled.emit(this.isMicActive());
  }

  onBack(): void {
    this.back.emit();
  }

  onHelp(): void {
    this.help.emit();
  }

  onLogin(): void {
    this.login.emit();
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.voiceService.clearTranscript();
        this.logout.emit();
      },
      error: () => {
        this.authService.fullLocalLogout();
        this.logout.emit();
      }
    });
  }

  isActiveRoute(route: string): boolean {
    // Se inyecta Router en el constructor o se usa inject
    // Lo haremos en el constructor
    return false; // Se implementa en el constructor
  }
}