// // src/app/features/pages/public/dashboard-v2/dashboard-v2.component.ts

// import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
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

// // Servicios externos (ajusta las rutas según tu estructura)
// import { AuthService } from '../../../../core/services/auth.service';
// import { ThemeService } from '../../../../shared/services/themes/themes.service';
// import { VoiceService } from '../../../services/voz/voice.service';
// import { VoiceContextService } from '../../../services/voz/voice-context.service';
// import { ProjectConfig, StatsCard, Course, QuickAction } from '../../../models/dashboard-v2/project-config.model';
// import { ProjectConfigService } from '../../../services/dashboard-v2/project-config.service';
// import { TransparentToolbarComponent } from "../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component";

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
// ],
//   templateUrl: './dashboard-v2.component.html',
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

//   // ============================================================
//   // VARIABLES PRIVADAS
//   // ============================================================
//   private destroy$ = new Subject<void>();
//   private welcomeShown = false;
//   private isDestroyed = false;
//   private timeInterval: any;

//   // ============================================================
//   // ESTADO PÚBLICO
//   // ============================================================
//   currentTime = new Date();
//   greeting = '';
//   currentTimeDisplay: string = '';
//   isDarkTheme = this.themeService.currentTheme() === 'dark';
//   isMicActive = !this.voiceService.isCurrentlyMuted();
//   activeSection: string = 'dashboard';

//   // Configuración del proyecto
//   projectConfig: ProjectConfig | null = null;
//   availableProjects: string[] = ['informatica', 'huertos', 'salud', 'finanzas'];
//   currentProjectId: string = 'informatica';

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
//   // CICLO DE VIDA - ngOnInit
//   // ============================================================
//   ngOnInit(): void {
//     console.log('🚀 DashboardV2 inicializado');

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
//   private showWelcomeMessage(): void {
//     if (this.isDestroyed || this.welcomeShown) return;
//     this.welcomeShown = true;

//     const message = this.projectConfig?.welcomeMessage || 
//                     `Hola ${this.userName}, bienvenido.`;
    
//     if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
//       this.voiceService.markWelcomeAsShown('dashboard');
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
//   toggleMic(): void {
//     if (this.isMicActive) {
//       this.voiceService.mute();
//       this.isMicActive = false;
//       this.voiceService.speak('Micrófono desactivado');
//     } else {
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

