// import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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

// // Servicios y modelos compartidos
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../environments/environment.development';
// import { ToolbarConfig, TransparentToolbarComponent, UserMenuItem } from '../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';
// import { AuthService } from '../../../core/services/auth.service';
// import { ThemeService } from '../../../shared/services/themes/themes.service';
// import { VoiceContextService } from '../../services/voz/voice-context.service';
// import { VoiceService } from '../../services/voz/voice.service';
// import { EntitySidebarComponent } from "../../../shared/components/entity-sidebar/entity-sidebar.component";

// // Importa tu registro centralizado (ajusta la ruta según la ubicación real de tu archivo)
// import { ENTITY_REGISTRY } from '../../../shared/constants/entity-registry';
// import { EntityTableComponent } from "../../../features/admin/components/entity-table/entity-table.component";

// interface EntityDefinition {
//   name: string;
//   label: string;
//   endpoint: string;
//   icon: string;
// }

// export interface ExternalToolbarConfig extends ToolbarConfig {
//   userMenuItems?: (UserMenuItem & { actionId?: string })[];
// }

// @Component({
//   selector: 'app-database-maintenance',
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
//     TransparentToolbarComponent,
//     EntitySidebarComponent,
//     EntityTableComponent
// ],
//   templateUrl: './database-maintenance.component.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   styleUrls: ['./database-maintenance.component.scss']
// })
// export class DatabaseMaintenanceComponent implements OnInit, OnDestroy {
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
//   private http = inject(HttpClient);

//   // ============================================================
//   // VARIABLES PRIVADAS Y ESTADO
//   // ============================================================
//   private destroy$ = new Subject<void>();
//   private isDestroyed = false;
//   private timeInterval: any;

//   currentTime = new Date();
//   greeting = '';
//   currentTimeDisplay: string = '';

//   // Mapa de acciones para el menú de usuario de la toolbar
//   private actionMap: { [key: string]: () => void } = {
//     logout: () => this.logout(),
//   };

//   // ============================================================
//   // SEÑALES DE NEGOCIO (Cargadas dinámicamente desde el registro)
//   // ============================================================
//   entities = signal<EntityDefinition[]>(
//     (() => {
//       const values = Object.values(ENTITY_REGISTRY);
//       const mapped = values.map(config => ({
//         name: config.entityName ?? '',
//         label: config.displayName ?? '',
//         endpoint: this.extractEndpoint(config.apiPath ?? ''),
//         icon: this.mapIconToMaterial(config.icon ?? '')
//       }));
//       console.table(mapped); // <-- Esto te imprimirá una tabla limpia en la consola con los 'name' y 'endpoint' reales
//       return mapped;
//     })()
//   );

//   selectedEntity = signal<EntityDefinition | null>(null);
//   items = signal<any[]>([]);
//   isLoading = signal<boolean>(false);
//   searchTerm = signal<string>('');

//   // Configuración dinámica para el TransparentToolbar combinada con la entidad seleccionada
//   toolbarConfig = computed<ToolbarConfig>(() => {
//     const current = this.selectedEntity();
//     const baseConfig = this.baseToolbarConfig;
//     return {
//       ...baseConfig,
//       title: current ? `Mantenimiento: ${current.label}` : 'Mantenimiento de Base de Datos',
//       showSearch: !!current
//     };
//   });

//   private baseToolbarConfig: ToolbarConfig = {
//     title: 'Mantenimiento de Base de Datos',
//     showLogo: true,
//     showThemeToggle: true,
//     showMicToggle: true,
//     showUserAvatar: true,
//     showBackButton: true,
//     showHelp: true,
//     userMenuItems: [
//       { label: 'Mi Perfil', icon: 'person', route: '/profile' },
//       { label: 'Configuración', icon: 'settings', route: '/settings' },
//       { isDivider: true },
//       {
//         label: 'Cerrar Sesión',
//         icon: 'logout',
//         class: 'logout-item',
//         action: () => this.logout()
//       }
//     ]
//   };

