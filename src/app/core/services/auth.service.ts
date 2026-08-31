// // src/app/core/services/auth/auth.service.ts
// import { HttpClient, HttpErrorResponse } from '@angular/common/http';
// import { Injectable, inject, signal, PLATFORM_ID, computed } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import { Observable, tap, catchError, throwError, of } from 'rxjs';
// import { environment } from '../../../environments/environment';
// import { LoginResponse } from '../../features/auth/models/LoginResponse';
// import { LoginRequest } from '../../features/auth/models/LoginRequest';
// import { Router } from '@angular/router';

// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private readonly http = inject(HttpClient);
//   private readonly platformId = inject(PLATFORM_ID);
//   private readonly router = inject(Router); // ← AÑADIR

//   private readonly AUTH_URL = `${environment.apiGateway}${environment.authEndpoint}`;
//   private readonly USER_INFO_KEY = 'user_info';
//   private readonly TAB_SESSION_KEY = 'app_session_active';
//   private readonly API_V1_URL = `${environment.apiGateway}${environment.apiV1}`;

    
//   currentUser = signal<LoginResponse | null>(this.getInitialUser());
  
//   // Selector reactivo de solo lectura para comprobar el estado desde rutas y guardianes
//   isAuthenticated = computed(() => this.currentUser() !== null);

//   private readonly httpOptions = { withCredentials: true };

//   constructor() {
//     console.log('🏗️ AuthService constructor - VERSIÓN ACTUALIZADA');
//     console.log('🏗️ AuthService constructor - AUTH_URL:', this.AUTH_URL);
//     console.log('🏗️ AuthService constructor - currentUser:', this.currentUser());
//   }

//   //
//   private getInitialUser(): LoginResponse | null {
//     if (!isPlatformBrowser(this.platformId)) return null;

//     const isTabActive = sessionStorage.getItem(this.TAB_SESSION_KEY);
//     if (!isTabActive) {
//       sessionStorage.setItem(this.TAB_SESSION_KEY, 'true');
//       return null;
//     }
    
//     const savedUser = localStorage.getItem(this.USER_INFO_KEY);
//     if (!savedUser) return null;

//     try {
//       const storedUser = JSON.parse(savedUser);
      
//       const user: LoginResponse = {
//         id: storedUser.id,
//         username: storedUser.username,
//         email: storedUser.email || '',  // ✅ Restaurar email
//         roles: storedUser.roles || [],
//         type: 'Bearer',
//         token: '',
//         refreshToken: null
//       };
      
//       console.log('✅ Sesión restaurada con roles:', user.roles);
//       console.log('📧 Email restaurado:', user.email);
//       return user;
//     } catch (e) {
//       console.error('Error parseando usuario:', e);
//       return null;
//     }
//   }

//   //
//   getUserId(): number | null {
//     const user = this.currentUser();
//     return user ? user.id : null;
//   }

//   getUserName(): string {
//     const user = this.currentUser();
//     return user ? user.username : 'Usuario';
//   }

//   //
//   getUserEmail(): string | null {
//     // 1. Intentar desde currentUser
//     const user = this.currentUser();
//     if (user?.email) {
//       return user.email;
//     }
    
//     // 2. Intentar desde localStorage (por separado)
//     if (isPlatformBrowser(this.platformId)) {
//       const email = localStorage.getItem('userEmail');
//       if (email) {
//         return email;
//       }
//     }
    
//     return null;
//   }

//   //
//   login(credentials: LoginRequest): Observable<LoginResponse> {
//     return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials, this.httpOptions)
//       .pipe(
//         tap((response) => {
//           console.log('✅ Login exitoso');
//           console.log('📧 Email recibido:', response.email);
          
//           if (isPlatformBrowser(this.platformId)) {
//             sessionStorage.setItem(this.TAB_SESSION_KEY, 'true');
            
//             // ✅ Guardar email por separado
//             if (response.email) {
//               localStorage.setItem('userEmail', response.email);
//             }
//           }
          
//           this.updateLocalSession(response);
//         }),
//         catchError((error) => this.handleError(error))
//       );
//   }

//   //
//   logout(): Observable<void> {
//     return this.http.post<void>(`${this.AUTH_URL}/logout`, {}, this.httpOptions)
//       .pipe(
//         tap(() => this.fullLocalLogout()),
//         catchError(() => {
//           this.fullLocalLogout();
//           return of(void 0);
//         })
//       );
//   }
  
