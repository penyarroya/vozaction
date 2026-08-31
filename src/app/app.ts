// // app.component.ts (CORREGIDO)
// import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
// import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
// import { filter, map, mergeMap } from 'rxjs/operators';
// import { AuthService } from './core/services/auth.service';
// import { ThemeService } from './shared/services/themes/themes.service';
// import { ServerStatusService } from './core/services/server-status.service';
// import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
// import { VoiceToggleComponent } from "./shared/components/app-voice-toggle/app-voice-toggle.component";
// import { VoiceCommandHandlerService } from './features/services/voz/voice-command-handler.service';

// @Component({
//   selector: 'app-root',
//   imports: [
//     RouterOutlet, 
//     ThemeToggleComponent, 
//     ThemeToggleComponent, 
//     VoiceToggleComponent
//   ],
//   templateUrl: './app.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   styleUrl: './app.scss'
// }) 
// export class App implements OnInit {
//   private authService = inject(AuthService);
//   public themeService = inject(ThemeService);
//   private router = inject(Router);
//   private activatedRoute = inject(ActivatedRoute);
//   private serverStatus = inject(ServerStatusService);
//   private voiceHandler = inject(VoiceCommandHandlerService);

//   ngOnInit(): void {
//     console.log('🚀 Inicializando VozAcction - Carga rápida');

//     // 1. ESCUCHADOR DE TEMAS
//     this.router.events.pipe(
//       filter(event => event instanceof NavigationEnd),
//       map(() => this.activatedRoute),
//       map(route => {
//         while (route.firstChild) route = route.firstChild;
//         return route;
//       }),
//       mergeMap(route => route.data)
//     ).subscribe(data => {
//       const showButton = data['showTheme'] ?? false;
//       this.themeService.setVisibility(showButton);
//       console.log(`🎨 Visibilidad del botón de tema actualizada por ruta: ${showButton}`);
//     });

//     // 2. INICIAR MONITOREO DEL SERVIDOR
//     this.serverStatus.startMonitoring();

//     // 3. ✅ CONTROL DE SESIÓN MEJORADO
//     this.initializeSession();
//   }

//   /**
//    * ✅ Inicializa la sesión de forma segura
//    * - Si hay sesión local, la verifica
//    * - Si no hay, solo muestra mensaje sin errores
//    */
//   private initializeSession(): void {
//     const currentUser = this.authService.currentUser();
    
//     // Si NO hay usuario en localStorage, es modo visitante
//     if (!currentUser) {
//       console.log('ℹ️ Modo visitante - sin sesión activa');
//       return;
//     }

//     // Si HAY usuario en localStorage, verificar con el servidor
//     console.log('🔄 Verificando sesión existente...');
//     this.authService.checkSession().subscribe({
//       next: (user) => {
//         if (user) {
//           console.log(`✅ Sesión confirmada para: ${user.username}`);
//         } else {
//           console.log('ℹ️ Sesión expirada - modo visitante');
//         }
//       },
//       error: () => {
//         console.log('ℹ️ Error verificando sesión - modo visitante');
//       }
//     });
//   }
// }












// // app.component.ts - VERSIÓN ORIGINAL RESTAURADA
// import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
// import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
// import { filter, map, mergeMap } from 'rxjs/operators';
// import { AuthService } from './core/services/auth.service';
// import { ThemeService } from './shared/services/themes/themes.service';
// import { ServerStatusService } from './core/services/server-status.service';
// import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
// import { VoiceToggleComponent } from "./shared/components/app-voice-toggle/app-voice-toggle.component";
// import { VoiceCommandHandlerService } from './features/services/voz/voice-command-handler.service';

// @Component({
//   selector: 'app-root',
//   imports: [
//     RouterOutlet, 
//     ThemeToggleComponent, 
//     ThemeToggleComponent, 
//     VoiceToggleComponent
//   ],
//   templateUrl: './app.html',
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   styleUrl: './app.scss'
// }) 
// export class App implements OnInit {
//   private authService = inject(AuthService);
//   public themeService = inject(ThemeService);
//   private router = inject(Router);
//   private activatedRoute = inject(ActivatedRoute);
//   private serverStatus = inject(ServerStatusService);
//   private voiceHandler = inject(VoiceCommandHandlerService);

//   ngOnInit(): void {
//     console.log('🚀 Inicializando VozAcction - Carga rápida');

//     // 1. ESCUCHADOR DE TEMAS
//     this.router.events.pipe(
//       filter(event => event instanceof NavigationEnd),
//       map(() => this.activatedRoute),
//       map(route => {
//         while (route.firstChild) route = route.firstChild;
//         return route;
//       }),
//       mergeMap(route => route.data)
//     ).subscribe(data => {
//       const showButton = data['showTheme'] ?? false;
//       this.themeService.setVisibility(showButton);
//       console.log(`🎨 Visibilidad del botón de tema actualizada por ruta: ${showButton}`);
//     });