//   // ============================================================
//   // GETTERS REQUERIDOS POR LA TOOLBAR
//   // ============================================================
//   get userName(): string {
//     return this.authService.getUserName() || 'Administrador';
//   }

//   get userEmail(): string {
//     return this.authService.getUserEmail() || 'admin@database.com';
//   }

//   get formattedCurrentTime(): string {
//     return this.currentTimeDisplay;
//   }

//   // ============================================================
//   // COMPUTED: FILTRADO DE ITEMS
//   // ============================================================
//   filteredItems = computed(() => {
//     const term = this.searchTerm().toLowerCase().trim();
//     const data = this.items();
//     if (!term) return data;
    
//     return data.filter(item => 
//       Object.values(item).some(val => 
//         String(val).toLowerCase().includes(term)
//       )
//     );
//   });

//   // ============================================================
//   // CICLO DE VIDA - ngOnInit / ngOnDestroy
//   // ============================================================
//   ngOnInit(): void {
//     console.log('🚀 DatabaseMaintenanceComponent inicializado');

//     // Inicializar reloj
//     this.updateTimeDisplay();
//     this.timeInterval = setInterval(() => {
//       this.currentTime = new Date();
//       this.greeting = this.getGreeting();
//       this.updateTimeDisplay();
//       this.cdr.detectChanges();
//     }, 1000);

//     this.greeting = this.getGreeting();
//     this.setupVoiceContext();

//     // Suscribirse a comandos de voz generales
//     this.voiceService.getTranscript()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((text: string) => {
//         this.ngZone.run(() => {
//           if (this.isDestroyed || !text) return;
//           this.handleVoiceCommand(text);
//         });
//       });
//   }

//   ngOnDestroy(): void {
//     this.isDestroyed = true;
//     this.destroy$.next();
//     this.destroy$.complete();

//     if (this.timeInterval) {
//       clearInterval(this.timeInterval);
//     }

//     this.voiceContext.resetContext();
//     window.speechSynthesis.cancel();
//     console.log('🧹 DatabaseMaintenanceComponent destruido');
//   }

//   onSelectEntityByName(entityName: string): void {
//     const foundEntity = this.entities().find(e => e.name === entityName);
//     if (foundEntity) {
//       this.selectEntity(foundEntity);
//     }
//   }

//   // ============================================================
//   // MÉTODOS DE DATOS Y ENTIDADES
//   // ============================================================
//   selectEntity(entity: EntityDefinition) {
//     this.selectedEntity.set(entity);
//     this.searchTerm.set('');
//     this.loadEntityData(entity);
//   }

//   //
//   loadEntityData(entity: EntityDefinition) {
//     this.isLoading.set(true);
//     const url = `${environment.apiGateway}${environment.apiV1}${entity.endpoint}`;

//     this.http.get<any>(url)
//       .pipe(takeUntil(this.destroy$))
//       .subscribe({
//         next: (response) => {
//           // Si Spring devuelve un objeto Page, los registros están dentro de 'content'. Si es una lista directa, se usa el response tal cual.
//           const itemsArray = Array.isArray(response) ? response : (response?.content || []);
          
//           this.items.set(itemsArray);
//           this.isLoading.set(false);
//           this.cdr.detectChanges();
//         },
//         error: (err) => {
//           console.error(`Error cargando ${entity.name} en ${url}:`, err);
//           this.items.set([]);
//           this.isLoading.set(false);
//           this.cdr.detectChanges();
//         }
//       });
//   }




//   onSearch(term: string) {
//     this.searchTerm.set(term);
//   }

//   getColumns(): string[] {
//     const data = this.items();
//     if (data.length === 0) return [];
//     return Object.keys(data[0]).filter(key => {
//       const val = data[0][key];
//       return typeof val !== 'object' || val === null;
//     });
//   }

