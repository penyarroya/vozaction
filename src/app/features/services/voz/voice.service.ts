// // src/core/services/voz/voice.service.ts
// import { Injectable, NgZone, inject, OnDestroy } from '@angular/core';
// import { Observable, Subject, BehaviorSubject, firstValueFrom, filter, take, timeout } from 'rxjs';
// import { VoiceFilterService } from './voice-filter.service';
// import { VoiceCommandResponse } from '../../models/voz/VoiceCommandResponse-model';
// import { environment } from '../../../../environments/environment';
// import { LoggerService } from '../../../shared/services/loggers/logger.service';
// import { VoiceContextService } from '../../../features/services/voz/voice-context.service';

// @Injectable({ providedIn: 'root' })
// export class VoiceService implements OnDestroy {
//   private recognition: SpeechRecognition | null = null;
//   private isListening = false;
//   private ngZone = inject(NgZone);
//   private logger = inject(LoggerService);
//   private filterService = inject(VoiceFilterService);
//   private voiceContext = inject(VoiceContextService);

//   // Subjects
//   private transcriptSubject = new Subject<string>();
//   private responseSubject = new Subject<VoiceCommandResponse>();
//   private mutedSubject = new BehaviorSubject<boolean>(false);
//   private wakeWordSubject = new Subject<string>();
//   private errorSubject = new Subject<string>();

//   private listeningSubject = new BehaviorSubject<boolean>(false);
//   public listening$ = this.listeningSubject.asObservable();

//   private autoRestartSubject = new BehaviorSubject<boolean>(false);
//   public autoRestart$ = this.autoRestartSubject.asObservable();

//   private readySubject = new BehaviorSubject<boolean>(false);
//   public ready$ = this.readySubject.asObservable();

//   private readonly WAKE_WORDS = ['hola', 'asistente'];

//   private isMuted = false;
//   private cachedVoice: SpeechSynthesisVoice | null = null;
//   private reconnectAttempts = 0;
//   private readonly MAX_RECONNECT_ATTEMPTS = 5;
//   private reconnectTimeout: any = null;

//   private isStarting = false;
//   private recognitionActive = false;

//   // Debounce para wake word
//   private lastWakeWordTime = 0;
//   private readonly WAKE_DEBOUNCE_TIME = 2000;

//   private welcomeFlags = {
//     welcome: false,
//     about: false,
//     login: false,
//     init: false,
//     register: false,
//     notfound: false
//   };

//   public muted$ = this.mutedSubject.asObservable();
//   public wakeWord$ = this.wakeWordSubject.asObservable();
//   public error$ = this.errorSubject.asObservable();
//   public response$ = this.responseSubject.asObservable();

//   private enableLogs = environment.enableLogs;
//   private lastProcessedTranscript = '';
//   private lastProcessedTime = 0;
//   private restartCount = 0;

//   constructor() {
//     this.initRecognition();
//     this.loadVoices();
    
//     this.isMuted = true;
//     this.mutedSubject.next(true);
//     this.listeningSubject.next(false);
//     this.readySubject.next(false);
    
//     if (this.enableLogs) {
//       this.logger.log('🎤 VoiceService inicializado en modo silencio');
//     }

//     setTimeout(() => {
//       this.startListening();
//     }, 0);
//   }

//   ngOnDestroy(): void {
//     this.destroy();
//   }

//   // ============================================================
//   // INICIALIZACIÓN
//   // ============================================================

//   private loadVoices(): void {
//     if (window.speechSynthesis) {
//       window.speechSynthesis.getVoices();
//       window.speechSynthesis.onvoiceschanged = () => {
//         window.speechSynthesis.getVoices();
//         if (this.enableLogs) {
//           this.logger.log('🗣️ Voces cargadas');
//         }
//       };
//     }
//   }

//   private initRecognition(): void {
//     const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       this.logger.warn('Web Speech API no soportada en este navegador');
//       return;
//     }

//     this.recognition = new SpeechRecognition();
//     this.recognition.continuous = true;
//     this.recognition.interimResults = true;
//     this.recognition.lang = 'es-ES';
//     this.recognition.maxAlternatives = 1;

//     this.recognition.onresult = this.handleResult.bind(this);
//     this.recognition.onerror = this.handleError.bind(this);
//     this.recognition.onend = this.handleEnd.bind(this);

//     // onstart se dispara cuando el hardware está realmente activo
//     this.recognition.onstart = () => {
//       this.ngZone.run(() => {
//         this.recognitionActive = true;
//         this.readySubject.next(true);
//         console.log('🎤 Micrófono realmente activo (onstart)');
//       });
//     };

//     if (this.enableLogs) {
//       this.logger.log('✅ Speech Recognition inicializado');
//     }
//   }

//   // ============================================================
//   // MANEJO DE EVENTOS
//   // ============================================================
  
//   private handleResult(event: SpeechRecognitionEvent): void {
//     if (!event.results || event.results.length === 0) return;

//     const result = event.results[event.results.length - 1];
//     if (!result || !result[0]) return;

//     const transcript = result[0].transcript.toLowerCase().trim();

//     if (this.enableLogs) {
//       console.log('🎤 Reconocido:', transcript, 'Final:', result.isFinal);
//     }

//     // ============================================================
//     // 🔥 FILTRAR RESULTADOS PARCIALES (SOLO WAKE WORDS Y NÚMEROS)
//     // ============================================================
//     if (!result.isFinal) {
//       const hasWakeWord = this.WAKE_WORDS.some(w => 
//         transcript.includes(w) || transcript === w
//       );
//       const hasDigits = /\d/.test(transcript);
//       const numberWords = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
//       const hasNumberWord = numberWords.some(w => transcript.includes(w));

//       if (hasWakeWord) {
//         if (this.enableLogs) {
//           console.log(`🔊 Wake word parcial detectada: "${transcript}"`);
//         }
//         this.processWakeWord(transcript);
//       } else if (hasDigits || hasNumberWord) {
//         if (this.enableLogs) {
//           console.log(`🔢 Resultado parcial numérico: "${transcript}"`);
//         }
//         // Continúa al procesamiento normal (NO retorna)
//       } else {
//         if (this.enableLogs) {
//           console.log(`⏳ Resultado parcial ignorado: "${transcript}"`);
//         }
//         return;
//       }
//     }

//     // ============================================================
//     // A PARTIR DE AQUÍ, TODOS LOS RESULTADOS (PARCIALES Y FINALES)
//     // ============================================================

//     // FILTRO DE RUIDO DE TECLADO/MOUSE
//     const noisePatterns = [
//       /^[a-z]$/i,
//       /^[a-z]{1,3}$/i,
//       /^(click|clic|tick|tac|clap|tap|pop|beep)$/i,
//       /^[cC][lL][iI][cC][kK]/,
//       /^[tT][iI][cC]/,
//       /^[cC][lL][aA][pP]/,
//       /^[mM][oO][uU][sS][eE]/,
//       /^[kK][eE][yY]/,
//       /^[a-zA-Z]\s+[a-zA-Z]$/,
//       /^[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]$/,
//       /^[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]$/,
//     ];

//     const shortValidCommands = ['hola', 'leer', 'ayuda', 'login', 'back', 'help', 'si', 'no', 'ok', 'vale', 'fin', 'ir'];

//     if (!shortValidCommands.includes(transcript) && noisePatterns.some(pattern => pattern.test(transcript))) {
//       if (this.enableLogs) {
//         console.log(`⏭️ Ruido de teclado/mouse ignorado: "${transcript}"`);
//       }
//       return;
//     }

//     // FILTRO PARA EVITAR DUPLICADOS
//     // const now = Date.now();
//     // const validCommands = [
//     //   'login', 'acerca', 'hola', 'asistente', 'silenciar', 'activar',
//     //   'ayuda', 'código', 'verificar', 'volver', 'atrás', 'regresar', 'cancelar',
//     //   'usuario', 'nombre', 'email', 'correo',
//     //   'contraseña', 'clave', 'password', 'pass',
//     //   'enviar', 'logear', 'acceder', 'entrar', 'ingresar',
//     //   'limpiar', 'borrar', 'resetear',
//     //   'mostrar', 'ocultar', 'ver',
//     //   'registro', 'registrar', 'recuperar', 'olvidé',  
//     //   'privacidad', 'condiciones', 'términos',
//     //   'fin', 'listo', 'terminar', 'finalizar', 'ok', 'vale', 'hecho',
//     //   'completar', 'cancel', 'abortar',
//     //   'confirmar', 'confirm', 'aceptar', 'validar',
//     //   'leer', 'información',
//     //   'iniciar sesion',    
//     //   'inicio de sesion'   
//     // ];

//     // const isValidCommand = validCommands.some(cmd => transcript.includes(cmd));
    
//     // if (!isValidCommand && transcript === this.lastProcessedTranscript && now - this.lastProcessedTime < 3000) {
//     //   if (this.enableLogs) {
//     //     console.log(`⏭️ Comando duplicado ignorado: "${transcript}"`);
//     //   }
//     //   return;
//     // }
//     // this.lastProcessedTranscript = transcript;
//     // this.lastProcessedTime = now;




