// // src/app/shared/components/transparent-toolbar/transparent-toolbar.component.ts

// import { Component, inject, Input, Output, EventEmitter, signal, computed, HostListener, ChangeDetectorRef, OnChanges, SimpleChanges, OnInit, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatBadgeModule } from '@angular/material/badge';
// import { AuthService } from '../../../../core/services/auth.service';
// import { VoiceService } from '../../../../features/services/voz/voice.service';
// import { ThemeService } from '../../../services/themes/themes.service';

// // ============================================================
// // INTERFACES
// // ============================================================

// export interface NavLink {
//   label: string;
//   route: string;
//   icon?: string;
//   roles?: string[];
// }

// export interface UserMenuItem {
//   label?: string;
//   icon?: string;
//   route?: string;
//   action?: () => void;
//   isDivider?: boolean;
//   class?: string;
//   roles?: string[];
//   actionId?: string;
// }

// export interface ToolbarConfig {
//   title?: string;
//   position?: 'fixed' | 'sticky' | 'relative';
//   backgroundColor?: string;
//   backgroundOpacity?: number;
//   showLogo?: boolean;
//   showThemeToggle?: boolean;
//   showMicToggle?: boolean;
//   showUserAvatar?: boolean;
//   showBackButton?: boolean;
//   showHelp?: boolean;
//   showSearch?: boolean;
//   showNotifications?: boolean;
//   showUserGreeting?: boolean;
//   greeting?: string;
//   userNameDisplay?: string;
//   userEmailDisplay?: string;
//   currentTimeDisplay?: string;
//   navLinks?: NavLink[];
//   userMenuItems?: UserMenuItem[];
//   unreadNotifications?: number;
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
//     MatTooltipModule,
//     MatDividerModule,
//     MatBadgeModule
//   ],
//   templateUrl: './transparent-toolbar.component.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   styleUrls: ['./transparent-toolbar.component.scss']
// })
// export class TransparentToolbarComponent implements OnChanges, OnInit {
//   // ============================================================
//   // INYECCIONES
//   // ============================================================
//   private router = inject(Router);
//   private cdr = inject(ChangeDetectorRef);
//   private authService = inject(AuthService);
//   private themeService = inject(ThemeService);
//   private voiceService = inject(VoiceService);

//   // ============================================================
//   // INPUTS
//   // ============================================================
//   @Input() config: ToolbarConfig = {};

//   @Input() title = 'VozAcción';
//   @Input() showLogo = true;
//   @Input() showThemeToggle = true;
//   @Input() showMicToggle = true;
//   @Input() showUserAvatar = true;
//   @Input() showBackButton = false;
//   @Input() showHelp = false;
//   @Input() showSearch = false;
//   @Input() showNotifications = false;
//   @Input() navLinks: NavLink[] = [];
//   @Input() backgroundColor = 'transparent';
//   @Input() position: 'fixed' | 'sticky' | 'relative' = 'fixed';
//   @Input() backgroundOpacity = 0.85;

//   @Input() greeting = '';
//   @Input() userNameDisplay = '';
//   @Input() userEmailDisplay = '';
//   @Input() currentTimeDisplay = '';
//   @Input() showUserGreeting = false;

//   @Input() userMenuItems: UserMenuItem[] = [];

//   // ============================================================
//   // OUTPUTS
//   // ============================================================
//   @Output() back = new EventEmitter<void>();
//   @Output() help = new EventEmitter<void>();
//   @Output() search = new EventEmitter<string>();
//   @Output() themeToggled = new EventEmitter<string>();
//   @Output() micToggled = new EventEmitter<boolean>();
//   @Output() notificationClick = new EventEmitter<void>();
//   @Output() login = new EventEmitter<void>();
//   @Output() logout = new EventEmitter<void>();
//   //
//   @Output() mobileMenuClick = new EventEmitter<void>();

//   // ============================================================
//   // ESTADO
//   // ============================================================
//   readonly isAuthenticated = this.authService.isAuthenticated;
//   readonly userName = computed(() => this.authService.getUserName() || 'Usuario');
//   readonly userEmail = computed(() => this.authService.getUserEmail() || 'usuario@email.com');
//   readonly isMicActive = signal(!this.voiceService.isCurrentlyMuted());
//   readonly isDarkTheme = computed(() => this.themeService.currentTheme() === 'dark');
//   readonly isMobileMenuOpen = signal(false);
//   readonly isSearchOpen = signal(false);
//   readonly isScrolled = signal(false);
//   unreadNotifications = 3;

//   // ✅ Roles del usuario (desde currentUser)
//   readonly userRoles = computed(() => {
//     const user = this.authService.currentUser();
//     return user?.roles || [];
//   });