import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef } from '@angular/core';
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
  private http = inject(HttpClient);  // ✅ AÑADIR

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
  isDarkTheme = this.themeService.currentTheme() === 'dark';
  isMicActive = !this.voiceService.isCurrentlyMuted();
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
  }

  toggleSidebarMobile(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  setActiveSection(section: string): void {
    this.activeSection = section;
    if (window.innerWidth < 768) {
      this.isSidebarOpen = false;
    }
  }

  // ============================================================
  // CICLO DE VIDA - ngOnInit
  // ============================================================
  // ngOnInit(): void {
  //   console.log('🚀 DashboardV2 inicializado');

  //   // ✅ Cargar configuraciones
  //   this.loadToolbarConfig();
  //   this.loadSidebarConfig();

  //   // 1. Inicializar reloj
  //   this.updateTimeDisplay();
  //   this.timeInterval = setInterval(() => {
  //     this.currentTime = new Date();
  //     this.greeting = this.getGreeting();
  //     this.updateTimeDisplay();
  //     this.cdr.detectChanges();
  //   }, 1000);

  //   this.greeting = this.getGreeting();

  //   // 2. Cargar configuración del proyecto
  //   this.loadProject('informatica');

  //   // 3. Configurar contexto de voz
  //   this.setupVoiceContext();

  //   // 4. Suscribirse a comandos de voz
  //   this.voiceService
  //     .getTranscript()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((text: string) => {
  //       this.ngZone.run(() => {
  //         if (this.isDestroyed || !text) return;
  //         this.handleVoiceCommand(text);
  //       });
  //     });

  //   // 5. Mostrar mensaje de bienvenida
  //   setTimeout(() => {
  //     this.showWelcomeMessage();
  //   }, 1500);
  // }




  // dashboard-v2.component.ts

  ngOnInit(): void {
    console.log('🚀 DashboardV2 inicializado');

    // ✅ Cargar configuraciones
    this.loadToolbarConfig();
    this.loadSidebarConfig();

    // 1. Inicializar reloj
    this.updateTimeDisplay();
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
      this.greeting = this.getGreeting();
      this.updateTimeDisplay();
      this.cdr.detectChanges();
    }, 1000);

    this.greeting = this.getGreeting();

    // 2. Cargar configuración del proyecto
    this.loadProject('informatica');

    // 3. Configurar contexto de voz
    this.setupVoiceContext();

    // 4. Suscribirse a comandos de voz
    this.voiceService
      .getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.ngZone.run(() => {
          if (this.isDestroyed || !text) return;
          this.handleVoiceCommand(text);
        });
      });

    // 5. Mostrar mensaje de bienvenida
    setTimeout(() => {
      this.showWelcomeMessage();
    }, 1500);

    // ✅ NUEVO: Verificar estado del micrófono pero NO forzarlo
    setTimeout(() => {
      if (!this.isDestroyed) {
        const isMicActive = this.voiceService.isRecognitionActive();
        const isMuted = this.voiceService.isCurrentlyMuted();
        
        console.log(`🎤 [DashboardV2] Estado del micrófono al cargar: ${isMicActive ? '✅ ACTIVO' : '❌ INACTIVO'}, Muteado: ${isMuted}`);
        
        // ✅ SOLO si está inactivo Y NO está muteado, entonces iniciar
        // Si está muteado, el usuario decidirá cuándo activarlo
        if (!isMicActive && !isMuted) {
          console.log('🎤 [DashboardV2] Micrófono inactivo, iniciando...');
          this.voiceService.startListening();
        } else if (isMicActive) {
          console.log('🎤 [DashboardV2] Micrófono ya activo, no hacer nada');
        } else if (isMuted) {
          console.log('🔇 [DashboardV2] Micrófono muteado, esperando "hola"');
        }
      }
    }, 500);
  }







  // ============================================================
  // CARGAR PROYECTO
  // ============================================================
  loadProject(projectId: string): void {
    this.isLoading = true;
    this.currentProjectId = projectId;
    
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
      this.activeSection = 'dashboard';
      this.voiceService.speak('Navegando al panel principal');
      return;
    }

    if (lower.includes('ayuda')) {
      this.showHelp();
      return;
    }

    if (lower.includes('silenciar')) {
      this.voiceService.mute();
      this.isMicActive = false;
      this.voiceService.speak('Micrófono silenciado');
      return;
    }

    if (lower.includes('activar')) {
      this.voiceService.unmute();
      this.isMicActive = true;
      this.voiceService.speak('Micrófono activado');
      return;
    }
  }

  // ============================================================
  // BIENVENIDA
  // ============================================================
  // private showWelcomeMessage(): void {
  //   if (this.isDestroyed || this.welcomeShown) return;
  //   this.welcomeShown = true;

  //   const message = this.projectConfig?.welcomeMessage || 
  //                   `Hola ${this.userName}, bienvenido.`;
    
  //   if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
  //     this.voiceService.markWelcomeAsShown('dashboard');
  //     this.voiceService.speakWhenReady(message);
  //   }
  // }




  //
  private showWelcomeMessage(): void {
    if (this.isDestroyed || this.welcomeShown) return;
    this.welcomeShown = true;

    const message = this.projectConfig?.welcomeMessage || 
                    `Hola ${this.userName}, bienvenido.`;
    
    // ✅ Usar speakWhenReady para NO forzar nada
    if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
      this.voiceService.markWelcomeAsShown('dashboard');
      // ✅ speakWhenReady respeta el estado del micrófono
      this.voiceService.speakWhenReady(message);
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
  // ACCIONES
  // ============================================================
  // toggleMic(): void {
  //   if (this.isMicActive) {
  //     this.voiceService.mute();
  //     this.isMicActive = false;
  //     this.voiceService.speak('Micrófono desactivado');
  //   } else {
  //     this.voiceService.unmute();
  //     this.isMicActive = true;
  //     this.voiceService.speak('Micrófono activado');
  //   }
  //   this.cdr.detectChanges();
  // }



  //
  toggleMic(): void {
    if (this.isMicActive) {
      this.voiceService.mute();
      this.isMicActive = false;
      this.voiceService.speak('Micrófono desactivado');
    } else {
      // ✅ Desmutear sin forzar startListening si ya está activo
      this.voiceService.unmute();
      this.isMicActive = true;
      this.voiceService.speak('Micrófono activado');
    }
    this.cdr.detectChanges();
  }



  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.isDarkTheme = this.themeService.currentTheme() === 'dark';
    this.cdr.detectChanges();
  }

  logout(): void {
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
  // DESTROY
  // ============================================================
  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.voiceContext.resetContext();
    window.speechSynthesis.cancel();
    console.log('🧹 DashboardV2 destruido');
  }
}