//     // FILTRO PARA EVITAR DUPLICADOS (CON EXCEPCIÓN PARA DÍGITOS Y NÚMEROS)
//     const now = Date.now();
//     const validCommands = [
//       'login', 'acerca', 'hola', 'asistente', 'silenciar', 'activar',
//       'ayuda', 'código', 'verificar', 'volver', 'atrás', 'regresar', 'cancelar',
//       'usuario', 'nombre', 'email', 'correo',
//       'contraseña', 'clave', 'password', 'pass',
//       'enviar', 'logear', 'acceder', 'entrar', 'ingresar',
//       'limpiar', 'borrar', 'resetear',
//       'mostrar', 'ocultar', 'ver',
//       'registro', 'registrar', 'recuperar', 'olvidé',  
//       'privacidad', 'condiciones', 'términos',
//       'fin', 'listo', 'terminar', 'finalizar', 'ok', 'vale', 'hecho',
//       'completar', 'cancel', 'abortar',
//       'confirmar', 'confirm', 'aceptar', 'validar',
//       'leer', 'información',
//       'iniciar sesion',    
//       'inicio de sesion'   
//     ];

//     const isValidCommand = validCommands.some(cmd => transcript.includes(cmd));

//     // 🔥 EXCEPCIÓN: si el texto contiene dígitos o palabras numéricas, NO aplicar control de duplicados
//     const hasDigits = /\d/.test(transcript);
//     const numberWords = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
//     const hasNumberWord = numberWords.some(w => transcript.includes(w));

//     if (!isValidCommand && !hasDigits && !hasNumberWord && transcript === this.lastProcessedTranscript && now - this.lastProcessedTime < 3000) {
//       if (this.enableLogs) {
//         console.log(`⏭️ Comando duplicado ignorado: "${transcript}"`);
//       }
//       return;
//     }
//     this.lastProcessedTranscript = transcript;
//     this.lastProcessedTime = now;





//     this.ngZone.run(() => {

//       // COMANDOS DIRECTOS (SILENCIAR MICRÓFONO)
//       const lower = transcript.toLowerCase();
//       if (/\bsilenciar\b/.test(lower) || 
//           lower.includes('silenciar micrófono') || 
//           lower.includes('silenciar micro') || 
//           lower.includes('silencia micrófono')) {
//         if (!this.isMuted) {
//           this.mute();
//           if (this.enableLogs) this.logger.log('🔇 Silenciado por comando de voz');
//         } else {
//           if (this.enableLogs) this.logger.log('ℹ️ Micrófono ya está muteado');
//         }
//         return;
//       }

//       // WAKE WORD DETECTION (hola / asistente)
//       const hasWakeWord = this.WAKE_WORDS.some(w =>
//         new RegExp(`\\b${w}\\b`, 'i').test(transcript)
//       );

//       if (hasWakeWord) {
//         if (this.enableLogs) {
//           console.log(`🔊 Wake word detectada: "${transcript}"`);
//           this.logger.log(`🔊 Wake word detectada: "${transcript}"`);
//         }

//         const command = transcript.replace(
//           /^(hola\s+|oye\s+|hey\s+|eh\s+)?(voz|asistente)\s*/i,
//           ''
//         ).trim();

//         const isJustHola = transcript === 'hola' || transcript === 'hola hola';
        
//         if (isJustHola) {
//           if (this.enableLogs) {
//             this.logger.log('👋 Saludo detectado: "hola"');
//           }
//           if (this.isMuted) {
//             const ahora = Date.now();
//             if (ahora - this.lastWakeWordTime > this.WAKE_DEBOUNCE_TIME) {
//               this.lastWakeWordTime = ahora;
//               this.unmute();
//               this.wakeWordSubject.next(transcript);
//             } else {
//               if (this.enableLogs) {
//                 this.logger.log('⏳ Saludo ignorado por debounce (demasiado rápido)');
//               }
//             }
//           }
//           return;
//         }

//         if (this.isMuted) {
//           if (this.enableLogs) {
//             this.logger.log('🔊 Wake word detectada, activando micrófono');
//           }
//           this.unmute();
//           this.wakeWordSubject.next(transcript);

//           if (command.length > 0) {
//             if (this.enableLogs) {
//               this.logger.log(`📤 Comando extraído: "${command}"`);
//             }
//             setTimeout(() => {
//               this.transcriptSubject.next(command);
//             }, 150);
//           }
//           return;
//         }

//         if (command.length > 0) {
//           if (this.enableLogs) {
//             this.logger.log(`✅ Comando procesado (con wake word): "${command}"`);
//           }
//           this.transcriptSubject.next(command);
//         }
//         return;
//       }

//       // SI ESTÁ MUTEADO Y NO HAY WAKE WORD, IGNORAR (CON LISTA DE EXCEPCIONES)
//       if (this.isMuted) {
//         const allowedWhenMuted = [
//           'ayuda', 'help',
//           'código', 'codigo',
//           'verificar', 'validar',
//           'leer',
//           'mostrar',
//           'registrar',
//           'hola',
//           'asistente',
//           'volver', 'atrás', 'regresar', 'back'
//         ];
        
//         const isAllowed = allowedWhenMuted.some(cmd => 
//           transcript === cmd || transcript.includes(cmd)
//         );
        
//         if (!isAllowed) {
//           if (this.enableLogs) {
//             this.logger.debug(`🔇 Muteado, ignorando: "${transcript}"`);
//           }
//           return;
//         }
//       }

//       // ============================================================
//       // 🔥 FILTROS DE RUIDO AVANZADOS (CON EXCEPCIÓN PARA NÚMEROS)
//       // ============================================================
//       const shortValidCommands2 = ['hola', 'leer', 'ayuda', 'login', 'back', 'help', 'si', 'no', 'ok', 'vale', 'fin', 'ir'];
//       const numberWords = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
//       const hasNumberWord = numberWords.some(w => transcript.includes(w));

//       // ✅ Permitir comandos cortos, dígitos o palabras numéricas sin filtrar vocales
//       if (shortValidCommands2.includes(transcript) || /\d/.test(transcript) || hasNumberWord) {
//         // Dejamos pasar sin aplicar más filtros
//       } else {
//         if (!transcript || transcript.length < 4) {
//           if (this.enableLogs) {
//             this.logger.debug(`⏭️ Muy corto: "${transcript}"`);
//           }
//           return;
//         }

//         if (!/[aeiouáéíóú]/.test(transcript)) {
//           if (this.enableLogs) {
//             this.logger.debug(`⏭️ Sin vocales: "${transcript}"`);
//           }
//           return;
//         }

//         const vowels = transcript.match(/[aeiouáéíóú]/g) || [];
//         if (new Set(vowels).size < 2) {
//           if (this.enableLogs) {
//             this.logger.debug(`⏭️ Muy pocas vocales: "${transcript}"`);
//           }
//           return;
//         }
//       }

//       // PROCESAR COMANDOS
//       const filterResult = this.filterService.filterTranscript(
//         transcript,
//         this.isMuted
//       );

//       if (!filterResult.valid) {
//         if (this.enableLogs) {
//           this.logger.debug(
//             `⏭️ Ignorado (${filterResult.reason}): "${transcript}"`
//           );
//         }
//         return;
//       }

//       const knownCommands = [
//         'login', 'iniciar', 'acceder', 'entrar', 'quienes', 'somos',
//         'acerca', 'ayuda', 'opciones', 'silenciar', 'activar',
//         'atrás', 'volver', 'cerrar', 'salir', 'back',
//         'usuario', 'contraseña', 'enviar', 'limpiar',
//         'clave', 'password', 'pass', 'user',
//         'nombre', 'email', 'correo', 'confirmar',
//         'nombre propio', 'apellidos', 'registrar',
//         'fullname', 'lastname',
//         'código', 'codigo', 'verificar', 'validar',
//         'confirmar código', 'leer', 'mostrar', 'aceptar',
//         'fin', 'recuperar', 
//         'olvidé',           
//       ];

//       const hasCommand = knownCommands.some(cmd =>
//         transcript.includes(cmd)
//       );

//       if (!hasCommand && transcript.split(' ').length < 2) {
//         if (this.enableLogs) {
//           this.logger.debug(`⏭️ Sin comando conocido: "${transcript}"`);
//         }
//         return;
//       }

//       if (this.enableLogs) {
//         this.logger.log('✅ Comando procesado:', transcript);
//       }

//       this.transcriptSubject.next(transcript);
//     });
//   }








//   // ============================================================
//   // 🔥 NUEVO MÉTODO: Procesar wake word parcial
//   // ============================================================
//   private processWakeWord(transcript: string): void {
//     const ahora = Date.now();
    
//     // Verificar debounce de wake word
//     if (ahora - this.lastWakeWordTime < this.WAKE_DEBOUNCE_TIME) {
//       if (this.enableLogs) {
//         this.logger.log('⏳ Wake word ignorada por debounce (demasiado rápido)');
//       }
//       return;
//     }
    
//     this.lastWakeWordTime = ahora;
    
//     // Si está muteado, activar micrófono
//     if (this.isMuted) {
//       if (this.enableLogs) {
//         this.logger.log('🔊 Wake word detectada, activando micrófono');
//       }
//       this.unmute();
//       this.wakeWordSubject.next(transcript);
//     } else {
//       if (this.enableLogs) {
//         this.logger.log(`ℹ️ Wake word recibida pero micrófono ya activo: "${transcript}"`);
//       }
//     }
//   }




//   // ============================================================
//   // MANEJO DE ERRORES Y FINALIZACIÓN
//   // ============================================================

//   private handleError(event: SpeechRecognitionErrorEvent): void {
//     this.ngZone.run(() => {
//       console.log('🔍 [VoiceService] handleError:', { error: event.error, timestamp: new Date().toISOString() });
//       this.logger.error('Error en reconocimiento:', event.error);
//       this.errorSubject.next(event.error);