//   // ============================================================
//   // SEÑAL PARA LA CONFIGURACIÓN RESUELTA (reactiva)
//   // ============================================================
//   private _resolvedConfig = signal<ToolbarConfig>({});

//   // Exponemos la señal como propiedad de solo lectura para el HTML
//   readonly resolvedConfig = this._resolvedConfig.asReadonly();

//     onMobileMenuClick(): void {
//     this.mobileMenuClick.emit();
//   }

//   // ============================================================
//   // HOST LISTENERS
//   // ============================================================
//   @HostListener('window:scroll', [])
//   onWindowScroll() {
//     this.isScrolled.set(window.scrollY > 50);
//   }

//   // ============================================================
//   // CICLO DE VIDA
//   // ============================================================
//   ngOnInit(): void {
//     this.updateResolvedConfig();
//   }

//   // ngOnChanges(changes: SimpleChanges): void {
//   //   if (changes['config'] || changes['userMenuItems'] || changes['navLinks']) {
//   //     this.updateResolvedConfig();
//   //   }
//   // }


//   //
//   ngOnChanges(changes: SimpleChanges): void {
//     // ✅ Si currentTimeDisplay cambió, actualizar la configuración
//     if (changes['currentTimeDisplay']) {
//       this.updateResolvedConfig();
//     }
    
//     if (changes['config'] || changes['userMenuItems'] || changes['navLinks']) {
//       this.updateResolvedConfig();
//     }
//   }

//   // ============================================================
//   // MÉTODOS PRIVADOS
//   // ============================================================

//   /**
//    * Construye la configuración final combinando inputs y config,
//    * aplica el filtro de roles y actualiza la señal.
//    */
//   private updateResolvedConfig(): void {
//     const c = this.config || {};
//     const result = {
//       title: this.title !== 'VozAcción' || c.title === undefined ? this.title : c.title,
//       position: this.position || c.position,
//       backgroundColor: this.backgroundColor || c.backgroundColor,
//       backgroundOpacity: this.backgroundOpacity ?? c.backgroundOpacity,

//       // ✅ AHORA EL JSON TIENE PRIORIDAD SOBRE LOS INPUTS POR DEFECTO
//       showLogo: c.showLogo ?? this.showLogo,
//       showThemeToggle: c.showThemeToggle ?? this.showThemeToggle,
//       showMicToggle: c.showMicToggle ?? this.showMicToggle,
//       showUserAvatar: c.showUserAvatar ?? this.showUserAvatar,
//       showBackButton: c.showBackButton ?? this.showBackButton,
//       showHelp: c.showHelp ?? this.showHelp,
//       showSearch: c.showSearch ?? this.showSearch,
//       showNotifications: c.showNotifications ?? this.showNotifications,
//       showUserGreeting: c.showUserGreeting ?? this.showUserGreeting,

//       greeting: this.greeting || c.greeting,
//       userNameDisplay: this.userNameDisplay || c.userNameDisplay,
//       userEmailDisplay: this.userEmailDisplay || c.userEmailDisplay,
//       currentTimeDisplay: this.currentTimeDisplay || c.currentTimeDisplay,
//       navLinks: this.navLinks.length ? this.navLinks : c.navLinks || [],
//       userMenuItems: this.userMenuItems.length ? this.userMenuItems : c.userMenuItems || [],
//       unreadNotifications: this.unreadNotifications ?? c.unreadNotifications,
//     };

//     const userRoles = this.userRoles();

//     // Filtrar por roles
//     const filteredNavLinks = this.filterByRoles(result.navLinks, userRoles);
//     const filteredUserMenuItems = this.filterByRoles(result.userMenuItems, userRoles);

//     // Actualizar la señal
//     this._resolvedConfig.set({
//       ...result,
//       navLinks: filteredNavLinks,
//       userMenuItems: filteredUserMenuItems,
//     });

//     // ✅ FORZAR DETECCIÓN DE CAMBIOS PARA QUE EL MENÚ SE ACTUALICE
//     this.cdr.detectChanges();
//   }

//   /**
//    * Función auxiliar para filtrar arrays de items por roles.
//    */
//   private filterByRoles<T extends { roles?: string[] }>(items: T[], userRoles: string[]): T[] {
//     if (!items || items.length === 0) return [];
//     if (!userRoles || userRoles.length === 0) {
//       return items.filter(item => !item.roles || item.roles.length === 0);
//     }
//     return items.filter(item => {
//       if (!item.roles || item.roles.length === 0) return true;
//       return item.roles.some(role => userRoles.includes(role));
//     });
//   }

//   // ============================================================
//   // GETTERS (para compatibilidad con el HTML, aunque usamos señales)
//   // ============================================================
//   get backgroundColorStyle(): string {
//     if (this.backgroundColor === 'transparent') {
//       return `rgba(var(--bg-rgb, 255, 255, 255), ${this.backgroundOpacity})`;
//     }
//     return this.backgroundColor;
//   }