//   // ============================================================
//   // MÉTODOS AUXILIARES DE ADAPTACIÓN (REGISTRO CENTRAL)
//   // ============================================================
//   private extractEndpoint(apiPath: string): string {
//     const parts = apiPath.split('/api/v1');
//     if (parts.length > 1) {
//       return parts[1];
//     }
//     return apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
//   }

//   private mapIconToMaterial(iconString: string): string {
//     const map: Record<string, string> = {
//       '👤': 'person',
//       '🛡️': 'security',
//       '🔐': 'vpn_key',
//       '📋': 'badge',
//       '⚙️': 'settings',
//       '🔄': 'devices',
//       '🔑': 'sync'
//     };
//     return map[iconString] || iconString || 'folder';
//   }

//   // ============================================================
//   // UTILIDADES, VOZ Y ACCIONES
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

//   private setupVoiceContext(): void {
//     const context = {
//       activationMessage: `Panel de Mantenimiento de Base de Datos.`,
//       availableCommands: ['ayuda', 'inicio'],
//       preventBackend: true
//     };
//     this.voiceContext.setContext(context);
//   }

//   private handleVoiceCommand(text: string): void {
//     const lower = text.toLowerCase().trim();
//     if (lower.includes('ayuda')) {
//       this.showHelp();
//     }
//   }

//   showHelp(): void {
//     this.voiceService.speak('Selecciona una entidad en el menú lateral para ver y gestionar sus registros.');
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
// }











// import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, signal, computed } from '@angular/core';
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

// // Servicios y modelos compartidos
// import { HttpClient } from '@angular/common/http';
// import { environment } from '../../../../environments/environment.development';
// import { ToolbarConfig, TransparentToolbarComponent, UserMenuItem } from '../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';
// import { AuthService } from '../../../core/services/auth.service';
// import { ThemeService } from '../../../shared/services/themes/themes.service';
// import { VoiceContextService } from '../../services/voz/voice-context.service';
// import { VoiceService } from '../../services/voz/voice.service';
// import { EntitySidebarComponent } from "../../../shared/components/entity-sidebar/entity-sidebar.component";

// // Importa tu registro centralizado (ajusta la ruta según la ubicación real de tu archivo)
// import { ENTITY_REGISTRY, getEntityConfig } from '../../../shared/constants/entity-registry';
// import { EntityTableComponent } from "../../../features/admin/components/entity-table/entity-table.component";
// import { EntityConfig } from '../models/entity-config';


// interface EntityDefinition {
//   name: string;
//   label: string;
//   endpoint: string;
//   icon: string;
// }

// export interface ExternalToolbarConfig extends ToolbarConfig {
//   userMenuItems?: (UserMenuItem & { actionId?: string })[];
// }

// @Component({
//   selector: 'app-database-maintenance',
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
//     TransparentToolbarComponent,
//     EntitySidebarComponent,
//     EntityTableComponent
//   ],
//   templateUrl: './database-maintenance.component.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   styleUrls: ['./database-maintenance.component.scss']
// })
// export class DatabaseMaintenanceComponent implements OnInit, OnDestroy {
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
//   private http = inject(HttpClient);

//   // ============================================================
//   // VARIABLES PRIVADAS Y ESTADO
//   // ============================================================
//   private destroy$ = new Subject<void>();
//   private isDestroyed = false;
//   private timeInterval: any;

//   currentTime = new Date();
//   greeting = '';
//   currentTimeDisplay: string = '';

//   // Mapa de acciones para el menú de usuario de la toolbar
//   private actionMap: { [key: string]: () => void } = {
//     logout: () => this.logout(),
//   };