//       // Si hay error, el micrófono no está listo
//       this.readySubject.next(false);
//       this.recognitionActive = false;

//       if (event.error === 'no-speech' || event.error === 'audio-capture') {
//         this.handleRecoverableError();
//       } else if (event.error === 'not-allowed') {
//         this.logger.error('❌ Permiso de micrófono denegado');
//         this.stopListening();
//         this.errorSubject.next('Permiso de micrófono denegado');
//       } else {
//         this.logger.error('❌ Error crítico, deteniendo reconocimiento');
//         this.stopListening();
//         this.errorSubject.next(`Error crítico: ${event.error}`);
//       }
//     });
//   }

//   private handleRecoverableError(): void {
//     this.reconnectAttempts++;
    
//     if (this.reconnectAttempts <= this.MAX_RECONNECT_ATTEMPTS) {
//       const delay = Math.min(500 * Math.pow(1.2, this.reconnectAttempts), 5000);
//       if (this.enableLogs) {
//         this.logger.log(`⏳ Reintentando en ${delay}ms (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
//       }
      
//       this.reconnectTimeout = setTimeout(() => {
//         if (this.isListening && !this.isStarting) {
//           this.restart();
//         }
//       }, delay);
//     } else {
//       this.logger.warn('⚠️ Máximos intentos de reconexión alcanzados');
//       this.stopListening();
//       this.reconnectAttempts = 0;
//       this.errorSubject.next('No se pudo restablecer la conexión del micrófono');
//     }
//   }

//   //
//   // voice.service.ts - handleEnd() CORREGIDO

//   private handleEnd(): void {
//     console.log('🔍 [VoiceService] handleEnd:', {
//       isListening: this.isListening,
//       isStarting: this.isStarting,
//       recognitionActive: this.recognitionActive,
//       timestamp: new Date().toISOString()
//     });
    
//     // ✅ RESETEAR isStarting (¡CLAVE!)
//     this.isStarting = false;
    
//     if (this.enableLogs) {
//       this.logger.log('🔴 Reconocimiento finalizado');
//     }
    
//     this.recognitionActive = false;
//     this.readySubject.next(false);
//     this.listeningSubject.next(false);
    
//     if (this.isListening && !this.isStarting) {
//       if (this.enableLogs) {
//         this.logger.log('🔄 Reiniciando reconocimiento...');
//       }
//       this.restartCount++;
//       console.log(`🔍 [VoiceService] → Llamando a restart() (#${this.restartCount}) (auto-restart)`);
      
//       this.autoRestartSubject.next(true);
//       this.restart();
      
//       setTimeout(() => {
//         this.autoRestartSubject.next(false);
//         console.log('🔍 [VoiceService] → autoRestartSubject resetado a false');
//       }, 1000);
//     }
//   }





//   private restart(): void {
//     console.log('🔍 [VoiceService] restart() llamado:', {
//       isStarting: this.isStarting,
//       isListening: this.isListening,
//       timestamp: new Date().toISOString()
//     });
    
//     if (this.isStarting) return;
    
//     if (this.recognition && this.isListening) {
//       try {
//         this.recognitionActive = false;
//         this.recognition.stop();
        
//         this.autoRestartSubject.next(true);
        
//         setTimeout(() => {
//           if (this.isListening && !this.isStarting) {
//             console.log('🔍 [VoiceService] → restart() llamando a startListening()');
//             this.startListening();
//           }
//           setTimeout(() => {
//             this.autoRestartSubject.next(false);
//             console.log('🔍 [VoiceService] → autoRestartSubject resetado a false desde restart');
//           }, 1000);
//         }, 100);
//       } catch (e) {
//         this.logger.warn('Error al reiniciar reconocimiento:', e);
//         this.autoRestartSubject.next(true);
//         setTimeout(() => {
//           if (this.isListening && !this.isStarting) {
//             console.log('🔍 [VoiceService] → restart() (catch) llamando a startListening()');
//             this.startListening();
//           }
//           setTimeout(() => {
//             this.autoRestartSubject.next(false);
//             console.log('🔍 [VoiceService] → autoRestartSubject resetado a false desde restart (catch)');
//           }, 1000);
//         }, 300);
//       }
//     }
//   }

//   // ============================================================
//   // CONTROL DEL MICRÓFONO
//   // ============================================================

//   startListening(): void {
//     console.log('🔍 [VoiceService] startListening() llamado:', {
//       isStarting: this.isStarting,
//       recognitionActive: this.recognitionActive,
//       isMuted: this.isMuted,
//       timestamp: new Date().toISOString()
//     });
    
//     if (this.isStarting) {
//       this.logger.log('🎤 Inicio en curso, omitiendo');
//       return;
//     }

//     if (this.recognitionActive) {
//       this.logger.log('🎤 Reconocimiento ya activo');
//       return;
//     }

//     if (!this.recognition) {
//       this.logger.error('Speech recognition no disponible');
//       this.errorSubject.next('Speech recognition no disponible');
//       return;
//     }

//     this.isStarting = true;

//     // Emitir listeningSubject para la UI (cambio visual inmediato)
//     this.listeningSubject.next(true);
//     // NO emitir readySubject aquí (se hará en onstart)

//     try {
//       if (this.reconnectTimeout) {
//         clearTimeout(this.reconnectTimeout);
//         this.reconnectTimeout = null;
//       }

//       this.recognition.start();
//       // readySubject se emitirá en onstart cuando el hardware esté listo
//     } catch (e: any) {
//       this.isStarting = false;
      
//       if (e.name === 'InvalidStateError') {
//         this.logger.warn('Reconocimiento ya iniciado, reiniciando...');
//         this.recognitionActive = true;
//         this.isListening = true;
//         // Si ya estaba activo, emitimos readySubject
//         this.readySubject.next(true);
//       } else {
//         this.logger.warn('Error al iniciar reconocimiento:', e);
//         this.errorSubject.next('Error al activar el micrófono');
//         this.listeningSubject.next(false);
//         this.readySubject.next(false);
//       }
//     }
//   }


//   /**
//    * Reinicia completamente el reconocimiento de voz
//    */
//   public restartRecognition(): void {
//     console.log('🔄 [VoiceService] Reiniciando reconocimiento...');
//     this.stopListening();
//     setTimeout(() => {
//       this.startListening();
//     }, 300);
//   }

//   //
//   stopListening(): void {
//     console.log('🔍 [VoiceService] stopListening() llamado:', {
//       isStarting: this.isStarting,
//       recognitionActive: this.recognitionActive,
//       timestamp: new Date().toISOString()
//     });
    
//     this.isStarting = false;

//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//       this.reconnectTimeout = null;
//     }

//     if (this.recognition && this.recognitionActive) {
//       try {
//         this.recognition.stop();
//         this.recognitionActive = false;
//         this.isListening = false;
//         this.reconnectAttempts = 0;
        
//         // ✅ Solo emitir false si realmente se detiene
//         this.listeningSubject.next(false);
//         this.readySubject.next(false);
        
//         if (this.enableLogs) {
//           this.logger.log('🔇 Micrófono desactivado');
//         }
//       } catch (e) {
//         this.logger.warn('Error al desactivar micrófono:', e);
//         this.recognitionActive = false;
//         this.isListening = false;
//         this.listeningSubject.next(false);
//         this.readySubject.next(false);
//       }
//     } else {
//       this.recognitionActive = false;
//       this.isListening = false;
//       this.listeningSubject.next(false);
//       this.readySubject.next(false);
//     }
//   }





//   // ============================================================
//   // MUTE / UNMUTE
//   // ============================================================

//   mute(): void {
//     console.log('🔍 [VoiceService] mute() llamado:', {
//       isMuted: this.isMuted,
//       timestamp: new Date().toISOString()
//     });
    
//     this.isMuted = true;
//     this.mutedSubject.next(true);
    
//     this.speakAlways('Micrófono desactivado. Di "hola" para activarlo.');
    
//     if (this.enableLogs) {
//       this.logger.log('🔇 Micrófono desactivado (reconocimiento activo)');
//     }
//   }

//   unmute(): void {
//     console.log('🔍 [VoiceService] unmute() llamado:', {
//       isMuted: this.isMuted,
//       recognitionActive: this.recognitionActive,
//       isListening: this.isListening,
//       timestamp: new Date().toISOString()
//     });
    
//     if (!this.isMuted) {
//       console.log('🎤 Micrófono ya activo');
//       return;
//     }

//     console.log('🎤 FORZANDO activación del micrófono');

//     this.isMuted = false;
//     this.mutedSubject.next(false);

//     if (!this.recognitionActive || !this.isListening) {
//       console.log('🔍 [VoiceService] → unmute() llamando a startListening()');
//       this.startListening();
//       // listeningSubject ya se emite en startListening, no duplicamos
//       console.log('🎤 Micrófono reactivado correctamente');
//     } else {
//       console.log('🎤 Micrófono ya estaba activo');
//     }
//   }

//   toggleMute(): void {
//     console.log('🔍 [VoiceService] toggleMute() llamado:', {
//       isMuted: this.isMuted,
//       timestamp: new Date().toISOString()
//     });
//     this.isMuted ? this.unmute() : this.mute();
//   }

//   isCurrentlyMuted(): boolean {
//     return this.isMuted;
//   }

