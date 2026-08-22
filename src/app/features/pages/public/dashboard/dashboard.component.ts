// // dashboard.component.ts

// import { Component, inject, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Router, RouterModule } from '@angular/router';
// import { Subject, takeUntil } from 'rxjs';

// // Angular Material
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCardModule } from '@angular/material/card';
// import { MatDividerModule } from '@angular/material/divider';
// import { MatListModule } from '@angular/material/list';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatBadgeModule } from '@angular/material/badge';

// // Servicios
// import { AuthService } from '../../../../core/services/auth.service';
// import { ThemeService } from '../../../../shared/services/themes/themes.service';
// import { VoiceCommandHandlerService } from '../../../services/voz/voice-command-handler.service';
// import { VoiceContextService } from '../../../services/voz/voice-context.service';
// import { VoiceService } from '../../../services/voz/voice.service';
// import { TransparentToolbarComponent } from '../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';

// // ============================================================
// // INTERFACES Y TIPOS
// // ============================================================
// type SectionType = 'dashboard' | 'stats' | 'actions' | 'activity' | 'voice' | 'settings';

// interface SidebarItem {
//   id: SectionType;
//   label: string;
//   icon: string;
// }

// interface QuickAction {
//   label: string;
//   icon: string;
//   route: string;
//   voiceCommand: string[];
//   description: string;
//   badge?: 'new' | 'popular' | 'beta' | '';
// }

// interface UserStats {
//   totalActions: number;
//   voiceCommandsUsed: number;
//   sessionsCount: number;
//   lastActive: Date;
//   voiceGrowth: string;
//   actionsGrowth: string;
//   sessionsChange: string;
//   lastActiveStatus: 'positive' | 'negative' | 'neutral';
//   lastActiveIcon: string;
//   lastActiveLabel: string;
// }

// interface ActivityItem {
//   action: string;
//   time: string;
//   icon: string;
//   status: 'success' | 'pending' | 'error' | 'info';
//   highlight?: string;
// }

// interface StatsCard {
//   icon: string;
//   label: string;
//   value: string | number;
//   change: string;
//   trend: 'up' | 'down' | 'neutral';
//   trendIcon: string;
//   gradient: string;
// }

// @Component({
//   selector: 'app-dashboard',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule,
//     MatButtonModule,
//     MatIconModule,
//     MatCardModule,
//     MatDividerModule,
//     MatListModule,
//     MatProgressBarModule,
//     MatTooltipModule,
//     MatBadgeModule,
//     TransparentToolbarComponent,
//   ],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent implements OnInit, OnDestroy {
//   // ============================================================
//   // INYECCIONES
//   // ============================================================
//   private router = inject(Router);
//   private ngZone = inject(NgZone);
//   private cdr = inject(ChangeDetectorRef);
//   public voiceService = inject(VoiceService);
//   private voiceContext = inject(VoiceContextService);
//   private voiceHandler = inject(VoiceCommandHandlerService);
//   private authService = inject(AuthService);
//   private themeService = inject(ThemeService);

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
//   currentYear = new Date().getFullYear();

//   userName = this.authService.getUserName() || 'Usuario';
//   userEmail = this.authService.getUserEmail() || 'usuario@email.com';

//   isDarkTheme = this.themeService.currentTheme() === 'dark';
//   isMicActive = !this.voiceService.isCurrentlyMuted();
//   isSidebarCollapsed = false;

//   // ✅ Sección activa
//   activeSection: SectionType = 'dashboard';

//   // ✅ Sidebar items con el tipo correcto
//   sidebarItems: SidebarItem[] = [
//     { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
//     { id: 'stats', label: 'Estadísticas', icon: 'analytics' },
//     { id: 'actions', label: 'Acciones', icon: 'flash_on' },
//     { id: 'activity', label: 'Actividad', icon: 'history' },
//     { id: 'voice', label: 'Comandos Voz', icon: 'mic' },
//     { id: 'settings', label: 'Configuración', icon: 'settings' }
//   ];

//   // ============================================================
//   // GETTER - FECHA FORMATEADA
//   // ============================================================
//   get formattedCurrentTime(): string {
//     return new Intl.DateTimeFormat('es-ES', {
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

