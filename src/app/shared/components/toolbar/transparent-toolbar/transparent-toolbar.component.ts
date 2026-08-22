// // src/app/shared/components/transparent-toolbar/transparent-toolbar.component.ts
// import { Component, inject, Input, Output, EventEmitter, signal, computed } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatMenuModule } from '@angular/material/menu';
// import { AuthService } from '../../../../core/services/auth.service';
// import { VoiceService } from '../../../../features/services/voz/voice.service';
// import { ThemeService } from '../../../services/themes/themes.service';
// import { MatDivider } from "@angular/material/divider";

// export interface ToolbarConfig {
//   /** Título de la aplicación */
//   title?: string;
//   /** Mostrar logo */
//   showLogo?: boolean;
//   /** Mostrar botón de tema */
//   showThemeToggle?: boolean;
//   /** Mostrar botón de micrófono */
//   showMicToggle?: boolean;
//   /** Mostrar avatar de usuario */
//   showUserAvatar?: boolean;
//   /** Mostrar botón de volver */
//   showBackButton?: boolean;
//   /** Mostrar botón de ayuda */
//   showHelp?: boolean;
//   /** Enlaces de navegación (solo para escritorio) */
//   navLinks?: Array<{ label: string; route: string; icon?: string }>;
//   /** Color de fondo personalizado */
//   backgroundColor?: string;
//   /** Posición (fixed, sticky, relative) */
//   position?: 'fixed' | 'sticky' | 'relative';
//   /** Opacidad del fondo (0-1) */
//   backgroundOpacity?: number;
// }

// @Component({
//   selector: 'app-transparent-toolbar',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule,
//     MatToolbarModule,
//     MatIconModule,
//     MatButtonModule,
//     MatMenuModule,
//     MatDivider
// ],
//   templateUrl: './transparent-toolbar.component.html',
//   styleUrls: ['./transparent-toolbar.component.scss']
// })
// export class TransparentToolbarComponent {
//   private authService = inject(AuthService);
//   private themeService = inject(ThemeService);
//   private voiceService = inject(VoiceService);

//   // ============================================================
//   // INPUTS (configuración)
//   // ============================================================
  
//   @Input() config: ToolbarConfig = {};
//   @Input() title = 'VozAcción';
//   @Input() showLogo = true;
//   @Input() showThemeToggle = true;
//   @Input() showMicToggle = true;
//   @Input() showUserAvatar = true;
//   @Input() showBackButton = false;
//   @Input() showHelp = false;
//   @Input() navLinks: Array<{ label: string; route: string; icon?: string }> = [];
//   @Input() backgroundColor = 'transparent';
//   @Input() position: 'fixed' | 'sticky' | 'relative' = 'fixed';
//   @Input() backgroundOpacity = 0.8;

//   // ============================================================
//   // OUTPUTS (eventos)
//   // ============================================================
  
//   @Output() back = new EventEmitter<void>();
//   @Output() help = new EventEmitter<void>();
//   @Output() themeToggled = new EventEmitter<string>();
//   @Output() micToggled = new EventEmitter<boolean>();
//   @Output() login = new EventEmitter<void>();
//   @Output() logout = new EventEmitter<void>();

//   // ============================================================
//   // ESTADO
//   // ============================================================
  
//   readonly isAuthenticated = this.authService.isAuthenticated;
//   readonly userName = computed(() => this.authService.getUserName());
//   readonly isMicActive = signal(!this.voiceService.isCurrentlyMuted());
//   readonly isDarkTheme = computed(() => this.themeService.currentTheme() === 'dark');

//   // ============================================================
//   // MÉTODOS
//   // ============================================================

//   get isLightTheme(): boolean {
//     return !this.isDarkTheme;
//   }

//   get backgroundColorStyle(): string {
//     if (this.backgroundColor === 'transparent') {
//       return `rgba(var(--bg-rgb, 255, 255, 255), ${this.backgroundOpacity})`;
//     }
//     return this.backgroundColor;
//   }

//   get toolbarClasses(): string {
//     const classes = [
//       `position-${this.position}`,
//       this.isDarkTheme() ? 'dark' : 'light'
//     ];
//     if (this.backgroundColor === 'transparent') {
//       classes.push('transparent');
//     }
//     return classes.join(' ');
//   }

//   toggleTheme(): void {
//     this.themeService.toggleTheme();
//     this.themeToggled.emit(this.themeService.currentTheme());
//   }

//   toggleMic(): void {
//     this.voiceService.toggleMute();
//     this.isMicActive.set(!this.voiceService.isCurrentlyMuted());
//     this.micToggled.emit(this.isMicActive());
//   }

//   onBack(): void {
//     this.back.emit();
//   }

//   onHelp(): void {
//     this.help.emit();
//   }

//   onLogin(): void {
//     this.login.emit();
//   }

//   onLogout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         this.voiceService.clearTranscript();
//         this.logout.emit();
//       },
//       error: () => {
//         this.authService.fullLocalLogout();
//         this.logout.emit();
//       }
//     });
//   }