//   isRecognitionActive(): boolean {
//     return this.recognitionActive;
//   }

//   // ============================================================
//   // SPEAK WHEN READY
//   // ============================================================

//   async speakWhenReady(text: string): Promise<void> {
//     // Si ya está activo, reproducir directamente
//     if (this.recognitionActive && this.readySubject.value) {
//       return this.speak(text);
//     }
//     // Esperar a que ready$ sea true
//     try {
//       await firstValueFrom(
//         this.ready$.pipe(
//           filter(ready => ready),
//           take(1),
//           timeout(5000)
//         )
//       );
//     } catch {
//       this.logger.warn('Timeout esperando reconocimiento, reproduciendo igual');
//     }
//     return this.speak(text);
//   }

//   waitForRecognitionReady(): Promise<void> {
//     return new Promise((resolve) => {
//       if (this.recognitionActive && this.readySubject.value) {
//         resolve();
//         return;
//       }
//       const checkInterval = setInterval(() => {
//         if (this.recognitionActive && this.readySubject.value) {
//           clearInterval(checkInterval);
//           resolve();
//         }
//       }, 100);
//       setTimeout(() => {
//         clearInterval(checkInterval);
//         resolve();
//       }, 3000);
//     });
//   }

//   // ============================================================
//   // CONTROL DE BIENVENIDA
//   // ============================================================

//   hasWelcomeBeenShown(page: 'welcome' | 'about' | 'login' | 'init' | 'register' | 'notfound'): boolean {
//     return this.welcomeFlags[page];
//   }

//   markWelcomeAsShown(page: 'welcome' | 'about' | 'login' | 'init' | 'register' | 'notfound'): void {
//     this.welcomeFlags[page] = true;
//     if (this.enableLogs) {
//       this.logger.log(`📌 Welcome marcado para: ${page}`);
//     }
//   }

//   resetWelcomeFlags(): void {
//     this.welcomeFlags = {
//       welcome: false,
//       about: false,
//       login: false,
//       init: false,
//       register: false,
//       notfound: false
//     };
//     if (this.enableLogs) {
//       this.logger.log('🔄 Welcome flags reiniciados');
//     }
//   }

//   // ============================================================
//   // SÍNTESIS DE VOZ (TTS)
//   // ============================================================

//   private getNaturalVoice(lang: string): SpeechSynthesisVoice | null {
//     if (this.cachedVoice) return this.cachedVoice;
//     const voices = window.speechSynthesis.getVoices();
//     const preferred = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
//     this.cachedVoice = preferred.find(v =>
//       /google|samantha|microsoft|diego|helena|zira|david|clara|maria|juan/i.test(v.name)
//     ) || preferred[0] || null;
//     if (this.cachedVoice && this.enableLogs) {
//       this.logger.log(`🗣️ Voz seleccionada: ${this.cachedVoice.name} (${this.cachedVoice.lang})`);
//     }
//     return this.cachedVoice;
//   }

//   speak(
//     text: string, 
//     lang: string = 'es-ES', 
//     rate: number = 0.9, 
//     pitch: number = 1.05
//   ): Promise<void> {
//     console.log('🔍 [VoiceService] speak() llamado:', {
//       text: text.substring(0, 50) + '...',
//       isMuted: this.isMuted,
//       timestamp: new Date().toISOString()
//     });
    
//     return new Promise((resolve, reject) => {
//       if (this.isMuted) {
//         if (this.enableLogs) {
//           this.logger.debug(`🔇 Muteado, mensaje ignorado: "${text}"`);
//         }
//         resolve();
//         return;
//       }

//       if (!window.speechSynthesis) {
//         this.logger.warn('Speech Synthesis no soportada');
//         reject(new Error('Speech Synthesis no soportada'));
//         return;
//       }

//       window.speechSynthesis.cancel();
      
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = lang;
//       utterance.rate = rate;
//       utterance.pitch = pitch;
//       utterance.volume = 1;
      
//       const voice = this.getNaturalVoice(lang);
//       if (voice) {
//         utterance.voice = voice;
//       }
      
//       utterance.onend = () => {
//         if (this.enableLogs) {
//           this.logger.debug(`🗣️ Síntesis completada: "${text}"`);
//         }
//         resolve();
//       };
      
//       utterance.onerror = (event) => {
//         if (event.error === 'interrupted') {
//           resolve();
//           return;
//         }
//         this.logger.warn('Error en síntesis de voz:', event);
//         reject(event);
//       };
      
//       window.speechSynthesis.speak(utterance);
//       if (this.enableLogs) {
//         this.logger.log(`🗣️ Hablando: "${text}"`);
//       }
//     });
//   }

//   public speakAlways(text: string): Promise<void> {
//     console.log('🔍 [VoiceService] speakAlways() llamado:', {
//       text: text.substring(0, 50) + '...',
//       wasListening: this.isListening,
//       isMuted: this.isMuted,
//       timestamp: new Date().toISOString()
//     });
    
//     return new Promise((resolve, reject) => {
//       if (!window.speechSynthesis) {
//         this.logger.warn('Speech Synthesis no soportada');
//         reject(new Error('Speech Synthesis no soportada'));
//         return;
//       }

//       const wasListening = this.isListening;
      
//       if (wasListening) {
//         console.log('🔍 [VoiceService] → speakAlways() deteniendo reconocimiento');
//         this.stopListening();
//       }

//       window.speechSynthesis.cancel();
      
//       const utterance = new SpeechSynthesisUtterance(text);
//       utterance.lang = 'es-ES';
//       utterance.rate = 0.9;
//       utterance.pitch = 1.05;
//       utterance.volume = 1;
      
//       const voice = this.getNaturalVoice('es-ES');
//       if (voice) {
//         utterance.voice = voice;
//       }
      
//       utterance.onend = () => {
//         console.log('🔍 [VoiceService] → speakAlways() onend, reactivando reconocimiento');
//         setTimeout(() => {
//           if (!this.recognitionActive) {
//             console.log('🔍 [VoiceService] → speakAlways() llamando a startListening()');
//             this.startListening();
//             console.log('🎤 Reconocimiento reactivado después de speakAlways');
//           }
//         }, 200);
//         resolve();
//       };
      
//       utterance.onerror = (event) => {
//         if (event.error === 'interrupted') {
//           console.log('🔍 [VoiceService] → speakAlways() interrumpido');
//           setTimeout(() => {
//             if (!this.recognitionActive) {
//               console.log('🔍 [VoiceService] → speakAlways() (interrupted) llamando a startListening()');
//               this.startListening();
//               console.log('🎤 Reconocimiento reactivado después de interrupción');
//             }
//           }, 200);
//           resolve();
//           return;
//         }
//         this.logger.warn('Error en síntesis de voz:', event);
//         reject(event);
//       };
      
//       window.speechSynthesis.speak(utterance);
//       if (this.enableLogs) {
//         this.logger.log(`🗣️ Hablando (siempre): "${text}"`);
//       }
//     });
//   }

//   // ============================================================
//   // MÉTODOS PARA ENVIAR RESPUESTAS
//   // ============================================================

//   sendSuccessResponse(
//     reply: string,
//     action?: { type: string; payload?: Record<string, any> },
//     data?: any
//   ): void {
//     const response: VoiceCommandResponse = {
//       success: true,
//       intent: 'success',
//       status: 'success',
//       reply,
//       action,
//       data,
//       timestamp: new Date().toISOString()
//     };
//     this.responseSubject.next(response);
//   }

//   sendErrorResponse(
//     reply: string,
//     error?: string,
//     data?: any
//   ): void {
//     const response: VoiceCommandResponse = {
//       success: false,
//       intent: 'error',
//       status: 'error',
//       reply,
//       error: error || reply,
//       data,
//       timestamp: new Date().toISOString()
//     };
//     this.responseSubject.next(response);
//   }

//   sendAudioResponse(
//     reply: string,
//     audioBase64: string,
//     action?: { type: string; payload?: Record<string, any> }
//   ): void {
//     const response: VoiceCommandResponse = {
//       success: true,
//       intent: 'audio',
//       status: 'success',
//       reply,
//       audioBase64,
//       action,
//       timestamp: new Date().toISOString()
//     };
//     this.responseSubject.next(response);
//   }

//   // ============================================================
//   // OBSERVABLES PÚBLICOS
//   // ============================================================

//   getTranscript(): Observable<string> {
//     return this.transcriptSubject.asObservable();
//   }

//   getResponses(): Observable<VoiceCommandResponse> {
//     return this.responseSubject.asObservable();
//   }

//   getMutedState(): Observable<boolean> {
//     return this.mutedSubject.asObservable();
//   }

//   getErrors(): Observable<string> {
//     return this.errorSubject.asObservable();
//   }

//   getWakeWords(): Observable<string> {
//     return this.wakeWordSubject.asObservable();
//   }

//   // ============================================================
//   // UTILIDADES
//   // ============================================================

//   isSupported(): boolean {
//     if (this.isFirefox()) {
//       console.warn('🦊 Firefox: SpeechRecognition no soportado nativamente');
//       return false;
//     }
//     return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
//   }

//   getBrowserSupportMessage(): string {
//     if (this.isFirefox()) {
//       return '⚠️ El reconocimiento de voz no está disponible en Firefox. Por favor, usa Chrome, Edge o Safari para usar comandos de voz.';
//     }
//     if (!this.isSupported()) {
//       return '⚠️ El reconocimiento de voz no está disponible en este navegador.';
//     }
//     return '';
//   }