//   // ============================================================
//   // STATS CARDS
//   // ============================================================
//   statsCards: StatsCard[] = [
//     {
//       icon: 'mic',
//       label: 'Comandos de Voz',
//       value: 128,
//       change: '+12%',
//       trend: 'up',
//       trendIcon: 'trending_up',
//       gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
//     },
//     {
//       icon: 'playlist_add_check',
//       label: 'Acciones Creadas',
//       value: 47,
//       change: '+8%',
//       trend: 'up',
//       trendIcon: 'trending_up',
//       gradient: 'linear-gradient(135deg, #10b981, #059669)'
//     },
//     {
//       icon: 'schedule',
//       label: 'Sesiones',
//       value: 12,
//       change: '0%',
//       trend: 'neutral',
//       trendIcon: 'remove',
//       gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
//     },
//     {
//       icon: 'access_time',
//       label: 'Última Actividad',
//       value: 'Ahora',
//       change: 'Activo',
//       trend: 'up',
//       trendIcon: 'fiber_manual_record',
//       gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)'
//     }
//   ];

//   // ============================================================
//   // ESTADÍSTICAS
//   // ============================================================
//   stats: UserStats = {
//     totalActions: 47,
//     voiceCommandsUsed: 128,
//     sessionsCount: 12,
//     lastActive: new Date(),
//     voiceGrowth: '+12%',
//     actionsGrowth: '+8%',
//     sessionsChange: '0%',
//     lastActiveStatus: 'positive',
//     lastActiveIcon: 'fiber_manual_record',
//     lastActiveLabel: 'Activo'
//   };

//   // ============================================================
//   // ACCIONES RÁPIDAS
//   // ============================================================
//   quickActions: QuickAction[] = [
//     {
//       label: 'Nueva Acción de Voz',
//       icon: 'mic',
//       route: '/voice-actions',
//       voiceCommand: ['nueva acción', 'crear acción', 'acción de voz'],
//       description: 'Crea una nueva acción controlada por voz',
//       badge: 'new'
//     },
//     {
//       label: 'Mis Comandos',
//       icon: 'settings_voice',
//       route: '/voice-commands',
//       voiceCommand: ['mis comandos', 'comandos', 'ver comandos'],
//       description: 'Gestiona tus comandos de voz personalizados',
//       badge: 'popular'
//     },
//     {
//       label: 'Historial',
//       icon: 'history',
//       route: '/history',
//       voiceCommand: ['historial', 'ver historial', 'actividad'],
//       description: 'Revisa tu historial de actividad',
//       badge: ''
//     },
//     {
//       label: 'Perfil',
//       icon: 'person',
//       route: '/profile',
//       voiceCommand: ['perfil', 'mi perfil', 'configuración'],
//       description: 'Administra tu información personal',
//       badge: ''
//     }
//   ];

//   // ============================================================
//   // ACTIVIDAD RECIENTE
//   // ============================================================
//   recentActivity: ActivityItem[] = [
//     {
//       action: 'Comando de voz ejecutado:',
//       highlight: '"Crear tarea"',
//       time: 'Hace 5 minutos',
//       icon: 'check_circle',
//       status: 'success'
//     },
//     {
//       action: 'Nueva acción creada:',
//       highlight: '"Recordatorio"',
//       time: 'Hace 2 horas',
//       icon: 'add_circle',
//       status: 'success'
//     },
//     {
//       action: 'Inicio de sesión',
//       time: 'Hace 3 horas',
//       icon: 'login',
//       status: 'info'
//     },
//     {
//       action: 'Configuración actualizada',
//       time: 'Hace 1 día',
//       icon: 'settings',
//       status: 'pending'
//     }
//   ];

//   // ============================================================
//   // MÉTODOS DEL SIDEBAR
//   // ============================================================
//   toggleSidebar(): void {
//     this.isSidebarCollapsed = !this.isSidebarCollapsed;
//   }

//   setActiveSection(section: SectionType): void {
//     this.activeSection = section;
//     if (window.innerWidth < 768) {
//       this.isSidebarCollapsed = true;
//     }
//   }

//   // ============================================================
//   // CICLO DE VIDA - INIT
//   // ============================================================
//   ngOnInit(): void {
//     console.log('✅ DashboardComponent inicializado');

//     this.timeInterval = setInterval(() => {
//       this.currentTime = new Date();
//       this.greeting = this.getGreeting();
//       this.cdr.detectChanges();
//     }, 1000);

