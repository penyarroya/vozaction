// // src/app/features/pages/public/dashboard-v2/dashboard-v2.component.ts

// import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';

// // Angular Material
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatBadgeModule } from '@angular/material/badge';

// // Servicios y modelos
// import { AuthService } from '../../../../core/services/auth.service';
// import { ThemeService } from '../../../../shared/services/themes/themes.service';
// import { VoiceService } from '../../../services/voz/voice.service';
// import { VoiceContextService } from '../../../services/voz/voice-context.service';
// import { ProjectConfig, StatsCard, Course, QuickAction } from '../../../models/dashboard-v2/project-config.model';
// import { ProjectConfigService } from '../../../services/dashboard-v2/project-config.service';
// import { TransparentToolbarComponent } from "../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component";

// // ✅ IMPORTAR HTTP CLIENT
// import { HttpClient } from '@angular/common/http';
// import { ToolbarConfig, UserMenuItem } from '../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';

// // ✅ INTERFAZ PARA CONFIGURACIÓN EXTERNA (con actionId)
// export interface ExternalToolbarConfig extends ToolbarConfig {
//   userMenuItems?: (UserMenuItem & { actionId?: string })[];
// }

// // ✅ INTERFAZ PARA SIDEBAR
// interface SidebarItem {
//   id: string;
//   label: string;
//   icon: string;
//   roles?: string[];
// }

// @Component({
//   selector: 'app-dashboard-v2',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule,
//     MatButtonModule,
//     MatIconModule,
//     MatCardModule,
//     MatDividerModule,
//     MatProgressBarModule,
//     MatTooltipModule,
//     MatBadgeModule,
//     TransparentToolbarComponent
//   ],
//   templateUrl: './dashboard-v2.component.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   styleUrls: ['./dashboard-v2.component.scss']
// })
// export class DashboardV2Component implements OnInit, OnDestroy {
//   // ============================================================
//   // INYECCIONES
//   // ============================================================
//   public router = inject(Router);
//   private ngZone = inject(NgZone);
//   private cdr = inject(ChangeDetectorRef);
//   public voiceService = inject(VoiceService);
//   private voiceContext = inject(VoiceContextService);
//   private authService = inject(AuthService);
//   private themeService = inject(ThemeService);
//   private projectConfigService = inject(ProjectConfigService);
//   private http = inject(HttpClient);  // ✅ AÑADIR

//   // ============================================================
//   // VARIABLES PRIVADAS
//   // ============================================================
//   private destroy$ = new Subject<void>();
//   private welcomeShown = false;
//   private isDestroyed = false;
//   private timeInterval: any;

//   // ✅ MAPA DE ACCIONES
//   private actionMap: { [key: string]: () => void } = {
//     logout: () => this.logout(),
//   };

//   // ============================================================
//   // ESTADO PÚBLICO
//   // ============================================================
//   currentTime = new Date();
//   greeting = '';
//   currentTimeDisplay: string = '';
//   isDarkTheme = this.themeService.currentTheme() === 'dark';
//   isMicActive = !this.voiceService.isCurrentlyMuted();
//   activeSection: string = 'dashboard';
//   isSidebarCollapsed = false;
//   isSidebarOpen = false;

//   // Configuración del proyecto
//   projectConfig: ProjectConfig | null = null;
//   availableProjects: string[] = ['informatica', 'huertos', 'salud', 'finanzas'];
//   currentProjectId: string = 'informatica';

//   // ✅ CONFIGURACIÓN DEL TOOLBAR
//   toolbarConfig: ToolbarConfig = {};

//   // ✅ CONFIGURACIÓN DEL SIDEBAR
//   sidebarItems: SidebarItem[] = [];

//   // Datos del proyecto
//   statsCards: StatsCard[] = [];
//   myCourses: Course[] = [];
//   quickActions: QuickAction[] = [];
//   isLoading: boolean = true;

//   // ============================================================
//   // GETTERS
//   // ============================================================
//   get userName(): string {
//     return this.authService.getUserName() || 'Usuario';
//   }

//   get userEmail(): string {
//     return this.authService.getUserEmail() || 'usuario@ejemplo.com';
//   }

//   get formattedCurrentTime(): string {
//     return this.currentTimeDisplay;
//   }

//   // ============================================================
//   // OBTENER ROLES DEL USUARIO
//   // ============================================================
//   private getUserRoles(): string[] {
//     const user = this.authService.currentUser();
//     return user?.roles || [];
//   }