//   isActiveRoute(route: string): boolean {
//     // Se inyecta Router en el constructor o se usa inject
//     // Lo haremos en el constructor
//     return false; // Se implementa en el constructor
//   }
// }
















// src/app/shared/components/transparent-toolbar/transparent-toolbar.component.ts

import { Component, inject, Input, Output, EventEmitter, signal, computed, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../../core/services/auth.service';
import { VoiceService } from '../../../../features/services/voz/voice.service';
import { ThemeService } from '../../../services/themes/themes.service';

export interface ToolbarConfig {
  title?: string;
  showLogo?: boolean;
  showThemeToggle?: boolean;
  showMicToggle?: boolean;
  showUserAvatar?: boolean;
  showBackButton?: boolean;
  showHelp?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  navLinks?: Array<{ label: string; route: string; icon?: string }>;
  backgroundColor?: string;
  position?: 'fixed' | 'sticky' | 'relative';
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
    MatTooltipModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './transparent-toolbar.component.html',
  styleUrls: ['./transparent-toolbar.component.scss']
})
export class TransparentToolbarComponent {
  // ============================================================
  // INYECCIONES
  // ============================================================
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private voiceService = inject(VoiceService);

  // ============================================================
  // INPUTS
  // ============================================================
  @Input() config: ToolbarConfig = {};
  @Input() title = 'VozAcción';
  @Input() showLogo = true;
  @Input() showThemeToggle = true;
  @Input() showMicToggle = true;
  @Input() showUserAvatar = true;
  @Input() showBackButton = false;
  @Input() showHelp = false;
  @Input() showSearch = false;
  @Input() showNotifications = false;
  @Input() navLinks: Array<{ label: string; route: string; icon?: string }> = [];
  @Input() backgroundColor = 'transparent';
  @Input() position: 'fixed' | 'sticky' | 'relative' = 'fixed';
  @Input() backgroundOpacity = 0.85;

  // ============================================================
  // OUTPUTS
  // ============================================================
  @Output() back = new EventEmitter<void>();
  @Output() help = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() themeToggled = new EventEmitter<string>();
  @Output() micToggled = new EventEmitter<boolean>();
  @Output() notificationClick = new EventEmitter<void>();
  @Output() login = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  //
  // ✅ NUEVOS INPUTS PARA EL SALUDO
  @Input() greeting: string = '';
  @Input() userNameDisplay: string = '';
  @Input() userEmailDisplay: string = '';
  @Input() currentTimeDisplay: string = '';
  @Input() showUserGreeting: boolean = false;

  // ============================================================
  // ESTADO
  // ============================================================
  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly userName = computed(() => this.authService.getUserName() || 'Usuario');
  readonly userEmail = computed(() => this.authService.getUserEmail() || 'usuario@email.com');
  readonly isMicActive = signal(!this.voiceService.isCurrentlyMuted());
  readonly isDarkTheme = computed(() => this.themeService.currentTheme() === 'dark');
  readonly isMobileMenuOpen = signal(false);
  readonly isSearchOpen = signal(false);
  readonly isScrolled = signal(false);
  unreadNotifications = 3;

  // ============================================================
  // HOST LISTENERS
  // ============================================================
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  // ============================================================
  // COMPUTED PROPS
  // ============================================================
  get backgroundColorStyle(): string {
    if (this.backgroundColor === 'transparent') {
      return `rgba(var(--bg-rgb, 255, 255, 255), ${this.backgroundOpacity})`;
    }
    return this.backgroundColor;
  }

  get toolbarClasses(): string {
    const classes = [
      `position-${this.position}`,
      this.isDarkTheme() ? 'dark' : 'light',
      this.isScrolled() ? 'scrolled' : ''
    ];
    if (this.backgroundColor === 'transparent') {
      classes.push('transparent');
    }
    return classes.join(' ');
  }

  // ============================================================
  // MÉTODOS
  // ============================================================
  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.themeToggled.emit(this.themeService.currentTheme());
  }

  toggleMic(): void {
    this.voiceService.toggleMute();
    this.isMicActive.set(!this.voiceService.isCurrentlyMuted());
    this.micToggled.emit(this.isMicActive());
  }

  toggleSearch(): void {
    this.isSearchOpen.set(!this.isSearchOpen());
    if (!this.isSearchOpen()) {
      this.search.emit('');
    }
  }

  closeSearch(): void {
    this.isSearchOpen.set(false);
    this.search.emit('');
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search.emit(input.value);
  }

  onSearchSubmit(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.search.emit(input.value);
    this.isSearchOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  onBack(): void {
    this.back.emit();
    window.history.back();
  }

  onHelp(): void {
    this.help.emit();
  }

  onNotificationClick(): void {
    this.unreadNotifications = 0;
    this.notificationClick.emit();
  }

  onLogin(): void {
    this.login.emit();
    this.router.navigate(['/login']);
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.voiceService.clearTranscript();
        this.logout.emit();
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.fullLocalLogout();
        this.logout.emit();
        this.router.navigate(['/login']);
      }
    });
  }

  isActiveRoute(route: string): boolean {
    return this.router.url.startsWith(route);
  }
}