//   // ============================================================
//   // SEÑALES DE NEGOCIO (Cargadas dinámicamente desde el registro)
//   // ============================================================
//   entities = signal<EntityDefinition[]>(
//     (() => {
//       const values = Object.values(ENTITY_REGISTRY);
//       const mapped = values.map(config => ({
//         name: config.entityName ?? '',
//         label: config.displayName ?? '',
//         endpoint: this.extractEndpoint(config.apiPath ?? ''),
//         icon: this.mapIconToMaterial(config.icon ?? '')
//       }));
//       return mapped;
//     })()
//   );

//   selectedEntity = signal<EntityDefinition | null>(null);
  
//   // Configuración de la entidad mapeada desde el EntityConfig completo para el componente de la tabla
//   selectedEntityConfig = computed<EntityConfig | null>(() => {
//     const current = this.selectedEntity();
//     if (!current) return null;
//     return getEntityConfig(current.name) || null;
//   });

//   // Configuración dinámica para el TransparentToolbar combinada con la entidad seleccionada
//   toolbarConfig = computed<ToolbarConfig>(() => {
//     const current = this.selectedEntity();
//     const baseConfig = this.baseToolbarConfig;
//     return {
//       ...baseConfig,
//       title: current ? `Mantenimiento: ${current.label}` : 'Mantenimiento de Base de Datos',
//       showSearch: false // Lo gestiona internamente el entity-table
//     };
//   });

//   private baseToolbarConfig: ToolbarConfig = {
//     title: 'Mantenimiento de Base de Datos',
//     showLogo: true,
//     showThemeToggle: true,
//     showMicToggle: true,
//     showUserAvatar: true,
//     showBackButton: true,
//     showHelp: true,
//     userMenuItems: [
//       { label: 'Mi Perfil', icon: 'person', route: '/profile' },
//       { label: 'Configuración', icon: 'settings', route: '/settings' },
//       { isDivider: true },
//       {
//         label: 'Cerrar Sesión',
//         icon: 'logout',
//         class: 'logout-item',
//         action: () => this.logout()
//       }
//     ]
//   };

//   // ============================================================
//   // GETTERS REQUERIDOS POR LA TOOLBAR
//   // ============================================================
//   get userName(): string {
//     return this.authService.getUserName() || 'Administrador';
//   }

//   get userEmail(): string {
//     return this.authService.getUserEmail() || 'admin@database.com';
//   }

//   get formattedCurrentTime(): string {
//     return this.currentTimeDisplay;
//   }

//   // ============================================================
//   // CICLO DE VIDA - ngOnInit / ngOnDestroy
//   // ============================================================
//   ngOnInit(): void {
//     console.log('🚀 DatabaseMaintenanceComponent inicializado');

//     // Inicializar reloj
//     this.updateTimeDisplay();
//     this.timeInterval = setInterval(() => {
//       this.currentTime = new Date();
//       this.greeting = this.getGreeting();
//       this.updateTimeDisplay();
//       this.cdr.detectChanges();
//     }, 1000);

//     this.greeting = this.getGreeting();
//     this.setupVoiceContext();

//     // Suscribirse a comandos de voz generales
//     this.voiceService.getTranscript()
//       .pipe(takeUntil(this.destroy$))
//       .subscribe((text: string) => {
//         this.ngZone.run(() => {
//           if (this.isDestroyed || !text) return;
//           this.handleVoiceCommand(text);
//         });
//       });
//   }

//   ngOnDestroy(): void {
//     this.isDestroyed = true;
//     this.destroy$.next();
//     this.destroy$.complete();

//     if (this.timeInterval) {
//       clearInterval(this.timeInterval);
//     }

//     this.voiceContext.resetContext();
//     window.speechSynthesis.cancel();
//     console.log('🧹 DatabaseMaintenanceComponent destruido');
//   }

//   onSelectEntityByName(entityName: string): void {
//     const foundEntity = this.entities().find(e => e.name === entityName);
//     if (foundEntity) {
//       this.selectEntity(foundEntity);
//     }
//   }
//   // Manejo de búsqueda general desde la toolbar superior (si aplica)
//   onSearch(query: string): void {
//     console.log('Búsqueda global:', query);
//     // Puedes implementar aquí una acción global si lo necesitas, 
//     // o dejarlo vacío si la barra de búsqueda de la toolbar ya no se usa.
//   }