//   // En src/app/core/services/auth.service.ts
//   cancelPendingRegistration(email: string): Observable<any> {
//     return this.http.delete(`${this.API_V1_URL}/users/register/pending`, {
//       params: { email },
//       ...this.httpOptions
//     });
//   }

//   /**
//    * Verifica la sesión actual con el servidor
//    * ✅ Maneja 401 silenciosamente (NO limpia la sesión)
//    * 🔥 Maneja 500 redirigiendo a login
//    */
//   checkSession(): Observable<LoginResponse | null> {
//     // Si no hay token/ sesión local, no llamar al servidor
//     const localUser = this.currentUser();
//     if (!localUser) {
//       console.log('ℹ️ [checkSession] No hay sesión local, omitiendo verificación');
//       return of(null);
//     }

//     console.log('🔄 [checkSession] Verificando sesión con el servidor...');
    
//     return this.http.get<LoginResponse>(`${this.AUTH_URL}/user-info`, this.httpOptions)
//       .pipe(
//         tap((user) => {
//           if (user) {
//             console.log('✅ [checkSession] Sesión válida');
//             this.updateLocalSession(user);
//           }
//         }),
//         catchError((error: HttpErrorResponse) => {
//           if (error.status === 401) {
//             console.log('ℹ️ [checkSession] No hay sesión activa (comportamiento esperado)');
//             return of(null);
//           }
          
//           // 🔥 Redirigir a login en caso de 500 (o cualquier error no 401)
//           if (error.status === 500) {
//             console.error('❌ [checkSession] Error 500 - redirigiendo a login');
//             this.fullLocalLogout();
//             // Redirigir a login desde el servicio
//             setTimeout(() => {
//               this.router.navigate(['/login']);
//             }, 0);
//             return of(null);
//           }
          
//           console.error('❌ [checkSession] Error verificando sesión:', error.status);
//           return of(null);
//         })
//       );
//   }

//   /**
//    * 🔥 NUEVO: Forzar verificación de sesión (con limpieza en 401)
//    * Útil para cuando el usuario hace clic en "Verificar sesión" manualmente
//    */
//   forceCheckSession(): Observable<LoginResponse | null> {
//     console.log('🔄 [forceCheckSession] Verificando sesión forzadamente...');
    
//     return this.http.get<LoginResponse>(`${this.AUTH_URL}/user-info`, this.httpOptions)
//       .pipe(
//         tap((user) => {
//           if (user) {
//             console.log('✅ [forceCheckSession] Sesión válida');
//             this.updateLocalSession(user);
//           }
//         }),
//         catchError((error: HttpErrorResponse) => {
//           if (error.status === 401) {
//             console.warn('🔴 [forceCheckSession] Sesión inválida - limpiando');
//             this.fullLocalLogout();
//           }
//           return of(null);
//         })
//       );
//   }

//   //
//   private updateLocalSession(user: LoginResponse): void {
//     console.log('💾 Guardando sesión local (id, username, email y roles)');
//     this.currentUser.set(user);
    
//     if (isPlatformBrowser(this.platformId)) {
//       const sessionData = {
//         id: user.id,
//         username: user.username,
//         email: user.email || '',  // ✅ Guardar email
//         roles: user.roles
//       };
//       localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(sessionData));
      
//       // ✅ Guardar email por separado para acceso rápido
//       if (user.email) {
//         localStorage.setItem('userEmail', user.email);
//       }
//     }
//   }


//   /**
//    * 🔥 NUEVO: Reinicia el estado del AuthService sin hacer logout del servidor
//    * Útil para cuando el sistema se reinicia (MaintenanceComponent)
//    */
//   public restartAuthService(): void {
//     console.log('🔄 [AuthService] Reiniciando estado de autenticación...');
    
//     // ✅ Resetear el usuario actual (sin llamar al servidor)
//     this.currentUser.set(null);
    
//     // ✅ Limpiar solo la sesión local (NO llamar a logout del servidor)
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem(this.USER_INFO_KEY);
//       localStorage.removeItem('userEmail');
//       // 🔥 NO eliminamos TAB_SESSION_KEY para mantener la pestaña activa
//       // sessionStorage.removeItem(this.TAB_SESSION_KEY);
//     }
    
