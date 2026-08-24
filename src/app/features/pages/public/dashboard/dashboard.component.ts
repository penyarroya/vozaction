// import { Component, inject, OnInit, OnDestroy, NgZone, ChangeDetectorRef, HostListener, signal } from '@angular/core';
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
// import { FooterComponent } from '../../../../shared/components/footer/footer/footer.component';

// // ✅ IMPORTAMOS LOS TIPOS DEL TOOLBAR
// import { ToolbarConfig, UserMenuItem } from '../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';

// // ✅ IMPORTAMOS HTTP CLIENT PARA CARGAR EL JSON
// import { HttpClient } from '@angular/common/http';
// import { FilterByNextClassPipe } from "../../../../shared/pipes/filter-by-next-class.pipe";

// // ============================================================
// // INTERFACES Y TIPOS - VERSIÓN EDUCATIVA
// // ============================================================
// type SectionType = 'dashboard' | 'courses' | 'activities' | 'progress' | 'calendar' | 'messages' | 'settings';

// interface SidebarItem {
//   id: SectionType;
//   label: string;
//   icon: string;
//   roles?: string[];
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
//   totalCourses: number;
//   completedCourses: number;
//   inProgress: number;
//   totalStudents: number;
//   averageGrade: number;
//   nextClass: Date;
//   pendingTasks: number;
// }

// interface ActivityItem {
//   action: string;
//   time: string;
//   icon: string;
//   status: 'success' | 'pending' | 'error' | 'info';
//   highlight?: string;
//   course?: string;
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

// // ✅ Interfaz para cursos
// interface Course {
//   id: string;
//   title: string;
//   instructor: string;
//   progress: number;
//   status: 'completed' | 'in-progress' | 'not-started' | 'pending';
//   nextClass?: Date;
//   category: string;
//   thumbnail?: string;
// }

// // ✅ INTERFAZ PARA CONFIGURACIÓN EXTERNA (con actionId)
// export interface ExternalToolbarConfig extends ToolbarConfig {
//   userMenuItems?: (UserMenuItem & { actionId?: string })[];
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
//     FooterComponent
// ],
//   templateUrl: './dashboard.component.html',
//   styleUrls: ['./dashboard.component.scss']
// })
// export class DashboardComponent implements OnInit, OnDestroy {
// //  
//   // ============================================================
//   // INYECCIONES
//   // ============================================================
//   private router = inject(Router);
//   private ngZone = inject(NgZone);
//   private cdr = inject(ChangeDetectorRef);
//   public voiceService = inject(VoiceService);
//   private voiceContext = inject(VoiceContextService);
//   //private voiceHandler = inject(VoiceCommandHandlerService);
//   private authService = inject(AuthService);
//   private themeService = inject(ThemeService);
//   private http = inject(HttpClient);

//   // ============================================================
//   // VARIABLES PRIVADAS
//   // ============================================================
//   private destroy$ = new Subject<void>();
//   private welcomeShown = false;
//   private isDestroyed = false;
//   private timeInterval: any;
//   private micKeepAliveInterval: any;
//   private readonly KEEP_ALIVE_INTERVAL = 8000;

//   // ============================================================
//   // ESTADO PÚBLICO - VERSIÓN EDUCATIVA
//   // ============================================================
//   currentTime = new Date();
//   greeting = '';
//   currentYear = new Date().getFullYear();
//   currentTimeDisplay = signal('');

//   // ✅ GETTERS en lugar de propiedades fijas
//   get userName(): string {
//     return this.authService.getUserName() || 'Estudiante';
//   }

//   get userEmail(): string {
//     return this.authService.getUserEmail() || 'estudiante@campus.edu';
//   }

//   get isAuthenticated(): boolean {
//     return this.authService.isAuthenticated();
//   }

//   // ✅ Propiedades que no dependen del authService
//   isDarkTheme = this.themeService.currentTheme() === 'dark';
//   isMicActive = !this.voiceService.isCurrentlyMuted();
//   isSidebarCollapsed = false;

//   activeSection: SectionType = 'dashboard';

//   isSidebarOpen = false;

//   sidebarItems: SidebarItem[] = [];

//   currentDate = new Date();










//   // ============================================================
//   // DATOS PARA MENSAJES - ✅ AGREGAR ESTO
//   // ============================================================
//   messages = [
//     {
//       id: 1,
//       sender: 'Dr. Juan Pérez',
//       avatar: 'JP',
//       content: 'Recordatorio: Examen de Matemáticas el viernes a las 10:00 AM',
//       time: 'Hace 2 horas',
//       unread: 2
//     },
//     {
//       id: 2,
//       sender: 'Ing. María García',
//       avatar: 'MG',
//       content: 'Tu proyecto final de Programación Web ha sido revisado',
//       time: 'Hace 1 día',
//       unread: 1
//     },
//     {
//       id: 3,
//       sender: 'Dra. Ana Martínez',
//       avatar: 'AM',
//       content: 'Nuevo material disponible para el curso de Historia del Arte',
//       time: 'Hace 2 días',
//       unread: 3
//     },
//     {
//       id: 4,
//       sender: 'Dr. Carlos Ruiz',
//       avatar: 'CR',
//       content: 'Próxima clase de Física Cuántica: Teoría de la Relatividad',
//       time: 'Hace 3 días',
//       unread: 0
//     }
//   ];

//   // ============================================================
//   // MANEJADOR DE RESIZE PARA RESETEAR ESTADO EN MÓVIL
//   // ============================================================
//   @HostListener('window:resize', ['$event'])
//   onResize(event: any) {
//     const isMobile = window.innerWidth < 768;
//     if (isMobile) {
//       this.isSidebarOpen = false;
//       this.isSidebarCollapsed = false;
//     }
//   }

//   // ============================================================
//   // MÉTODO PARA ALTERNAR SIDEBAR EN MÓVIL (DESDE EL TOOLBAR)
//   // ============================================================
//   toggleSidebarMobile(): void {
//     this.isSidebarOpen = !this.isSidebarOpen;
//   }

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



// ============================================================
// MÉTODO PARA ACTUALIZAR EL RELOJ
// ============================================================
// private updateTimeDisplay(): void {
//   this.currentTimeDisplay = new Intl.DateTimeFormat('es-ES', {
//     weekday: 'long',
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     second: '2-digit',
//     hour12: false
//   }).format(this.currentTime);
// }


//   // ============================================================
//   // GETTER - Cursos con próxima clase
//   // ============================================================
//   get coursesWithNextClass(): Course[] {
//     return this.myCourses.filter(course => course.nextClass !== undefined && course.nextClass !== null);
//   }


