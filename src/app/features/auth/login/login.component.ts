// src/app/features/auth/login/login.component.ts
import { Component, signal, inject, OnDestroy, ViewChild, ElementRef, OnInit, ChangeDetectorRef, AfterViewInit, Renderer2, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize, Subscription, Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AutoFocusDirective } from '../../../shared/directives/auto-focus.directive';
import { FocusTrapDirective } from '../../../shared/directives/focus-trap.directive';
import { usernameValidator, passwordValidator } from '../../../shared/validators/validators';
import { VoiceCommandResponse } from '../../models/voz/VoiceCommandResponse-model';
import { VoiceCommandOrchestratorService } from '../../services/voz/voice-command-orchestrator.service';
import { VoiceService } from '../../services/voz/voice.service';
import { VoiceFilterService } from '../../services/voz/voice-filter.service';
import { VoiceContextService } from '../../services/voz/voice-context.service';
import { environment } from '../../../../environments/environment';
import { DisableAutofillDirective } from '../../../shared/directives/disable-autofill.directive';
import { AuthService } from '../../../core/services/auth.service';
import { LoginRequest } from '../models/LoginRequest';
import { FieldCleanupService } from '../../services/voz/field-cleanup.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    DisableAutofillDirective,
    AutoFocusDirective,
    FocusTrapDirective,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private voiceService = inject(VoiceService);
  private orchestrator = inject(VoiceCommandOrchestratorService);
  private voiceFilter = inject(VoiceFilterService);
  private cdr = inject(ChangeDetectorRef);
  private renderer = inject(Renderer2);
  private ngZone = inject(NgZone);
  private voiceContext = inject(VoiceContextService);
  private fieldCleanup = inject(FieldCleanupService);

  private lastProcessedCommand = '';
  private lastProcessedTime = 0;
  private readonly COMMAND_DEBOUNCE = 2000;

  private readonly DEFAULT_REDIRECT = '/dashboard-v2';

  @ViewChild('usernameInput') usernameInput!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput') passwordInput!: ElementRef<HTMLInputElement>;

  readonly hidePassword = signal(true);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly specialChars = '!@#$%^&*(),.?":{}|<>';

  private destroy$ = new Subject<void>();
  readonly isProcessing = signal(false);
  readonly lastReply = signal('');
  readonly isListening = signal(false);
  private valueChangesSubscription?: Subscription;
  private mutedSubscription?: Subscription;

  private dictationMode = false;
  private dictationTarget: 'username' | 'password' | null = null;
  private dictationBuffer = '';

  private isDestroyed = false;
  private welcomeTimeout: any = null;

  private readonly WELCOME_MESSAGE = 'Bienvenido a inicio de sesión. Di "usuario", "contraseña", "enviar", "limpiar campos", "leer campos", "volver", o "ayuda" para más opciones.';
  private readonly HELP_MESSAGE = 
    'Puedes decir: "usuario" para escribir tu usuario, ' +
    '"contraseña" para tu clave, ' +
    '"enviar" para iniciar sesión, ' +
    '"limpiar" para borrar los campos, ' +
    '"leer campos" para escuchar el contenido, ' +
    '"mostrar contraseña" u "ocultar contraseña" para ver u ocultar tu clave, ' +
    '"registrar" para crear una cuenta, ' +
    '"recuperar" para recuperar tu contraseña, ' +
    '"volver" para regresar a la página anterior, ' +
    '"silenciar micrófono" para apagar el micrófono, ' +
    '"privacidad" para ver la política de privacidad, ' +
    '"condiciones" para ver los términos y condiciones, ' +
    'o "ayuda" para ver todas las opciones.';

  readonly loginForm = this.fb.nonNullable.group({
    usernameOrEmail: ['', [Validators.required, Validators.minLength(3), usernameValidator()]],
    password: ['', [Validators.required, passwordValidator(9)]],
  });

  get usernameOrEmailCtrl() { return this.loginForm.controls.usernameOrEmail; }
  get passwordCtrl() { return this.loginForm.controls.password; }

  constructor() {
    console.log('🏗️ LoginComponent constructor');
    this.valueChangesSubscription = this.loginForm.valueChanges.subscribe(() => {
      if (this.errorMessage()) { this.errorMessage.set(null); this.cdr.markForCheck(); }
    });
    this.mutedSubscription = this.voiceService.getMutedState().subscribe(muted => {
      this.isListening.set(!muted);
      this.cdr.markForCheck();
    });
  }


  
  // ngOnInit(): void {
  //   console.log('✅ LoginComponent ngOnInit');

  //   this.voiceContext.setContext({
  //     activationMessage: this.WELCOME_MESSAGE,
  //     availableCommands: [
  //       'usuario', 'contraseña', 'enviar', 'limpiar', 'mostrar contraseña', 
  //       'ocultar contraseña', 'registro', 'recuperar', 'volver', 
  //       'silenciar micrófono', 'ayuda', 'leer campos',
  //       'privacidad', 'condiciones' 
  //     ],
  //     preventBackend: true
  //   });

  //   this.subscribeToVoiceTranscript();
  //   this.subscribeToOrchestrator();

  //   if (environment.enableLogs) {
  //     this.orchestrator.configure({ defaultTimeout: 10000, autoResetDelay: 3000, maxRetries: 2 });
  //   }

  //   this.voiceService.ready$
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((ready) => {
  //       if (!ready && !this.isDestroyed) {
  //         console.log('🔄 [Login] Reconocimiento caído, reactivando...');
  //         setTimeout(() => {
  //           if (!this.isDestroyed) {
  //             this.voiceService.startListening();
  //           }
  //         }, 500);
  //       }
  //     });

  //   setTimeout(() => {
  //     if (!this.isDestroyed && !this.voiceService.isRecognitionActive()) {
  //       console.log('🎤 [Login] Reconocimiento inactivo, iniciando...');
  //       this.voiceService.startListening();
  //     }
  //   }, 1000);

  //   this.speakWelcomeIfActive();

  //   // Registrar campos para limpieza universal
  //   this.registerFieldsForCleanup();
  // }

  // ngAfterViewInit(): void {
  //   console.log('👀 LoginComponent AfterViewInit');
  //   this.setupFocusListeners();
  //   this.cdr.markForCheck();
  // }

  // private log(...args: any[]): void { if (environment.enableLogs) console.log(...args); }
  // private logError(...args: any[]): void { if (environment.enableLogs) console.error(...args); }

  // private speakWelcomeIfActive(): void {
  //   if (!this.voiceService.isCurrentlyMuted()) {
  //     this.welcomeTimeout = setTimeout(() => {
  //       if (!this.isDestroyed) {
  //         this.voiceService.speakAlways(this.WELCOME_MESSAGE);
  //       }
  //     }, 1500);
  //   }
  // }







  // login.component.ts

  ngOnInit(): void {
    console.log('✅ LoginComponent ngOnInit');

    this.voiceContext.setContext({
      activationMessage: this.WELCOME_MESSAGE,
      availableCommands: [
        'usuario', 'contraseña', 'enviar', 'limpiar', 'mostrar contraseña', 
        'ocultar contraseña', 'registro', 'recuperar', 'volver', 
        'silenciar micrófono', 'ayuda', 'leer campos',
        'privacidad', 'condiciones' 
      ],
      preventBackend: true
    });

    this.subscribeToVoiceTranscript();
    this.subscribeToOrchestrator();

    if (environment.enableLogs) {
      this.orchestrator.configure({ defaultTimeout: 10000, autoResetDelay: 3000, maxRetries: 2 });
    }

    this.voiceService.ready$
      .pipe(takeUntil(this.destroy$))
      .subscribe((ready) => {
        if (!ready && !this.isDestroyed) {
          console.log('🔄 [Login] Reconocimiento caído, reactivando...');
          setTimeout(() => {
            if (!this.isDestroyed) {
              this.voiceService.startListening();
            }
          }, 500);
        }
      });

    setTimeout(() => {
      if (!this.isDestroyed && !this.voiceService.isRecognitionActive()) {
        console.log('🎤 [Login] Reconocimiento inactivo, iniciando...');
        this.voiceService.startListening();
      }
    }, 1000);

    this.speakWelcomeIfActive();

    // Registrar campos para limpieza universal
    this.registerFieldsForCleanup();

    // ✅ NUEVO: COMPROBAR ESTADO DEL MICRÓFONO AL ENTRAR
    setTimeout(() => {
      if (!this.isDestroyed) {
        const isMicActive = this.voiceService.isRecognitionActive();
        const isMuted = this.voiceService.isCurrentlyMuted();
        
        console.log(`🎤 [Login] Estado del micrófono: ${isMicActive ? '✅ ACTIVO' : '❌ INACTIVO'}, Muteado: ${isMuted}`);
        
        if (isMicActive && !isMuted) {
          // ✅ Micrófono activo - avisar
          this.voiceService.speakAlways('Micrófono activo. Puedes usar comandos de voz para rellenar el formulario.');
        } else if (isMuted) {
          // 🔇 Micrófono muteado - avisar
          this.voiceService.speakAlways('El micrófono está desactivado. Di "hola" para activarlo.');
        }
      }
    }, 2000); // ⬅️ 2 segundos para dar tiempo a que todo se inicialice
  }

  ngAfterViewInit(): void {
    console.log('👀 LoginComponent AfterViewInit');
    this.setupFocusListeners();
    this.cdr.markForCheck();
  }

  private log(...args: any[]): void { 
    if (environment.enableLogs) console.log(...args); 
  }

  private logError(...args: any[]): void { 
    if (environment.enableLogs) console.error(...args); 
  }

  // ✅ MEJORADO: speakWelcomeIfActive()
  private speakWelcomeIfActive(): void {
    // ✅ Comprobar si el micrófono NO está muteado
    if (!this.voiceService.isCurrentlyMuted()) {
      this.welcomeTimeout = setTimeout(() => {
        if (!this.isDestroyed) {
          // ✅ Usar speakAlways para asegurar que se escuche
          this.voiceService.speakAlways(this.WELCOME_MESSAGE);
        }
      }, 1500);
    } else {
      // 🔇 Si está muteado, avisar en consola
      console.log('🔇 [Login] Micrófono muteado, mensaje de bienvenida omitido');
    }
  }








  private subscribeToVoiceTranscript(): void {
    console.log('🔊 Login - Suscribiendo a transcript');
    this.voiceService.getTranscript()
      .pipe(takeUntil(this.destroy$))
      .subscribe((text: string) => {
        this.ngZone.run(() => {
          if (this.isDestroyed) return;
          console.log('📝 Login - Texto transcrito:', text);
          if (text && text.trim().length >= 1 && /[a-záéíóú]/.test(text)) {
            this.handleVoiceCommand(text);
          }
        });
      });
  }

  private subscribeToOrchestrator(): void {
    console.log('🔊 Login - Suscribiendo a orchestrator');
    this.orchestrator.status$
      .pipe(takeUntil(this.destroy$))
      .subscribe((status) => {
        this.ngZone.run(() => {
          if (this.isDestroyed) return;
          this.isProcessing.set(status === 'processing' || status === 'listening');
          this.cdr.markForCheck();
        });
      });

    this.orchestrator.response$
      .pipe(takeUntil(this.destroy$))
      .subscribe((response: VoiceCommandResponse | null) => {
        this.ngZone.run(() => {
          if (this.isDestroyed) return;
          if (response) {
            this.lastReply.set(response.reply);
            if (!response.audioBase64) {
              this.voiceService.speak(response.reply);
            }
            this.handleAction(response);
            this.cdr.markForCheck();
          }
        });
      });

    this.orchestrator.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe((err) => {
        this.ngZone.run(() => {
          if (this.isDestroyed) return;
          if (err) {
            this.logError('Error en orchestrator:', err);
            this.errorMessage.set(err);
            this.cdr.markForCheck();
          }
        });
      });

    this.orchestrator.progress$
      .pipe(takeUntil(this.destroy$))
      .subscribe((progress) => {
        if (this.isDestroyed) return;
        if (environment.enableLogs && progress > 0) {
          this.log(`📊 Progreso: ${progress}%`);
        }
      });
  }

  // ============================================================
  // REGISTRO DE CAMPOS PARA LIMPIEZA UNIVERSAL
  // ============================================================

  private registerFieldsForCleanup(): void {
    this.fieldCleanup.registerField({
      name: 'username',
      label: 'usuario',
      isFocused: false,
      clear: () => this.clearField('username'),
      isEmpty: () => !this.loginForm.get('usernameOrEmail')?.value
    });

    this.fieldCleanup.registerField({
      name: 'password',
      label: 'contraseña',
      isFocused: false,
      clear: () => this.clearField('password'),
      isEmpty: () => !this.loginForm.get('password')?.value
    });
  }

  private setupFocusListeners(): void {
    this.usernameInput.nativeElement.addEventListener('focus', () => {
      this.fieldCleanup.registerField({
        name: 'username',
        label: 'usuario',
        isFocused: true,
        clear: () => this.clearField('username'),
        isEmpty: () => !this.loginForm.get('usernameOrEmail')?.value
      });
    });

    this.usernameInput.nativeElement.addEventListener('blur', () => {
      this.fieldCleanup.registerField({
        name: 'username',
        label: 'usuario',
        isFocused: false,
        clear: () => this.clearField('username'),
        isEmpty: () => !this.loginForm.get('usernameOrEmail')?.value
      });
    });

    this.passwordInput.nativeElement.addEventListener('focus', () => {
      this.fieldCleanup.registerField({
        name: 'password',
        label: 'contraseña',
        isFocused: true,
        clear: () => this.clearField('password'),
        isEmpty: () => !this.loginForm.get('password')?.value
      });
    });

    this.passwordInput.nativeElement.addEventListener('blur', () => {
      this.fieldCleanup.registerField({
        name: 'password',
        label: 'contraseña',
        isFocused: false,
        clear: () => this.clearField('password'),
        isEmpty: () => !this.loginForm.get('password')?.value
      });
    });
  }

  // ============================================================
  // HANDLE VOICE COMMAND
  // ============================================================
 
  private handleVoiceCommand(text: string): void {
    if (this.isDestroyed) return;
    const lower = text.toLowerCase().trim();
    
    console.log(`📝 [handleVoiceCommand] ENTRADA - lower: "${lower}"`);

    // 🔥 Ignorar números sueltos (evita errores 401)
    const isNumeric = /^\d+$/.test(lower) || ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'].some(w => lower === w);
    if (isNumeric) {
      console.log('⏭️ Login: número suelto ignorado');
      return;
    }

    console.log(`📝 [handleVoiceCommand] PASÓ FILTRO NUMÉRICO - lower: "${lower}"`);

    // ✅ PRIMERO: Comandos de navegación (prioridad máxima)
    // 🔥 1. VOLVER
    if (lower.includes('volver') || lower.includes('atrás') || lower.includes('regresar') || lower.includes('retroceder')) {
      console.log('🔙 Login: ejecutando "volver"');
      if (this.dictationMode) {
        this.stopDictation(undefined, true);
      }
      // ✅ LIMPIAR ANTES DE NAVEGAR
      this.voiceService.clearTranscript();
      this.router.navigate(['/welcome']);
      return;
    }

    // 🔥 2. PRIVACIDAD
    if (lower.includes('privacidad') || lower.includes('política de privacidad') || lower.includes('política')) {
      console.log('🔐 [Login] Ejecutando "privacidad"');
      // ✅ LIMPIAR ANTES DE NAVEGAR
      this.voiceService.clearTranscript();
      this.voiceService.speak('Navegando a política de privacidad');
      this.router.navigate(['/privacy']);
      return;
    }

    // 🔥 3. CONDICIONES
    if (lower.includes('condiciones') || lower.includes('términos') || lower.includes('términos y condiciones') || lower.includes('condiciones de uso')) {
      console.log('📄 [Login] Ejecutando "condiciones"');
      // ✅ LIMPIAR ANTES DE NAVEGAR
      this.voiceService.clearTranscript();
      this.voiceService.speak('Navegando a términos y condiciones');
      this.router.navigate(['/terms']);
      return;
    }

    console.log(`📝 [handleVoiceCommand] PASÓ NAVEGACIÓN - lower: "${lower}"`);

    // ✅ Si el campo está vacío y dice "usuario" o "contraseña", iniciar dictado directo
    if (lower === 'usuario' || lower === 'contraseña' || lower === 'clave' || lower === 'password' || lower === 'pass') {
      console.log(`🎤 [Login] Campo "${lower}" detectado`);
      const target = lower === 'usuario' ? 'username' : 'password';
      const formControlName = target === 'username' ? 'usernameOrEmail' : 'password';
      const control = this.loginForm.get(formControlName);
      
      const shouldStartDictation = (!control?.value || control.value.length === 0) && 
                                  (!this.dictationMode || this.dictationTarget !== target);
      
      if (shouldStartDictation) {
        console.log(`🎤 [Login] Campo "${lower}" vacío, iniciando dictado directo`);
        if (this.dictationMode) {
          this.stopDictation(undefined, true);
        }
        this.startDictation(target, '');
        return;
      } else if (this.dictationMode && this.dictationTarget === target) {
        console.log(`⏭️ [Login] Ya dictando "${target}", ignorando comando`);
        return;
      }
    }

    console.log(`📝 [handleVoiceCommand] PASÓ DICTADO DIRECTO - lower: "${lower}"`);

    // Prevenir duplicados
    const now = Date.now();
    if (lower === this.lastProcessedCommand && (now - this.lastProcessedTime) < this.COMMAND_DEBOUNCE) {
      console.log(`⏭️ Login: comando duplicado ignorado: "${lower}"`);
      return;
    }
    this.lastProcessedCommand = lower;
    this.lastProcessedTime = now;

    console.log(`📝 [handleVoiceCommand] PASÓ DEBOUNCE - lower: "${lower}"`);

    // Sinónimos
    const synonyms = {
      dictateUsername: ['usuario', 'escribir usuario', 'escribe usuario', 'nombre', 'escribir nombre', 'escribe nombre', 'user', 'email', 'correo'],
      dictatePassword: ['contraseña', 'clave', 'escribir contraseña', 'escribe contraseña', 'escribir clave', 'escribe clave', 'password', 'pass'],
      finish: ['fin', 'listo', 'terminar', 'finalizar', 'ok', 'vale', 'hecho', 'completar'],
      back: ['volver', 'atrás', 'regresar', 'retroceder', 'cancelar'],
      login: ['enviar', 'logear', 'acceder', 'entrar', 'iniciar sesión', 'login', 'ingresar', 'acceder al sistema'],
      mute: ['silenciar micrófono', 'dejar de escuchar', 'silenciar', 'mute', 'apagar micrófono'],
      unmute: ['activar micrófono', 'encender micrófono', 'desmutear', 'unmute', 'escuchar'],
      showPassword: ['mostrar contraseña', 'ver contraseña', 'mostrar clave', 'ver clave'],
      hidePassword: ['ocultar contraseña', 'ocultar clave', 'esconder contraseña'],
      help: ['ayuda', 'qué puedo decir', 'opciones', 'comandos', 'ayúdame'],
      clearUsername: ['limpiar usuario', 'borrar usuario', 'limpiar nombre', 'borrar nombre', 'limpiar nombre de usuario'],
      clearPassword: ['limpiar contraseña', 'borrar contraseña', 'limpiar clave', 'borrar clave'],
      clearCurrent: ['limpiar campo', 'borrar campo', 'limpiar este campo', 'borrar este campo'],
      clearAll: ['limpiar campos', 'limpiar todo', 'borrar todo', 'resetear', 'empezar de cero', 'borrar campos'],
      cancel: ['cancelar', 'cancel', 'abortar'],
      register: ['registro', 'registrar', 'crear cuenta', 'registrarme', 'nueva cuenta'],
      forgot: ['olvidé', 'recuperar', 'recuperar contraseña', 'olvide contraseña', 'recuperar clave'],
      privacy: ['privacidad', 'política de privacidad', 'política'],
      terms: ['condiciones', 'términos', 'términos y condiciones', 'condiciones de uso'],
      readFields: ['leer campos', 'leer', 'leer todo', 'qué tengo', 'qué hay', 'mostrar campos', 
                  'qué he escrito', 'revisar campos', 'comprobar campos', 'ver campos'],
      status: ['estado', 'qué falta', 'campos pendientes', 'falta algo']
    };

    // Ignorar comandos de otras páginas
    if (lower.includes('quienes somos') || lower.includes('acerca de')) {
      this.log('⏭️ Login: comando ignorado (corresponde a Welcome)');
      return;
    }

    // ============================================================
    // COMANDOS DE NAVEGACIÓN Y LIMPIEZA
    // ============================================================

    if (synonyms.cancel.some(s => lower.includes(s))) {
      if (this.dictationMode) {
        this.stopDictation(undefined, true);
        this.voiceService.speak('Dictado cancelado');
      }
      return;
    }

    if (synonyms.login.some(s => lower.includes(s))) {
      console.log('🔐 Login: ejecutando login por voz');
      if (this.dictationMode) {
        this.stopDictation(undefined, true);
      }
      this.onLogin();
      return;
    }

    // ============================================================
    // COMANDO "LEER CAMPOS"
    // ============================================================
    if (synonyms.readFields.some(s => lower.includes(s))) {
      console.log('📖 [Login] Comando "leer campos" detectado');
      if (this.dictationMode) {
        this.stopDictation(undefined, true);
      }
      this.readAllFields();
      return;
    }

    // ============================================================
    // COMANDO "ESTADO" / "QUÉ FALTA"
    // ============================================================
    if (synonyms.status.some(s => lower.includes(s))) {
      console.log('📊 [Login] Comando "estado" detectado');
      if (this.dictationMode) {
        this.stopDictation(undefined, true);
      }
      
      const username = this.loginForm.get('usernameOrEmail')?.value || '';
      const password = this.loginForm.get('password')?.value || '';
      const missingFields = [];
      
      if (!username || username.trim().length === 0) missingFields.push('usuario');
      if (!password || password.trim().length === 0) missingFields.push('contraseña');
      
      if (missingFields.length === 0) {
        this.voiceService.speak('Todos los campos están completos. Di "enviar" para iniciar sesión, o "leer campos" para comprobar el contenido.');
      } else {
        const fieldList = missingFields.map(f => `"${f}"`).join(', ');
        this.voiceService.speak(`Faltan los campos: ${fieldList}. Di el nombre de uno para editarlo.`);
      }
      return;
    }

    if (synonyms.clearUsername.some(s => lower.includes(s))) {
      this.clearField('username');
      return;
    }

    if (synonyms.clearPassword.some(s => lower.includes(s))) {
      this.clearField('password');
      return;
    }

    if (synonyms.clearCurrent.some(s => lower.includes(s))) {
      const focusedField = this.getFocusedField();
      if (focusedField) {
        this.clearField(focusedField);
      } else {
        this.voiceService.speak('No hay ningún campo enfocado. Di "limpiar usuario" o "limpiar contraseña".');
      }
      return;
    }

    if (synonyms.clearAll.some(s => lower.includes(s))) {
      this.clearAllFields();
      return;
    }

    if (synonyms.help.some(s => lower.includes(s))) {
      this.showHelp();
      return;
    }

    if (synonyms.mute.some(s => lower.includes(s))) {
      this.voiceService.mute();
      return;
    }
    if (synonyms.unmute.some(s => lower.includes(s))) {
      this.voiceService.unmute();
      return;
    }

    if (synonyms.showPassword.some(s => lower.includes(s))) {
      if (this.hidePassword()) {
        this.togglePassword();
        this.voiceService.speak('Contraseña visible');
      }
      return;
    }
    if (synonyms.hidePassword.some(s => lower.includes(s))) {
      if (!this.hidePassword()) {
        this.togglePassword();
        this.voiceService.speak('Contraseña oculta');
      }
      return;
    }

    // ============================================================
    // MODO DICTADO ACTIVO
    // ============================================================
    if (this.dictationMode && this.dictationTarget) {
      console.log(`🔍 [handleVoiceCommand] Modo dictado activo, llamando a handleDictation: "${lower}"`);
      this.handleDictation(lower);
      return;
    }

    // ============================================================
    // INICIAR DICTADO (solo cuando no está en modo dictado)
    // ============================================================
    if (synonyms.dictateUsername.some(s => lower.includes(s))) {
      const afterCommand = lower.replace(/^(usuario|nombre|user|email|correo|escribir usuario|escribe usuario|escribir nombre|escribe nombre)\s*/, '').trim();
      this.startDictation('username', afterCommand);
      return;
    }

    if (synonyms.dictatePassword.some(s => lower.includes(s))) {
      const afterCommand = lower.replace(/^(contraseña|clave|pass|password|escribir contraseña|escribe contraseña|escribir clave|escribe clave)\s*/, '').trim();
      this.startDictation('password', afterCommand);
      return;
    }

    // if (synonyms.register.some(s => lower.includes(s))) {
    //   console.log('🔍 Login: navegando a registro');
    //   // ✅ LIMPIAR EL TRANSCRIPT ANTES DE NAVEGAR
    //   this.voiceService.clearTranscript();
    //   this.voiceService.speak('Navegando a registro');
    //   setTimeout(() => {
    //     if (!this.isDestroyed) {
    //       this.router.navigate(['/register']);
    //     }
    //   }, 300);
    //   return;
    // }



    if (synonyms.register.some(s => lower.includes(s))) {
      console.log('🔍 Login: navegando a registro');
      this.voiceService.speak('Navegando a registro');
      
      // ✅ LIMPIAR DESPUÉS DE NAVEGAR (con retraso)
      setTimeout(() => {
        this.voiceService.clearTranscript();
      }, 100);
      
      setTimeout(() => {
        if (!this.isDestroyed) {
          this.router.navigate(['/register']);
        }
      }, 300);
      return;
    }




    if (synonyms.forgot.some(s => lower.includes(s))) {
      // ✅ LIMPIAR ANTES DE NAVEGAR
      this.voiceService.clearTranscript();
      this.voiceService.speak('Navegando a recuperar contraseña');
      this.router.navigate(['/forgot-password']);
      return;
    }

    console.log('⏭️ Login - Comando no reconocido, ignorado:', lower);
  }

  // ============================================================
  // MÉTODOS DE LIMPIEZA
  // ============================================================

  private getFocusedField(): 'username' | 'password' | null {
    const activeElement = document.activeElement;
    if (this.usernameInput?.nativeElement === activeElement) return 'username';
    if (this.passwordInput?.nativeElement === activeElement) return 'password';
    const usernameInput = document.querySelector('input[formControlName="usernameOrEmail"]');
    const passwordInput = document.querySelector('input[formControlName="password"]');
    if (usernameInput === activeElement) return 'username';
    if (passwordInput === activeElement) return 'password';
    return null;
  }

  private clearField(target: 'username' | 'password'): void {
    if (this.isDestroyed) return;
    if (this.dictationMode) {
      this.stopDictation(undefined, true);
    }

    const fieldName = target === 'username' ? 'usuario' : 'contraseña';
    const formControlName = target === 'username' ? 'usernameOrEmail' : 'password';
    const control = this.loginForm.get(formControlName);

    if (!control) return;

    const currentValue = control.value || '';

    if (!currentValue) {
      console.log(`📢 [Login] Campo "${fieldName}" ya vacío, informando...`);
      this.voiceService.speak(`El campo ${fieldName} ya está vacío. Di "${fieldName}" para escribir uno nuevo.`);
      
      setTimeout(() => {
        if (!this.isDestroyed) {
          console.log(`🎤 [Login] Reactivando reconocimiento para "${fieldName}"`);
          this.lastProcessedCommand = '';
          this.lastProcessedTime = 0;
          if (!this.voiceService.isRecognitionActive()) {
            this.voiceService.startListening();
          }
          this.focusInput(target);
        }
      }, 800);
      return;
    }

    control.setValue('', { emitEvent: true });
    control.markAsPristine();
    control.markAsUntouched();
    this.errorMessage.set(null);
    this.dictationBuffer = '';
    this.updateFormAndInputDirectly(target, '');
    this.cdr.markForCheck();

    this.voiceService.speak(`Campo ${fieldName} limpiado. Di "${fieldName}" para escribir uno nuevo.`);

    setTimeout(() => {
      if (!this.isDestroyed) {
        this.lastProcessedCommand = '';
        this.lastProcessedTime = 0;
        if (!this.voiceService.isRecognitionActive()) {
          this.voiceService.startListening();
        }
        this.focusInput(target);
      }
    }, 800);

    this.log(`🧹 Campo ${fieldName} limpiado`);
  }

  private clearAllFields(): void {
    if (this.isDestroyed) return;
    if (this.dictationMode) this.stopDictation(undefined, true);
    const usernameOrEmail = this.loginForm.get('usernameOrEmail')?.value || '';
    const password = this.loginForm.get('password')?.value || '';
    if (!usernameOrEmail && !password) {
      this.voiceService.speak('Los campos ya están vacíos.');
      this.focusInput('username');
      return;
    }
    this.loginForm.patchValue({ usernameOrEmail: '', password: '' });
    this.loginForm.markAsPristine();
    this.loginForm.markAsUntouched();
    this.errorMessage.set(null);
    this.dictationBuffer = '';
    this.updateFormAndInputDirectly('username', '');
    this.updateFormAndInputDirectly('password', '');
    this.cdr.detectChanges();
    this.cdr.markForCheck();
    this.voiceService.speak('Todos los campos limpiados.');
    this.focusInput('username');
    this.log('🧹 Todos los campos limpiados');
  }

  // ============================================================
  // LEER TODOS LOS CAMPOS
  // ============================================================
  
  /**
   * Lee por voz el contenido de todos los campos del formulario de login
   * ✅ SEGURO: NO revela la contraseña
   * ✅ CON PAUSAS: Para mejor comprensión
   */
  private readAllFields(): void {
    if (this.isDestroyed) return;

    const fieldConfigs = [
      { key: 'usernameOrEmail', label: 'Usuario' },
      { key: 'password', label: 'Contraseña' }
    ];

    const filledFields: string[] = [];
    const emptyFields: string[] = [];

    for (const field of fieldConfigs) {
      const control = this.loginForm.get(field.key);
      const value = control?.value || '';
      if (value && value.trim().length > 0) {
        if (field.key === 'password') {
          filledFields.push(`${field.label}: completada`);
        } else {
          filledFields.push(`${field.label}: ${value}`);
        }
      } else {
        emptyFields.push(field.label);
      }
    }

    // Construir mensaje con pausas
    const messages: string[] = [];

    if (filledFields.length === 0 && emptyFields.length === 0) {
      messages.push('No hay campos en el formulario.');
    } else if (filledFields.length === 0) {
      messages.push('Todos los campos están vacíos.');
      messages.push('Los campos disponibles son: ' + emptyFields.join(', ') + '.');
    } else {
      // Mensaje principal
      messages.push('Contenido del formulario:');
      messages.push(filledFields.join('. ') + '.');
      
      // Si hay campos vacíos, añadir mensaje separado
      if (emptyFields.length > 0) {
        messages.push('Campos vacíos: ' + emptyFields.join(', ') + '.');
      }
      
      // Si todos están completos, añadir mensaje con pausa
      if (emptyFields.length === 0) {
        messages.push('Todos los campos están completos.');
        messages.push('Di "enviar" para iniciar sesión.');
      }
    }

    // Reproducir cada mensaje con una pausa entre ellos
    this.speakWithPauses(messages);
  }
  

  /**
   * Reproduce una lista de mensajes con pausas entre ellos
   */
  private speakWithPauses(messages: string[], pauseMs: number = 500): void {
    if (this.isDestroyed || messages.length === 0) return;

    let index = 0;

    const speakNext = () => {
      if (this.isDestroyed || index >= messages.length) return;
      
      const message = messages[index];
      console.log(`🔊 [Login] Hablando (${index + 1}/${messages.length}): "${message}"`);
      
      this.voiceService.speak(message).then(() => {
        index++;
        if (index < messages.length) {
          // Esperar la pausa antes de la siguiente frase
          setTimeout(() => {
            speakNext();
          }, pauseMs);
        }
      }).catch(() => {
        // Si hay error, intentar con la siguiente después de la pausa
        index++;
        setTimeout(() => {
          speakNext();
        }, pauseMs);
      });
    };

    speakNext();
  }

  // ============================================================
  // DICTADO
  // ============================================================

  private startDictation(target: 'username' | 'password', initialText = ''): void {
    if (this.isDestroyed) return;
    this.dictationMode = true;
    this.dictationTarget = target;
    this.dictationBuffer = '';
    const fieldName = target === 'username' ? 'usuario' : 'contraseña';

    this.updateFormAndInputDirectly(target, '');

    if (initialText) {
      this.updateFormAndInputDirectly(target, initialText);
      this.dictationBuffer = initialText.trimEnd();
      this.voiceService.speak(`Dictando ${fieldName}. Texto inicial: ${initialText}`);
    } else {
      const finishList = this.voiceFilter.getFinishWords().slice(0, 2).join(' o ');
      this.voiceService.speak(`Dictando ${fieldName}. Di "${finishList}" para finalizar.`);
    }

    this.focusInput(target);
    this.log(`🎤 Dictado activado para: ${target}`);
  }



  // private focusInput(target: 'username' | 'password'): void {
  //   if (this.isDestroyed) return;
  //   const inputElement = target === 'username' ? this.usernameInput?.nativeElement : this.passwordInput?.nativeElement;
  //   if (inputElement) {
  //     setTimeout(() => {
  //       if (!this.isDestroyed) {
  //         inputElement.focus({ preventScroll: true });
  //         inputElement.select();
  //         this.cdr.markForCheck();
  //       }
  //     }, 100);
  //   }
  // }



  //
  private focusInput(target: 'username' | 'password'): void {
    if (this.isDestroyed) return;
    
    const inputElement = target === 'username' 
      ? this.usernameInput?.nativeElement 
      : this.passwordInput?.nativeElement;
      
    if (inputElement) {
      setTimeout(() => {
        if (!this.isDestroyed) {
          inputElement.focus({ preventScroll: true });
          inputElement.select();
          this.cdr.markForCheck();
        }
      }, 100);
    }
  }




  private handleDictation(text: string): void {
    if (this.isDestroyed) return;
    const target = this.dictationTarget!;
    const formControlName = target === 'username' ? 'usernameOrEmail' : 'password';
    const control = this.loginForm.get(formControlName);
    if (!control) return;
    const currentValue = control.value || '';
    this.log(`🔊 handleDictation: "${text}"`);

    const shouldCapitalize = target !== 'username';

    if (this.voiceFilter.containsFinishWords(text)) {
      this.log('🔴 Comando de finalización');
      const cleanText = this.voiceFilter.removeFinishWords(text);
      let finalValue = currentValue;

      if (cleanText.length > 0) {
        this.log(`📝 Procesando: "${cleanText}"`);
        const processed = this.voiceFilter.processDictationPhrase(cleanText, target, shouldCapitalize);
        if (processed.success) {
          finalValue = processed.text;
          this.updateFormAndInputDirectly(target, finalValue);
          this.dictationBuffer = processed.text.trimEnd();
          this.log(`🔤 Reemplazado por: "${finalValue}"`);
        }
      } else {
        this.log(`🔤 Sin texto nuevo, manteniendo: "${currentValue}"`);
      }
      this.stopDictation(finalValue);
      return;
    }

    if (text.includes('borrar') || text.includes('eliminar')) {
      if (this.dictationBuffer.length > 0) {
        const newValue = currentValue.slice(0, -this.dictationBuffer.length);
        this.updateFormAndInputDirectly(target, newValue);
        this.voiceService.speak(`Borrado: ${this.dictationBuffer.trim()}`);
        this.dictationBuffer = '';
        return;
      } else {
        const newValue = currentValue.slice(0, -1);
        this.updateFormAndInputDirectly(target, newValue);
        this.voiceService.speak('Borrado último carácter');
        return;
      }
    }

    if (text.includes('limpiar todo') || text.includes('borrar todo')) {
      this.updateFormAndInputDirectly(target, '');
      this.dictationBuffer = '';
      this.voiceService.speak('Campo limpiado');
      return;
    }

    if (text.includes('mostrar') || text.includes('ver') || text.includes('leer')) {
      this.voiceService.speak(`Texto actual: ${currentValue || 'vacío'}`);
      return;
    }

    let processed = this.voiceFilter.processDictationPhrase(text, target, shouldCapitalize);
    if (!processed.success || !processed.text) {
      const word = text.trim();
      const cleanWord = word.replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i').replace(/ó/g, 'o').replace(/ú/g, 'u');
      let finalWord = cleanWord;
      if (shouldCapitalize && (currentValue === '' || currentValue.endsWith(' ')) && finalWord.length > 0) {
        finalWord = finalWord.charAt(0).toUpperCase() + finalWord.slice(1);
      }
      processed = { success: true, text: finalWord + ' ', originalText: text, processedText: finalWord + ' ' } as any;
      this.log(`🔤 Fallback: "${processed.text}"`);
    }

    this.dictationBuffer = processed.text.trimEnd();
    this.log(`🔤 Texto acumulado (no visible): "${this.dictationBuffer}"`);
  }

  private updateFormAndInputDirectly(target: 'username' | 'password', value: string): void {
    if (this.isDestroyed) return;
    const formControlName = target === 'username' ? 'usernameOrEmail' : 'password';
    console.log(`🔵 updateFormAndInputDirectly - target: "${target}", value: "${value}"`);
    const control = this.loginForm.get(formControlName);
    if (!control) { this.logError(`❌ Control ${formControlName} no encontrado`); return; }

    control.setValue(value, { emitEvent: true });
    control.markAsDirty();
    control.markAsTouched();

    const input = document.querySelector(`input[formControlName="${formControlName}"]`) as HTMLInputElement;
    if (input) {
      input.value = value;
      this.renderer.setProperty(input, 'value', value);
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      this.renderer.addClass(input, 'input-valid');
      setTimeout(() => {
        this.renderer.removeClass(input, 'input-valid');
      }, 1000);
    }

    control.updateValueAndValidity({ emitEvent: true });
    this.cdr.markForCheck();
    console.log(`✅ Valor actualizado: "${control.value}"`);
  }

  //
  //private stopDictation(finalValue?: string, silent = false): void {
  //   if (this.isDestroyed) return;
  //   this.log(`🔴 stopDictation (silent: ${silent})`);
  //   const target = this.dictationTarget;
  //   if (target) {
  //     const formControlName = target === 'username' ? 'usernameOrEmail' : 'password';
  //     const control = this.loginForm.get(formControlName);
  //     let value = finalValue !== undefined ? finalValue : control?.value || '';
  //     value = value.trimEnd();

  //     if (value && value.length > 0) {
  //       this.updateFormAndInputDirectly(target, value);

  //       // ✅ Validación para usuario
  //       if (target === 'username') {
  //         control?.markAsTouched();
  //         control?.updateValueAndValidity();
  //         if (control?.invalid) {
  //           // ❌ Usuario inválido: NO borrar, solo avisar
  //           const errors = this.getUsernameErrors();
  //           const msg = errors || 'El usuario no es válido. Debe tener al menos 3 caracteres y solo letras, números, . _ @ ! ? - y sin espacios.';
  //           this.voiceService.speak(`Error: ${msg}. Puedes corregirlo manualmente o decir "usuario" para intentarlo de nuevo.`);
  //           // Enfocar el campo para que el usuario pueda corregir manualmente
  //           setTimeout(() => this.focusInput('username'), 500);
  //           // Salir del modo dictado, pero mantener el texto
  //           this.dictationMode = false;
  //           this.dictationTarget = null;
  //           this.dictationBuffer = '';
  //           this.cdr.markForCheck();
  //           return;
  //         } else {
  //           // ✅ Usuario válido
  //           if (!silent) {
  //             this.voiceService.speak(`Listo, usuario completado y válido.`);
  //           }
  //         }
  //       }

  //       // ✅ Validación para contraseña
  //       if (target === 'password') {
  //         control?.markAsTouched();
  //         control?.updateValueAndValidity();
  //         if (control?.invalid) {
  //           // ❌ Contraseña inválida: NO borrar, solo avisar
  //           const errors = this.getPasswordErrors();
  //           const msg = errors || 'La contraseña no cumple los requisitos. Debe tener al menos 9 caracteres, mayúscula, minúscula, número y símbolo.';
  //           this.voiceService.speak(`Error: ${msg}. Puedes corregirlo manualmente o decir "contraseña" para intentarlo de nuevo.`);
  //           // Enfocar el campo para que el usuario pueda corregir manualmente
  //           setTimeout(() => this.focusInput('password'), 500);
  //           // Salir del modo dictado, pero mantener el texto
  //           this.dictationMode = false;
  //           this.dictationTarget = null;
  //           this.dictationBuffer = '';
  //           this.cdr.markForCheck();
  //           return;
  //         } else {
  //           // ✅ Contraseña válida
  //           if (!silent) {
  //             this.voiceService.speak(`Listo, contraseña completada y válida.`);
  //           }
  //         }
  //       }
  //     } else {
  //       if (!silent) {
  //         this.voiceService.speak(`No se reconoció ${target === 'username' ? 'el usuario' : 'la contraseña'}.`);
  //       }
  //     }

  //     if (target === 'username' && this.passwordInput && !silent) {
  //       setTimeout(() => {
  //         if (!this.isDestroyed) {
  //           this.passwordInput.nativeElement.focus({ preventScroll: true });
  //           this.cdr.markForCheck();
  //         }
  //       }, 300);
  //     }
  //   }
  //   this.dictationMode = false;
  //   this.dictationTarget = null;
  //   this.dictationBuffer = '';
  //   this.cdr.markForCheck();
  // }








  private stopDictation(finalValue?: string, silent = false): void {
    if (this.isDestroyed) return;
    this.log(`🔴 stopDictation (silent: ${silent})`);
    const target = this.dictationTarget;
    
    if (target) {
      const formControlName = target === 'username' ? 'usernameOrEmail' : 'password';
      const control = this.loginForm.get(formControlName);
      let value = finalValue !== undefined ? finalValue : control?.value || '';
      value = value.trimEnd();

      if (value && value.length > 0) {
        this.updateFormAndInputDirectly(target, value);

        // ============================================================
        // ✅ VALIDACIÓN DE USUARIO
        // ============================================================
        if (target === 'username') {
          control?.markAsTouched();
          control?.updateValueAndValidity();
          
          if (control?.invalid) {
            // ❌ Usuario inválido: avisar y NO pasar al siguiente campo
            const errors = this.getUsernameErrors();
            const msg = errors || 'El usuario no es válido. Debe tener al menos 3 caracteres y solo letras, números, . _ @ ! ? - y sin espacios.';
            
            // ✅ Usar speakAlways para asegurar que se escuche
            this.voiceService.speakAlways(`Error: ${msg}. Puedes corregirlo manualmente o decir "usuario" para intentarlo de nuevo.`);
            
            // ✅ Enfocar el campo para corregir
            setTimeout(() => this.focusInput('username'), 500);
            
            // ✅ Salir del modo dictado, mantener el texto para corregir
            this.dictationMode = false;
            this.dictationTarget = null;
            this.dictationBuffer = '';
            this.cdr.markForCheck();
            return;
          } else {
            // ✅ Usuario válido
            if (!silent) {
              this.voiceService.speakAlways(`Usuario válido. Ahora puedes decir "contraseña".`);
              
              // ✅ Enfocar automáticamente el siguiente campo
              setTimeout(() => {
                this.focusInput('password');
              }, 800);
            }
          }
        }

        // ============================================================
        // ✅ VALIDACIÓN DE CONTRASEÑA
        // ============================================================
        if (target === 'password') {
          control?.markAsTouched();
          control?.updateValueAndValidity();
          
          if (control?.invalid) {
            // ❌ Contraseña inválida: avisar y NO pasar al siguiente campo
            const errors = this.getPasswordErrors();
            const msg = errors || 'La contraseña no cumple los requisitos. Debe tener al menos 9 caracteres, mayúscula, minúscula, número y símbolo.';
            
            // ✅ Usar speakAlways para asegurar que se escuche
            this.voiceService.speakAlways(`Error: ${msg}. Puedes corregirlo manualmente o decir "contraseña" para intentarlo de nuevo.`);
            
            // ✅ Enfocar el campo para corregir
            setTimeout(() => this.focusInput('password'), 500);
            
            // ✅ Salir del modo dictado, mantener el texto para corregir
            this.dictationMode = false;
            this.dictationTarget = null;
            this.dictationBuffer = '';
            this.cdr.markForCheck();
            return;
          } else {
            // ✅ Contraseña válida
            if (!silent) {
              this.voiceService.speakAlways(`Contraseña válida. Di "enviar" para iniciar sesión.`);
            }
          }
        }
      } else {
        // ⚠️ No se reconoció texto
        if (!silent) {
          const fieldName = target === 'username' ? 'el usuario' : 'la contraseña';
          this.voiceService.speakAlways(`No se reconoció ${fieldName}. Di "${target === 'username' ? 'usuario' : 'contraseña'}" para intentarlo de nuevo.`);
        }
      }

      // ✅ Si el campo era usuario y es válido, enfocar contraseña
      if (target === 'username' && this.passwordInput && !silent) {
        setTimeout(() => {
          if (!this.isDestroyed) {
            this.passwordInput.nativeElement.focus({ preventScroll: true });
            this.cdr.markForCheck();
          }
        }, 300);
      }
    }
    
    // ✅ Resetear estado de dictado
    this.dictationMode = false;
    this.dictationTarget = null;
    this.dictationBuffer = '';
    this.cdr.markForCheck();
  }







  //
  private getUsernameErrors(): string | null {
    const ctrl = this.usernameOrEmailCtrl;
    if (!ctrl.dirty && !ctrl.touched) return null;
    const value = ctrl.value || '';

    if (ctrl.hasError('required')) return 'El usuario o email es obligatorio';
    if (ctrl.hasError('minlength')) return 'Debe tener al menos 3 caracteres';
    if (ctrl.hasError('maxlength')) return 'No puede tener más de 50 caracteres';

    if (ctrl.hasError('invalidUsername')) {
      // 🔥 Detectar si parece un email con expresión regular
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailPattern.test(value)) {
        return 'El email no tiene un formato válido. Ejemplo: usuario@dominio.com';
      }
      return 'El usuario solo puede contener letras, números, . _ @ ! ? - y sin espacios.';
    }
    return null;
  }





  private handleAction(response: VoiceCommandResponse): void {
    if (this.isDestroyed) return;
    const action = response.action;
    if (!action) return;
    this.log(`🎯 Acción recibida: ${action.type}`, action.payload);
    switch (action.type) {
      case 'navigate':
        const route = action.payload?.['route'];
        if (route) this.router.navigate([route]);
        break;
      case 'login':
        this.onLogin();
        break;
      case 'input':
        if (action.payload?.['field'] && action.payload?.['value']) {
          this.updateFormAndInputDirectly(action.payload['field'] as 'username' | 'password', action.payload['value'] as string);
        }
        break;
      case 'clear':
        this.clearAllFields();
        break;
      default:
        this.log('Acción no reconocida:', action.type);
    }
  }

  private showHelp(): void {
    if (this.isDestroyed) return;
    if (this.voiceService.isCurrentlyMuted()) {
      this.voiceService.speak('El micrófono está desactivado. Di "hola" para activarlo.');
      return;
    }

    // ✅ Dividir el mensaje en fragmentos más cortos
    const helpMessages = [
      'Puedes decir: "usuario" para escribir tu usuario.',
      '"contraseña" para tu clave.',
      '"enviar" para iniciar sesión.',
      '"limpiar" para borrar los campos.',
      '"leer campos" para escuchar el contenido.',
      '"mostrar contraseña" u "ocultar contraseña" para ver u ocultar tu clave.',
      '"registrar" para crear una cuenta.',
      '"recuperar" para recuperar tu contraseña.',
      '"volver" para regresar a la página anterior.',
      '"silenciar micrófono" para apagar el micrófono.',
      '"privacidad" para ver la política de privacidad.',
      '"condiciones" para ver los términos y condiciones.',
      'o "ayuda" para ver todas las opciones.'
    ];

    // ✅ Reproducir con pausas de 300ms entre fragmentos
    this.speakWithPauses(helpMessages, 100);
  }

  togglePassword(): void {
    if (this.isDestroyed) return;
    this.hidePassword.update((value) => !value);
    const input = this.passwordInput?.nativeElement;
    if (input) {
      if (this.hidePassword()) {
        this.renderer.addClass(input, 'password-mask');
      } else {
        this.renderer.removeClass(input, 'password-mask');
      }
    }
    this.cdr.markForCheck();
  }

  // ============================================================
  // LOGIN
  // ============================================================

  // onLogin(): void {
  //   if (this.isDestroyed) return;
  //   if (this.dictationMode) this.stopDictation(undefined, true);

  //   if (this.loginForm.invalid || this.isLoading()) {
  //     this.loginForm.markAllAsTouched();
  //     let errorMsg = 'El formulario tiene errores. ';
  //     if (this.usernameOrEmailCtrl.invalid) {
  //       if (this.usernameOrEmailCtrl.hasError('required')) {
  //         errorMsg += 'El usuario es obligatorio. ';
  //       } else if (this.usernameOrEmailCtrl.hasError('minlength')) {
  //         errorMsg += 'El usuario debe tener al menos 3 caracteres. ';
  //       }
  //     }
  //     if (this.passwordCtrl.invalid) {
  //       const passwordErrors = this.getPasswordErrors();
  //       if (passwordErrors) {
  //         errorMsg += passwordErrors;
  //       } else {
  //         errorMsg += 'La contraseña no cumple los requisitos. ';
  //       }
  //     }
  //     this.voiceService.speak(errorMsg);
  //     this.cdr.markForCheck();
  //     return;
  //   }

  //   this.isLoading.set(true);
  //   this.errorMessage.set(null);
  //   this.cdr.markForCheck();

  //   const credentials: LoginRequest = {
  //     usernameOrEmail: this.loginForm.get('usernameOrEmail')?.value || '',
  //     password: this.loginForm.get('password')?.value || ''
  //   };

  //   console.log('🔐 Enviando login:', credentials);
  //   this.authService.login(credentials)
  //     .pipe(finalize(() => {
  //       if (!this.isDestroyed) { this.isLoading.set(false); this.cdr.markForCheck(); }
  //     }))
  //     .subscribe({
  //       next: () => {
  //         if (!this.isDestroyed) {
  //           console.log('✅ Login exitoso');
  //           // ✅ LIMPIAR ANTES DE NAVEGAR
  //           this.voiceService.clearTranscript();
  //           this.voiceService.speak('¡Bienvenido!');
  //           // this.router.navigate(['/dashboard']);
  //           this.router.navigate([this.DEFAULT_REDIRECT]);
  //         }
  //       },
  //       error: (err) => {
  //         if (!this.isDestroyed) {
  //           this.logError('Error en login:', err);
  //           let msg: string;
  //           if (err.status === 401 || err.status === 403) {
  //             msg = 'Usuario o contraseña incorrectos.';
  //           } else if (err.status === 0) {
  //             msg = 'Error de conexión. Verifica tu internet.';
  //           } else if (err.status === 500) {
  //             msg = 'Error en el servidor. Intenta más tarde.';
  //           } else {
  //             msg = 'Error inesperado. Intenta de nuevo.';
  //           }
  //           this.errorMessage.set(msg);
  //           this.voiceService.speak(msg);
  //           this.focusUsernameInput();
  //           this.cdr.markForCheck();
  //         }
  //       },
  //     });
  // }






  // login.component.ts

  onLogin(): void {
    if (this.isDestroyed) return;
    if (this.dictationMode) this.stopDictation(undefined, true);

    // ============================================================
    // 1. VALIDACIÓN DEL FORMULARIO
    // ============================================================
    if (this.loginForm.invalid || this.isLoading()) {
      this.loginForm.markAllAsTouched();
      let errorMsg = 'El formulario tiene errores. ';
      
      // Validación de Usuario
      if (this.usernameOrEmailCtrl.invalid) {
        if (this.usernameOrEmailCtrl.hasError('required')) {
          errorMsg += 'El usuario es obligatorio. ';
        } else if (this.usernameOrEmailCtrl.hasError('minlength')) {
          errorMsg += 'El usuario debe tener al menos 3 caracteres. ';
        } else if (this.usernameOrEmailCtrl.hasError('maxlength')) {
          errorMsg += 'El usuario no puede tener más de 50 caracteres. ';
        } else if (this.usernameOrEmailCtrl.hasError('invalidUsername')) {
          // Detectar si parece un email con expresión regular
          const value = this.usernameOrEmailCtrl.value || '';
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (emailPattern.test(value)) {
            errorMsg += 'El email no tiene un formato válido. Ejemplo: usuario@dominio.com. ';
          } else {
            errorMsg += 'El usuario solo puede contener letras, números, . _ @ ! ? - y sin espacios. ';
          }
        }
      }
      
      // Validación de Contraseña
      if (this.passwordCtrl.invalid) {
        const passwordErrors = this.getPasswordErrors();
        if (passwordErrors) {
          errorMsg += passwordErrors;
        } else {
          errorMsg += 'La contraseña no cumple los requisitos. ';
        }
      }
      
      // ✅ Usar speakAlways para asegurar que se escuche incluso con micrófono activo
      this.voiceService.speakAlways(errorMsg);
      
      // ✅ Enfocar el primer campo inválido
      if (this.usernameOrEmailCtrl.invalid) {
        setTimeout(() => this.focusInput('username'), 500);
      } else if (this.passwordCtrl.invalid) {
        setTimeout(() => this.focusInput('password'), 500);
      }
      
      this.cdr.markForCheck();
      return;
    }

    // ============================================================
    // 2. FORMULARIO VÁLIDO - INICIAR LOGIN
    // ============================================================
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.cdr.markForCheck();

    const credentials: LoginRequest = {
      usernameOrEmail: this.loginForm.get('usernameOrEmail')?.value || '',
      password: this.loginForm.get('password')?.value || ''
    };

    console.log('🔐 Enviando login:', credentials);
    
    this.authService.login(credentials)
      .pipe(finalize(() => {
        if (!this.isDestroyed) { 
          this.isLoading.set(false); 
          this.cdr.markForCheck(); 
        }
      }))
      .subscribe({
        next: () => {
          if (!this.isDestroyed) {
            console.log('✅ Login exitoso');
            // ✅ LIMPIAR ANTES DE NAVEGAR
            this.voiceService.clearTranscript();
            this.voiceService.speak('¡Bienvenido!');
            // ✅ Redirigir al dashboard-v2
            this.router.navigate(['/dashboard-v2']);
          }
        },
        error: (err) => {
          if (!this.isDestroyed) {
            this.logError('Error en login:', err);
            let msg: string;
            
            // ✅ Manejo de errores con mensajes claros
            if (err.status === 401 || err.status === 403) {
              msg = 'Usuario o contraseña incorrectos. Por favor, inténtalo de nuevo.';
            } else if (err.status === 0) {
              msg = 'Error de conexión. Verifica tu conexión a internet.';
            } else if (err.status === 404) {
              msg = 'Usuario no encontrado. Verifica que el usuario o email esté registrado.';
            } else if (err.status === 500) {
              msg = 'Error en el servidor. Intenta más tarde o contacta con soporte.';
            } else if (err.status === 429) {
              msg = 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
            } else {
              msg = 'Error inesperado. Intenta de nuevo más tarde.';
            }
            
            this.errorMessage.set(msg);
            
            // ✅ Usar speakAlways para asegurar que se escuche
            this.voiceService.speakAlways(msg);
            
            // ✅ Enfocar el campo de usuario para reintentar
            this.focusUsernameInput();
            this.cdr.markForCheck();
          }
        }
      });
  }




  getPasswordErrors(): string | null {
    const ctrl = this.passwordCtrl;
    if (!ctrl.dirty && !ctrl.touched) return null;
    const value = ctrl.value || '';
    if (ctrl.hasError('required')) return 'La contraseña es obligatoria';
    if (value.length <= 2) return null;
    if (ctrl.valid) return null;
    if (ctrl.hasError('minlength')) return `Mínimo 9 caracteres (actual: ${value.length})`;
    const missing: string[] = [];
    if (ctrl.hasError('missingUppercase')) missing.push('mayúscula');
    if (ctrl.hasError('missingLowercase')) missing.push('minúscula');
    if (ctrl.hasError('missingNumber')) missing.push('número');
    if (ctrl.hasError('missingSpecialChar')) missing.push('carácter especial');
    if (missing.length === 0) return null;
    return 'Falta: ' + missing.join(', ');
  }

  onUsernameBlur(): void {
    if (this.isDestroyed) return;
    this.usernameOrEmailCtrl.markAsTouched();
    this.usernameOrEmailCtrl.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  onPasswordBlur(): void {
    if (this.isDestroyed) return;
    this.passwordCtrl.markAsTouched();
    this.passwordCtrl.updateValueAndValidity();
    this.cdr.markForCheck();
  }

  private focusUsernameInput(): void {
    if (this.isDestroyed) return;
    setTimeout(() => {
      if (!this.isDestroyed) {
        const input = this.usernameInput?.nativeElement || document.querySelector('input[formControlName="usernameOrEmail"]') as HTMLInputElement;
        if (input) { input.focus({ preventScroll: true }); input.select(); this.cdr.markForCheck(); }
      }
    }, 100);
  }

  // ============================================================
  // DESTRUCTOR
  // ============================================================

  ngOnDestroy(): void {
    console.log('🧹 LoginComponent - Iniciando limpieza');
    
    this.voiceService.clearTranscript();
    
    if (this.welcomeTimeout) {
      clearTimeout(this.welcomeTimeout);
      this.welcomeTimeout = null;
    }
    
    window.speechSynthesis.cancel();
    
    this.voiceContext.resetContext();
    this.isDestroyed = true;
    if (this.dictationMode) this.stopDictation(undefined, true);
    this.orchestrator.reset();
    this.destroy$.next();
    this.destroy$.complete();
    this.valueChangesSubscription?.unsubscribe();
    this.mutedSubscription?.unsubscribe();
    this.fieldCleanup.unregisterField('username');
    this.fieldCleanup.unregisterField('password');
    this.dictationMode = false;
    this.dictationTarget = null;
    this.dictationBuffer = '';
    console.log('🧹 LoginComponent destruido');
  }
}