//   get toolbarClasses(): string {
//     const classes = [
//       `position-${this.position}`,
//       this.isDarkTheme() ? 'dark' : 'light',
//       this.isScrolled() ? 'scrolled' : ''
//     ];
//     if (this.backgroundColor === 'transparent') {
//       classes.push('transparent');
//     }
//     return classes.join(' ');
//   }

//   // ============================================================
//   // MÉTODOS PÚBLICOS
//   // ============================================================
//   toggleTheme(): void {
//     this.themeService.toggleTheme();
//     this.themeToggled.emit(this.themeService.currentTheme());
//   }

//   toggleMic(): void {
//     this.voiceService.toggleMute();
//     this.isMicActive.set(!this.voiceService.isCurrentlyMuted());
//     this.micToggled.emit(this.isMicActive());
//   }

//   toggleSearch(): void {
//     this.isSearchOpen.set(!this.isSearchOpen());
//     if (!this.isSearchOpen()) {
//       this.search.emit('');
//     }
//   }

//   closeSearch(): void {
//     this.isSearchOpen.set(false);
//     this.search.emit('');
//   }

//   onSearchInput(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     this.search.emit(input.value);
//   }

//   onSearchSubmit(event: Event): void {
//     const input = event.target as HTMLInputElement;
//     this.search.emit(input.value);
//     this.isSearchOpen.set(false);
//   }

//   toggleMobileMenu(): void {
//     this.isMobileMenuOpen.set(!this.isMobileMenuOpen());
//   }

//   closeMobileMenu(): void {
//     this.isMobileMenuOpen.set(false);
//   }

//   onBack(): void {
//     this.back.emit();
//     window.history.back();
//   }

//   onHelp(): void {
//     this.help.emit();
//   }

//   onNotificationClick(): void {
//     this.unreadNotifications = 0;
//     this.notificationClick.emit();
//   }

//   onLogin(): void {
//     this.login.emit();
//     this.router.navigate(['/login']);
//   }

//   onLogout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         this.voiceService.clearTranscript();
//         this.logout.emit();
//         this.router.navigate(['/login']);
//       },
//       error: () => {
//         this.authService.fullLocalLogout();
//         this.logout.emit();
//         this.router.navigate(['/login']);
//       }
//     });
//   }

//   isActiveRoute(route: string): boolean {
//     return this.router.url.startsWith(route);
//   }
// }












// src/app/shared/components/transparent-toolbar/transparent-toolbar.component.ts

import { Component, inject, Input, Output, EventEmitter, signal, computed, HostListener, ChangeDetectorRef, OnChanges, SimpleChanges, OnInit, ChangeDetectionStrategy } from '@angular/core';
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
// ✅ AÑADIDO: IMPORTAR SERVICIO DE PREFERENCIAS
import { UserPreferencesService } from '../../../services/user-preferences/user-preferences.service';

// ============================================================
// INTERFACES
// ============================================================

export interface NavLink {
  label: string;
  route: string;
  icon?: string;
  roles?: string[];
}

export interface UserMenuItem {
  label?: string;
  icon?: string;
  route?: string;
  action?: () => void;
  isDivider?: boolean;
  class?: string;
  roles?: string[];
  actionId?: string;
}

export interface ToolbarConfig {
  title?: string;
  position?: 'fixed' | 'sticky' | 'relative';
  backgroundColor?: string;
  backgroundOpacity?: number;
  showLogo?: boolean;
  showThemeToggle?: boolean;
  showMicToggle?: boolean;
  showUserAvatar?: boolean;
  showBackButton?: boolean;
  showHelp?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserGreeting?: boolean;
  greeting?: string;
  userNameDisplay?: string;
  userEmailDisplay?: string;
  currentTimeDisplay?: string;
  navLinks?: NavLink[];
  userMenuItems?: UserMenuItem[];
  unreadNotifications?: number;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./transparent-toolbar.component.scss']
})
export class TransparentToolbarComponent implements OnChanges, OnInit {
  // ============================================================
  // INYECCIONES
  // ============================================================
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private voiceService = inject(VoiceService);
  // ✅ AÑADIDO: INYECTAR SERVICIO DE PREFERENCIAS
  private userPreferences = inject(UserPreferencesService);

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
  @Input() navLinks: NavLink[] = [];
  @Input() backgroundColor = 'transparent';
  @Input() position: 'fixed' | 'sticky' | 'relative' = 'fixed';
  @Input() backgroundOpacity = 0.85;

  @Input() greeting = '';
  @Input() userNameDisplay = '';
  @Input() userEmailDisplay = '';
  @Input() currentTimeDisplay = '';
  @Input() showUserGreeting = false;