//   // Getter para los días del calendario
//   get calendarDays(): { number: number; hasEvent: boolean; isToday: boolean }[] {
//     const days = [];
//     const year = this.currentDate.getFullYear();
//     const month = this.currentDate.getMonth();
//     const today = new Date();
//     const firstDayOfMonth = new Date(year, month, 1);
//     const lastDayOfMonth = new Date(year, month + 1, 0);
//     const daysInMonth = lastDayOfMonth.getDate();
    
//     // Días con eventos de tus cursos
//     const eventDays = this.myCourses
//       .filter(course => course.nextClass)
//       .map(course => course.nextClass?.getDate())
//       .filter(date => date !== undefined) as number[];

//     // Días del mes anterior para completar la primera semana
//     const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Domingo, 1 = Lunes...
//     const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

//     // Agregar días del mes anterior
//     const prevMonthDate = new Date(year, month, 0);
//     const prevMonthDays = prevMonthDate.getDate();
//     for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
//       days.push({
//         number: prevMonthDays - i,
//         hasEvent: false,
//         isToday: false,
//         isOtherMonth: true
//       });
//     }

//     // Agregar días del mes actual
//     for (let i = 1; i <= daysInMonth; i++) {
//       const isToday = today.getDate() === i && 
//                       today.getMonth() === month && 
//                       today.getFullYear() === year;
//       days.push({
//         number: i,
//         hasEvent: eventDays.includes(i),
//         isToday: isToday,
//         isOtherMonth: false
//       });
//     }

//     // Completar la última semana con días del mes siguiente
//     const totalDays = days.length;
//     const remainingDays = 7 - (totalDays % 7);
//     if (remainingDays < 7) {
//       for (let i = 1; i <= remainingDays; i++) {
//         days.push({
//           number: i,
//           hasEvent: false,
//           isToday: false,
//           isOtherMonth: true
//         });
//       }
//     }

//     return days;
//   }


//   // ============================================================
//   // MÉTODOS PARA EL CALENDARIO
//   // ============================================================

//   previousMonth(): void {
//     this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
//   }

//   nextMonth(): void {
//     this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
//   }


//   // ============================================================
//   // MÉTODOS ADICIONALES PARA LAS NUEVAS SECCIONES
//   // ============================================================

//   /**
//    * Getter para tareas pendientes
//    */
//   get pendingTasks(): ActivityItem[] {
//     return this.recentActivity.filter(activity => activity.status === 'pending');
//   }
  
//   /**
//    * Completar una tarea
//    */
//   completeTask(task: ActivityItem): void {
//     task.status = 'success';
//     this.voiceService.speak('Tarea marcada como completada. ¡Buen trabajo!');
//     this.cdr.detectChanges();
//   }

//   /**
//    * Configurar notificaciones
//    */
//   configureNotifications(): void {
//     this.voiceService.speak('Abriendo configuración de notificaciones');
//     this.router.navigate(['/notifications']);
//   }

//   /**
//    * Gestionar seguridad
//    */
//   manageSecurity(): void {
//     this.voiceService.speak('Abriendo configuración de seguridad');
//     this.router.navigate(['/security']);
//   }

//   /**
//    * Cambiar idioma
//    */
//   changeLanguage(): void {
//     this.voiceService.speak('Cambiando idioma a español');
//     // Lógica para cambiar idioma
//   }



//   /**
//    * Obtiene los roles del usuario actual desde el AuthService
//    */
//   private getUserRoles(): string[] {
//     const user = this.authService.currentUser();
//     return user?.roles || [];
//   }
  
//   /**
//    * Filtra un array de items (navLinks, userMenuItems) según los roles del usuario.
//    * Si un item no tiene la propiedad 'roles', se muestra a todos.
//    */
//   private filterItemsByRoles<T extends { label?: string; roles?: string[] }>(items: T[]): T[] {
//     const userRoles = this.getUserRoles();
//     const filtered = items.filter(item => {
//       if (!item.roles || item.roles.length === 0) {
//         return true;
//       }
//       const visible = item.roles.some(role => userRoles.includes(role));
//       return visible;
//     });
//     return filtered;
//   }

//   // ============================================================
//   // ✅ CONFIGURACIÓN DEL TOOLBAR (se cargará desde JSON)
//   // ============================================================
//   toolbarConfig: ToolbarConfig = {};

//   // Mapa de acciones disponibles (para mapear actionId)
//   private actionMap: { [key: string]: () => void } = {
//     logout: () => this.logout(),
//   };

//   // ============================================================
//   // STATS CARDS - VERSIÓN EDUCATIVA
//   // ============================================================
//   statsCards: StatsCard[] = [
//     {
//       icon: 'school',
//       label: 'Cursos Activos',
//       value: 9,
//       change: '+2',
//       trend: 'up',
//       trendIcon: 'trending_up',
//       gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
//     },
//     {
//       icon: 'assignment_turned_in',
//       label: 'Completados',
//       value: 5,
//       change: '+80%',
//       trend: 'up',
//       trendIcon: 'trending_up',
//       gradient: 'linear-gradient(135deg, #10b981, #059669)'
//     },
//     {
//       icon: 'pending_actions',
//       label: 'Tareas Pendientes',
//       value: 3,
//       change: '2',
//       trend: 'down',
//       trendIcon: 'trending_down',
//       gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
//     },
//     {
//       icon: 'calendar_today',
//       label: 'Próxima Clase',
//       value: 'Mañana',
//       change: '10:00 AM',
//       trend: 'up',
//       trendIcon: 'event',
//       gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)'
//     }
//   ];

//   // ============================================================
//   // ESTADÍSTICAS EDUCATIVAS
//   // ============================================================
//   courseStats: UserStats = {
//     totalCourses: 12,
//     completedCourses: 5,
//     inProgress: 4,
//     totalStudents: 156,
//     averageGrade: 8.7,
//     nextClass: new Date(Date.now() + 86400000 * 2),
//     pendingTasks: 3
//   };