//   isListeningActive(): boolean {
//     return this.isListening;
//   }

//   isSpeechSynthesisSupported(): boolean {
//     return !!(window.speechSynthesis);
//   }

//   isFullySupported(): boolean {
//     return this.isSupported() && this.isSpeechSynthesisSupported();
//   }

//   isFirefox(): boolean {
//     return navigator.userAgent.toLowerCase().includes('firefox');
//   }

//   // ============================================================
//   // LIMPIEZA
//   // ============================================================

//   destroy(): void {
//     if (this.enableLogs) {
//       this.logger.log('🧹 Destruyendo VoiceService...');
//     }
    
//     if (this.reconnectTimeout) {
//       clearTimeout(this.reconnectTimeout);
//       this.reconnectTimeout = null;
//     }
    
//     this.stopListening();
    
//     if (window.speechSynthesis) {
//       window.speechSynthesis.cancel();
//     }
    
//     this.transcriptSubject.complete();
//     this.responseSubject.complete();
//     this.mutedSubject.complete();
//     this.wakeWordSubject.complete();
//     this.errorSubject.complete();
//     this.listeningSubject.complete();
//     this.readySubject.complete();
    
//     this.filterService.reset();
    
//     if (this.recognition) {
//       this.recognition.onresult = null;
//       this.recognition.onerror = null;
//       this.recognition.onend = null;
//       this.recognition.onstart = null;
//       this.recognition = null;
//     }
    
//     if (this.enableLogs) {
//       this.logger.log('✅ VoiceService destruido correctamente');
//     }
//   }
// }

















// src/core/services/voz/voice.service.ts
import { Injectable, NgZone, inject, OnDestroy } from '@angular/core';
import { Observable, Subject, BehaviorSubject, firstValueFrom, filter, take, timeout } from 'rxjs';
import { VoiceFilterService } from './voice-filter.service';
import { VoiceCommandResponse } from '../../models/voz/VoiceCommandResponse-model';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../shared/services/loggers/logger.service';
import { VoiceContextService } from '../../../features/services/voz/voice-context.service';

@Injectable({ providedIn: 'root' })
export class VoiceService implements OnDestroy {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private ngZone = inject(NgZone);
  private logger = inject(LoggerService);
  private filterService = inject(VoiceFilterService);
  private voiceContext = inject(VoiceContextService);

  // Subjects
  private transcriptSubject = new Subject<string>();
  private currentTranscript = '';
  // 🔥 NUEVO: Subject para OTP con isFinal
  private transcriptWithFinalSubject = new Subject<{ text: string; isFinal: boolean }>();
  private responseSubject = new Subject<VoiceCommandResponse>();
  private mutedSubject = new BehaviorSubject<boolean>(false);
  private wakeWordSubject = new Subject<string>();
  private errorSubject = new Subject<string>();

  private listeningSubject = new BehaviorSubject<boolean>(false);
  public listening$ = this.listeningSubject.asObservable();

  private autoRestartSubject = new BehaviorSubject<boolean>(false);
  public autoRestart$ = this.autoRestartSubject.asObservable();

  private readySubject = new BehaviorSubject<boolean>(false);
  public ready$ = this.readySubject.asObservable();

  private readonly WAKE_WORDS = ['hola', 'asistente'];

  private isMuted = false;
  private cachedVoice: SpeechSynthesisVoice | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private reconnectTimeout: any = null;

  private isStarting = false;
  private recognitionActive = false;

  // Debounce para wake word
  private lastWakeWordTime = 0;
  private readonly WAKE_DEBOUNCE_TIME = 2000;

  private welcomeFlags = {
    welcome: false,
    about: false,
    login: false,
    init: false,
    register: false,
    notfound: false,
    home: false,
    dashboard: false 
  };

  public muted$ = this.mutedSubject.asObservable();
  public wakeWord$ = this.wakeWordSubject.asObservable();
  public error$ = this.errorSubject.asObservable();
  public response$ = this.responseSubject.asObservable();

  private enableLogs = environment.enableLogs;
  private lastProcessedTranscript = '';
  private lastProcessedTime = 0;
  private restartCount = 0;

  constructor() {
    this.initRecognition();
    this.loadVoices();
    
    this.isMuted = true;
    this.mutedSubject.next(true);
    this.listeningSubject.next(false);
    this.readySubject.next(false);
    
    if (this.enableLogs) {
      this.logger.log('🎤 VoiceService inicializado en modo silencio');
    }

    setTimeout(() => {
      this.startListening();
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroy();
  }

  // ============================================================
  // INICIALIZACIÓN
  // ============================================================

  private loadVoices(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
        if (this.enableLogs) {
          this.logger.log('🗣️ Voces cargadas');
        }
      };
    }
  }

  private initRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.logger.warn('Web Speech API no soportada en este navegador');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'es-ES';
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = this.handleResult.bind(this);
    this.recognition.onerror = this.handleError.bind(this);
    this.recognition.onend = this.handleEnd.bind(this);

    // onstart se dispara cuando el hardware está realmente activo
    this.recognition.onstart = () => {
      this.ngZone.run(() => {
        this.recognitionActive = true;
        this.readySubject.next(true);
        console.log('🎤 Micrófono realmente activo (onstart)');
      });
    };

