import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../../environments/environment';
import { Subscription, interval, switchMap, startWith, catchError, of } from 'rxjs';
import { ThemeService } from '../../../../shared/services/themes/themes.service'; // 👈 IMPORTAR

@Component({
  selector: 'app-maintenance',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './maintenance.component.html',
  styleUrl: './maintenance.component.scss',
})
export class MaintenanceComponent implements OnInit, OnDestroy {
  public Math = Math;
  
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private themeService = inject(ThemeService); // 👈 INYECTAR
  
  private autoCheckSub?: Subscription;
  private isBrowser = isPlatformBrowser(this.platformId);
  private readonly healthUrl = environment.healthUrl;
  
  // 🔥 Estados UI
  public showServerDown = true;
  public showEurekaTimer = false;
  public isChecking = true;
  
  public readonly EUREKA_WAIT_SECONDS = 15; 
  private eurekaEndTime: number = 0;
  public remainingSeconds = this.EUREKA_WAIT_SECONDS;
  public progressPercent = 0;
  private countdownInterval?: any;
  
  public isRetrying = false;
  public statusMessage = 'Verificando servidor...';

  // 🔥 Getter para el tema actual (se usa en el HTML)
  get currentTheme() {
    return this.themeService.currentTheme();
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.startHealthCheck();
    } else {
      console.log('🔧 SSR: Componente de mantenimiento renderizado en servidor');
    }
  }

  // ============================================================
  // 🔥 LÓGICA DE MONITOREO (SIN CAMBIOS)
  // ============================================================

  private startHealthCheck() {    
    console.log('🔍 Iniciando monitoreo de salud en:', this.healthUrl);
    this.autoCheckSub = interval(5000)
      .pipe(
        startWith(0),
        switchMap(() => {
          return this.http.get(this.healthUrl, { timeout: 10000 }).pipe(
            catchError((error) => {
              console.log('❌ Backend no disponible:', error.status || error.message);
              if (this.showEurekaTimer) this.cancelEurekaTimer();
              this.showServerDown = true;
              this.showEurekaTimer = false;
              this.statusMessage = 'Servidor no disponible. Reintentando en 5 segundos...';
              this.cdr.detectChanges();
              return of(null);
            })
          );
        })
      )
      .subscribe((response: any) => {
        if (response && response.status === 'UP') {
          console.log('✅ Servidor detectado. Iniciando temporizador de Eureka...');
          if (this.showServerDown || !this.showEurekaTimer) {
            this.startEurekaTimer();
          }
          this.cdr.detectChanges();
        }
      });
  }

  private startEurekaTimer() {
    this.showServerDown = false;
    this.showEurekaTimer = true;
    this.isRetrying = false;
    this.eurekaEndTime = Date.now() + (this.EUREKA_WAIT_SECONDS * 1000);
    this.remainingSeconds = this.EUREKA_WAIT_SECONDS;
    this.progressPercent = 0;
    console.log(`⏳ Eureka iniciando. Esperando ${this.EUREKA_WAIT_SECONDS} segundos...`);
    if (this.countdownInterval) clearInterval(this.countdownInterval);
    this.countdownInterval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((this.eurekaEndTime - Date.now()) / 1000));
      this.remainingSeconds = remaining;
      this.progressPercent = ((this.EUREKA_WAIT_SECONDS - remaining) / this.EUREKA_WAIT_SECONDS) * 100;
      if (remaining === 0) {
        clearInterval(this.countdownInterval);
        console.log('✅ Eureka listo. Redirigiendo a login...');
        this.router.navigate(['/login']);
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private cancelEurekaTimer() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = undefined;
    }
    this.showEurekaTimer = false;
    console.log('❌ Temporizador de Eureka cancelado');
  }

  retry() {
    if (!this.isBrowser) return;
    console.log('🔄 Reintento manual solicitado');
    this.isRetrying = true;
    this.statusMessage = 'Reintentando conexión...';
    this.cdr.detectChanges();
    this.http.get(this.healthUrl, { timeout: 10000 }).subscribe({
      next: (response: any) => {
        if (response && response.status === 'UP') {
          console.log('✅ Backend disponible. Iniciando temporizador de Eureka...');
          this.startEurekaTimer();
        } else {
          this.statusMessage = 'El servidor respondió pero no está listo. Reintentando...';
          this.isRetrying = false;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.statusMessage = 'Servidor no disponible. Reintentando en 5 segundos...';
        this.isRetrying = false;
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    if (this.isBrowser && this.autoCheckSub) {
      this.autoCheckSub.unsubscribe();
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
}