//   // ============================================================
//   // CURSOS DEL USUARIO
//   // ============================================================
//   myCourses: Course[] = [
//     {
//       id: '1',
//       title: 'Matemáticas Avanzadas',
//       instructor: 'Dr. Juan Pérez',
//       progress: 75,
//       status: 'in-progress',
//       nextClass: new Date(Date.now() + 86400000),
//       category: 'Ciencias'
//     },
//     {
//       id: '2',
//       title: 'Programación Web',
//       instructor: 'Ing. María García',
//       progress: 100,
//       status: 'completed',
//       category: 'Tecnología'
//     },
//     {
//       id: '3',
//       title: 'Historia del Arte',
//       instructor: 'Dra. Ana Martínez',
//       progress: 30,
//       status: 'in-progress',
//       nextClass: new Date(Date.now() + 86400000 * 3),
//       category: 'Humanidades'
//     },
//     {
//       id: '4',
//       title: 'Física Cuántica',
//       instructor: 'Dr. Carlos Ruiz',
//       progress: 0,
//       status: 'not-started',
//       category: 'Ciencias'
//     },
//     {
//       id: '5',
//       title: 'Diseño UX/UI',
//       instructor: 'Lic. Laura Fernández',
//       progress: 60,
//       status: 'in-progress',
//       nextClass: new Date(Date.now() + 86400000 * 5),
//       category: 'Diseño'
//     }
//   ];

//   // ============================================================
//   // ACCIONES RÁPIDAS EDUCATIVAS
//   // ============================================================
//   quickActions: QuickAction[] = [
//     {
//       label: 'Ver Cursos',
//       icon: 'menu_book',
//       route: '/courses',
//       voiceCommand: ['cursos', 'mis cursos', 'ver cursos'],
//       description: 'Accede a todos tus cursos disponibles',
//       badge: 'popular'
//     },
//     {
//       label: 'Tareas Pendientes',
//       icon: 'assignment',
//       route: '/tasks',
//       voiceCommand: ['tareas', 'pendientes', 'mis tareas'],
//       description: 'Revisa tus tareas y entregas pendientes',
//       badge: 'new'
//     },
//     {
//       label: 'Calendario',
//       icon: 'calendar_month',
//       route: '/calendar',
//       voiceCommand: ['calendario', 'horario', 'clases'],
//       description: 'Consulta tu horario de clases',
//       badge: ''
//     },
//     {
//       label: 'Foros',
//       icon: 'forum',
//       route: '/forums',
//       voiceCommand: ['foros', 'discusiones', 'participar'],
//       description: 'Participa en los foros de discusión',
//       badge: ''
//     },
//     {
//       label: 'Progreso',
//       icon: 'trending_up',
//       route: '/progress',
//       voiceCommand: ['progreso', 'avance', 'rendimiento'],
//       description: 'Visualiza tu progreso académico',
//       badge: ''
//     },
//     {
//       label: 'Mensajes',
//       icon: 'message',
//       route: '/messages',
//       voiceCommand: ['mensajes', 'chat', 'comunicación'],
//       description: 'Comunícate con profesores y compañeros',
//       badge: 'beta'
//     }
//   ];

//   // ============================================================
//   // ACTIVIDAD RECIENTE EDUCATIVA
//   // ============================================================
//   recentActivity: ActivityItem[] = [
//     {
//       action: 'Completaste el curso:',
//       highlight: '"Programación Web"',
//       time: 'Hace 2 horas',
//       icon: 'check_circle',
//       status: 'success',
//       course: 'Programación Web'
//     },
//     {
//       action: 'Nueva tarea asignada:',
//       highlight: '"Proyecto Final - Matemáticas"',
//       time: 'Hace 1 día',
//       icon: 'assignment',
//       status: 'pending',
//       course: 'Matemáticas Avanzadas'
//     },
//     {
//       action: 'Clase completada:',
//       highlight: '"Historia del Arte - Módulo 3"',
//       time: 'Hace 2 días',
//       icon: 'school',
//       status: 'success',
//       course: 'Historia del Arte'
//     },
//     {
//       action: 'Foro nuevo:',
//       highlight: '"Discusión sobre IA"',
//       time: 'Hace 3 días',
//       icon: 'forum',
//       status: 'info',
//       course: 'Programación Web'
//     },
//     {
//       action: 'Calificación recibida:',
//       highlight: '"9.5 en Examen"',
//       time: 'Hace 5 días',
//       icon: 'grade',
//       status: 'success',
//       course: 'Diseño UX/UI'
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
//       this.isSidebarOpen = false;
//     }
//   }

//   // ============================================================
//   // MANTENER MICRÓFONO ACTIVO
//   // ============================================================
//   private activateMicIfNeeded(): void {
//     if (!this.isMicActive && !this.voiceService.isCurrentlyMuted()) {
//       console.log('🎤 [Dashboard] Activando micrófono...');
//       this.voiceService.unmute();
//       this.isMicActive = true;
//       this.cdr.detectChanges();
//     }
//   }

//   private startMicKeepAlive(): void {
//     this.micKeepAliveInterval = setInterval(() => {
//       if (!this.isDestroyed) {
//         if (!this.isMicActive && !this.voiceService.isCurrentlyMuted()) {
//           console.log('🔄 [Dashboard] Manteniendo micrófono activo (keep-alive)...');
//           this.voiceService.unmute();
//           this.isMicActive = true;
//           this.cdr.detectChanges();
//         }
//       }
//     }, this.KEEP_ALIVE_INTERVAL);
//   }

//   // ============================================================
//   // ✅ CARGA DE CONFIGURACIÓN DEL TOOLBAR DESDE JSON
//   // ============================================================
//   private loadToolbarConfig(): void {
//     this.http.get<ExternalToolbarConfig>('/config/dashboard/menu-dashboardEducativo.json')
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

//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error('❌ Error al cargar configuración del toolbar:', err);
//           this.toolbarConfig = this.getDefaultToolbarConfig();
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   // ============================================================
//   // ✅ CARGA DE CONFIGURACIÓN DEL SIDEBAR DESDE JSON
//   // ============================================================
//   private loadSidebarConfig(): void {
//     console.log('📂 Intentando cargar sidebar desde: /config/sidebar/sidebar-configEducativo.json');
    
//     this.http.get<{ sidebarItems: SidebarItem[] }>('/config/sidebar/sidebar-configEducativo.json')
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           console.log('✅ Sidebar cargado correctamente:', response);
//           this.sidebarItems = this.filterItemsByRoles(response.sidebarItems);
//           console.log('📋 Sidebar items después de filtrar:', this.sidebarItems);
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error('❌ Error al cargar configuración del sidebar:');
//           console.error('  - Status:', err.status);
//           console.error('  - Message:', err.message);
//           console.error('  - URL:', err.url);
//           console.log('🔄 Usando sidebar por defecto');
//           this.sidebarItems = this.filterItemsByRoles(this.getDefaultSidebarItems());
//           console.log('📋 Sidebar por defecto:', this.sidebarItems);
//           this.cdr.detectChanges();
//         }
//       });
//   }