//     this.greeting = this.getGreeting();
//     this.setupVoiceContext();

//     this.voiceService
//       .getTranscript()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((text: string) => {
//         this.ngZone.run(() => {
//           if (this.isDestroyed || !text) return;
//           this.handleVoiceCommand(text);
//         });
//       });

//     this.showWelcomeMessage();

//     if (window.innerWidth < 768) {
//       this.isSidebarCollapsed = true;
//     }
//   }

//   // ============================================================
//   // CONFIGURACIÓN DE VOZ
//   // ============================================================
//   private setupVoiceContext(): void {
//     const context = {
//       activationMessage: `Bienvenido de vuelta ${this.userName}. Puedes navegar por el dashboard usando tu voz.`,
//       availableCommands: [
//         'dashboard', 'inicio', 'panel',
//         'estadísticas', 'estadisticas', 'analisis',
//         'acciones', 'rápidas', 'rapidas',
//         'historial', 'actividad', 'reciente',
//         'voz', 'comandos', 'comando',
//         'configuración', 'configuracion', 'ajustes',
//         'nueva acción', 'mis comandos', 'perfil',
//         'cerrar sesión', 'logout', 'salir',
//         'ayuda', 'silenciar micrófono', 'activar micrófono'
//       ],
//       preventBackend: true
//     };
//     this.voiceContext.setContext(context);
//   }

//   private showWelcomeMessage(): void {
//     setTimeout(() => {
//       if (!this.isDestroyed && !this.isMicActive && !this.welcomeShown) {
//         this.welcomeShown = true;
//         if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
//           this.voiceService.markWelcomeAsShown('dashboard');
//           const welcomeMessage = `Hola ${this.userName}, bienvenido a tu panel de control. Tienes ${this.stats.voiceCommandsUsed} comandos de voz ejecutados.`;
//           this.voiceService.speakWhenReady(welcomeMessage);
//         }
//       }
//     }, 1500);
//   }

//   // ============================================================
//   // OBTENER SALUDO
//   // ============================================================
//   private getGreeting(): string {
//     const hour = this.currentTime.getHours();
//     if (hour < 12) return 'Buenos días 🌅';
//     if (hour < 18) return 'Buenas tardes ☀️';
//     return 'Buenas noches 🌙';
//   }

//   // ============================================================
//   // MANEJAR COMANDOS DE VOZ
//   // ============================================================
//   private handleVoiceCommand(text: string): void {
//     if (this.isDestroyed) return;
//     const lower = text.toLowerCase().trim();

//     console.log(`📝 [Dashboard] Comando recibido: "${lower}"`);

//     // Navegación por secciones
//     if (lower.includes('dashboard') || lower.includes('inicio') || lower.includes('panel')) {
//       this.setActiveSection('dashboard');
//       this.voiceService.speak('Navegando al panel de control');
//       return;
//     }

//     if (lower.includes('estadísticas') || lower.includes('estadisticas') || lower.includes('analisis')) {
//       this.setActiveSection('stats');
//       this.voiceService.speak('Navegando a estadísticas');
//       return;
//     }

//     if (lower.includes('acciones') || lower.includes('rápidas') || lower.includes('rapidas')) {
//       this.setActiveSection('actions');
//       this.voiceService.speak('Navegando a acciones rápidas');
//       return;
//     }

//     if (lower.includes('historial') || lower.includes('actividad') || lower.includes('reciente')) {
//       this.setActiveSection('activity');
//       this.voiceService.speak('Navegando a actividad reciente');
//       return;
//     }

//     if (lower.includes('voz') || lower.includes('comandos') || lower.includes('comando')) {
//       this.setActiveSection('voice');
//       this.voiceService.speak('Navegando a comandos de voz');
//       return;
//     }

//     if (lower.includes('configuración') || lower.includes('configuracion') || lower.includes('ajustes')) {
//       this.setActiveSection('settings');
//       this.voiceService.speak('Navegando a configuración');
//       return;
//     }

//     // Acciones rápidas
//     for (const action of this.quickActions) {
//       if (action.voiceCommand.some(cmd => lower.includes(cmd))) {
//         this.voiceService.clearTranscript();
//         this.voiceService.speak(`Navegando a ${action.label}`);
//         this.router.navigate([action.route]);
//         return;
//       }
//     }