//   // ============================================================
//   // MÉTODOS DE SELECCIÓN Y ACCIONES DE TABLA
//   // ============================================================
//   selectEntity(entity: EntityDefinition) {
//     this.selectedEntity.set(entity);
//   }

//   editEntityItem(id: number): void {
//     console.log('Editar registro con ID:', id);
//     // Lógica para abrir modal o redirigir al formulario de edición
//   }

//   deleteEntityItem(id: number): void {
//     console.log('Eliminar registro con ID:', id);
//     // Lógica para confirmar y eliminar el registro
//   }

//   // ============================================================
//   // MÉTODOS AUXILIARES DE ADAPTACIÓN (REGISTRO CENTRAL)
//   // ============================================================
//   private extractEndpoint(apiPath: string): string {
//     const parts = apiPath.split('/api/v1');
//     if (parts.length > 1) {
//       return parts[1];
//     }
//     return apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
//   }

//   private mapIconToMaterial(iconString: string): string {
//     const map: Record<string, string> = {
//       '👤': 'person',
//       '🛡️': 'security',
//       '🔐': 'vpn_key',
//       '📋': 'badge',
//       '⚙️': 'settings',
//       '🔄': 'devices',
//       '🔑': 'sync'
//     };
//     return map[iconString] || iconString || 'folder';
//   }

//   // ============================================================
//   // UTILIDADES, VOZ Y ACCIONES
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

//   private setupVoiceContext(): void {
//     const context = {
//       activationMessage: `Panel de Mantenimiento de Base de Datos.`,
//       availableCommands: ['ayuda', 'inicio'],
//       preventBackend: true
//     };
//     this.voiceContext.setContext(context);
//   }

//   private handleVoiceCommand(text: string): void {
//     const lower = text.toLowerCase().trim();
//     if (lower.includes('ayuda')) {
//       this.showHelp();
//     }
//   }

//   showHelp(): void {
//     this.voiceService.speak('Selecciona una entidad en el menú lateral para ver y gestionar sus registros.');
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
// }









// src/app/features/admin/pages/database-maintenance/database-maintenance.component.ts

import { Component, OnInit, OnDestroy, inject, NgZone, ChangeDetectorRef, ChangeDetectionStrategy, signal, computed, ViewChild } from '@angular/core';
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

// Servicios y modelos compartidos
import { HttpClient } from '@angular/common/http';
import { TransparentToolbarComponent, ToolbarConfig, UserMenuItem } from '../../../shared/components/toolbar/transparent-toolbar/transparent-toolbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../shared/services/themes/themes.service';
import { VoiceContextService } from '../../services/voz/voice-context.service';
import { VoiceService } from '../../services/voz/voice.service';
import { EntitySidebarComponent } from "../../../shared/components/entity-sidebar/entity-sidebar.component";
import { EntityCrudService } from '../../../shared/services/sidebar/entity-crud.service';

// Importa componentes de gestión de entidades
import { ENTITY_REGISTRY, getEntityConfig } from '../../../shared/constants/entity-registry';
import { EntityTableComponent } from "../../../features/admin/components/entity-table/entity-table.component";
import { EntityFormComponent } from '../../../features/admin/components/entity-form/entity-form.component';
import { EntityConfig } from '../models/entity-config';

interface EntityDefinition {
  name: string;
  label: string;
  endpoint: string;
  icon: string;
}

export interface ExternalToolbarConfig extends ToolbarConfig {
  userMenuItems?: (UserMenuItem & { actionId?: string })[];
}