//   /**
//    * Items por defecto (fallback si no se carga el JSON)
//    */
//   private getDefaultSidebarItems(): SidebarItem[] {
//     return [
//             { "id": "dashboard", "label": "Panel Principal", "icon": "dashboard", "roles": ["SUPER_ADMIN", "USER"] },
//             { "id": "courses", "label": "Mis Cursos", "icon": "menu_book", "roles": ["SUPER_ADMIN", "USER"] },
//             { "id": "activities", "label": "Tareas", "icon": "assignment", "roles": ["SUPER_ADMIN", "USER"] },
//             { "id": "progress", "label": "Progreso", "icon": "trending_up", "roles": ["SUPER_ADMIN", "USER"] },
//             { "id": "calendar", "label": "Calendario", "icon": "calendar_month", "roles":["SUPER_ADMIN", "USER"] },
//             { "id": "messages", "label": "Mensajes", "icon": "message", "roles": ["SUPER_ADMIN", "USER"] },
//             { "id": "settings", "label": "Configuración", "icon": "settings", "roles": ["SUPER_ADMIN", "USER"] }
//           ]
//   }

//   /**
//    * Configuración por defecto (fallback si no se carga el JSON)
//    */
//   private getDefaultToolbarConfig(): ToolbarConfig {
//     return {
//       title: 'Campus Virtual',
//       showLogo: true,
//       showThemeToggle: true,
//       showMicToggle: true,
//       showUserAvatar: true,
//       showBackButton: false,
//       showHelp: true,
//       navLinks: [
//         { label: 'Inicio', route: '/dashboard', icon: 'home', roles: ['SUPER_ADMIN', 'STUDENT', 'TEACHER'] },
//         { label: 'Cursos', route: '/courses', icon: 'menu_book', roles: ['SUPER_ADMIN', 'STUDENT', 'TEACHER'] },
//         { label: 'Calendario', route: '/calendar', icon: 'calendar_month', roles: ['SUPER_ADMIN', 'STUDENT', 'TEACHER'] }
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
//       unreadNotifications: 5
//     };
//   }

//   // ============================================================
//   // CICLO DE VIDA
//   // ============================================================
//   // ngOnInit(): void {
//   //   const isMobile = window.innerWidth < 768;
//   //   if (isMobile) {
//   //     this.isSidebarOpen = false;
//   //     this.isSidebarCollapsed = false;
//   //   }

//   //   this.loadToolbarConfig();
//   //   this.loadSidebarConfig();

//   //   this.timeInterval = setInterval(() => {
//   //     this.currentTime = new Date();
//   //     this.greeting = this.getGreeting();
//   //     this.cdr.detectChanges();
//   //   }, 1000);

//   //   this.greeting = this.getGreeting();

//   //   this.setupVoiceContext();

//   //   this.voiceService
//   //     .getTranscript()
//   //     .pipe(takeUntil(this.destroy$))
//   //     .subscribe((text: string) => {
//   //       this.ngZone.run(() => {
//   //         if (this.isDestroyed || !text) return;
//   //         this.handleVoiceCommand(text);
//   //       });
//   //     });

//   //   this.showWelcomeMessage();

//   //   setTimeout(() => {
//   //     this.activateMicIfNeeded();
//   //   }, 500);

//   //   this.startMicKeepAlive();
//   // }






//   ngOnInit(): void {
//   const isMobile = window.innerWidth < 768;
//   if (isMobile) {
//     this.isSidebarOpen = false;
//     this.isSidebarCollapsed = false;
//   }

//   this.loadToolbarConfig();
//   this.loadSidebarConfig();

//   // ✅ Reloj y saludo con NgZone
//   this.timeInterval = setInterval(() => {
//     this.ngZone.run(() => {
//       this.currentTime = new Date();
//       this.greeting = this.getGreeting();
//     });
//   }, 1000);

//   this.greeting = this.getGreeting();

//   this.setupVoiceContext();

//   this.voiceService
//     .getTranscript()
//     .pipe(takeUntil(this.destroy$))
//     .subscribe((text: string) => {
//       this.ngZone.run(() => {
//         if (this.isDestroyed || !text) return;
//         this.handleVoiceCommand(text);
//       });
//     });

//   this.showWelcomeMessage();

//   setTimeout(() => {
//     this.activateMicIfNeeded();
//   }, 500);

//   this.startMicKeepAlive();
// }






//   // ============================================================
//   // CONFIGURACIÓN DE VOZ - VERSIÓN EDUCATIVA
//   // ============================================================
//   private setupVoiceContext(): void {
//     const context = {
//       activationMessage: `Bienvenido de vuelta ${this.userName}. Puedes navegar por el campus virtual usando tu voz.`,
//       availableCommands: [
//         'dashboard', 'inicio', 'panel',
//         'cursos', 'mis cursos',
//         'tareas', 'pendientes',
//         'calendario', 'horario',
//         'progreso', 'rendimiento',
//         'mensajes', 'chat',
//         'foros', 'discusión',
//         'configuración', 'ajustes',
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
//           const welcomeMessage = `Hola ${this.userName}, bienvenido al Campus Virtual. Tienes ${this.courseStats.pendingTasks} tareas pendientes y ${this.courseStats.inProgress} cursos en progreso.`;
//           this.voiceService.speakWhenReady(welcomeMessage);
//         }
//       }
//     }, 1500);
//   }

//   private getGreeting(): string {
//     const hour = this.currentTime.getHours();
//     if (hour < 12) return 'Buenos días 🌅';
//     if (hour < 18) return 'Buenas tardes ☀️';
//     return 'Buenas noches 🌙';
//   }

//   // ============================================================
//   // MANEJAR COMANDOS DE VOZ - VERSIÓN EDUCATIVA
//   // ============================================================
//   private handleVoiceCommand(text: string): void {
//     if (this.isDestroyed) return;
//     const lower = text.toLowerCase().trim();

//     console.log(`📝 [Dashboard] Comando recibido: "${lower}"`);

//     // Navegación por secciones educativas
//     if (lower.includes('dashboard') || lower.includes('inicio') || lower.includes('panel')) {
//       this.setActiveSection('dashboard');
//       this.voiceService.speak('Navegando al panel de control del campus');
//       return;
//     }

//     if (lower.includes('cursos') || lower.includes('mis cursos')) {
//       this.setActiveSection('courses');
//       this.voiceService.speak('Navegando a tus cursos');
//       return;
//     }

//     if (lower.includes('tareas') || lower.includes('pendientes')) {
//       this.setActiveSection('activities');
//       this.voiceService.speak('Navegando a tareas pendientes');
//       return;
//     }