//     console.log('✅ [AuthService] Estado reiniciado correctamente');
//   }


//   public fullLocalLogout(): void {
//     console.log('🧹 Limpiando toda la sesión local');
    
//     if (this.currentUser) {
//       this.currentUser.set(null);
//     }
    
//     if (isPlatformBrowser(this.platformId)) {
//       localStorage.removeItem(this.USER_INFO_KEY);
//       sessionStorage.removeItem(this.TAB_SESSION_KEY);
//     }
//   }

//   refreshToken(): Observable<LoginResponse> {
//     const url = `${this.AUTH_URL}/refresh`;
//     console.log('🔄 Llamando a refresh endpoint');
    
//     return this.http.post<LoginResponse>(url, {}, this.httpOptions)
//       .pipe(
//         tap((response) => {
//           console.log('🔄 Respuesta de refresh:', response);
//           console.log('✅ Refresh exitoso');
//           this.updateLocalSession(response);
//         }),
//         catchError((error: HttpErrorResponse) => {
//           console.error('❌ Error en refresh:', error.status);
//           if (error.status === 401) {
//             this.fullLocalLogout();
//           }
//           return throwError(() => error);
//         })
//       );
//   }

//   private handleError(error: HttpErrorResponse) {
//     let errorMessage = 'Ocurrió un error inesperado';
//     let errorStatus = error.status || 500;
    
//     if (error.error && typeof error.error === 'object' && error.error.message) {
//       errorMessage = error.error.message;
//     } else if (error.error && typeof error.error === 'string') {
//       errorMessage = error.error;
//     } else if (error.status === 0) {
//       errorMessage = 'Error de conexión con el servidor. Verifica tu conexión a internet.';
//       errorStatus = 0;
//     } else if (error.status === 404) {
//       errorMessage = 'El correo electrónico no está registrado. Verifica que lo has escrito correctamente.';
//     } else if (error.status === 409) {
//       errorMessage = 'El correo electrónico o usuario ya existe.';
//     } else if (error.status === 400) {
//       errorMessage = error.error?.message || 'Solicitud inválida. Revisa los datos ingresados.';
//     } else if (error.status === 500) {
//       errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
//     } else if (error.status === 503) {
//       errorMessage = 'El servidor de autenticación no responde.';
//     } else if (error.status === 401) {
//       errorMessage = 'Usuario o contraseña incorrectos.';
//     } else if (error.status === 403) {
//       errorMessage = 'No tienes permiso para realizar esta acción.';
//     }
    
//     console.log('🔴 Error capturado en AuthService:', errorMessage);
    
//     return throwError(() => ({ 
//       status: errorStatus, 
//       message: errorMessage,
//       originalError: error
//     }));
//   }

//   register(userData: unknown): Observable<unknown> {
//     const data = userData as any;

//     console.log(`📤 Registrando usuario: ${data.username} (${data.email})`);

//     const payloadToSend = {
//       username: data.username,
//       email: data.email,
//       password: data.password,
//       confirmPassword: data.confirmPassword,
//       firstName: data.firstName,
//       lastName: data.lastName
//     };

//     const registerOptions = {
//       withCredentials: true,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     };

//     return this.http.post(`${this.AUTH_URL}/register`, payloadToSend, registerOptions)
//       .pipe(
//         tap(() => console.log('✅ Registro exitoso')),
//         catchError((err) => this.handleError(err))
//       );
//   }

//   /**
//    * Verifica el código OTP enviado al email del usuario
//    */
//   verifyOtp(data: { email: string, code: string }): Observable<any> {
//     return this.http.post(`${this.AUTH_URL}/verify-email`, data, this.httpOptions)
//       .pipe(
//         tap(() => console.log('✅ Código OTP verificado con éxito')),
//         catchError((err) => this.handleError(err))
//       );
//   }

//   // ============================================================
//   // 🔥 NUEVOS MÉTODOS PARA RECUPERACIÓN DE CONTRASEÑA
//   // ============================================================