@Component({
  selector: 'app-database-maintenance',
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
    TransparentToolbarComponent,
    EntitySidebarComponent,
    EntityTableComponent,
    EntityFormComponent
  ],
  templateUrl: './database-maintenance.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./database-maintenance.component.scss']
})
export class DatabaseMaintenanceComponent implements OnInit, OnDestroy {
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
  private http = inject(HttpClient);
  private crudService = inject(EntityCrudService);

  // Referencia a la tabla para actualizarla dinámicamente
  @ViewChild(EntityTableComponent) tableComponent?: EntityTableComponent;

  // ============================================================
  // VARIABLES PRIVADAS Y ESTADO
  // ============================================================
  private destroy$ = new Subject<void>();
  private isDestroyed = false;
  private timeInterval: any;

  currentTime = new Date();
  greeting = '';
  currentTimeDisplay: string = '';

  // Control de vistas (Tabla vs Formulario dinámico)
  showForm = signal(false);
  isEditing = signal(false);
  currentData = signal<any>(null);
  loading = signal(false);

  // Mapa de acciones para el menú de usuario de la toolbar
  private actionMap: { [key: string]: () => void } = {
    logout: () => this.logout(),
  };

  // ============================================================
  // SEÑALES DE NEGOCIO (Cargadas dinámicamente desde el registro)
  // ============================================================
  entities = signal<EntityDefinition[]>(
    (() => {
      const values = Object.values(ENTITY_REGISTRY);
      const mapped = values.map(config => ({
        name: config.entityName ?? '',
        label: config.displayName ?? '',
        endpoint: this.extractEndpoint(config.apiPath ?? ''),
        icon: this.mapIconToMaterial(config.icon ?? '')
      }));
      return mapped;
    })()
  );

  selectedEntity = signal<EntityDefinition | null>(null);
  
  // Configuración de la entidad mapeada desde el EntityConfig completo
  selectedEntityConfig = computed<EntityConfig | null>(() => {
    const current = this.selectedEntity();
    if (!current) return null;
    return getEntityConfig(current.name) || null;
  });

  // Configuración dinámica para el TransparentToolbar
  toolbarConfig = computed<ToolbarConfig>(() => {
    const current = this.selectedEntity();
    const baseConfig = this.baseToolbarConfig;
    return {
      ...baseConfig,
      title: current ? `Mantenimiento: ${current.label}` : 'Mantenimiento de Base de Datos',
      showSearch: false
    };
  });

  private baseToolbarConfig: ToolbarConfig = {
    title: 'Mantenimiento de Base de Datos',
    showLogo: true,
    showThemeToggle: true,
    showMicToggle: true,
    showUserAvatar: true,
    showBackButton: true,
    showHelp: true,
    userMenuItems: [
      { label: 'Mi Perfil', icon: 'person', route: '/profile' },
      { label: 'Configuración', icon: 'settings', route: '/settings' },
      { isDivider: true },
      {
        label: 'Cerrar Sesión',
        icon: 'logout',
        class: 'logout-item',
        action: () => this.logout()
      }
    ]
  };

  // ============================================================
  // GETTERS REQUERIDOS POR LA TOOLBAR
  // ============================================================
  get userName(): string {
    return this.authService.getUserName() || 'Administrador';
  }

  get userEmail(): string {
    return this.authService.getUserEmail() || 'admin@database.com';
  }

  get formattedCurrentTime(): string {
    return this.currentTimeDisplay;
  }