    if (this.enableLogs) {
      this.logger.log('✅ Speech Recognition inicializado');
    }
  }

  // ============================================================
  // MANEJO DE EVENTOS
  // ============================================================
  
  private handleResult(event: SpeechRecognitionEvent): void {
    if (!event.results || event.results.length === 0) return;

    const result = event.results[event.results.length - 1];
    if (!result || !result[0]) return;

    const transcript = result[0].transcript.toLowerCase().trim();

    if (this.enableLogs) {
      console.log('🎤 Reconocido:', transcript, 'Final:', result.isFinal);
    }

    // ============================================================
    // 🔥 FILTRAR RESULTADOS PARCIALES (SOLO WAKE WORDS Y NÚMEROS)
    // ============================================================
    if (!result.isFinal) {
      const hasWakeWord = this.WAKE_WORDS.some(w => 
        transcript.includes(w) || transcript === w
      );
      const hasDigits = /\d/.test(transcript);
      const numberWords = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
      const hasNumberWord = numberWords.some(w => transcript.includes(w));

      // ✅ PALABRAS CLAVE DE CAMPOS DE FORMULARIO (GLOBAL)
      const keyCommands = [
        'usuario', 'contraseña', 'clave', 'password', 'pass',
        'nombre', 'email', 'correo', 'apellidos', 'fullname',
        'confirmar', 'registrar', 'recuperar',
        'privacidad', 'condiciones'
      ];
      const hasKeyCommand = keyCommands.some(w => 
        transcript === w || transcript.includes(w)
      );

      if (hasWakeWord) {
        if (this.enableLogs) {
          console.log(`🔊 Wake word parcial detectada: "${transcript}"`);
        }
        this.processWakeWord(transcript);
      } else if (hasDigits || hasNumberWord || hasKeyCommand) {
        if (this.enableLogs) {
          console.log(`🔢 Resultado parcial (numérico o comando clave): "${transcript}"`);
        }
        // Continúa al procesamiento normal (NO retorna)
      } else {
        if (this.enableLogs) {
          console.log(`⏳ Resultado parcial ignorado: "${transcript}"`);
        }
        return;
      }
    }

    // ============================================================
    // A PARTIR DE AQUÍ, TODOS LOS RESULTADOS (PARCIALES Y FINALES)
    // ============================================================

    // FILTRO DE RUIDO DE TECLADO/MOUSE
    const noisePatterns = [
      /^[a-z]$/i,
      /^[a-z]{1,3}$/i,
      /^(click|clic|tick|tac|clap|tap|pop|beep)$/i,
      /^[cC][lL][iI][cC][kK]/,
      /^[tT][iI][cC]/,
      /^[cC][lL][aA][pP]/,
      /^[mM][oO][uU][sS][eE]/,
      /^[kK][eE][yY]/,
      /^[a-zA-Z]\s+[a-zA-Z]$/,
      /^[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]$/,
      /^[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]\s+[a-zA-Z]$/,
    ];

    const shortValidCommands = ['hola', 'leer', 'ayuda', 'login', 'back', 'help', 'si', 'no', 'ok', 'vale', 'fin', 'ir'];

    if (!shortValidCommands.includes(transcript) && noisePatterns.some(pattern => pattern.test(transcript))) {
      if (this.enableLogs) {
        console.log(`⏭️ Ruido de teclado/mouse ignorado: "${transcript}"`);
      }
      return;
    }

    // FILTRO PARA EVITAR DUPLICADOS (CON EXCEPCIÓN PARA DÍGITOS Y NÚMEROS)
    const now = Date.now();
    const validCommands = [
      'login', 'acerca', 'hola', 'asistente', 'silenciar', 'activar',
      'ayuda', 'código', 'verificar', 'volver', 'atrás', 'regresar', 'cancelar',
      'usuario', 'nombre', 'email', 'correo',
      'contraseña', 'clave', 'password', 'pass',
      'enviar', 'logear', 'acceder', 'entrar', 'ingresar',
      'limpiar', 'borrar', 'resetear',
      'mostrar', 'ocultar', 'ver',
      'registro', 'registrar', 'recuperar', 'olvidé',  
      'privacidad', 'condiciones', 'términos',
      'fin', 'listo', 'terminar', 'finalizar', 'ok', 'vale', 'hecho',
      'completar', 'cancel', 'abortar',
      'confirmar', 'confirm', 'aceptar', 'validar',
      'leer', 'información',
      'iniciar sesion',    
      'inicio de sesion',
      'privacidad', 'condiciones', 'términos',   
    ];

    const isValidCommand = validCommands.some(cmd => transcript.includes(cmd));

    // 🔥 EXCEPCIÓN: si el texto contiene dígitos o palabras numéricas, NO aplicar control de duplicados
    const hasDigits = /\d/.test(transcript);
    const numberWords = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
    const hasNumberWord = numberWords.some(w => transcript.includes(w));

    if (!isValidCommand && !hasDigits && !hasNumberWord && transcript === this.lastProcessedTranscript && now - this.lastProcessedTime < 3000) {
      if (this.enableLogs) {
        console.log(`⏭️ Comando duplicado ignorado: "${transcript}"`);
      }
      return;
    }
    this.lastProcessedTranscript = transcript;
    this.lastProcessedTime = now;

    this.ngZone.run(() => {

      // COMANDOS DIRECTOS (SILENCIAR MICRÓFONO)
      const lower = transcript.toLowerCase();
      if (/\bsilenciar\b/.test(lower) || 
          lower.includes('silenciar micrófono') || 
          lower.includes('silenciar micro') || 
          lower.includes('silencia micrófono')) {
        if (!this.isMuted) {
          this.mute();
          if (this.enableLogs) this.logger.log('🔇 Silenciado por comando de voz');
        } else {
          if (this.enableLogs) this.logger.log('ℹ️ Micrófono ya está muteado');
        }
        return;
      }

      // WAKE WORD DETECTION (hola / asistente)
      const hasWakeWord = this.WAKE_WORDS.some(w =>
        new RegExp(`\\b${w}\\b`, 'i').test(transcript)
      );

      if (hasWakeWord) {
        if (this.enableLogs) {
          console.log(`🔊 Wake word detectada: "${transcript}"`);
          this.logger.log(`🔊 Wake word detectada: "${transcript}"`);
        }

        const command = transcript.replace(
          /^(hola\s+|oye\s+|hey\s+|eh\s+)?(voz|asistente)\s*/i,
          ''
        ).trim();

        const isJustHola = transcript === 'hola' || transcript === 'hola hola';
        
        if (isJustHola) {
          if (this.enableLogs) {
            this.logger.log('👋 Saludo detectado: "hola"');
          }
          if (this.isMuted) {
            const ahora = Date.now();
            if (ahora - this.lastWakeWordTime > this.WAKE_DEBOUNCE_TIME) {
              this.lastWakeWordTime = ahora;
              this.unmute();
              this.wakeWordSubject.next(transcript);
            } else {
              if (this.enableLogs) {
                this.logger.log('⏳ Saludo ignorado por debounce (demasiado rápido)');
              }
            }
          }
          return;
        }

        if (this.isMuted) {
          if (this.enableLogs) {
            this.logger.log('🔊 Wake word detectada, activando micrófono');
          }
          this.unmute();
          this.wakeWordSubject.next(transcript);

          if (command.length > 0) {
            if (this.enableLogs) {
              this.logger.log(`📤 Comando extraído: "${command}"`);
            }
            setTimeout(() => {
              this.transcriptSubject.next(command);
              // 🔥 Emisión con isFinal
              this.transcriptWithFinalSubject.next({ text: command, isFinal: result.isFinal });
            }, 150);
          }
          return;
        }

        if (command.length > 0) {
          if (this.enableLogs) {
            this.logger.log(`✅ Comando procesado (con wake word): "${command}"`);
          }
          this.transcriptSubject.next(command);
          // 🔥 Emisión con isFinal
          this.transcriptWithFinalSubject.next({ text: command, isFinal: result.isFinal });
        }
        return;
      }

      // SI ESTÁ MUTEADO Y NO HAY WAKE WORD, IGNORAR (CON LISTA DE EXCEPCIONES)
      if (this.isMuted) {
        const allowedWhenMuted = [
          'ayuda', 'help',
          'código', 'codigo',
          'verificar', 'validar',
          'leer',
          'mostrar',
          'registrar',
          'hola',
          'asistente',
          'volver', 'atrás', 'regresar', 'back'
        ];
        
        const isAllowed = allowedWhenMuted.some(cmd => 
          transcript === cmd || transcript.includes(cmd)
        );
        
        if (!isAllowed) {
          if (this.enableLogs) {
            this.logger.debug(`🔇 Muteado, ignorando: "${transcript}"`);
          }
          return;
        }
      }

      // ============================================================
      // 🔥 FILTROS DE RUIDO AVANZADOS (CON EXCEPCIÓN PARA NÚMEROS)
      // ============================================================
      const shortValidCommands2 = ['hola', 'leer', 'ayuda', 'login', 'back', 'help', 'si', 'no', 'ok', 'vale', 'fin', 'ir'];
      const numberWords = ['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve'];
      const hasNumberWord = numberWords.some(w => transcript.includes(w));

      if (shortValidCommands2.includes(transcript) || /\d/.test(transcript) || hasNumberWord) {
        // Dejamos pasar sin aplicar más filtros
      } else {
        if (!transcript || transcript.length < 4) {
          if (this.enableLogs) {
            this.logger.debug(`⏭️ Muy corto: "${transcript}"`);
          }
          return;
        }

        if (!/[aeiouáéíóú]/.test(transcript)) {
          if (this.enableLogs) {
            this.logger.debug(`⏭️ Sin vocales: "${transcript}"`);
          }
          return;
        }

        const vowels = transcript.match(/[aeiouáéíóú]/g) || [];
        if (new Set(vowels).size < 2) {
          if (this.enableLogs) {
            this.logger.debug(`⏭️ Muy pocas vocales: "${transcript}"`);
          }
          return;
        }
      }

      // PROCESAR COMANDOS
      const filterResult = this.filterService.filterTranscript(
        transcript,
        this.isMuted
      );

      if (!filterResult.valid) {
        if (this.enableLogs) {
          this.logger.debug(
            `⏭️ Ignorado (${filterResult.reason}): "${transcript}"`
          );
        }
        return;
      }

      const knownCommands = [
        'login', 'iniciar', 'acceder', 'entrar', 'quienes', 'somos',
        'acerca', 'ayuda', 'opciones', 'silenciar', 'activar',
        'atrás', 'volver', 'cerrar', 'salir', 'back',
        'usuario', 'contraseña', 'enviar', 'limpiar',
        'clave', 'password', 'pass', 'user',
        'nombre', 'email', 'correo', 'confirmar',
        'nombre propio', 'apellidos', 'registrar',
        'fullname', 'lastname',
        'código', 'codigo', 'verificar', 'validar',
        'confirmar código', 'leer', 'mostrar', 'aceptar',
        'fin', 'recuperar', 
        'olvidé',
        'privacidad', 'condiciones', 'términos'  
      ];

      const hasCommand = knownCommands.some(cmd =>
        transcript.includes(cmd)
      );

      if (!hasCommand && transcript.split(' ').length < 2) {
        if (this.enableLogs) {
          this.logger.debug(`⏭️ Sin comando conocido: "${transcript}"`);
        }
        return;
      }

      if (this.enableLogs) {
        this.logger.log('✅ Comando procesado:', transcript);
      }

      // Emisión principal
      this.transcriptSubject.next(transcript);
      // 🔥 Emisión con isFinal
      this.transcriptWithFinalSubject.next({ text: transcript, isFinal: result.isFinal });
    });
  }

  // ============================================================
  // 🔥 NUEVO MÉTODO: Procesar wake word parcial
  // ============================================================
  private processWakeWord(transcript: string): void {
    const ahora = Date.now();
    
    // Verificar debounce de wake word
    if (ahora - this.lastWakeWordTime < this.WAKE_DEBOUNCE_TIME) {
      if (this.enableLogs) {
        this.logger.log('⏳ Wake word ignorada por debounce (demasiado rápido)');
      }
      return;
    }
    
    this.lastWakeWordTime = ahora;
    
    // Si está muteado, activar micrófono
    if (this.isMuted) {
      if (this.enableLogs) {
        this.logger.log('🔊 Wake word detectada, activando micrófono');
      }
      this.unmute();
      this.wakeWordSubject.next(transcript);
    } else {
      if (this.enableLogs) {
        this.logger.log(`ℹ️ Wake word recibida pero micrófono ya activo: "${transcript}"`);
      }
    }
  }

  // ============================================================
  // MANEJO DE ERRORES Y FINALIZACIÓN
  // ============================================================

  private handleError(event: SpeechRecognitionErrorEvent): void {
    this.ngZone.run(() => {
      // ✅ Ignorar silencio: no mostrar error ni hacer nada
      if (event.error === 'no-speech') {
        return;
      }

      console.log('🔍 [VoiceService] handleError:', { error: event.error, timestamp: new Date().toISOString() });
      this.logger.error('Error en reconocimiento:', event.error);
      this.errorSubject.next(event.error);

      // Si hay error, el micrófono no está listo
      this.readySubject.next(false);
      this.recognitionActive = false;

      if (event.error === 'audio-capture') {
        // ✅ Reintentar sin límite
        this.handleRecoverableError();
      } else if (event.error === 'not-allowed') {
        // ✅ Único caso en que se detiene el micrófono (por privacidad)
        this.logger.error('❌ Permiso de micrófono denegado');
        this.stopListening();
        this.errorSubject.next('Permiso de micrófono denegado');
      } else {
        // ✅ Para cualquier otro error (network, aborted, etc.) reintentar sin detener
        this.logger.warn(`⚠️ Error recuperable (${event.error}), reintentando...`);
        this.handleRecoverableError();
      }
    });
  }

  //
  private handleRecoverableError(): void {
    // ✅ Siempre reintentar, sin límite. El micrófono nunca se apaga por errores.
    const delay = Math.min(500 * Math.pow(1.2, this.reconnectAttempts), 5000);
    this.reconnectAttempts++;
    
    if (this.enableLogs) {
      this.logger.log(`⏳ Reintentando en ${delay}ms (intento #${this.reconnectAttempts})`);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      if (this.isListening && !this.isStarting) {
        this.restart();
      }
    }, delay);
  }




  private handleEnd(): void {
    console.log('🔍 [VoiceService] handleEnd:', {
      isListening: this.isListening,
      isStarting: this.isStarting,
      recognitionActive: this.recognitionActive,
      timestamp: new Date().toISOString()
    });
    
    // ✅ RESETEAR isStarting (¡CLAVE!)
    this.isStarting = false;
    
    if (this.enableLogs) {
      this.logger.log('🔴 Reconocimiento finalizado');
    }
    
    this.recognitionActive = false;
    this.readySubject.next(false);
    this.listeningSubject.next(false);
    
    if (this.isListening && !this.isStarting) {
      if (this.enableLogs) {
        this.logger.log('🔄 Reiniciando reconocimiento...');
      }
      this.restartCount++;
      console.log(`🔍 [VoiceService] → Llamando a restart() (#${this.restartCount}) (auto-restart)`);
      
      this.autoRestartSubject.next(true);
      this.restart();
      
      setTimeout(() => {
        this.autoRestartSubject.next(false);
        console.log('🔍 [VoiceService] → autoRestartSubject resetado a false');
      }, 1000);
    }
  }

  private restart(): void {
    console.log('🔍 [VoiceService] restart() llamado:', {
      isStarting: this.isStarting,
      isListening: this.isListening,
      timestamp: new Date().toISOString()
    });
    
    if (this.isStarting) return;
    
    if (this.recognition && this.isListening) {
      try {
        this.recognitionActive = false;
        this.recognition.stop();
        
        this.autoRestartSubject.next(true);
        
        setTimeout(() => {
          if (this.isListening && !this.isStarting) {
            console.log('🔍 [VoiceService] → restart() llamando a startListening()');
            this.startListening();
          }
          setTimeout(() => {
            this.autoRestartSubject.next(false);
            console.log('🔍 [VoiceService] → autoRestartSubject resetado a false desde restart');
          }, 1000);
        }, 100);
      } catch (e) {
        this.logger.warn('Error al reiniciar reconocimiento:', e);
        this.autoRestartSubject.next(true);
        setTimeout(() => {
          if (this.isListening && !this.isStarting) {
            console.log('🔍 [VoiceService] → restart() (catch) llamando a startListening()');
            this.startListening();
          }
          setTimeout(() => {
            this.autoRestartSubject.next(false);
            console.log('🔍 [VoiceService] → autoRestartSubject resetado a false desde restart (catch)');
          }, 1000);
        }, 300);
      }
    }
  }

  // ============================================================
  // CONTROL DEL MICRÓFONO
  // ============================================================

  startListening(): void {
    console.log('🔍 [VoiceService] startListening() llamado:', {
      isStarting: this.isStarting,
      recognitionActive: this.recognitionActive,
      isMuted: this.isMuted,
      timestamp: new Date().toISOString()
    });
    
    if (this.isStarting) {
      this.logger.log('🎤 Inicio en curso, omitiendo');
      return;
    }

    if (this.recognitionActive) {
      this.logger.log('🎤 Reconocimiento ya activo');
      return;
    }

    if (!this.recognition) {
      this.logger.error('Speech recognition no disponible');
      this.errorSubject.next('Speech recognition no disponible');
      return;
    }

    this.isStarting = true;

    // Emitir listeningSubject para la UI (cambio visual inmediato)
    this.listeningSubject.next(true);
    // NO emitir readySubject aquí (se hará en onstart)

    try {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      this.recognition.start();
      // readySubject se emitirá en onstart cuando el hardware esté listo
    } catch (e: any) {
      this.isStarting = false;
      
      if (e.name === 'InvalidStateError') {
        this.logger.warn('Reconocimiento ya iniciado, reiniciando...');
        this.recognitionActive = true;
        this.isListening = true;
        // Si ya estaba activo, emitimos readySubject
        this.readySubject.next(true);
      } else {
        this.logger.warn('Error al iniciar reconocimiento:', e);
        this.errorSubject.next('Error al activar el micrófono');
        this.listeningSubject.next(false);
        this.readySubject.next(false);
      }
    }
  }

  /**
   * Reinicia completamente el reconocimiento de voz
   */
  public restartRecognition(): void {
    console.log('🔄 [VoiceService] Reiniciando reconocimiento...');
    this.stopListening();
    setTimeout(() => {
      this.startListening();
    }, 300);
  }

  stopListening(): void {
    console.log('🔍 [VoiceService] stopListening() llamado:', {
      isStarting: this.isStarting,
      recognitionActive: this.recognitionActive,
      timestamp: new Date().toISOString()
    });
    
    this.isStarting = false;

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.recognition && this.recognitionActive) {
      try {
        this.recognition.stop();
        this.recognitionActive = false;
        this.isListening = false;
        this.reconnectAttempts = 0;
        
        // ✅ Solo emitir false si realmente se detiene
        this.listeningSubject.next(false);
        this.readySubject.next(false);
        
        if (this.enableLogs) {
          this.logger.log('🔇 Micrófono desactivado');
        }
      } catch (e) {
        this.logger.warn('Error al desactivar micrófono:', e);
        this.recognitionActive = false;
        this.isListening = false;
        this.listeningSubject.next(false);
        this.readySubject.next(false);
      }
    } else {
      this.recognitionActive = false;
      this.isListening = false;
      this.listeningSubject.next(false);
      this.readySubject.next(false);
    }
  }




  //============================================================
  /**
   * Limpia el transcript actual sin abortar el reconocimiento
   * Esto permite que el micrófono siga escuchando después de la navegación
   */
  clearTranscript(): void {
    console.log('🧹 [VoiceService] Limpiando transcript');
    // ✅ Limpiar el texto del transcript
    this.currentTranscript = '';
    // ✅ Enviar un texto vacío para resetear el subject
    this.transcriptSubject.next('');
    console.log('🧹 [VoiceService] Transcript limpiado (reconocimiento activo)');
  }


  /**
   * Aborta completamente el reconocimiento (solo para casos extremos)
   */
  abortRecognition(): void {
    console.log('🛑 [VoiceService] Abortando reconocimiento');
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (e) {
        // Ignorar errores
      }
    }
  }

  // ============================================================
  // MUTE / UNMUTE
  // ============================================================

  mute(): void {
    console.log('🔍 [VoiceService] mute() llamado:', {
      isMuted: this.isMuted,
      timestamp: new Date().toISOString()
    });
    
    this.isMuted = true;
    this.mutedSubject.next(true);
    
    this.speakAlways('Micrófono desactivado. Di "hola" para activarlo.');
    
    if (this.enableLogs) {
      this.logger.log('🔇 Micrófono desactivado (reconocimiento activo)');
    }
  }

  unmute(): void {
    console.log('🔍 [VoiceService] unmute() llamado:', {
      isMuted: this.isMuted,
      recognitionActive: this.recognitionActive,
      isListening: this.isListening,
      timestamp: new Date().toISOString()
    });
    
    if (!this.isMuted) {
      console.log('🎤 Micrófono ya activo');
      return;
    }

    console.log('🎤 FORZANDO activación del micrófono');

    this.isMuted = false;
    this.mutedSubject.next(false);

    if (!this.recognitionActive || !this.isListening) {
      console.log('🔍 [VoiceService] → unmute() llamando a startListening()');
      this.startListening();
      // listeningSubject ya se emite en startListening, no duplicamos
      console.log('🎤 Micrófono reactivado correctamente');
    } else {
      console.log('🎤 Micrófono ya estaba activo');
    }
  }

  toggleMute(): void {
    console.log('🔍 [VoiceService] toggleMute() llamado:', {
      isMuted: this.isMuted,
      timestamp: new Date().toISOString()
    });
    this.isMuted ? this.unmute() : this.mute();
  }

  isCurrentlyMuted(): boolean {
    return this.isMuted;
  }

  isRecognitionActive(): boolean {
    return this.recognitionActive;
  }

  // ============================================================
  // SPEAK WHEN READY
  // ============================================================

  async speakWhenReady(text: string): Promise<void> {
    // Si ya está activo, reproducir directamente
    if (this.recognitionActive && this.readySubject.value) {
      return this.speak(text);
    }
    // Esperar a que ready$ sea true
    try {
      await firstValueFrom(
        this.ready$.pipe(
          filter(ready => ready),
          take(1),
          timeout(5000)
        )
      );
    } catch {
      this.logger.warn('Timeout esperando reconocimiento, reproduciendo igual');
    }
    return this.speak(text);
  }

  waitForRecognitionReady(): Promise<void> {
    return new Promise((resolve) => {
      if (this.recognitionActive && this.readySubject.value) {
        resolve();
        return;
      }
      const checkInterval = setInterval(() => {
        if (this.recognitionActive && this.readySubject.value) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 3000);
    });
  }

  // ============================================================
  // CONTROL DE BIENVENIDA
  // ============================================================

  // ✅ DESPUÉS:
  hasWelcomeBeenShown(page: 'welcome' | 'about' | 'login' | 'init' | 'register' | 'notfound' | 'home' | 'dashboard'): boolean {
    return this.welcomeFlags[page];
  }

  markWelcomeAsShown(page: 'welcome' | 'about' | 'login' | 'init' | 'register' | 'notfound' | 'home' | 'dashboard'): void {
    this.welcomeFlags[page] = true;
    if (this.enableLogs) {
      this.logger.log(`📌 Welcome marcado para: ${page}`);
    }
  }

  resetWelcomeFlags(): void {
    this.welcomeFlags = {
      welcome: false,
      about: false,
      login: false,
      init: false,
      register: false,
      notfound: false,
      home:false,
      dashboard: false
    };
    if (this.enableLogs) {
      this.logger.log('🔄 Welcome flags reiniciados');
    }
  }

  // ============================================================
  // SÍNTESIS DE VOZ (TTS)
  // ============================================================

  private getNaturalVoice(lang: string): SpeechSynthesisVoice | null {
    if (this.cachedVoice) return this.cachedVoice;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.filter(v => v.lang.startsWith(lang.split('-')[0]));
    this.cachedVoice = preferred.find(v =>
      /google|samantha|microsoft|diego|helena|zira|david|clara|maria|juan/i.test(v.name)
    ) || preferred[0] || null;
    if (this.cachedVoice && this.enableLogs) {
      this.logger.log(`🗣️ Voz seleccionada: ${this.cachedVoice.name} (${this.cachedVoice.lang})`);
    }
    return this.cachedVoice;
  }


  //
  speak(
    text: string, 
    lang: string = 'es-ES', 
    rate: number = 0.9, 
    pitch: number = 1.05
  ): Promise<void> {
    console.log('🔍 [VoiceService] speak() llamado:', {
      text: text.substring(0, 50) + '...',
      isMuted: this.isMuted,
      timestamp: new Date().toISOString()
    });
    
    return new Promise((resolve, reject) => {
      if (this.isMuted) {
        if (this.enableLogs) {
          this.logger.debug(`🔇 Muteado, mensaje ignorado: "${text}"`);
        }
        resolve();
        return;
      }

      if (!window.speechSynthesis) {
        this.logger.warn('Speech Synthesis no soportada');
        reject(new Error('Speech Synthesis no soportada'));
        return;
      }

      // ✅ SILENCIAR EL MICRÓFONO ANTES DE HABLAR
      const wasListening = this.isListening;
      if (wasListening) {
        console.log('🔍 [VoiceService] → speak() silenciando micrófono durante TTS');
        this.stopListening();
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 1;
      
      const voice = this.getNaturalVoice(lang);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onend = () => {
        console.log('🔍 [VoiceService] → speak() onend, reactivando micrófono');
        // ✅ REACTIVAR DESPUÉS DE 1.5 SEGUNDOS
        setTimeout(() => {
          if (!this.recognitionActive) {
            console.log('🔍 [VoiceService] → speak() llamando a startListening()');
            this.startListening();
            console.log('🎤 Micrófono reactivado después de speak');
          }
        }, 1500);
        resolve();
      };
      
      utterance.onerror = (event) => {
        if (event.error === 'interrupted') {
          resolve();
          return;
        }
        this.logger.warn('Error en síntesis de voz:', event);
        reject(event);
      };
      
      window.speechSynthesis.speak(utterance);
      if (this.enableLogs) {
        this.logger.log(`🗣️ Hablando: "${text}"`);
      }
    });
  }

  //
  public speakAlways(text: string): Promise<void> {
    console.log('🔍 [VoiceService] speakAlways() llamado:', {
      text: text.substring(0, 50) + '...',
      isMuted: this.isMuted,
      timestamp: new Date().toISOString()
    });
    
    return new Promise((resolve, reject) => {
      if (!window.speechSynthesis) {
        this.logger.warn('Speech Synthesis no soportada');
        reject(new Error('Speech Synthesis no soportada'));
        return;
      }

      // ✅ SILENCIAR EL MICRÓFONO ANTES DE HABLAR
      const wasListening = this.isListening;
      if (wasListening) {
        console.log('🔍 [VoiceService] → speakAlways() silenciando micrófono durante TTS');
        this.stopListening();
      }

      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.9;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      
      const voice = this.getNaturalVoice('es-ES');
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.onend = () => {
        console.log('🔍 [VoiceService] → speakAlways() onend, reactivando micrófono');
        // ✅ REACTIVAR EL MICRÓFONO DESPUÉS DE 1.5 SEGUNDOS
        setTimeout(() => {
          if (!this.recognitionActive) {
            console.log('🔍 [VoiceService] → speakAlways() llamando a startListening()');
            this.startListening();
            console.log('🎤 Micrófono reactivado después de speakAlways');
          }
        }, 1500);
        resolve();
      };
      
      utterance.onerror = (event) => {
        if (event.error === 'interrupted') {
          console.log('🔍 [VoiceService] → speakAlways() interrumpido');
          setTimeout(() => {
            if (!this.recognitionActive) {
              console.log('🔍 [VoiceService] → speakAlways() (interrupted) llamando a startListening()');
              this.startListening();
            }
          }, 1500);
          resolve();
          return;
        }
        this.logger.warn('Error en síntesis de voz:', event);
        reject(event);
      };
      
      window.speechSynthesis.speak(utterance);
      if (this.enableLogs) {
        this.logger.log(`🗣️ Hablando (siempre): "${text}"`);
      }
    });
  }

  // ============================================================
  // MÉTODOS PARA ENVIAR RESPUESTAS
  // ============================================================

  sendSuccessResponse(
    reply: string,
    action?: { type: string; payload?: Record<string, any> },
    data?: any
  ): void {
    const response: VoiceCommandResponse = {
      success: true,
      intent: 'success',
      status: 'success',
      reply,
      action,
      data,
      timestamp: new Date().toISOString()
    };
    this.responseSubject.next(response);
  }

  sendErrorResponse(
    reply: string,
    error?: string,
    data?: any
  ): void {
    const response: VoiceCommandResponse = {
      success: false,
      intent: 'error',
      status: 'error',
      reply,
      error: error || reply,
      data,
      timestamp: new Date().toISOString()
    };
    this.responseSubject.next(response);
  }

  sendAudioResponse(
    reply: string,
    audioBase64: string,
    action?: { type: string; payload?: Record<string, any> }
  ): void {
    const response: VoiceCommandResponse = {
      success: true,
      intent: 'audio',
      status: 'success',
      reply,
      audioBase64,
      action,
      timestamp: new Date().toISOString()
    };
    this.responseSubject.next(response);
  }

  // ============================================================
  // OBSERVABLES PÚBLICOS
  // ============================================================

  getTranscript(): Observable<string> {
    return this.transcriptSubject.asObservable();
  }

  // 🔥 NUEVO: Observable con isFinal (para OTP y otros casos especiales)
  getTranscriptWithFinal(): Observable<{ text: string; isFinal: boolean }> {
    return this.transcriptWithFinalSubject.asObservable();
  }

  getResponses(): Observable<VoiceCommandResponse> {
    return this.responseSubject.asObservable();
  }

  getMutedState(): Observable<boolean> {
    return this.mutedSubject.asObservable();
  }

  getErrors(): Observable<string> {
    return this.errorSubject.asObservable();
  }

  getWakeWords(): Observable<string> {
    return this.wakeWordSubject.asObservable();
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  isSupported(): boolean {
    if (this.isFirefox()) {
      console.warn('🦊 Firefox: SpeechRecognition no soportado nativamente');
      return false;
    }
    return !!(window.SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  getBrowserSupportMessage(): string {
    if (this.isFirefox()) {
      return '⚠️ El reconocimiento de voz no está disponible en Firefox. Por favor, usa Chrome, Edge o Safari para usar comandos de voz.';
    }
    if (!this.isSupported()) {
      return '⚠️ El reconocimiento de voz no está disponible en este navegador.';
    }
    return '';
  }

  isListeningActive(): boolean {
    return this.isListening;
  }

  isSpeechSynthesisSupported(): boolean {
    return !!(window.speechSynthesis);
  }

  isFullySupported(): boolean {
    return this.isSupported() && this.isSpeechSynthesisSupported();
  }

  isFirefox(): boolean {
    return navigator.userAgent.toLowerCase().includes('firefox');
  }

  // ============================================================
  // LIMPIEZA
  // ============================================================

  destroy(): void {
    if (this.enableLogs) {
      this.logger.log('🧹 Destruyendo VoiceService...');
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    this.stopListening();
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    this.transcriptSubject.complete();
    this.transcriptWithFinalSubject.complete(); // 🔥 Nuevo Subject
    this.responseSubject.complete();
    this.mutedSubject.complete();
    this.wakeWordSubject.complete();
    this.errorSubject.complete();
    this.listeningSubject.complete();
    this.readySubject.complete();
    
    this.filterService.reset();
    
    if (this.recognition) {
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      this.recognition.onstart = null;
      this.recognition = null;
    }
    
    if (this.enableLogs) {
      this.logger.log('✅ VoiceService destruido correctamente');
    }
  }
}