//     if (lower.includes('progreso') || lower.includes('rendimiento') || lower.includes('avance')) {
//       this.setActiveSection('progress');
//       this.voiceService.speak('Navegando a tu progreso académico');
//       return;
//     }

//     if (lower.includes('calendario') || lower.includes('horario')) {
//       this.setActiveSection('calendar');
//       this.voiceService.speak('Navegando al calendario académico');
//       return;
//     }

//     if (lower.includes('mensajes') || lower.includes('chat')) {
//       this.setActiveSection('messages');
//       this.voiceService.speak('Navegando a mensajes');
//       return;
//     }

//     if (lower.includes('configuración') || lower.includes('configuracion') || lower.includes('ajustes')) {
//       this.setActiveSection('settings');
//       this.voiceService.speak('Navegando a configuración');
//       return;
//     }

//     // Acciones rápidas por voz
//     for (const action of this.quickActions) {
//       if (action.voiceCommand.some(cmd => lower.includes(cmd))) {
//         this.voiceService.clearTranscript();
//         this.voiceService.speak(`Navegando a ${action.label}`);
//         this.router.navigate([action.route]);
//         return;
//       }
//     }

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
//     const message = 'En el campus virtual puedes navegar usando tu voz. Di: "cursos", "tareas", "calendario", "progreso", "mensajes" o "configuración" para cambiar de sección.';
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
//     this.router.navigate(['/progress']);
//   }

//   // ============================================================
//   // MÉTODO PARA NAVEGAR A UN CURSO ESPECÍFICO
//   // ============================================================
//   navigateToCourse(courseId: string): void {
//     this.voiceService.clearTranscript();
//     this.voiceService.speak(`Navegando al curso`);
//     this.router.navigate([`/course/${courseId}`]);
//   }

//   // ============================================================
//   // DESTROY
//   // ============================================================
//   ngOnDestroy(): void {
//     console.log('🧹 DashboardComponent destruido');
//     this.isDestroyed = true;
//     this.destroy$.next();
//     this.destroy$.complete();

//     if (this.timeInterval) {
//       clearInterval(this.timeInterval);
//     }

//     if (this.micKeepAliveInterval) {
//       clearInterval(this.micKeepAliveInterval);
//       this.micKeepAliveInterval = null;
//     }

//     this.voiceContext.resetContext();
//     window.speechSynthesis.cancel();
//   }
// }
