  // ============================================================
  // CICLO DE VIDA - ngOnInit / ngOnDestroy
  // ============================================================
  ngOnInit(): void {
    console.log('🚀 DatabaseMaintenanceComponent inicializado');

    this.updateTimeDisplay();
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
      this.greeting = this.getGreeting();
      this.updateTimeDisplay();
      this.cdr.detectChanges();
    }, 1000);

    this.greeting = this.getGreeting();
    this.setupVoiceContext();

    this.voiceService.getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.ngZone.run(() => {
          if (this.isDestroyed || !text) return;
          this.handleVoiceCommand(text);
        });
      });
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.destroy$.next();
    this.destroy$.complete();

    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.voiceContext.resetContext();
    window.speechSynthesis.cancel();
    console.log('🧹 DatabaseMaintenanceComponent destruido');
  }

  onSelectEntityByName(entityName: string): void {
    const foundEntity = this.entities().find(e => e.name === entityName);
    if (foundEntity) {
      this.selectEntity(foundEntity);
    }
  }

  onSearch(query: string): void {
    console.log('Búsqueda global:', query);
  }

  // ============================================================
  // MÉTODOS DE SELECCIÓN Y GESTIÓN DE ACCIONES (TABLA Y FORMULARIO)
  // ============================================================
  selectEntity(entity: EntityDefinition) {
    this.selectedEntity.set(entity);
    this.showForm.set(false); // Regresar a la tabla al cambiar de entidad
  }

  openCreateForm(): void {
    this.isEditing.set(false);
    this.currentData.set(null);
    this.showForm.set(true);
  }

  editEntityItem(id: number): void {
    const config = this.selectedEntityConfig();
    if (!config) return;

    this.loading.set(true);
    this.crudService.getById(config, id).subscribe({
      next: (data) => {
        this.currentData.set(data);
        this.isEditing.set(true);
        this.showForm.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar registro para editar:', err);
        this.loading.set(false);
      }
    });
  }

  deleteEntityItem(id: number): void {
    const config = this.selectedEntityConfig();
    if (!config) return;

    if (confirm('¿Estás seguro de que deseas eliminar este registro?')) {
      this.loading.set(true);
      this.crudService.delete(config, id).subscribe({
        next: () => {
          this.loading.set(false);
          if (this.tableComponent) {
            this.tableComponent.reload();
          }
        },
        error: (err) => {
          console.error('Error al eliminar registro:', err);
          this.loading.set(false);
        }
      });
    }
  }

  handleSave(formValue: any): void {
    const config = this.selectedEntityConfig();
    if (!config) return;

    this.loading.set(true);

    const request$ = this.isEditing()
      ? this.crudService.update(config, this.currentData().id, formValue)
      : this.crudService.create(config, formValue);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.closeForm();
        if (this.tableComponent) {
          this.tableComponent.reload();
        }
      },
      error: (err) => {
        console.error('Error al guardar el registro:', err);
        this.loading.set(false);
      }
    });
  }

  closeForm(): void {
    this.showForm.set(false);
    this.currentData.set(null);
    this.isEditing.set(false);
  }

  // ============================================================
  // MÉTODOS AUXILIARES DE ADAPTACIÓN (REGISTRO CENTRAL)
  // ============================================================
  private extractEndpoint(apiPath: string): string {
    const parts = apiPath.split('/api/v1');
    if (parts.length > 1) {
      return parts[1];
    }
    return apiPath.startsWith('/') ? apiPath : `/${apiPath}`;
  }

  private mapIconToMaterial(iconString: string): string {
    const map: Record<string, string> = {
      '👤': 'person',
      '🛡️': 'security',
      '🔐': 'vpn_key',
      '📋': 'badge',
      '⚙️': 'settings',
      '🔄': 'devices',
      '🔑': 'sync'
    };
    return map[iconString] || iconString || 'folder';
  }

  // ============================================================
  // UTILIDADES, VOZ Y ACCIONES
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

  private setupVoiceContext(): void {
    const context = {
      activationMessage: `Panel de Mantenimiento de Base de Datos.`,
      availableCommands: ['ayuda', 'inicio'],
      preventBackend: true
    };
    this.voiceContext.setContext(context);
  }

  private handleVoiceCommand(text: string): void {
    const lower = text.toLowerCase().trim();
    if (lower.includes('ayuda')) {
      this.showHelp();
    }
  }

  showHelp(): void {
    this.voiceService.speak('Selecciona una entidad en el menú lateral para ver y gestionar sus registros.');
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
}