//   private filterItemsByRoles<T extends { roles?: string[] }>(items: T[]): T[] {
//     const userRoles = this.getUserRoles();
//     return items.filter(item => {
//       if (!item.roles || item.roles.length === 0) return true;
//       return item.roles.some(role => userRoles.includes(role));
//     });
//   }

//   // ============================================================
//   // ✅ CARGA DE CONFIGURACIÓN DEL TOOLBAR DESDE JSON
//   // ============================================================
//   private loadToolbarConfig(): void {
//     console.log('📂 [DashboardV2] Cargando toolbar desde: /config/dashboard-v2/toolbar-config.json');
    
//     this.http.get<ExternalToolbarConfig>('/config/dashboard-v2/toolbar-config.json')
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (config) => {
//           let userMenuItems = config.userMenuItems?.map(item => {
//             if (item.actionId && this.actionMap[item.actionId]) {
//               return { ...item, action: this.actionMap[item.actionId] };
//             }
//             if (item.actionId && !this.actionMap[item.actionId]) {
//               console.warn(`⚠️ Acción no mapeada: ${item.actionId}`);
//               const { actionId, ...rest } = item;
//               return rest;
//             }
//             return item;
//           }) || [];

//           const navLinks = this.filterItemsByRoles(config.navLinks || []);
//           userMenuItems = this.filterItemsByRoles(userMenuItems);

//           this.toolbarConfig = {
//             ...config,
//             navLinks,
//             userMenuItems
//           };

//           console.log('✅ Toolbar config cargada:', this.toolbarConfig);
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error('❌ Error al cargar configuración del toolbar:', err);
//           this.toolbarConfig = this.getDefaultToolbarConfig();
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   private getDefaultToolbarConfig(): ToolbarConfig {
//     return {
//       title: 'Centro de Ayuda Digital',
//       showLogo: true,
//       showThemeToggle: true,
//       showMicToggle: true,
//       showUserAvatar: true,
//       showBackButton: false,
//       showHelp: true,
//       navLinks: [
//         { label: 'Dashboard', route: '/dashboard-v2', icon: 'dashboard', roles: ['USER'] }
//       ],
//       userMenuItems: [
//         { label: 'Mi Perfil', icon: 'person', route: '/profile' },
//         { label: 'Configuración', icon: 'settings', route: '/settings' },
//         { label: 'Preferencias de Voz', icon: 'settings_voice', route: '/voice-settings' },
//         { isDivider: true },
//         {
//           label: 'Cerrar Sesión',
//           icon: 'logout',
//           class: 'logout-item',
//           action: () => this.logout()
//         }
//       ],
//       unreadNotifications: 0
//     };
//   }

//   // ============================================================
//   // ✅ CARGA DE CONFIGURACIÓN DEL SIDEBAR DESDE JSON
//   // ============================================================
//   private loadSidebarConfig(): void {
//     console.log('📂 [DashboardV2] Cargando sidebar desde: /config/dashboard-v2/sidebar-config.json');
    
//     this.http.get<{ sidebarItems: SidebarItem[] }>('/config/dashboard-v2/sidebar-config.json')
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           this.sidebarItems = this.filterItemsByRoles(response.sidebarItems);
//           console.log('✅ Sidebar config cargada:', this.sidebarItems);
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error('❌ Error al cargar sidebar:', err);
//           this.sidebarItems = this.getDefaultSidebarItems();
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   private getDefaultSidebarItems(): SidebarItem[] {
//     return [
//       { id: 'dashboard', label: 'Panel Principal', icon: 'dashboard', roles: ['USER'] }
//     ];
//   }

//   // ============================================================
//   // MÉTODOS DEL SIDEBAR
//   // ============================================================
//   toggleSidebar(): void {
//     this.isSidebarCollapsed = !this.isSidebarCollapsed;
//   }

//   toggleSidebarMobile(): void {
//     this.isSidebarOpen = !this.isSidebarOpen;
//   }

//   setActiveSection(section: string): void {
//     this.activeSection = section;
//     if (window.innerWidth < 768) {
//       this.isSidebarOpen = false;
//     }
//   }

//   // ============================================================
//   // CICLO DE VIDA - ngOnInit
//   // ============================================================
//   // ngOnInit(): void {
//   //   console.log('🚀 DashboardV2 inicializado');

//   //   // ✅ Cargar configuraciones
//   //   this.loadToolbarConfig();
//   //   this.loadSidebarConfig();

//   //   // 1. Inicializar reloj
//   //   this.updateTimeDisplay();
//   //   this.timeInterval = setInterval(() => {
//   //     this.currentTime = new Date();
//   //     this.greeting = this.getGreeting();
//   //     this.updateTimeDisplay();
//   //     this.cdr.detectChanges();
//   //   }, 1000);

//   //   this.greeting = this.getGreeting();

//   //   // 2. Cargar configuración del proyecto
//   //   this.loadProject('informatica');

//   //   // 3. Configurar contexto de voz
//   //   this.setupVoiceContext();

//   //   // 4. Suscribirse a comandos de voz
//   //   this.voiceService
//   //     .getTranscript()
//   //     .pipe(takeUntil(this.destroy$))
//   //     .subscribe((text: string) => {
//   //       this.ngZone.run(() => {
//   //         if (this.isDestroyed || !text) return;
//   //         this.handleVoiceCommand(text);
//   //       });
//   //     });

//   //   // 5. Mostrar mensaje de bienvenida
//   //   setTimeout(() => {
//   //     this.showWelcomeMessage();
//   //   }, 1500);
//   // }




//   // dashboard-v2.component.ts

//   ngOnInit(): void {
//     console.log('🚀 DashboardV2 inicializado');

//     // ✅ Cargar configuraciones
//     this.loadToolbarConfig();
//     this.loadSidebarConfig();

//     // 1. Inicializar reloj
//     this.updateTimeDisplay();
//     this.timeInterval = setInterval(() => {
//       this.currentTime = new Date();
//       this.greeting = this.getGreeting();
//       this.updateTimeDisplay();
//       this.cdr.detectChanges();
//     }, 1000);

//     this.greeting = this.getGreeting();

//     // 2. Cargar configuración del proyecto
//     this.loadProject('informatica');

//     // 3. Configurar contexto de voz
//     this.setupVoiceContext();

//     // 4. Suscribirse a comandos de voz
//     this.voiceService
//       .getTranscript()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((text: string) => {
//         this.ngZone.run(() => {
//           if (this.isDestroyed || !text) return;
//           this.handleVoiceCommand(text);
//         });
//       });

//     // 5. Mostrar mensaje de bienvenida
//     setTimeout(() => {
//       this.showWelcomeMessage();
//     }, 1500);

//     // ✅ NUEVO: Verificar estado del micrófono pero NO forzarlo
//     setTimeout(() => {
//       if (!this.isDestroyed) {
//         const isMicActive = this.voiceService.isRecognitionActive();
//         const isMuted = this.voiceService.isCurrentlyMuted();
        
//         console.log(`🎤 [DashboardV2] Estado del micrófono al cargar: ${isMicActive ? '✅ ACTIVO' : '❌ INACTIVO'}, Muteado: ${isMuted}`);
        
//         // ✅ SOLO si está inactivo Y NO está muteado, entonces iniciar
//         // Si está muteado, el usuario decidirá cuándo activarlo
//         if (!isMicActive && !isMuted) {
//           console.log('🎤 [DashboardV2] Micrófono inactivo, iniciando...');
//           this.voiceService.startListening();
//         } else if (isMicActive) {
//           console.log('🎤 [DashboardV2] Micrófono ya activo, no hacer nada');
//         } else if (isMuted) {
//           console.log('🔇 [DashboardV2] Micrófono muteado, esperando "hola"');
//         }
//       }
//     }, 500);
//   }







//   // ============================================================
//   // CARGAR PROYECTO
//   // ============================================================
//   loadProject(projectId: string): void {
//     this.isLoading = true;
//     this.currentProjectId = projectId;
    
//     this.projectConfigService.loadProjectConfig(projectId)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (config) => {
//           this.projectConfig = config;
//           this.statsCards = config.statsCards;
//           this.myCourses = config.courses;
//           this.quickActions = config.quickActions;
//           this.isLoading = false;
//           console.log(`✅ Proyecto cargado: ${config.projectName}`);
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error('❌ Error cargando proyecto:', err);
//           this.loadDefaultData();
//           this.isLoading = false;
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   loadDefaultData(): void {
//     this.statsCards = [
//       { icon: 'dashboard', label: 'Proyectos', value: 1, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
//     ];
//     this.myCourses = [];
//     this.quickActions = [];
//   }

//   // ============================================================
//   // VOZ Y COMANDOS
//   // ============================================================
//   private setupVoiceContext(): void {
//     const context = {
//       activationMessage: `Bienvenido de vuelta ${this.userName}.`,
//       availableCommands: ['dashboard', 'inicio', 'ayuda', 'silenciar', 'activar'],
//       preventBackend: true
//     };
//     this.voiceContext.setContext(context);
//   }

//   private handleVoiceCommand(text: string): void {
//     const lower = text.toLowerCase().trim();
//     console.log(`📝 [DashboardV2] Comando recibido: "${lower}"`);

//     if (lower.includes('dashboard') || lower.includes('inicio') || lower.includes('panel')) {
//       this.activeSection = 'dashboard';
//       this.voiceService.speak('Navegando al panel principal');
//       return;
//     }

//     if (lower.includes('ayuda')) {
//       this.showHelp();
//       return;
//     }

//     if (lower.includes('silenciar')) {
//       this.voiceService.mute();
//       this.isMicActive = false;
//       this.voiceService.speak('Micrófono silenciado');
//       return;
//     }

//     if (lower.includes('activar')) {
//       this.voiceService.unmute();
//       this.isMicActive = true;
//       this.voiceService.speak('Micrófono activado');
//       return;
//     }
//   }

//   // ============================================================
//   // BIENVENIDA
//   // ============================================================
//   // private showWelcomeMessage(): void {
//   //   if (this.isDestroyed || this.welcomeShown) return;
//   //   this.welcomeShown = true;

//   //   const message = this.projectConfig?.welcomeMessage || 
//   //                   `Hola ${this.userName}, bienvenido.`;
    
//   //   if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
//   //     this.voiceService.markWelcomeAsShown('dashboard');
//   //     this.voiceService.speakWhenReady(message);
//   //   }
//   // }




//   //
//   private showWelcomeMessage(): void {
//     if (this.isDestroyed || this.welcomeShown) return;
//     this.welcomeShown = true;

//     const message = this.projectConfig?.welcomeMessage || 
//                     `Hola ${this.userName}, bienvenido.`;
    
//     // ✅ Usar speakWhenReady para NO forzar nada
//     if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
//       this.voiceService.markWelcomeAsShown('dashboard');
//       // ✅ speakWhenReady respeta el estado del micrófono
//       this.voiceService.speakWhenReady(message);
//     }
//   }



//   // ============================================================
//   // UTILIDADES
//   // ============================================================
//   private getGreeting(): string {
//     const hour = this.currentTime.getHours();
//     if (hour < 12) return 'Buenos días 🌅';
//     if (hour < 18) return 'Buenas tardes ☀️';
//     return 'Buenas noches 🌙';
//   }

//   private updateTimeDisplay(): void {
//     this.currentTimeDisplay = new Intl.DateTimeFormat('es-ES', {
//       weekday: 'long',
//       day: 'numeric',
//       month: 'long',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       second: '2-digit',
//       hour12: false
//     }).format(this.currentTime);
//   }

//   showHelp(): void {
//     this.voiceService.speak('Puedes usar comandos de voz como: dashboard, inicio, ayuda, silenciar o activar');
//   }

//   // ============================================================
//   // ACCIONES
//   // ============================================================
//   // toggleMic(): void {
//   //   if (this.isMicActive) {
//   //     this.voiceService.mute();
//   //     this.isMicActive = false;
//   //     this.voiceService.speak('Micrófono desactivado');
//   //   } else {
//   //     this.voiceService.unmute();
//   //     this.isMicActive = true;
//   //     this.voiceService.speak('Micrófono activado');
//   //   }
//   //   this.cdr.detectChanges();
//   // }



//   //
//   toggleMic(): void {
//     if (this.isMicActive) {
//       this.voiceService.mute();
//       this.isMicActive = false;
//       this.voiceService.speak('Micrófono desactivado');
//     } else {
//       // ✅ Desmutear sin forzar startListening si ya está activo
//       this.voiceService.unmute();
//       this.isMicActive = true;
//       this.voiceService.speak('Micrófono activado');
//     }
//     this.cdr.detectChanges();
//   }



//   toggleTheme(): void {
//     this.themeService.toggleTheme();
//     this.isDarkTheme = this.themeService.currentTheme() === 'dark';
//     this.cdr.detectChanges();
//   }

//   logout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         this.voiceService.clearTranscript();
//         this.voiceService.speak('Sesión cerrada');
//         this.router.navigate(['/login']);
//       },
//       error: () => {
//         this.authService.fullLocalLogout();
//         this.router.navigate(['/login']);
//       }
//     });
//   }

//   goToLogin(): void {
//     this.router.navigate(['/login']);
//   }

//   // ============================================================
//   // DESTROY
//   // ============================================================
//   ngOnDestroy(): void {
//     this.isDestroyed = true;
//     this.destroy$.next();
//     this.destroy$.complete();

//     if (this.timeInterval) {
//       clearInterval(this.timeInterval);
//     }

//     this.voiceContext.resetContext();
//     window.speechSynthesis.cancel();
//     console.log('🧹 DashboardV2 destruido');
//   }
// }










// src/app/features/pages/public/dashboard-v2/dashboard-v2.component.ts

import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

// Servicios y modelos
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../shared/services/themes/themes.service';
import { VoiceService } from '../../../services/voz/voice.service';
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { ProjectConfig, StatsCard, Course, QuickAction } from '../../../models/dashboard-v2/project-config.model';
import { ProjectConfigService } from '../../../services/dashboard-v2/project-config.service';
import { TransparentToolbarComponent } from "../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component";

// ✅ IMPORTAR HTTP CLIENT
import { HttpClient } from '@angular/common/http';
import { ToolbarConfig, UserMenuItem } from '../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';

// ✅ IMPORTAR SERVICIO DE PREFERENCIAS
import { UserPreferencesService } from '../../../../shared/services/user-preferences/user-preferences.service';
import { UserPreferences } from '../../../../shared/models/user-preferences/user-preferences.model';

// ✅ INTERFAZ PARA CONFIGURACIÓN EXTERNA (con actionId)
export interface ExternalToolbarConfig extends ToolbarConfig {
  userMenuItems?: (UserMenuItem & { actionId?: string })[];
}

// ✅ INTERFAZ PARA SIDEBAR
interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  roles?: string[];
}

@Component({
  selector: 'app-dashboard-v2',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule,
    TransparentToolbarComponent
  ],
  templateUrl: './dashboard-v2.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./dashboard-v2.component.scss']
})
export class DashboardV2Component implements OnInit, OnDestroy {
  // ============================================================
  // INYECCIONES
  // ============================================================
  public router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  public voiceService = inject(VoiceService);
  private voiceContext = inject(VoiceContextService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private projectConfigService = inject(ProjectConfigService);
  private http = inject(HttpClient);
  
  // ✅ INYECTAR SERVICIO DE PREFERENCIAS
  private userPreferences = inject(UserPreferencesService);

  // ============================================================
  // VARIABLES PRIVADAS
  // ============================================================
  private destroy$ = new Subject<void>();
  private welcomeShown = false;
  private isDestroyed = false;
  private timeInterval: any;

  // ✅ MAPA DE ACCIONES
  private actionMap: { [key: string]: () => void } = {
    logout: () => this.logout(),
  };

  // ============================================================
  // ESTADO PÚBLICO
  // ============================================================
  currentTime = new Date();
  greeting = '';
  currentTimeDisplay: string = '';
  isDarkTheme = false;
  isMicActive = true;
  activeSection: string = 'dashboard';
  isSidebarCollapsed = false;
  isSidebarOpen = false;

  // Configuración del proyecto
  projectConfig: ProjectConfig | null = null;
  availableProjects: string[] = ['informatica', 'huertos', 'salud', 'finanzas'];
  currentProjectId: string = 'informatica';

  // ✅ CONFIGURACIÓN DEL TOOLBAR
  toolbarConfig: ToolbarConfig = {};

  // ✅ CONFIGURACIÓN DEL SIDEBAR
  sidebarItems: SidebarItem[] = [];

  // Datos del proyecto
  statsCards: StatsCard[] = [];
  myCourses: Course[] = [];
  quickActions: QuickAction[] = [];
  isLoading: boolean = true;

  // ============================================================
  // GETTERS
  // ============================================================
  get userName(): string {
    return this.authService.getUserName() || 'Usuario';
  }

  get userEmail(): string {
    return this.authService.getUserEmail() || 'usuario@ejemplo.com';
  }

  get formattedCurrentTime(): string {
    return this.currentTimeDisplay;
  }

  /**
   * ✅ Obtener el estado REAL del micrófono
   */
  get isMicActuallyActive(): boolean {
    return this.voiceService.isRecognitionActive() && !this.voiceService.isCurrentlyMuted();
  }

  /**
   * ✅ Obtener el texto del botón
   */
  get micButtonText(): string {
    return this.isMicActuallyActive ? '🔴 Desactivar' : '🟢 Activar';
  }

  // ============================================================
  // OBTENER ROLES DEL USUARIO
  // ============================================================
  private getUserRoles(): string[] {
    const user = this.authService.currentUser();
    return user?.roles || [];
  }

  private filterItemsByRoles<T extends { roles?: string[] }>(items: T[]): T[] {
    const userRoles = this.getUserRoles();
    return items.filter(item => {
      if (!item.roles || item.roles.length === 0) return true;
      return item.roles.some(role => userRoles.includes(role));
    });
  }

  // ============================================================
  // ✅ CARGA DE CONFIGURACIÓN DEL TOOLBAR DESDE JSON
  // ============================================================
  private loadToolbarConfig(): void {
    console.log('📂 [DashboardV2] Cargando toolbar desde: /config/dashboard-v2/toolbar-config.json');
    
    this.http.get<ExternalToolbarConfig>('/config/dashboard-v2/toolbar-config.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          let userMenuItems = config.userMenuItems?.map(item => {
            if (item.actionId && this.actionMap[item.actionId]) {
              return { ...item, action: this.actionMap[item.actionId] };
            }
            if (item.actionId && !this.actionMap[item.actionId]) {
              console.warn(`⚠️ Acción no mapeada: ${item.actionId}`);
              const { actionId, ...rest } = item;
              return rest;
            }
            return item;
          }) || [];

          const navLinks = this.filterItemsByRoles(config.navLinks || []);
          userMenuItems = this.filterItemsByRoles(userMenuItems);

          this.toolbarConfig = {
            ...config,
            navLinks,
            userMenuItems
          };

          console.log('✅ Toolbar config cargada:', this.toolbarConfig);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error al cargar configuración del toolbar:', err);
          this.toolbarConfig = this.getDefaultToolbarConfig();
          this.cdr.detectChanges();
        }
      });
  }

  private getDefaultToolbarConfig(): ToolbarConfig {
    return {
      title: 'Centro de Ayuda Digital',
      showLogo: true,
      showThemeToggle: true,
      showMicToggle: true,
      showUserAvatar: true,
      showBackButton: false,
      showHelp: true,
      navLinks: [
        { label: 'Dashboard', route: '/dashboard-v2', icon: 'dashboard', roles: ['USER'] }
      ],
      userMenuItems: [
        { label: 'Mi Perfil', icon: 'person', route: '/profile' },
        { label: 'Configuración', icon: 'settings', route: '/settings' },
        { label: 'Preferencias de Voz', icon: 'settings_voice', route: '/voice-settings' },
        { isDivider: true },
        {
          label: 'Cerrar Sesión',
          icon: 'logout',
          class: 'logout-item',
          action: () => this.logout()
        }
      ],
      unreadNotifications: 0
    };
  }

  // ============================================================
  // ✅ CARGA DE CONFIGURACIÓN DEL SIDEBAR DESDE JSON
  // ============================================================
  private loadSidebarConfig(): void {
    console.log('📂 [DashboardV2] Cargando sidebar desde: /config/dashboard-v2/sidebar-config.json');
    
    this.http.get<{ sidebarItems: SidebarItem[] }>('/config/dashboard-v2/sidebar-config.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.sidebarItems = this.filterItemsByRoles(response.sidebarItems);
          console.log('✅ Sidebar config cargada:', this.sidebarItems);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error al cargar sidebar:', err);
          this.sidebarItems = this.getDefaultSidebarItems();
          this.cdr.detectChanges();
        }
      });
  }

  private getDefaultSidebarItems(): SidebarItem[] {
    return [
      { id: 'dashboard', label: 'Panel Principal', icon: 'dashboard', roles: ['USER'] }
    ];
  }

  // ============================================================
  // MÉTODOS DEL SIDEBAR
  // ============================================================
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    // ✅ Guardar preferencia
    this.userPreferences.updatePreference('sidebarCollapsed', this.isSidebarCollapsed).subscribe();
  }

  toggleSidebarMobile(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    // ✅ Guardar preferencia
    this.userPreferences.updatePreference('lastVisitedSection', section).subscribe();
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  // ============================================================
  // CICLO DE VIDA - ngOnInit
  // ============================================================
  ngOnInit(): void {
    console.log('🚀 DashboardV2 inicializado');

    // ✅ 1. OBTENER PREFERENCIAS ACTUALES
    const prefs = this.userPreferences.getCurrentPreferences();
    this.applyPreferences(prefs);

    // ✅ 2. ESCUCHAR CAMBIOS EN TIEMPO REAL
    this.userPreferences.preferences$
      .pipe(takeUntil(this.destroy$))
      .subscribe(prefs => {
        if (prefs) {
          this.applyPreferences(prefs);
          this.cdr.detectChanges();
        }
      });

    // ✅ 3. Cargar configuraciones
    this.loadToolbarConfig();
    this.loadSidebarConfig();

    // 4. Inicializar reloj
    this.updateTimeDisplay();
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
      this.greeting = this.getGreeting();
      this.updateTimeDisplay();
      this.cdr.detectChanges();
    }, 1000);

    this.greeting = this.getGreeting();

    // 5. Cargar configuración del proyecto según preferencias
    const projectId = this.userPreferences.getPreference('activeProjectId') || 'informatica';
    this.loadProject(projectId);

    // 6. Configurar contexto de voz
    this.setupVoiceContext();

    // 7. Suscribirse a comandos de voz
    this.voiceService
      .getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.ngZone.run(() => {
          if (this.isDestroyed || !text) return;
          this.handleVoiceCommand(text);
        });
      });

    // 8. Mostrar mensaje de bienvenida
    setTimeout(() => {
      this.showWelcomeMessage();
    }, 1500);

    // 9. Inicializar estado del micrófono según preferencias
    setTimeout(() => {
      if (!this.isDestroyed) {
        this.initializeMicState();
      }
    }, 500);
  }

  /**
   * ✅ Aplicar preferencias al componente
   */
  private applyPreferences(prefs: UserPreferences): void {
    this.isDarkTheme = prefs.theme === 'dark';
    this.isSidebarCollapsed = prefs.sidebarCollapsed || false;
    this.activeSection = prefs.lastVisitedSection || 'dashboard';
    this.isMicActive = prefs.micEnabled;
    this.currentProjectId = prefs.activeProjectId || 'informatica';
  }

  /**
   * ✅ Inicializar estado del micrófono según preferencias
   */
  private initializeMicState(): void {
    const isMicActive = this.voiceService.isRecognitionActive();
    const isMuted = this.voiceService.isCurrentlyMuted();
    
    console.log(`🎤 [DashboardV2] Estado del micrófono al cargar: ${isMicActive ? '✅ ACTIVO' : '❌ INACTIVO'}, Muteado: ${isMuted}`);
    
    // Si el usuario tiene preferencia de micrófono desactivado
    if (this.userPreferences.getPreference('micEnabled') === false) {
      if (isMicActive) {
        this.voiceService.mute();
        this.isMicActive = false;
      }
      return;
    }
    
    // Si está inactivo Y NO está muteado, iniciar
    if (!isMicActive && !isMuted) {
      console.log('🎤 [DashboardV2] Micrófono inactivo, iniciando...');
      this.voiceService.startListening();
      this.isMicActive = true;
    } else if (isMicActive) {
      console.log('🎤 [DashboardV2] Micrófono ya activo, no hacer nada');
    } else if (isMuted) {
      console.log('🔇 [DashboardV2] Micrófono muteado, esperando activación');
    }
  }

  // ============================================================
  // CARGAR PROYECTO
  // ============================================================
  loadProject(projectId: string): void {
    this.isLoading = true;
    this.currentProjectId = projectId;
    
    // ✅ Guardar preferencia
    this.userPreferences.updatePreference('activeProjectId', projectId).subscribe();
    
    this.projectConfigService.loadProjectConfig(projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (config) => {
          this.projectConfig = config;
          this.statsCards = config.statsCards;
          this.myCourses = config.courses;
          this.quickActions = config.quickActions;
          this.isLoading = false;
          console.log(`✅ Proyecto cargado: ${config.projectName}`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error cargando proyecto:', err);
          this.loadDefaultData();
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  loadDefaultData(): void {
    this.statsCards = [
      { icon: 'dashboard', label: 'Proyectos', value: 1, gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
    ];
    this.myCourses = [];
    this.quickActions = [];
  }

  // ============================================================
  // VOZ Y COMANDOS
  // ============================================================
  private setupVoiceContext(): void {
    const context = {
      activationMessage: `Bienvenido de vuelta ${this.userName}.`,
      availableCommands: ['dashboard', 'inicio', 'ayuda', 'silenciar', 'activar'],
      preventBackend: true
    };
    this.voiceContext.setContext(context);
  }

  private handleVoiceCommand(text: string): void {
    const lower = text.toLowerCase().trim();
    console.log(`📝 [DashboardV2] Comando recibido: "${lower}"`);

    if (lower.includes('dashboard') || lower.includes('inicio') || lower.includes('panel')) {
      this.setActiveSection('dashboard');
      this.voiceService.speak('Navegando al panel principal');
      return;
    }

    if (lower.includes('ayuda')) {
      this.showHelp();
      return;
    }

    if (lower.includes('silenciar')) {
      this.toggleMic();
      return;
    }

    if (lower.includes('activar')) {
      this.toggleMic();
      return;
    }
  }

  // ============================================================
  // BIENVENIDA
  // ============================================================
  private showWelcomeMessage(): void {
    if (this.isDestroyed || this.welcomeShown) return;
    
    // Verificar si ya se mostró la bienvenida según preferencias
    if (this.userPreferences.getPreference('welcomeShown')) {
      this.welcomeShown = true;
      return;
    }
    
    this.welcomeShown = true;
    const message = this.projectConfig?.welcomeMessage || `Hola ${this.userName}, bienvenido.`;
    
    if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
      this.voiceService.markWelcomeAsShown('dashboard');
      this.voiceService.speakWhenReady(message);
      // ✅ Guardar que ya se mostró la bienvenida
      this.userPreferences.updatePreference('welcomeShown', true).subscribe();
    }
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  private getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Buenos días 🌅';
    if (hour < 18) return 'Buenas tardes ☀️';
    return 'Buenas noches 🌙';
  }

  private updateTimeDisplay(): void {
    this.currentTimeDisplay = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(this.currentTime);
  }

  showHelp(): void {
    this.voiceService.speak('Puedes usar comandos de voz como: dashboard, inicio, ayuda, silenciar o activar');
  }

  // ============================================================
  // ACCIONES - CON GUARDADO DE PREFERENCIAS
  // ============================================================
  
  toggleMic(): void {
    const isMuted = this.voiceService.isCurrentlyMuted();
    const isActive = this.voiceService.isRecognitionActive();
    
    console.log(`🔍 [toggleMic] isMuted: ${isMuted}, isActive: ${isActive}`);
    
    if (isMuted || !isActive) {
      // ✅ Si está muteado o inactivo, ACTIVAR
      console.log('🔊 [toggleMic] Activando micrófono...');
      
      // ✅ 1. Asegurar que el reconocimiento está detenido antes de iniciar
      this.voiceService.stopListening();
      
      // ✅ 2. Pequeño delay para asegurar limpieza
      setTimeout(() => {
        // ✅ 3. Desmutear
        this.voiceService.unmute();
        
        // ✅ 4. Iniciar reconocimiento
        this.voiceService.startListening();
        
        this.isMicActive = true;
        this.voiceService.speak('Micrófono activado');
        this.userPreferences.updatePreference('micEnabled', true).subscribe();
      }, 300);
      
    } else {
      // ✅ Si está activo, DESACTIVAR
      console.log('🔇 [toggleMic] Desactivando micrófono...');
      this.voiceService.mute();
      this.isMicActive = false;
      this.voiceService.speak('Micrófono desactivado');
      this.userPreferences.updatePreference('micEnabled', false).subscribe();
    }
    
    this.cdr.detectChanges();
  }

  
  /**
   * ✅ Toggle tema CON GUARDADO DE PREFERENCIAS
   */
  toggleTheme(): void {
    const newTheme = this.isDarkTheme ? 'light' : 'dark';
    
    // Cambiar tema en ThemeService
    this.themeService.setTheme(newTheme);
    this.isDarkTheme = newTheme === 'dark';
    
    // ✅ GUARDAR PREFERENCIA DIRECTAMENTE
    this.userPreferences.updatePreference('theme', newTheme as 'light' | 'dark').subscribe({
      next: () => {
        console.log('✅ Tema guardado en preferencias:', newTheme);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Error guardando tema:', error);
      }
    });
  }

  //
  logout(): void {
    // ✅ Guardar estado actual antes de logout
    this.userPreferences.savePreferences({
      sidebarCollapsed: this.isSidebarCollapsed,
      lastVisitedSection: this.activeSection,
      activeProjectId: this.currentProjectId,
      micEnabled: this.isMicActive
    }).subscribe();
    
    this.authService.logout().subscribe({
      next: () => {
        this.voiceService.clearTranscript();
        this.voiceService.speak('Sesión cerrada');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.fullLocalLogout();
        this.router.navigate(['/login']);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  // ============================================================
  // DESTROY - Guardar estado final
  // ============================================================
  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    // ✅ Guardar estado final antes de destruir
    this.userPreferences.savePreferences({
      sidebarCollapsed: this.isSidebarCollapsed,
      lastVisitedSection: this.activeSection,
      activeProjectId: this.currentProjectId,
      micEnabled: this.isMicActive
    }).subscribe();

    this.voiceContext.resetContext();
    window.speechSynthesis.cancel();
    console.log('🧹 DashboardV2 destruido');
  }
}
