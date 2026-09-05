// src/app/features/admin/dynamic-entity-manager/services/entity-crud.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';  // 👈 NUEVO IMPORT
import { EntityConfig } from '../../../features/admin/models/entity-config';

@Injectable({ providedIn: 'root' })
export class EntityCrudService {
  private http = inject(HttpClient);

  getAll(config: EntityConfig): Observable<any[]> {
    console.log('📡 GET:', config.apiPath);
    
    return this.http.get<any>(config.apiPath, { withCredentials: true }).pipe(
      map((response: any) => {
        console.log('📡 Respuesta cruda:', response);
        console.log('📡 Tipo:', typeof response);
        console.log('📡 Es array?', Array.isArray(response));
        
        // ✅ Si la respuesta es un array, devolverlo directamente
        if (Array.isArray(response)) {
          console.log('✅ Es un array, devolviendo directamente');
          return response;
        }
        
        // ✅ Si la respuesta es un objeto con 'content' (Spring Data Page)
        if (response && typeof response === 'object' && response.content && Array.isArray(response.content)) {
          console.log('✅ Usando response.content (Spring Page)');
          return response.content;
        }
        
        // ✅ Si la respuesta es un objeto con 'data'
        if (response && response.data && Array.isArray(response.data)) {
          console.log('✅ Usando response.data');
          return response.data;
        }
        
        // ✅ Si la respuesta es un objeto con 'items'
        if (response && response.items && Array.isArray(response.items)) {
          console.log('✅ Usando response.items');
          return response.items;
        }
        
        // ✅ Si es un objeto simple (no array), convertirlo a array
        if (response && typeof response === 'object' && Object.keys(response).length > 0) {
          console.log('✅ Convirtiendo objeto a array');
          return [response];
        }
        
        // ✅ Cualquier otro caso, devolver array vacío
        console.log('⚠️ No se pudo extraer datos, devolviendo []');
        return [];
      })
    );
  }

  getById(config: EntityConfig, id: number): Observable<any> {
    console.log('📡 GET BY ID:', `${config.apiPath}/${id}`);
    return this.http.get<any>(`${config.apiPath}/${id}`, { withCredentials: true });
  }

  create(config: EntityConfig, data: any): Observable<any> {
    console.log('📡 POST:', config.apiPath, data);
    return this.http.post<any>(config.apiPath, data, { withCredentials: true });
  }

  update(config: EntityConfig, id: number, data: any): Observable<any> {
    console.log('📡 PUT:', `${config.apiPath}/${id}`, data);
    return this.http.put<any>(`${config.apiPath}/${id}`, data, { withCredentials: true });
  }

  delete(config: EntityConfig, id: number): Observable<void> {
    console.log('📡 DELETE:', `${config.apiPath}/${id}`);
    return this.http.delete<void>(`${config.apiPath}/${id}`, { withCredentials: true });
  }
}