import { Component, inject, OnInit, OnDestroy, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
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
import { VoiceContextService } from '../../../services/voz/voice-context.service';
import { VoiceService } from '../../../services/voz/voice.service';
import { TransparentToolbarComponent } from '../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';
import { FooterComponent } from '../../../../shared/components/footer/footer/footer.component';

// ✅ IMPORTAMOS LOS TIPOS DEL TOOLBAR
import { ToolbarConfig, UserMenuItem } from '../../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';

// ✅ IMPORTAMOS HTTP CLIENT PARA CARGAR EL JSON
import { HttpClient } from '@angular/common/http';

// ============================================================
// INTERFACES Y TIPOS - VERSIÓN EDUCATIVA
// ============================================================
type SectionType = 'dashboard' | 'courses' | 'activities' | 'progress' | 'calendar' | 'messages' | 'settings';

interface SidebarItem {
  id: SectionType;
  label: string;
  icon: string;
  roles?: string[];
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
  totalCourses: number;
  completedCourses: number;
  inProgress: number;
  totalStudents: number;
  averageGrade: number;
  nextClass: Date;
  pendingTasks: number;
}

interface ActivityItem {
  action: string;
  time: string;
  icon: string;
  status: 'success' | 'pending' | 'error' | 'info';
  highlight?: string;
  course?: string;
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

// ✅ Interfaz para cursos
interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started' | 'pending';
  nextClass?: Date;
  category: string;
  thumbnail?: string;
}

// ✅ INTERFAZ PARA CONFIGURACIÓN EXTERNA (con actionId)
export interface ExternalToolbarConfig extends ToolbarConfig {
  userMenuItems?: (UserMenuItem & { actionId?: string })[];
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
    FooterComponent
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
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private http = inject(HttpClient);

  // ============================================================
  // VARIABLES PRIVADAS
  // ============================================================
  private destroy$ = new Subject<void>();
  private welcomeShown = false;
  private isDestroyed = false;
  private timeInterval: any;
  private micKeepAliveInterval: any;
  private readonly KEEP_ALIVE_INTERVAL = 8000;

  // ============================================================
  // ESTADO PÚBLICO - VERSIÓN EDUCATIVA
  // ============================================================
  currentTime = new Date();
  greeting = '';
  currentYear = new Date().getFullYear();

  // ✅ Propiedad para el reloj
  currentTimeDisplay: string = '';

  // ✅ GETTER - FECHA FORMATEADA (devuelve la propiedad)
  get formattedCurrentTime(): string {
    return this.currentTimeDisplay;
  }

  // ✅ GETTERS para datos del usuario
  get userName(): string {
    return this.authService.getUserName() || 'Estudiante';
  }

  get userEmail(): string {
    return this.authService.getUserEmail() || 'estudiante@campus.edu';
  }

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  // ✅ Propiedades que no dependen del authService
  isDarkTheme = this.themeService.currentTheme() === 'dark';
  isMicActive = !this.voiceService.isCurrentlyMuted();
  isSidebarCollapsed = false;

  activeSection: SectionType = 'dashboard';
  isSidebarOpen = false;
  sidebarItems: SidebarItem[] = [];
  currentDate = new Date();

  // ============================================================
  // DATOS PARA MENSAJES
  // ============================================================
  messages = [
    {
      id: 1,
      sender: 'Dr. Juan Pérez',
      avatar: 'JP',
      content: 'Recordatorio: Examen de Matemáticas el viernes a las 10:00 AM',
      time: 'Hace 2 horas',
      unread: 2
    },
    {
      id: 2,
      sender: 'Ing. María García',
      avatar: 'MG',
      content: 'Tu proyecto final de Programación Web ha sido revisado',
      time: 'Hace 1 día',
      unread: 1
    },
    {
      id: 3,
      sender: 'Dra. Ana Martínez',
      avatar: 'AM',
      content: 'Nuevo material disponible para el curso de Historia del Arte',
      time: 'Hace 2 días',
      unread: 3
    },
    {
      id: 4,
      sender: 'Dr. Carlos Ruiz',
      avatar: 'CR',
      content: 'Próxima clase de Física Cuántica: Teoría de la Relatividad',
      time: 'Hace 3 días',
      unread: 0
    }
  ];

  // ============================================================
  // MANEJADOR DE RESIZE PARA RESETEAR ESTADO EN MÓVIL
  // ============================================================
  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.isSidebarOpen = false;
      this.isSidebarCollapsed = false;
    }
  }

  // ============================================================
  // MÉTODO PARA ALTERNAR SIDEBAR EN MÓVIL
  // ============================================================
  toggleSidebarMobile(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  // ============================================================
  // GETTER - Cursos con próxima clase
  // ============================================================
  get coursesWithNextClass(): Course[] {
    return this.myCourses.filter(course => course.nextClass !== undefined && course.nextClass !== null);
  }

  // ============================================================
  // Getter para los días del calendario
  // ============================================================
  get calendarDays(): { number: number; hasEvent: boolean; isToday: boolean }[] {
    const days = [];
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const today = new Date();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    const eventDays = this.myCourses
      .filter(course => course.nextClass)
      .map(course => course.nextClass?.getDate())
      .filter(date => date !== undefined) as number[];

    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysFromPrevMonth = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const prevMonthDate = new Date(year, month, 0);
    const prevMonthDays = prevMonthDate.getDate();
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      days.push({
        number: prevMonthDays - i,
        hasEvent: false,
        isToday: false,
        isOtherMonth: true
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const isToday = today.getDate() === i && 
                      today.getMonth() === month && 
                      today.getFullYear() === year;
      days.push({
        number: i,
        hasEvent: eventDays.includes(i),
        isToday: isToday,
        isOtherMonth: false
      });
    }

    const totalDays = days.length;
    const remainingDays = 7 - (totalDays % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          number: i,
          hasEvent: false,
          isToday: false,
          isOtherMonth: true
        });
      }
    }

    return days;
  }

  // ============================================================
  // MÉTODOS PARA EL CALENDARIO
  // ============================================================
  previousMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
  }

  nextMonth(): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
  }

  // ============================================================
  // MÉTODOS ADICIONALES
  // ============================================================

  /**
   * Getter para tareas pendientes
   */
  get pendingTasks(): ActivityItem[] {
    return this.recentActivity.filter(activity => activity.status === 'pending');
  }
  
  /**
   * Completar una tarea
   */
  completeTask(task: ActivityItem): void {
    task.status = 'success';
    this.voiceService.speak('Tarea marcada como completada. ¡Buen trabajo!');
    this.cdr.detectChanges();
  }

  /**
   * Configurar notificaciones
   */
  configureNotifications(): void {
    this.voiceService.speak('Abriendo configuración de notificaciones');
    this.router.navigate(['/notifications']);
  }

  /**
   * Gestionar seguridad
   */
  manageSecurity(): void {
    this.voiceService.speak('Abriendo configuración de seguridad');
    this.router.navigate(['/security']);
  }

  /**
   * Cambiar idioma
   */
  changeLanguage(): void {
    this.voiceService.speak('Cambiando idioma a español');
  }

  /**
   * Obtiene los roles del usuario actual desde el AuthService
   */
  private getUserRoles(): string[] {
    const user = this.authService.currentUser();
    return user?.roles || [];
  }
  
  /**
   * Filtra un array de items según los roles del usuario.
   */
  private filterItemsByRoles<T extends { label?: string; roles?: string[] }>(items: T[]): T[] {
    const userRoles = this.getUserRoles();
    const filtered = items.filter(item => {
      if (!item.roles || item.roles.length === 0) {
        return true;
      }
      const visible = item.roles.some(role => userRoles.includes(role));
      return visible;
    });
    return filtered;
  }

  // ============================================================
  // ✅ CONFIGURACIÓN DEL TOOLBAR (se cargará desde JSON)
  // ============================================================
  toolbarConfig: ToolbarConfig = {};

  // Mapa de acciones disponibles (para mapear actionId)
  private actionMap: { [key: string]: () => void } = {
    logout: () => this.logout(),
  };

  // ============================================================
  // STATS CARDS - VERSIÓN EDUCATIVA
  // ============================================================
  statsCards: StatsCard[] = [
    {
      icon: 'school',
      label: 'Cursos Activos',
      value: 9,
      change: '+2',
      trend: 'up',
      trendIcon: 'trending_up',
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    },
    {
      icon: 'assignment_turned_in',
      label: 'Completados',
      value: 5,
      change: '+80%',
      trend: 'up',
      trendIcon: 'trending_up',
      gradient: 'linear-gradient(135deg, #10b981, #059669)'
    },
    {
      icon: 'pending_actions',
      label: 'Tareas Pendientes',
      value: 3,
      change: '2',
      trend: 'down',
      trendIcon: 'trending_down',
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)'
    },
    {
      icon: 'calendar_today',
      label: 'Próxima Clase',
      value: 'Mañana',
      change: '10:00 AM',
      trend: 'up',
      trendIcon: 'event',
      gradient: 'linear-gradient(135deg, #3b82f6, #6366f1)'
    }
  ];

  // ============================================================
  // ESTADÍSTICAS EDUCATIVAS
  // ============================================================
  courseStats: UserStats = {
    totalCourses: 12,
    completedCourses: 5,
    inProgress: 4,
    totalStudents: 156,
    averageGrade: 8.7,
    nextClass: new Date(Date.now() + 86400000 * 2),
    pendingTasks: 3
  };

  // ============================================================
  // CURSOS DEL USUARIO
  // ============================================================
  myCourses: Course[] = [
    {
      id: '1',
      title: 'Matemáticas Avanzadas',
      instructor: 'Dr. Juan Pérez',
      progress: 75,
      status: 'in-progress',
      nextClass: new Date(Date.now() + 86400000),
      category: 'Ciencias'
    },
    {
      id: '2',
      title: 'Programación Web',
      instructor: 'Ing. María García',
      progress: 100,
      status: 'completed',
      category: 'Tecnología'
    },
    {
      id: '3',
      title: 'Historia del Arte',
      instructor: 'Dra. Ana Martínez',
      progress: 30,
      status: 'in-progress',
      nextClass: new Date(Date.now() + 86400000 * 3),
      category: 'Humanidades'
    },
    {
      id: '4',
      title: 'Física Cuántica',
      instructor: 'Dr. Carlos Ruiz',
      progress: 0,
      status: 'not-started',
      category: 'Ciencias'
    },
    {
      id: '5',
      title: 'Diseño UX/UI',
      instructor: 'Lic. Laura Fernández',
      progress: 60,
      status: 'in-progress',
      nextClass: new Date(Date.now() + 86400000 * 5),
      category: 'Diseño'
    }
  ];

  // ============================================================
  // ACCIONES RÁPIDAS EDUCATIVAS
  // ============================================================
  quickActions: QuickAction[] = [
    {
      label: 'Ver Cursos',
      icon: 'menu_book',
      route: '/courses',
      voiceCommand: ['cursos', 'mis cursos', 'ver cursos'],
      description: 'Accede a todos tus cursos disponibles',
      badge: 'popular'
    },
    {
      label: 'Tareas Pendientes',
      icon: 'assignment',
      route: '/tasks',
      voiceCommand: ['tareas', 'pendientes', 'mis tareas'],
      description: 'Revisa tus tareas y entregas pendientes',
      badge: 'new'
    },
    {
      label: 'Calendario',
      icon: 'calendar_month',
      route: '/calendar',
      voiceCommand: ['calendario', 'horario', 'clases'],
      description: 'Consulta tu horario de clases',
      badge: ''
    },
    {
      label: 'Foros',
      icon: 'forum',
      route: '/forums',
      voiceCommand: ['foros', 'discusiones', 'participar'],
      description: 'Participa en los foros de discusión',
      badge: ''
    },
    {
      label: 'Progreso',
      icon: 'trending_up',
      route: '/progress',
      voiceCommand: ['progreso', 'avance', 'rendimiento'],
      description: 'Visualiza tu progreso académico',
      badge: ''
    },
    {
      label: 'Mensajes',
      icon: 'message',
      route: '/messages',
      voiceCommand: ['mensajes', 'chat', 'comunicación'],
      description: 'Comunícate con profesores y compañeros',
      badge: 'beta'
    }
  ];

  // ============================================================
  // ACTIVIDAD RECIENTE EDUCATIVA
  // ============================================================
  recentActivity: ActivityItem[] = [
    {
      action: 'Completaste el curso:',
      highlight: '"Programación Web"',
      time: 'Hace 2 horas',
      icon: 'check_circle',
      status: 'success',
      course: 'Programación Web'
    },
    {
      action: 'Nueva tarea asignada:',
      highlight: '"Proyecto Final - Matemáticas"',
      time: 'Hace 1 día',
      icon: 'assignment',
      status: 'pending',
      course: 'Matemáticas Avanzadas'
    },
    {
      action: 'Clase completada:',
      highlight: '"Historia del Arte - Módulo 3"',
      time: 'Hace 2 días',
      icon: 'school',
      status: 'success',
      course: 'Historia del Arte'
    },
    {
      action: 'Foro nuevo:',
      highlight: '"Discusión sobre IA"',
      time: 'Hace 3 días',
      icon: 'forum',
      status: 'info',
      course: 'Programación Web'
    },
    {
      action: 'Calificación recibida:',
      highlight: '"9.5 en Examen"',
      time: 'Hace 5 días',
      icon: 'grade',
      status: 'success',
      course: 'Diseño UX/UI'
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
      this.isSidebarOpen = false;
    }
  }

  // ============================================================
  // MANTENER MICRÓFONO ACTIVO
  // ============================================================
  private activateMicIfNeeded(): void {
    if (!this.isMicActive && !this.voiceService.isCurrentlyMuted()) {
      console.log('🎤 [Dashboard] Activando micrófono...');
      this.voiceService.unmute();
      this.isMicActive = true;
      this.cdr.detectChanges();
    }
  }

  private startMicKeepAlive(): void {
    this.micKeepAliveInterval = setInterval(() => {
      if (!this.isDestroyed) {
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
  // ✅ CARGA DE CONFIGURACIÓN DEL TOOLBAR DESDE JSON
  // ============================================================
  private loadToolbarConfig(): void {
    this.http.get<ExternalToolbarConfig>('/config/dashboard/menu-dashboardEducativo.json')
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

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error al cargar configuración del toolbar:', err);
          this.toolbarConfig = this.getDefaultToolbarConfig();
          this.cdr.detectChanges();
        }
      });
  }

  // ============================================================
  // ✅ CARGA DE CONFIGURACIÓN DEL SIDEBAR DESDE JSON
  // ============================================================
  private loadSidebarConfig(): void {
    console.log('📂 Intentando cargar sidebar desde: /config/sidebar/sidebar-configEducativo.json');
    
    this.http.get<{ sidebarItems: SidebarItem[] }>('/config/sidebar/sidebar-configEducativo.json')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('✅ Sidebar cargado correctamente:', response);
          this.sidebarItems = this.filterItemsByRoles(response.sidebarItems);
          console.log('📋 Sidebar items después de filtrar:', this.sidebarItems);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('❌ Error al cargar configuración del sidebar:');
          console.error('  - Status:', err.status);
          console.error('  - Message:', err.message);
          console.error('  - URL:', err.url);
          console.log('🔄 Usando sidebar por defecto');
          this.sidebarItems = this.filterItemsByRoles(this.getDefaultSidebarItems());
          console.log('📋 Sidebar por defecto:', this.sidebarItems);
          this.cdr.detectChanges();
        }
      });
  }

  /**
   * Items por defecto (fallback si no se carga el JSON)
   */
  private getDefaultSidebarItems(): SidebarItem[] {
    return [
      { "id": "dashboard", "label": "Panel Principal", "icon": "dashboard", "roles": ["SUPER_ADMIN", "USER"] },
      { "id": "courses", "label": "Mis Cursos", "icon": "menu_book", "roles": ["SUPER_ADMIN", "USER"] },
      { "id": "activities", "label": "Tareas", "icon": "assignment", "roles": ["SUPER_ADMIN", "USER"] },
      { "id": "progress", "label": "Progreso", "icon": "trending_up", "roles": ["SUPER_ADMIN", "USER"] },
      { "id": "calendar", "label": "Calendario", "icon": "calendar_month", "roles":["SUPER_ADMIN", "USER"] },
      { "id": "messages", "label": "Mensajes", "icon": "message", "roles": ["SUPER_ADMIN", "USER"] },
      { "id": "settings", "label": "Configuración", "icon": "settings", "roles": ["SUPER_ADMIN", "USER"] }
    ];
  }

  /**
   * Configuración por defecto (fallback si no se carga el JSON)
   */
  private getDefaultToolbarConfig(): ToolbarConfig {
    return {
      title: 'Campus Virtual',
      showLogo: true,
      showThemeToggle: true,
      showMicToggle: true,
      showUserAvatar: true,
      showBackButton: false,
      showHelp: true,
      navLinks: [
        { label: 'Inicio', route: '/dashboard', icon: 'home', roles: ['SUPER_ADMIN', 'STUDENT', 'TEACHER'] },
        { label: 'Cursos', route: '/courses', icon: 'menu_book', roles: ['SUPER_ADMIN', 'STUDENT', 'TEACHER'] },
        { label: 'Calendario', route: '/calendar', icon: 'calendar_month', roles: ['SUPER_ADMIN', 'STUDENT', 'TEACHER'] }
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
      unreadNotifications: 5
    };
  }

  

  // ============================================================
  // CICLO DE VIDA - ngOnInit
  // ============================================================
  // ngOnInit(): void {
  //   const isMobile = window.innerWidth < 768;
  //   if (isMobile) {
  //     this.isSidebarOpen = false;
  //     this.isSidebarCollapsed = false;
  //   }

  //   this.loadToolbarConfig();
  //   this.loadSidebarConfig();

  //   // ✅ INICIALIZAR EL RELOJ
  //   this.updateTimeDisplay();

  //   // ✅ ACTUALIZAR CADA SEGUNDO
  //   this.timeInterval = setInterval(() => {
  //     this.currentTime = new Date();
  //     this.greeting = this.getGreeting();
  //     this.updateTimeDisplay();
  //   }, 1000);

  //   this.greeting = this.getGreeting();

  //   this.setupVoiceContext();

  //   this.voiceService
  //     .getTranscript()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((text: string) => {
  //       this.ngZone.run(() => {
  //         if (this.isDestroyed || !text) return;
  //         this.handleVoiceCommand(text);
  //       });
  //     });

  //   this.showWelcomeMessage();

  //   setTimeout(() => {
  //     this.activateMicIfNeeded();
  //   }, 500);

  //   this.startMicKeepAlive();
  // }




  //
  ngOnInit(): void {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      this.isSidebarOpen = false;
      this.isSidebarCollapsed = false;
    }

    this.loadToolbarConfig();
    this.loadSidebarConfig();

    // ✅ Inicializar reloj
    this.updateTimeDisplay();

    // ✅ Actualizar cada segundo
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
      this.greeting = this.getGreeting();
      this.updateTimeDisplay();
      // ✅ FORZAR DETECCIÓN DE CAMBIOS
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

    setTimeout(() => {
      this.activateMicIfNeeded();
    }, 500);

    this.startMicKeepAlive();
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
    
    // Debug: ver en consola
    console.log('🕐 Reloj actualizado:', this.currentTimeDisplay);
  }

  // ============================================================
  // CONFIGURACIÓN DE VOZ - VERSIÓN EDUCATIVA
  // ============================================================
  private setupVoiceContext(): void {
    const context = {
      activationMessage: `Bienvenido de vuelta ${this.userName}. Puedes navegar por el campus virtual usando tu voz.`,
      availableCommands: [
        'dashboard', 'inicio', 'panel',
        'cursos', 'mis cursos',
        'tareas', 'pendientes',
        'calendario', 'horario',
        'progreso', 'rendimiento',
        'mensajes', 'chat',
        'foros', 'discusión',
        'configuración', 'ajustes',
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
          const welcomeMessage = `Hola ${this.userName}, bienvenido al Campus Virtual. Tienes ${this.courseStats.pendingTasks} tareas pendientes y ${this.courseStats.inProgress} cursos en progreso.`;
          this.voiceService.speakWhenReady(welcomeMessage);
        }
      }
    }, 1500);
  }

  private getGreeting(): string {
    const hour = this.currentTime.getHours();
    if (hour < 12) return 'Buenos días 🌅';
    if (hour < 18) return 'Buenas tardes ☀️';
    return 'Buenas noches 🌙';
  }

  // ============================================================
  // MANEJAR COMANDOS DE VOZ - VERSIÓN EDUCATIVA
  // ============================================================
  private handleVoiceCommand(text: string): void {
    if (this.isDestroyed) return;
    const lower = text.toLowerCase().trim();

    console.log(`📝 [Dashboard] Comando recibido: "${lower}"`);

    if (lower.includes('dashboard') || lower.includes('inicio') || lower.includes('panel')) {
      this.setActiveSection('dashboard');
      this.voiceService.speak('Navegando al panel de control del campus');
      return;
    }

    if (lower.includes('cursos') || lower.includes('mis cursos')) {
      this.setActiveSection('courses');
      this.voiceService.speak('Navegando a tus cursos');
      return;
    }

    if (lower.includes('tareas') || lower.includes('pendientes')) {
      this.setActiveSection('activities');
      this.voiceService.speak('Navegando a tareas pendientes');
      return;
    }

    if (lower.includes('progreso') || lower.includes('rendimiento') || lower.includes('avance')) {
      this.setActiveSection('progress');
      this.voiceService.speak('Navegando a tu progreso académico');
      return;
    }

    if (lower.includes('calendario') || lower.includes('horario')) {
      this.setActiveSection('calendar');
      this.voiceService.speak('Navegando al calendario académico');
      return;
    }

    if (lower.includes('mensajes') || lower.includes('chat')) {
      this.setActiveSection('messages');
      this.voiceService.speak('Navegando a mensajes');
      return;
    }

    if (lower.includes('configuración') || lower.includes('configuracion') || lower.includes('ajustes')) {
      this.setActiveSection('settings');
      this.voiceService.speak('Navegando a configuración');
      return;
    }

    for (const action of this.quickActions) {
      if (action.voiceCommand.some(cmd => lower.includes(cmd))) {
        this.voiceService.clearTranscript();
        this.voiceService.speak(`Navegando a ${action.label}`);
        this.router.navigate([action.route]);
        return;
      }
    }

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
    const message = 'En el campus virtual puedes navegar usando tu voz. Di: "cursos", "tareas", "calendario", "progreso", "mensajes" o "configuración" para cambiar de sección.';
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
    this.router.navigate(['/progress']);
  }

  // ============================================================
  // MÉTODO PARA NAVEGAR A UN CURSO ESPECÍFICO
  // ============================================================
  navigateToCourse(courseId: string): void {
    this.voiceService.clearTranscript();
    this.voiceService.speak(`Navegando al curso`);
    this.router.navigate([`/course/${courseId}`]);
  }

  // ============================================================
  // DESTROY
  // ============================================================
  ngOnDestroy(): void {
    console.log('🧹 DashboardComponent destruido');
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    if (this.micKeepAliveInterval) {
      clearInterval(this.micKeepAliveInterval);
      this.micKeepAliveInterval = null;
    }

    this.voiceContext.resetContext();
    window.speechSynthesis.cancel();
  }
}