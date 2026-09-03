// import { Service } from '@angular/core';

// @Service()
// export class EntityManagerService {
// }



// src/app/core/services/entity-manager.service.ts
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { getEntityConfig, getEntityList, getEntityListGrouped } from '../constants/entity-registry';
import { EntityConfig } from '../models/entity-config.interface';
import { AuthService } from '../../../../core/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EntityManagerService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); // 👈 INYECTAR AuthService

  // Estado - BehaviorSubject para suscripciones
  private currentEntitySubject = new BehaviorSubject<EntityConfig | null>(null);
  currentEntity$ = this.currentEntitySubject.asObservable();

  // Signals para el estado reactivo
  isLoading = signal(false);
  entities = signal<any[]>([]);
  totalItems = signal(0);
  searchTerm = signal('');
  pageSize = signal(10);
  pageIndex = signal(0);
  error = signal<string | null>(null);

  /**
   * Carga la configuración de una entidad
   */
  loadEntity(entityName: string): EntityConfig | null {
    const config = getEntityConfig(entityName);
    if (config) {
      this.currentEntitySubject.next(config);
      // Resetear estado al cambiar de entidad
      this.resetState();
      return config;
    }
    return null;
  }

  /**
   * Obtiene la configuración actual
   */
  getCurrentConfig(): EntityConfig | null {
    return this.currentEntitySubject.value;
  }

  /**
   * ✅ Obtiene la lista de entidades (filtrada por rol del usuario)
   */
  getEntityList() {
    const user = this.authService.currentUser();
    const userRoles = user?.roles || [];
    return getEntityList(userRoles); // 👈 Pasar roles al helper
  }

  /**
   * ✅ Obtiene la lista de entidades agrupadas (filtrada por rol del usuario)
   */
  getEntityListGrouped() {
    const user = this.authService.currentUser();
    const userRoles = user?.roles || [];
    return getEntityListGrouped(userRoles); // 👈 Pasar roles al helper
  }

  /**
   * Carga los datos de la entidad actual con paginación y búsqueda
   */
  // loadData(): void {
  //   const config = this.getCurrentConfig();
  //   if (!config) {
  //     console.warn('⚠️ No hay configuración de entidad para cargar datos');
  //     this.entities.set([]);
  //     this.totalItems.set(0);
  //     return;
  //   }

  //   this.isLoading.set(true);
  //   this.error.set(null);
    
  //   // Construir parámetros
  //   const params = new URLSearchParams();
  //   params.set('page', String(this.pageIndex() + 1));
  //   params.set('limit', String(this.pageSize()));
    
  //   if (this.searchTerm() && this.searchTerm().trim() !== '') {
  //     params.set('search', this.searchTerm().trim());
  //   }

  //   const url = `${config.apiPath}?${params.toString()}`;
  //   console.log(`📡 Cargando datos desde: ${url}`);

  //   this.http.get<any>(url, { withCredentials: true })
  //     .pipe(
  //       catchError((error) => {
  //         console.error('❌ Error en la petición HTTP:', error);
  //         this.error.set(error.message || 'Error al cargar los datos');
  //         return throwError(() => error);
  //       }),
  //       finalize(() => this.isLoading.set(false))
  //     )
  //     .subscribe({
  //       next: (response) => {
  //         this.processResponse(response);
  //       },
  //       error: (error) => {
  //         console.error('❌ Error loading data:', error);
  //         this.entities.set([]);
  //         this.totalItems.set(0);
  //       }
  //     });
  // }






  loadData(): void {
    const config = this.getCurrentConfig();
    if (!config) {
      console.warn('⚠️ No hay configuración de entidad para cargar datos');
      this.entities.set([]);
      this.totalItems.set(0);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    
    // ✅ CONSTRUIR PARÁMETROS - Spring Boot usa page 0-based
    const params = new URLSearchParams();
    // ❌ ANTES: page = this.pageIndex() + 1 (empezaba en 1)
    // ✅ AHORA: page = this.pageIndex() (empieza en 0)
    params.set('page', String(this.pageIndex()));
    params.set('size', String(this.pageSize())); // 👈 Spring Boot usa 'size', no 'limit'
    
    if (this.searchTerm() && this.searchTerm().trim() !== '') {
      params.set('search', this.searchTerm().trim());
    }

    const url = `${config.apiPath}?${params.toString()}`;
    console.log(`📡 Cargando datos desde: ${url}`);

    this.http.get<any>(url, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('❌ Error en la petición HTTP:', error);
          this.error.set(error.message || 'Error al cargar los datos');
          this.isLoading.set(false); // 👈 Asegurar que se quite el loading
          return throwError(() => error);
        }),
        finalize(() => {
          this.isLoading.set(false);
        })
      )
      .subscribe({
        next: (response) => {
          console.log('📦 Respuesta recibida en service:', response);
          this.processResponse(response);
        },
        error: (error) => {
          console.error('❌ Error loading data:', error);
          this.entities.set([]);
          this.totalItems.set(0);
          this.isLoading.set(false);
        }
      });
  }






  /**
   * Procesa la respuesta de la API
   */
  // private processResponse(response: any): void {
  //   console.log('📦 Respuesta recibida:', response);

  //   if (!response) {
  //     this.entities.set([]);
  //     this.totalItems.set(0);
  //     return;
  //   }

  //   // Caso 1: Respuesta paginada { data: [], total: 0 }
  //   if (typeof response === 'object' && 'data' in response) {
  //     this.entities.set(Array.isArray(response.data) ? response.data : []);
  //     this.totalItems.set(
  //       typeof response.total === 'number' 
  //         ? response.total 
  //         : response.data?.length || 0
  //     );
  //     console.log(`✅ Cargados ${this.entities().length} registros (total: ${this.totalItems()})`);
  //     return;
  //   }

  //   // Caso 2: Respuesta es un array directamente
  //   if (Array.isArray(response)) {
  //     this.entities.set(response);
  //     this.totalItems.set(response.length);
  //     console.log(`✅ Cargados ${response.length} registros`);
  //     return;
  //   }

  //   // Caso 3: Respuesta con items
  //   if (typeof response === 'object' && 'items' in response && Array.isArray(response.items)) {
  //     this.entities.set(response.items);
  //     this.totalItems.set(response.total || response.items.length);
  //     console.log(`✅ Cargados ${response.items.length} registros (total: ${this.totalItems()})`);
  //     return;
  //   }

  //   // Caso 4: Respuesta con results
  //   if (typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
  //     this.entities.set(response.results);
  //     this.totalItems.set(response.total || response.results.length);
  //     console.log(`✅ Cargados ${response.results.length} registros (total: ${this.totalItems()})`);
  //     return;
  //   }

  //   // Caso 5: Fallback - intentar extraer datos
  //   console.warn('⚠️ Formato de respuesta no reconocido:', response);
  //   this.entities.set([]);
  //   this.totalItems.set(0);
  // }






  private processResponse(response: any): void {
      console.log('📦 Respuesta recibida:', response);

      if (!response) {
        this.entities.set([]);
        this.totalItems.set(0);
        return;
      }

      // Variable para almacenar los datos extraídos
      let data: any[] = [];
      let total: number = 0;

      // ✅ CASO 1: Es un array directamente
      if (Array.isArray(response)) {
        console.log(`✅ Cargados ${response.length} registros (array directo)`);
        data = response;
        total = response.length;
      }
      // ✅ CASO 2: Spring Boot Page - { content: [], totalElements: 0 }
      else if (typeof response === 'object' && 'content' in response) {
        data = Array.isArray(response.content) ? response.content : [];
        total = typeof response.totalElements === 'number' 
          ? response.totalElements 
          : data.length;
        console.log(`✅ Cargados ${data.length} registros de ${total} (Spring Page)`);
      }
      // ✅ CASO 3: { data: [], total: 0 }
      else if (typeof response === 'object' && 'data' in response) {
        data = Array.isArray(response.data) ? response.data : [];
        total = typeof response.total === 'number' ? response.total : data.length;
        console.log(`✅ Cargados ${data.length} registros de ${total} (data/total)`);
      }
      // ✅ CASO 4: { items: [], total: 0 }
      else if (typeof response === 'object' && 'items' in response) {
        data = Array.isArray(response.items) ? response.items : [];
        total = typeof response.total === 'number' ? response.total : data.length;
        console.log(`✅ Cargados ${data.length} registros de ${total} (items/total)`);
      }
      // ✅ CASO 5: { results: [], total: 0 }
      else if (typeof response === 'object' && 'results' in response) {
        data = Array.isArray(response.results) ? response.results : [];
        total = typeof response.total === 'number' ? response.total : data.length;
        console.log(`✅ Cargados ${data.length} registros de ${total} (results/total)`);
      }
      // ✅ CASO 6: Fallback - buscar cualquier array en el objeto
      else if (typeof response === 'object') {
        for (const key of Object.keys(response)) {
          if (Array.isArray(response[key])) {
            data = response[key];
            total = data.length;
            console.log(`✅ Cargados ${data.length} registros desde key: ${key}`);
            break;
          }
        }
      }

      // ❌ Si no se encontraron datos
      if (data.length === 0) {
        console.warn('⚠️ No se encontraron datos en la respuesta');
        console.log('🔍 Keys del objeto:', Object.keys(response || {}));
        this.entities.set([]);
        this.totalItems.set(0);
        return;
      }

      // ============================================================
      // 🔍 DEPURACIÓN: Mostrar estructura de los datos
      // ============================================================
      console.log('📊 Primer registro (crudo):', data[0]);
      console.log('🔑 Campos del primer registro:', Object.keys(data[0]));
      
      // ✅ Obtener configuración para comparar
      const config = this.getCurrentConfig();
      if (config) {
        const configFields = config.fields.map(f => f.key);
        console.log('📋 Campos esperados por configuración:', configFields);
        
        // 🔍 Detectar campos que no coinciden
        const dataFields = Object.keys(data[0]);
        const missingInConfig = dataFields.filter(k => !configFields.includes(k) && k !== 'id');
        const missingInData = configFields.filter(k => !dataFields.includes(k));
        
        if (missingInConfig.length > 0) {
          console.warn('⚠️ Campos en datos que NO están en configuración:', missingInConfig);
          console.warn('💡 Sugerencia: Añade estos campos a la configuración en entity-registry.ts');
        }
        
        if (missingInData.length > 0) {
          console.warn('⚠️ Campos en configuración que NO están en datos:', missingInData);
          console.warn('💡 Sugerencia: Verifica que el backend devuelva estos campos');
        }
        
        // 🔍 Verificar si el campo displayField existe
        if (config.displayField && !dataFields.includes(config.displayField)) {
          console.warn(`⚠️ El campo displayField '${config.displayField}' no existe en los datos`);
          console.warn('💡 Sugerencia: Cambia el displayField en la configuración a uno que exista');
        }
      }

      // ============================================================
      // 🔄 NORMALIZACIÓN OPCIONAL DE DATOS
      // ============================================================
      // Si el backend usa nombres diferentes (ej: user_name vs username)
      // puedes normalizarlos aquí
      const normalizedData = data.map((item: any) => {
        const normalized: any = { ...item };
        
        // Ejemplo de normalización (descomenta y adapta según necesites)
        // if (item.user_name && !item.username) {
        //   normalized.username = item.user_name;
        // }
        // if (item.full_name && !item.fullName) {
        //   normalized.fullName = item.full_name;
        // }
        // if (item.created_at && !item.createdAt) {
        //   normalized.createdAt = item.created_at;
        // }
        
        return normalized;
      });

      // ============================================================
      // ✅ ASIGNAR DATOS FINALES
      // ============================================================
      this.entities.set(normalizedData);
      this.totalItems.set(total);
      
      console.log(`✅ Total: ${this.totalItems()} registros cargados`);
      console.log('📊 Datos finales (normalizados):', this.entities());
  }





  /**
   * Crea un nuevo registro
   */
  create(data: any): Observable<any> {
    const config = this.getCurrentConfig();
    if (!config) {
      return throwError(() => new Error('No hay configuración de entidad'));
    }
    
    return this.http.post(config.apiPath, data, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error('❌ Error creating entity:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualiza un registro
   */
  update(id: number, data: any): Observable<any> {
    const config = this.getCurrentConfig();
    if (!config) {
      return throwError(() => new Error('No hay configuración de entidad'));
    }
    
    return this.http.put(`${config.apiPath}/${id}`, data, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error(`❌ Error updating entity ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Elimina un registro
   */
  delete(id: number): Observable<any> {
    const config = this.getCurrentConfig();
    if (!config) {
      return throwError(() => new Error('No hay configuración de entidad'));
    }
    
    return this.http.delete(`${config.apiPath}/${id}`, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error(`❌ Error deleting entity ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Obtiene un registro por ID
   */
  getById(id: number): Observable<any> {
    const config = this.getCurrentConfig();
    if (!config) {
      return throwError(() => new Error('No hay configuración de entidad'));
    }
    
    return this.http.get(`${config.apiPath}/${id}`, { withCredentials: true })
      .pipe(
        catchError((error) => {
          console.error(`❌ Error getting entity ${id}:`, error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Actualiza los parámetros de paginación y recarga
   */
  updatePagination(pageIndex: number, pageSize: number): void {
    this.pageIndex.set(pageIndex);
    this.pageSize.set(pageSize);
    this.loadData();
  }

  /**
   * Actualiza el término de búsqueda y recarga
   */
  updateSearch(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
    this.pageIndex.set(0);
    this.loadData();
  }

  /**
   * Recarga los datos actuales
   */
  refresh(): void {
    this.loadData();
  }

  /**
   * Resetea el estado
   */
  private resetState(): void {
    this.entities.set([]);
    this.totalItems.set(0);
    this.error.set(null);
    this.searchTerm.set('');
    this.pageIndex.set(0);
    this.pageSize.set(10);
  }

  /**
   * Limpia el estado
   */
  clearState(): void {
    this.resetState();
    this.currentEntitySubject.next(null);
  }
}