//   /**
//    * Solicita un código de verificación para restablecer la contraseña
//    */
//   forgotPassword(email: string): Observable<any> {
//     const url = `${this.AUTH_URL}/forgot-password`;
//     console.log(`📤 Solicitud de recuperación para: ${email}`);
//     return this.http.post(url, { email }, this.httpOptions).pipe(
//       tap(() => console.log('✅ Solicitud de recuperación enviada')),
//       catchError((err) => this.handleError(err))
//     );
//   }

//   /**
//    * Verifica el código OTP y restablece la contraseña
//    */
//   resetPassword(payload: { email: string; code: string; newPassword: string }): Observable<any> {
//     const url = `${this.AUTH_URL}/reset-password`;
//     console.log(`📤 Restableciendo contraseña para: ${payload.email}`);
//     return this.http.post(url, payload, this.httpOptions).pipe(
//       tap(() => console.log('✅ Contraseña restablecida con éxito')),
//       catchError((err) => this.handleError(err))
//     );
//   }
// }












// src/app/core/services/auth/auth.service.ts

import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal, PLATFORM_ID, computed, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap, catchError, throwError, of, switchMap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginResponse } from '../../features/auth/models/LoginResponse';
import { LoginRequest } from '../../features/auth/models/LoginRequest';
import { Router } from '@angular/router';
// ✅ NUEVA IMPORTACIÓN
import { UserPreferencesService } from '../../shared/services/user-preferences/user-preferences.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  
  // ✅ NUEVA INYECCIÓN
  private userPreferences = inject(UserPreferencesService);

  private readonly AUTH_URL = `${environment.apiGateway}${environment.authEndpoint}`;
  private readonly USER_INFO_KEY = 'user_info';
  private readonly TAB_SESSION_KEY = 'app_session_active';
  private readonly API_V1_URL = `${environment.apiGateway}${environment.apiV1}`;

  currentUser = signal<LoginResponse | null>(this.getInitialUser());
  isAuthenticated = computed(() => this.currentUser() !== null);


  // ✅ NUEVO: BehaviorSubject para observables (para componentes que usan subscribe)
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(this.getInitialUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  private readonly httpOptions = { withCredentials: true };

  constructor() {
    console.log('🏗️ AuthService constructor - VERSIÓN ACTUALIZADA');
    console.log('🏗️ AuthService constructor - AUTH_URL:', this.AUTH_URL);
    console.log('🏗️ AuthService constructor - currentUser:', this.currentUser());
    
    // ✅ Sincronizar el BehaviorSubject con la signal
    effect(() => {
      const user = this.currentUser();
      this.currentUserSubject.next(user);
    });
  }

  // ============================================================
  // MÉTODOS EXISTENTES (SIN CAMBIOS)
  // ============================================================

  //
  private getInitialUser(): LoginResponse | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    const isTabActive = sessionStorage.getItem(this.TAB_SESSION_KEY);
    if (!isTabActive) {
      sessionStorage.setItem(this.TAB_SESSION_KEY, 'true');
      return null;
    }
    
    const savedUser = localStorage.getItem(this.USER_INFO_KEY);
    if (!savedUser) return null;

    try {
      const storedUser = JSON.parse(savedUser);
      
      const user: LoginResponse = {
        id: storedUser.id,
        username: storedUser.username,
        email: storedUser.email || '',
        roles: storedUser.roles || [],
        type: 'Bearer',
        accessToken: '',      
        refreshToken: null,
        token: '',
        permissions: storedUser.permissions || []
      };
      
      // ✅ Restaurar token desde localStorage si existe
      if (isPlatformBrowser(this.platformId)) {
        const token = localStorage.getItem('access_token');
        if (token) {
          user.accessToken = token;
          user.token = token;
        }
      }
      
      console.log('✅ Sesión restaurada con roles:', user.roles);
      console.log('📧 Email restaurado:', user.email);
      return user;
    } catch (e) {
      console.error('Error parseando usuario:', e);
      return null;
    }
  }

  //
  getUserId(): number | null {
    const user = this.currentUser();
    return user ? user.id : null;
  }

  getUserName(): string {
    const user = this.currentUser();
    return user ? user.username : 'Usuario';
  }

  getUserEmail(): string | null {
    const user = this.currentUser();
    if (user?.email) return user.email;
    
    if (isPlatformBrowser(this.platformId)) {
      const email = localStorage.getItem('userEmail');
      if (email) return email;
    }
    
    return null;
  }

  // ============================================================
  // ✅ LOGIN MODIFICADO
  // ============================================================

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.AUTH_URL}/login`, credentials, this.httpOptions)
      .pipe(
        tap((response) => {
          console.log('✅ Login exitoso');
          console.log('📧 Email recibido:', response.email);
          console.log('🆔 ID recibido:', response.id);
          
          if (isPlatformBrowser(this.platformId)) {
            sessionStorage.setItem(this.TAB_SESSION_KEY, 'true');
            if (response.email) {
              localStorage.setItem('userEmail', response.email);
            }
          }
          
          // ✅ Guardar información del usuario
          this.updateLocalSession(response);
          
          if (response.id) {
            // ✅ 1. Establecer userId
            this.userPreferences.setUserId(response.id);
            
            // ✅ 2. Cargar preferencias del backend
            this.userPreferences.loadPreferences().subscribe({
              next: (prefs) => {
                console.log('✅ Preferencias cargadas:', prefs);
                
                // ✅ 3. Sincronizar tema local con backend
                this.userPreferences.syncThemeOnLogin(response.id);
              },
              error: (error) => console.error('❌ Error cargando preferencias:', error)
            });
          }
        }),
        catchError((error) => this.handleError(error))
      );
  }



  // ============================================================
  // ✅ LOGOUT MODIFICADO (CORREGIDO)
  // ============================================================
  logout(): Observable<void> {
    // ✅ 1. PRIMERO: Guardar preferencias (con el userId actual)
    const currentPrefs = this.userPreferences.getCurrentPreferences();
    this.userPreferences.savePreferences({
      ...currentPrefs,
      lastVisitedSection: this.router.url || 'dashboard'
    }).subscribe({
      next: () => console.log('✅ Preferencias guardadas antes de logout'),
      error: (error) => console.error('❌ Error guardando preferencias:', error)
    });
    
    // ✅ 2. SEGUNDO: Hacer logout en el servidor
    return this.http.post<void>(`${this.AUTH_URL}/logout`, {}, this.httpOptions)
      .pipe(
        tap(() => {
          // ✅ 3. TERCERO: Limpiar sesión local (después del logout)
          this.fullLocalLogout();
          // ✅ 4. CUARTO: Limpiar preferencias (después de guardar)
          this.userPreferences.clearPreferences();
          console.log('✅ Logout exitoso');
        }),
        catchError(() => {
          // ✅ En caso de error, también limpiar
          this.fullLocalLogout();
          this.userPreferences.clearPreferences();
          return of(void 0);
        })
      );
  }


  // ============================================================
  // ✅ CHECK SESSION MODIFICADO
  // ============================================================
  
  checkSession(): Observable<LoginResponse | null> {
    const localUser = this.currentUser();
    if (!localUser) {
      console.log('ℹ️ [checkSession] No hay sesión local, omitiendo verificación');
      return of(null);
    }

    console.log('🔄 [checkSession] Verificando sesión con el servidor...');
    
    return this.http.get<LoginResponse>(`${this.AUTH_URL}/user-info`, {
      ...this.httpOptions,
      withCredentials: true
    }).pipe(
      tap((user) => {
        if (user) {
          console.log('✅ [checkSession] Sesión válida');
          this.updateLocalSession(user);
          this.userPreferences.loadPreferences().subscribe({
            next: (prefs) => console.log('✅ Preferencias recargadas:', prefs),
            error: (error) => console.error('❌ Error recargando preferencias:', error)
          });
        }
      }),
      catchError((error: HttpErrorResponse): Observable<LoginResponse | null> => {
        if (error.status === 401) {
          console.warn('🔴 [checkSession] Token expirado, intentando refresh...');
          
          return this.refreshToken().pipe(
            switchMap((refreshResponse: LoginResponse) => {
              console.log('✅ [checkSession] Refresh exitoso');
              
              if (refreshResponse) {
                this.updateLocalSession(refreshResponse);
                this.userPreferences.loadPreferences().subscribe({
                  next: (prefs) => console.log('✅ Preferencias recargadas después de refresh'),
                  error: (err) => console.error('❌ Error recargando preferencias:', err)
                });
              }
              
              // ✅ Reintentar la verificación
              return this.http.get<LoginResponse>(`${this.AUTH_URL}/user-info`, {
                ...this.httpOptions,
                withCredentials: true
              }).pipe(
                tap((user) => {
                  if (user) {
                    console.log('✅ [checkSession] Sesión verificada después de refresh');
                    this.updateLocalSession(user);
                  }
                }),
                catchError(() => {
                  console.warn('❌ [checkSession] Falló la verificación después del refresh');
                  this.fullLocalLogout();
                  this.userPreferences.clearPreferences();
                  return of(null);
                })
              );
            }),
            catchError(() => {
              console.warn('❌ [checkSession] Falló el refresh, sesión expirada');
              this.fullLocalLogout();
              this.userPreferences.clearPreferences();
              return of(null);
            })
          );
        }
        
        if (error.status === 500) {
          console.error('❌ [checkSession] Error 500 - redirigiendo a login');
          this.fullLocalLogout();
          this.userPreferences.clearPreferences();
          setTimeout(() => this.router.navigate(['/login']), 0);
          return of(null);
        }
        
        console.error('❌ [checkSession] Error verificando sesión:', error.status);
        return of(null);
      })
    );
  }

  // ============================================================
  // MÉTODOS EXISTENTES (SIN CAMBIOS)
  // ============================================================

  forceCheckSession(): Observable<LoginResponse | null> {
    console.log('🔄 [forceCheckSession] Verificando sesión forzadamente...');
    
    return this.http.get<LoginResponse>(`${this.AUTH_URL}/user-info`, this.httpOptions)
      .pipe(
        tap((user) => {
          if (user) {
            console.log('✅ [forceCheckSession] Sesión válida');
            this.updateLocalSession(user);
          }
        }),
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            console.warn('🔴 [forceCheckSession] Sesión inválida - limpiando');
            this.fullLocalLogout();
            this.userPreferences.clearPreferences(); // ✅ NUEVO
          }
          return of(null);
        })
      );
  }

  //
  private updateLocalSession(user: LoginResponse): void {
    console.log('💾 Guardando sesión local');
    console.log('🔍 ====== DATOS DEL USUARIO RECIBIDOS ======');
    console.log('🔍 user.id:', user.id);
    console.log('🔍 user.username:', user.username);
    console.log('🔍 user.email:', user.email);
    console.log('🔍 user.roles:', user.roles);
    console.log('🔍 =========================================');
    // ❌ ELIMINA: user.accessToken, user.refreshToken, user.token
    
    this.currentUser.set(user);
    
    if (isPlatformBrowser(this.platformId)) {
      const sessionData = {
        id: user.id,
        username: user.username,
        email: user.email || '',
        roles: user.roles
      };
      localStorage.setItem(this.USER_INFO_KEY, JSON.stringify(sessionData));
      
      // ✅ SOLO guarda el email
      if (user.email) {
        localStorage.setItem('userEmail', user.email);
      }
    }
  }

  //
  public restartAuthService(): void {
    console.log('🔄 [AuthService] Reiniciando estado de autenticación...');
    this.currentUser.set(null);
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_INFO_KEY);
      localStorage.removeItem('userEmail');
    }
    
    // ✅ NUEVO: Limpiar preferencias al reiniciar
    this.userPreferences.clearPreferences();
    
    console.log('✅ [AuthService] Estado reiniciado correctamente');
  }

  public fullLocalLogout(): void {
    console.log('🧹 Limpiando toda la sesión local');
    
    if (this.currentUser) {
      this.currentUser.set(null);
    }
    
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.USER_INFO_KEY);
      sessionStorage.removeItem(this.TAB_SESSION_KEY);
    }
    
    // ✅ NUEVO: Limpiar preferencias en logout local
    this.userPreferences.clearPreferences();
  }

  //
  refreshToken(): Observable<LoginResponse> {
    // ✅ Usar environment.authEndpoint
    const url = `${environment.apiGateway}${environment.authEndpoint}/refresh`;
    console.log('🔄 Llamando a refresh endpoint:', url);
    
    // Obtener el refresh token de localStorage
    const refreshToken = localStorage.getItem('refreshToken');
    
    return this.http.post<LoginResponse>(url, { refreshToken }, {
      withCredentials: true
    })
    .pipe(
      tap((response) => {
        console.log('✅ Refresh exitoso');
        console.log('📦 Respuesta del refresh:', response);
        
        // Guardar tokens en localStorage (fallback)
        if (response?.accessToken) {
          localStorage.setItem('accessToken', response.accessToken);
          console.log('✅ Access token guardado en localStorage');
        }
        if (response?.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
          console.log('✅ Refresh token guardado en localStorage');
        }
        
        // Actualizar el usuario en memoria
        if (response) {
          this.currentUser.set(response);
          console.log('✅ Usuario actualizado en memoria');
        }
        
        // Recargar preferencias después del refresh
        this.userPreferences.loadPreferences().subscribe({
          next: (prefs) => {
            console.log('✅ Preferencias recargadas después de refresh');
          },
          error: (error) => {
            console.error('❌ Error recargando preferencias:', error);
          }
        });
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('❌ Error en refresh:', error.status, error.message);
        
        if (error.status === 401) {
          console.warn('🔴 Refresh token expirado o inválido, cerrando sesión');
          this.fullLocalLogout();
          this.userPreferences.clearPreferences();
          this.router.navigate(['/login']);
        } else if (error.status === 500) {
          console.error('🚨 Error interno del servidor (500) en refresh');
        }
        
        return throwError(() => error);
      })
    );
  }

  //
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocurrió un error inesperado';
    let errorStatus = error.status || 500;
    
    if (error.error && typeof error.error === 'object' && error.error.message) {
      errorMessage = error.error.message;
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    } else if (error.status === 0) {
      errorMessage = 'Error de conexión con el servidor. Verifica tu conexión a internet.';
      errorStatus = 0;
    } else if (error.status === 404) {
      errorMessage = 'El correo electrónico no está registrado. Verifica que lo has escrito correctamente.';
    } else if (error.status === 409) {
      errorMessage = 'El correo electrónico o usuario ya existe.';
    } else if (error.status === 400) {
      errorMessage = error.error?.message || 'Solicitud inválida. Revisa los datos ingresados.';
    } else if (error.status === 500) {
      errorMessage = 'Error interno del servidor. Inténtalo más tarde.';
    } else if (error.status === 503) {
      errorMessage = 'El servidor de autenticación no responde.';
    } else if (error.status === 401) {
      errorMessage = 'Usuario o contraseña incorrectos.';
    } else if (error.status === 403) {
      errorMessage = 'No tienes permiso para realizar esta acción.';
    }
    
    console.log('🔴 Error capturado en AuthService:', errorMessage);
    
    return throwError(() => ({ 
      status: errorStatus, 
      message: errorMessage,
      originalError: error
    }));
  }

  register(userData: unknown): Observable<unknown> {
    const data = userData as any;
    console.log(`📤 Registrando usuario: ${data.username} (${data.email})`);

    const payloadToSend = {
      username: data.username,
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.firstName,
      lastName: data.lastName
    };

    const registerOptions = {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return this.http.post(`${this.AUTH_URL}/register`, payloadToSend, registerOptions)
      .pipe(
        tap(() => console.log('✅ Registro exitoso')),
        catchError((err) => this.handleError(err))
      );
  }

  verifyOtp(data: { email: string, code: string }): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/verify-email`, data, this.httpOptions)
      .pipe(
        tap(() => console.log('✅ Código OTP verificado con éxito')),
        catchError((err) => this.handleError(err))
      );
  }

  forgotPassword(email: string): Observable<any> {
    const url = `${this.AUTH_URL}/forgot-password`;
    console.log(`📤 Solicitud de recuperación para: ${email}`);
    return this.http.post(url, { email }, this.httpOptions).pipe(
      tap(() => console.log('✅ Solicitud de recuperación enviada')),
      catchError((err) => this.handleError(err))
    );
  }

  resetPassword(payload: { email: string; code: string; newPassword: string }): Observable<any> {
    const url = `${this.AUTH_URL}/reset-password`;
    console.log(`📤 Restableciendo contraseña para: ${payload.email}`);
    return this.http.post(url, payload, this.httpOptions).pipe(
      tap(() => console.log('✅ Contraseña restablecida con éxito')),
      catchError((err) => this.handleError(err))
    );
  }

  cancelPendingRegistration(email: string): Observable<any> {
    return this.http.delete(`${this.API_V1_URL}/users/register/pending`, {
      params: { email },
      ...this.httpOptions
    });
  }
}