//     // Comandos generales
//     if (lower.includes('cerrar sesión') || lower.includes('logout') || lower.includes('salir')) {
//       this.logout();
//       return;
//     }

//     if (lower.includes('ayuda')) {
//       this.showHelp();
//       return;
//     }

//     if (lower.includes('silenciar micrófono') || lower.includes('silenciar')) {
//       this.voiceService.mute();
//       this.isMicActive = false;
//       this.cdr.detectChanges();
//       this.voiceService.speak('Micrófono silenciado');
//       return;
//     }

//     if (lower.includes('activar micrófono') || lower.includes('desmutear')) {
//       this.voiceService.unmute();
//       this.isMicActive = true;
//       this.cdr.detectChanges();
//       this.voiceService.speak('Micrófono activado');
//       return;
//     }

//     console.log(`⏭️ [Dashboard] Comando no reconocido: "${lower}"`);
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

//   showHelp(): void {
//     const message = 'En el panel de control puedes navegar usando tu voz. Di: "dashboard", "estadísticas", "acciones", "historial", "voz", o "configuración" para cambiar de sección.';
//     this.voiceService.speak(message);
//   }

//   goToLogin(): void {
//     this.voiceService.clearTranscript();
//     this.router.navigate(['/login']);
//   }

//   logout(): void {
//     this.authService.logout().subscribe({
//       next: () => {
//         this.voiceService.clearTranscript();
//         this.voiceService.speak('Sesión cerrada correctamente.');
//         this.router.navigate(['/login']);
//       },
//       error: () => {
//         this.authService.fullLocalLogout();
//         this.voiceService.clearTranscript();
//         this.router.navigate(['/login']);
//       }
//     });
//   }

//   executeQuickAction(action: QuickAction): void {
//     this.voiceService.clearTranscript();
//     this.voiceService.speak(`Navegando a ${action.label}`);
//     this.router.navigate([action.route]);
//   }

//   viewAllActivity(): void {
//     this.voiceService.clearTranscript();
//     this.router.navigate(['/history']);
//   }

//   // ============================================================
//   // CICLO DE VIDA - DESTROY
//   // ============================================================
//   ngOnDestroy(): void {
//     console.log('🧹 DashboardComponent destruido');
//     this.isDestroyed = true;
//     this.destroy$.next();
//     this.destroy$.complete();

//     if (this.timeInterval) {
//       clearInterval(this.timeInterval);
//     }

//     this.voiceContext.resetContext();
//     window.speechSynthesis.cancel();
//   }
// }















// dashboard.component.ts

