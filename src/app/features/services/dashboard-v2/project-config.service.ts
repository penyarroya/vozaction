// import { Injectable } from '@angular/core';

// @Injectable({
//   providedIn: 'root',
// })
// export class ProjectConfigService {
  
// }


// src/app/features/pages/public/dashboard-v2/services/project-config.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { ProjectConfig, VoiceCommand } from '../../models/dashboard-v2/project-config.model';

@Injectable({
  providedIn: 'root'
})
export class ProjectConfigService {
  private http = inject(HttpClient);
  
  private currentProjectSubject = new BehaviorSubject<ProjectConfig | null>(null);
  public currentProject$ = this.currentProjectSubject.asObservable();
  
  private projectIdSubject = new BehaviorSubject<string>('informatica');
  public projectId$ = this.projectIdSubject.asObservable();

  /**
   * Carga la configuración de un proyecto desde JSON
   * ✅ Ruta: public/config/dashboard-v2/proyectos/
   */
  loadProjectConfig(projectId: string): Observable<ProjectConfig> {
    // ✅ CORREGIDO: coincide con la ubicación real del JSON
    const url = `/config/dashboard-v2/proyectos/${projectId}.json`;
    console.log(`📂 [DashboardV2] Cargando proyecto: ${url}`);
    
    return this.http.get<ProjectConfig>(url).pipe(
      tap((config) => {
        console.log(`✅ [DashboardV2] Proyecto cargado: ${config.projectName}`);
        this.currentProjectSubject.next(config);
        this.projectIdSubject.next(projectId);
      })
    );
  }

  /**
   * Obtiene la configuración actual
   */
  getCurrentConfig(): ProjectConfig | null {
    return this.currentProjectSubject.getValue();
  }

  /**
   * Cambia el proyecto activo
   */
  switchProject(projectId: string): Observable<ProjectConfig> {
    return this.loadProjectConfig(projectId);
  }

  /**
   * Obtiene la lista de proyectos disponibles
   */
  getAvailableProjects(): string[] {
    return ['informatica', 'huertos', 'salud', 'finanzas'];
  }

  /**
   * Obtiene los comandos de voz del proyecto actual
   */
  getVoiceCommands(): VoiceCommand[] {
    const config = this.getCurrentConfig();
    return config?.voiceCommands || [];
  }
}