  @Input() userMenuItems: UserMenuItem[] = [];

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
  @Output() mobileMenuClick = new EventEmitter<void>();

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

  readonly userRoles = computed(() => {
    const user = this.authService.currentUser();
    return user?.roles || [];
  });

  // ============================================================
  // SEÑAL PARA LA CONFIGURACIÓN RESUELTA
  // ============================================================
  private _resolvedConfig = signal<ToolbarConfig>({});
  readonly resolvedConfig = this._resolvedConfig.asReadonly();

  onMobileMenuClick(): void {
    this.mobileMenuClick.emit();
  }

  // ============================================================
  // HOST LISTENERS
  // ============================================================
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

  // ============================================================
  // CICLO DE VIDA
  // ============================================================
  ngOnInit(): void {
    this.updateResolvedConfig();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTimeDisplay']) {
      this.updateResolvedConfig();
    }
    
    if (changes['config'] || changes['userMenuItems'] || changes['navLinks']) {
      this.updateResolvedConfig();
    }
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================

  private updateResolvedConfig(): void {
    const c = this.config || {};
    const result = {
      title: this.title !== 'VozAcción' || c.title === undefined ? this.title : c.title,
      position: this.position || c.position,
      backgroundColor: this.backgroundColor || c.backgroundColor,
      backgroundOpacity: this.backgroundOpacity ?? c.backgroundOpacity,

      showLogo: c.showLogo ?? this.showLogo,
      showThemeToggle: c.showThemeToggle ?? this.showThemeToggle,
      showMicToggle: c.showMicToggle ?? this.showMicToggle,
      showUserAvatar: c.showUserAvatar ?? this.showUserAvatar,
      showBackButton: c.showBackButton ?? this.showBackButton,
      showHelp: c.showHelp ?? this.showHelp,
      showSearch: c.showSearch ?? this.showSearch,
      showNotifications: c.showNotifications ?? this.showNotifications,
      showUserGreeting: c.showUserGreeting ?? this.showUserGreeting,

      greeting: this.greeting || c.greeting,
      userNameDisplay: this.userNameDisplay || c.userNameDisplay,
      userEmailDisplay: this.userEmailDisplay || c.userEmailDisplay,
      currentTimeDisplay: this.currentTimeDisplay || c.currentTimeDisplay,
      navLinks: this.navLinks.length ? this.navLinks : c.navLinks || [],
      userMenuItems: this.userMenuItems.length ? this.userMenuItems : c.userMenuItems || [],
      unreadNotifications: this.unreadNotifications ?? c.unreadNotifications,
    };

    const userRoles = this.userRoles();

    const filteredNavLinks = this.filterByRoles(result.navLinks, userRoles);
    const filteredUserMenuItems = this.filterByRoles(result.userMenuItems, userRoles);

    this._resolvedConfig.set({
      ...result,
      navLinks: filteredNavLinks,
      userMenuItems: filteredUserMenuItems,
    });

    this.cdr.detectChanges();
  }

  private filterByRoles<T extends { roles?: string[] }>(items: T[], userRoles: string[]): T[] {
    if (!items || items.length === 0) return [];
    if (!userRoles || userRoles.length === 0) {
      return items.filter(item => !item.roles || item.roles.length === 0);
    }
    return items.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.some(role => userRoles.includes(role));
    });
  }

  // ============================================================
  // GETTERS
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
  // MÉTODOS PÚBLICOS
  // ============================================================

  /**
   * ✅ Toggle tema CON GUARDADO DE PREFERENCIAS (MODIFICADO)
   */
  toggleTheme(): void {
    this.themeService.toggleTheme();
    const newTheme = this.themeService.currentTheme();
    this.themeToggled.emit(newTheme);
    
    // ✅ AÑADIDO: GUARDAR PREFERENCIA
    this.userPreferences.updatePreference('theme', newTheme as 'light' | 'dark').subscribe({
      next: () => console.log('✅ Tema guardado desde toolbar:', newTheme),
      error: (error) => console.error('❌ Error guardando tema desde toolbar:', error)
    });
  }

  /**
   * ✅ Toggle micrófono CON GUARDADO DE PREFERENCIAS (MODIFICADO)
   */
  toggleMic(): void {
    this.voiceService.toggleMute();
    const isActive = !this.voiceService.isCurrentlyMuted();
    this.isMicActive.set(isActive);
    this.micToggled.emit(isActive);
    
    // ✅ AÑADIDO: GUARDAR PREFERENCIA
    this.userPreferences.updatePreference('micEnabled', isActive).subscribe({
      next: () => console.log('✅ Micrófono guardado desde toolbar:', isActive),
      error: (error) => console.error('❌ Error guardando micrófono desde toolbar:', error)
    });
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