//     // 2. INICIAR MONITOREO DEL SERVIDOR
//     this.serverStatus.startMonitoring();

//     // 3. ✅ CONTROL DE SESIÓN MEJORADO
//     this.initializeSession();
//   }

//   /**
//    * ✅ Inicializa la sesión de forma segura
//    * - Si hay sesión local, la verifica
//    * - Si no hay, solo muestra mensaje sin errores
//    */
//   private initializeSession(): void {
//     const currentUser = this.authService.currentUser();
    
//     // Si NO hay usuario en localStorage, es modo visitante
//     if (!currentUser) {
//       console.log('ℹ️ Modo visitante - sin sesión activa');
//       return;
//     }

//     // Si HAY usuario en localStorage, verificar con el servidor
//     console.log('🔄 Verificando sesión existente...');
//     this.authService.checkSession().subscribe({
//       next: (user) => {
//         if (user) {
//           console.log(`✅ Sesión confirmada para: ${user.username}`);
//         } else {
//           console.log('ℹ️ Sesión expirada - modo visitante');
//         }
//       },
//       error: () => {
//         console.log('ℹ️ Error verificando sesión - modo visitante');
//       }
//     });
//   }
// }










// app.component.ts - VERSIÓN ORIGINAL RESTAURADA + LIMPIEZA DE PREFERENCIAS
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map, mergeMap } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './shared/services/themes/themes.service';
import { ServerStatusService } from './core/services/server-status.service';
import { ThemeToggleComponent } from './shared/components/theme-toggle/theme-toggle.component';
import { VoiceToggleComponent } from "./shared/components/app-voice-toggle/app-voice-toggle.component";
import { VoiceCommandHandlerService } from './features/services/voz/voice-command-handler.service';
// ✅ AÑADIR IMPORTACIÓN
import { UserPreferencesService } from './shared/services/user-preferences/user-preferences.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    ThemeToggleComponent, 
    ThemeToggleComponent, 
    VoiceToggleComponent
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss'
}) 
export class App implements OnInit {
  private authService = inject(AuthService);
  public themeService = inject(ThemeService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private serverStatus = inject(ServerStatusService);
  private voiceHandler = inject(VoiceCommandHandlerService);
  // ✅ AÑADIR INYECCIÓN
  private userPreferences = inject(UserPreferencesService);

  ngOnInit(): void {
    console.log('🚀 Inicializando VozAcction - Carga rápida');

    // 1. ESCUCHADOR DE TEMAS
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.activatedRoute),
      map(route => {
        while (route.firstChild) route = route.firstChild;
        return route;
      }),
      mergeMap(route => route.data)
    ).subscribe(data => {
      const showButton = data['showTheme'] ?? false;
      this.themeService.setVisibility(showButton);
      console.log(`🎨 Visibilidad del botón de tema actualizada por ruta: ${showButton}`);
    });

    // 2. INICIAR MONITOREO DEL SERVIDOR
    this.serverStatus.startMonitoring();

    // 3. ✅ CONTROL DE SESIÓN MEJORADO
    this.initializeSession();
  }

  /**
   * ✅ Inicializa la sesión de forma segura
   * - Si hay sesión local, la verifica
   * - Si no hay, solo muestra mensaje sin errores
   */
  private initializeSession(): void {
    const currentUser = this.authService.currentUser();
    
    // Si NO hay usuario en localStorage, es modo visitante
    if (!currentUser) {
      console.log('ℹ️ Modo visitante - sin sesión activa');
      // ✅ AÑADIR: Limpiar preferencias si no hay usuario
      this.userPreferences.clearPreferences();
      return;
    }

    // Si HAY usuario en localStorage, verificar con el servidor
    console.log('🔄 Verificando sesión existente...');
    this.authService.checkSession().subscribe({
      next: (user) => {
        if (user) {
          console.log(`✅ Sesión confirmada para: ${user.username}`);
          // ✅ AÑADIR: Cargar preferencias del usuario autenticado
          this.userPreferences.loadPreferences().subscribe({
            next: (prefs) => console.log('✅ Preferencias cargadas:', prefs),
            error: (error) => console.error('❌ Error cargando preferencias:', error)
          });
        } else {
          console.log('ℹ️ Sesión expirada - limpiando datos locales');
          // ✅ AÑADIR: Limpiar preferencias si la sesión expiró
          this.userPreferences.clearPreferences();
          this.authService.fullLocalLogout();
        }
      },
      error: () => {
        console.log('ℹ️ Error verificando sesión - limpiando datos locales');
        // ✅ AÑADIR: Limpiar preferencias si hay error
        this.userPreferences.clearPreferences();
        this.authService.fullLocalLogout();
      }
    });
  }
}