import { Component, inject, OnInit, OnDestroy, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

// Servicios
import { AuthService } from '../../../../core/services/auth.service';
import { ThemeService } from '../../../../shared/services/themes/themes.service';
import { VoiceCommandHandlerService } from '../../../services/voz/voice-command-handler.service';
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { VoiceService } from '../../../services/voz/voice.service';
import { TransparentToolbarComponent } from '../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer/footer.component';

// ============================================================
// INTERFACES Y TIPOS
// ============================================================
type SectionType = 'dashboard' | 'stats' | 'actions' | 'activity' | 'voice' | 'settings';

interface SidebarItem {
  id: SectionType;
  label: string;
  icon: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  voiceCommand: string[];
  description: string;
  badge?: 'new' | 'popular' | 'beta' | '';
}

interface UserStats {
  totalActions: number;
  voiceCommandsUsed: number;
  sessionsCount: number;
  lastActive: Date;
  voiceGrowth: string;
  actionsGrowth: string;
  sessionsChange: string;
  lastActiveStatus: 'positive' | 'negative' | 'neutral';
  lastActiveIcon: string;
  lastActiveLabel: string;
}

interface ActivityItem {
  action: string;
  time: string;
  icon: string;
  status: 'success' | 'pending' | 'error' | 'info';
  highlight?: string;
}

interface StatsCard {
  icon: string;
  label: string;
  value: string | number;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  trendIcon: string;
  gradient: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatBadgeModule,
    TransparentToolbarComponent,
    FooterComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ============================================================
  // INYECCIONES
  // ============================================================
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  public voiceService = inject(VoiceService);
  private voiceContext = inject(VoiceContextService);
  private voiceHandler = inject(VoiceCommandHandlerService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  // ============================================================
  // VARIABLES PRIVADAS
  // ============================================================
  private destroy$ = new Subject<void>();
  private welcomeShown = false;
  private isDestroyed = false;
  private timeInterval: any;
  // ✅ NUEVA: Para mantener el micrófono activo
  private micKeepAliveInterval: any;
  private readonly KEEP_ALIVE_INTERVAL = 8000; // 8 segundos

  // ============================================================
  // ESTADO PÚBLICO
  // ============================================================
  currentTime = new Date();
  greeting = '';
  currentYear = new Date().getFullYear();

  userName = this.authService.getUserName() || 'Usuario';
  userEmail = this.authService.getUserEmail() || 'usuario@email.com';

  isDarkTheme = this.themeService.currentTheme() === 'dark';
  isMicActive = !this.voiceService.isCurrentlyMuted();
  isSidebarCollapsed = false;

  // ✅ Sección activa
  activeSection: SectionType = 'dashboard';

  // ✅ Sidebar items con el tipo correcto
  sidebarItems: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'stats', label: 'Estadísticas', icon: 'analytics' },
    { id: 'actions', label: 'Acciones', icon: 'flash_on' },
    { id: 'activity', label: 'Actividad', icon: 'history' },
    { id: 'voice', label: 'Comandos Voz', icon: 'mic' },
    { id: 'settings', label: 'Configuración', icon: 'settings' }
  ];

  // ============================================================
  // GETTER - FECHA FORMATEADA
  // ============================================================
  get formattedCurrentTime(): string {
    return new Intl.DateTimeFormat('es-ES', {
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

  // ============================================================
  // STATS CARDS
  // ============================================================
  statsCards: StatsCard[] = [
    {
      icon: 'mic',
      label: 'Comandos de Voz',
      value: 128,
      change: '+12%',
      trend: 'up',
      trendIcon: 'trending_up',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    },
    {
      icon: 'playlist_add_check',
      label: 'Acciones Creadas',
      value: 47,
      change: '+8%',
      trend: 'up',
      trendIcon: 'trending_up',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      icon: 'schedule',
      label: 'Sesiones',
      value: 12,
      change: '0%',
      trend: 'neutral',
      trendIcon: 'remove',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      icon: 'access_time',
      label: 'Última Actividad',
      value: 'Ahora',
      change: 'Activo',
      trend: 'up',
      trendIcon: 'fiber_manual_record',
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)'
    }
  ];

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================
  stats: UserStats = {
    totalActions: 47,
    voiceCommandsUsed: 128,
    sessionsCount: 12,
    lastActive: new Date(),
    voiceGrowth: '+12%',
    actionsGrowth: '+8%',
    sessionsChange: '0%',
    lastActiveStatus: 'positive',
    lastActiveIcon: 'fiber_manual_record',
    lastActiveLabel: 'Activo'
  };

  // ============================================================
  // ACCIONES RÁPIDAS
  // ============================================================
  quickActions: QuickAction[] = [
    {
      label: 'Nueva Acción de Voz',
      icon: 'mic',
      route: '/voice-actions',
      voiceCommand: ['nueva acción', 'crear acción', 'acción de voz'],
      description: 'Crea una nueva acción controlada por voz',
      badge: 'new'
    },
    {
      label: 'Mis Comandos',
      icon: 'settings_voice',
      route: '/voice-commands',
      voiceCommand: ['mis comandos', 'comandos', 'ver comandos'],
      description: 'Gestiona tus comandos de voz personalizados',
      badge: 'popular'
    },
    {
      label: 'Historial',
      icon: 'history',
      route: '/history',
      voiceCommand: ['historial', 'ver historial', 'actividad'],
      description: 'Revisa tu historial de actividad',
      badge: ''
    },
    {
      label: 'Perfil',
      icon: 'person',
      route: '/profile',
      voiceCommand: ['perfil', 'mi perfil', 'configuración'],
      description: 'Administra tu información personal',
      badge: ''
    }
  ];

  // ============================================================
  // ACTIVIDAD RECIENTE
  // ============================================================
  recentActivity: ActivityItem[] = [
    {
      action: 'Comando de voz ejecutado:',
      highlight: '"Crear tarea"',
      time: 'Hace 5 minutos',
      icon: 'check_circle',
      status: 'success'
    },
    {
      action: 'Nueva acción creada:',
      highlight: '"Recordatorio"',
      time: 'Hace 2 horas',
      icon: 'add_circle',
      status: 'success'
    },
    {
      action: 'Inicio de sesión',
      time: 'Hace 3 horas',
      icon: 'login',
      status: 'info'
    },
    {
      action: 'Configuración actualizada',
      time: 'Hace 1 día',
      icon: 'settings',
      status: 'pending'
    }
  ];

  // ============================================================
  // MÉTODOS DEL SIDEBAR
  // ============================================================
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveSection(section: SectionType): void {
    this.activeSection = section;
    if (window.innerWidth < 768) {
      this.isSidebarCollapsed = true;
    }
  }

  // ============================================================
  // ✅ NUEVO: MANTENER MICRÓFONO ACTIVO
  // ============================================================
  
  /**
   * Activa el micrófono si no está activo
   */
  private activateMicIfNeeded(): void {
    if (!this.isMicActive && !this.voiceService.isCurrentlyMuted()) {
      console.log('🎤 [Dashboard] Activando micrófono...');
      this.voiceService.unmute();
      this.isMicActive = true;
      this.cdr.detectChanges();
    }
  }

  /**
   * Mantiene el micrófono activo con un ping periódico
   */
  private startMicKeepAlive(): void {
    this.micKeepAliveInterval = setInterval(() => {
      if (!this.isDestroyed) {
        // Si el micrófono está silenciado pero debería estar activo
        if (!this.isMicActive && !this.voiceService.isCurrentlyMuted()) {
          console.log('🔄 [Dashboard] Manteniendo micrófono activo (keep-alive)...');
          this.voiceService.unmute();
          this.isMicActive = true;
          this.cdr.detectChanges();
        }
      }
    }, this.KEEP_ALIVE_INTERVAL);
  }

  // ============================================================
  // CICLO DE VIDA - INIT
  // ============================================================
  ngOnInit(): void {
    console.log('✅ DashboardComponent inicializado');

    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
      this.greeting = this.getGreeting();
      this.cdr.detectChanges();
    }, 1000);

    this.greeting = this.getGreeting();
    this.setupVoiceContext();

    this.voiceService
      .getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.ngZone.run(() => {
          if (this.isDestroyed || !text) return;
          this.handleVoiceCommand(text);
        });
      });

    this.showWelcomeMessage();

    if (window.innerWidth < 768) {
      this.isSidebarCollapsed = true;
    }

    // ✅ NUEVO: Activar micrófono al iniciar
    setTimeout(() => {
      this.activateMicIfNeeded();
    }, 500);

    // ✅ NUEVO: Iniciar keep-alive del micrófono
    this.startMicKeepAlive();
  }

  // ============================================================
  // CONFIGURACIÓN DE VOZ
  // ============================================================
  private setupVoiceContext(): void {
    const context = {
      activationMessage: `Bienvenido de vuelta ${this.userName}. Puedes navegar por el dashboard usando tu voz.`,
      availableCommands: [
        'dashboard', 'inicio', 'panel',
        'estadísticas', 'estadisticas', 'analisis',
        'acciones', 'rápidas', 'rapidas',
        'historial', 'actividad', 'reciente',
        'voz', 'comandos', 'comando',
        'configuración', 'configuracion', 'ajustes',
        'nueva acción', 'mis comandos', 'perfil',
        'cerrar sesión', 'logout', 'salir',
        'ayuda', 'silenciar micrófono', 'activar micrófono'
      ],
      preventBackend: true
    };
    this.voiceContext.setContext(context);
  }

  private showWelcomeMessage(): void {
    setTimeout(() => {
      if (!this.isDestroyed && !this.isMicActive && !this.welcomeShown) {
        this.welcomeShown = true;
        if (!this.voiceService.hasWelcomeBeenShown('dashboard')) {
          this.voiceService.markWelcomeAsShown('dashboard');
          const welcomeMessage = `Hola ${this.userName}, bienvenido a tu panel de control. Tienes ${this.stats.voiceCommandsUsed} comandos de voz ejecutados.`;
          this.voiceService.speakWhenReady(welcomeMessage);
        }
      }
    }, 1500);
  }

  // ============================================================
  // OBTENER SALUDO
  // ============================================================
  private getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Buenos días 🌅';
    if (hour < 18) return 'Buenas tardes ☀️';
    return 'Buenas noches 🌙';
  }

  // ============================================================
  // MANEJAR COMANDOS DE VOZ
  // ============================================================
  private handleVoiceCommand(text: string): void {
    if (this.isDestroyed) return;
    const lower = text.toLowerCase().trim();

    console.log(`📝 [Dashboard] Comando recibido: "${lower}"`);

    // Navegación por secciones
    if (lower.includes('dashboard') || lower.includes('inicio') || lower.includes('panel')) {
      this.setActiveSection('dashboard');
      this.voiceService.speak('Navegando al panel de control');
      return;
    }

    if (lower.includes('estadísticas') || lower.includes('estadisticas') || lower.includes('analisis')) {
      this.setActiveSection('stats');
      this.voiceService.speak('Navegando a estadísticas');
      return;
    }

    if (lower.includes('acciones') || lower.includes('rápidas') || lower.includes('rapidas')) {
      this.setActiveSection('actions');
      this.voiceService.speak('Navegando a acciones rápidas');
      return;
    }

    if (lower.includes('historial') || lower.includes('actividad') || lower.includes('reciente')) {
      this.setActiveSection('activity');
      this.voiceService.speak('Navegando a actividad reciente');
      return;
    }

    if (lower.includes('voz') || lower.includes('comandos') || lower.includes('comando')) {
      this.setActiveSection('voice');
      this.voiceService.speak('Navegando a comandos de voz');
      return;
    }

    if (lower.includes('configuración') || lower.includes('configuracion') || lower.includes('ajustes')) {
      this.setActiveSection('settings');
      this.voiceService.speak('Navegando a configuración');
      return;
    }

    // Acciones rápidas
    for (const action of this.quickActions) {
      if (action.voiceCommand.some(cmd => lower.includes(cmd))) {
        this.voiceService.clearTranscript();
        this.voiceService.speak(`Navegando a ${action.label}`);
        this.router.navigate([action.route]);
        return;
      }
    }

    // Comandos generales
    if (lower.includes('cerrar sesión') || lower.includes('logout') || lower.includes('salir')) {
      this.logout();
      return;
    }

    if (lower.includes('ayuda')) {
      this.showHelp();
      return;
    }

    if (lower.includes('silenciar micrófono') || lower.includes('silenciar')) {
      this.voiceService.mute();
      this.isMicActive = false;
      this.cdr.detectChanges();
      this.voiceService.speak('Micrófono silenciado');
      return;
    }

    if (lower.includes('activar micrófono') || lower.includes('desmutear')) {
      this.voiceService.unmute();
      this.isMicActive = true;
      this.cdr.detectChanges();
      this.voiceService.speak('Micrófono activado');
      return;
    }

    console.log(`⏭️ [Dashboard] Comando no reconocido: "${lower}"`);
  }

  // ============================================================
  // ACCIONES
  // ============================================================
  toggleMic(): void {
    if (this.isMicActive) {
      this.voiceService.mute();
      this.isMicActive = false;
      this.voiceService.speak('Micrófono desactivado');
    } else {
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

  showHelp(): void {
    const message = 'En el panel de control puedes navegar usando tu voz. Di: "dashboard", "estadísticas", "acciones", "historial", "voz", o "configuración" para cambiar de sección.';
    this.voiceService.speak(message);
  }

  goToLogin(): void {
    this.voiceService.clearTranscript();
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.voiceService.clearTranscript();
        this.voiceService.speak('Sesión cerrada correctamente.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.authService.fullLocalLogout();
        this.voiceService.clearTranscript();
        this.router.navigate(['/login']);
      }
    });
  }

  executeQuickAction(action: QuickAction): void {
    this.voiceService.clearTranscript();
    this.voiceService.speak(`Navegando a ${action.label}`);
    this.router.navigate([action.route]);
  }

  viewAllActivity(): void {
    this.voiceService.clearTranscript();
    this.router.navigate(['/history']);
  }

  // ============================================================
  // CICLO DE VIDA - DESTROY
  // ============================================================
  ngOnDestroy(): void {
    console.log('🧹 DashboardComponent destruido');
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    // ✅ NUEVO: Limpiar keep-alive
    if (this.micKeepAliveInterval) {
      clearInterval(this.micKeepAliveInterval);
      this.micKeepAliveInterval = null;
    }

    this.voiceContext.resetContext();
    window.speechSynthesis.cancel();
  }
}