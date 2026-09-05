// import { Component } from '@angular/core';

// @Component({
//   imports: [],
//   selector: 'app-dynamic-entity-manager',
//   styleUrl: './dynamic-entity-manager.component.scss',
//   templateUrl: './dynamic-entity-manager.component.html',
// })
// export class DynamicEntityManagerComponent {
// }




// // src/app/features/admin/dynamic-entity-manager/dynamic-entity-manager.component.ts

// import { Component, inject, signal, computed, effect } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, ActivatedRoute, Router } from '@angular/router';
// import { EntityFormComponent } from './components/entity-form/entity-form.component';
// import { EntityListComponent } from './components/entity-list/entity-list.component';
// import { EntitySidebarComponent } from './components/entity-sidebar/entity-sidebar.component';
// import { getEntityConfig, ENTITY_REGISTRY } from './constants/entity-registry';
// import { EntityConfig } from './models/entity-config';

// @Component({
//   selector: 'app-dynamic-entity-manager',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule,
//     EntityListComponent,
//     EntityFormComponent,
//     EntitySidebarComponent,
//   ],
//   templateUrl: './dynamic-entity-manager.component.html',
//   styleUrls: ['./dynamic-entity-manager.component.scss']
// })
// export class DynamicEntityManagerComponent {
//   private route = inject(ActivatedRoute);
//   private router = inject(Router);

//   selectedEntity = signal<string>('UserEntity');
//   isFormMode = signal(false);

//   selectedConfig = computed((): EntityConfig => {
//     const config = getEntityConfig(this.selectedEntity());
//     const firstEntity = Object.values(ENTITY_REGISTRY)[0];
//     return config || firstEntity;
//   });

//   constructor() {
//     effect(() => {
//       const url = this.router.url;
//       const isForm = url.includes('/create') || url.includes('/edit');
//       this.isFormMode.set(isForm);

//       const segments = url.split('/');
//       const entityIndex = segments.indexOf('entities') + 1;
//       if (entityIndex && segments[entityIndex] && 
//           !segments[entityIndex].includes('create') && 
//           !segments[entityIndex].includes('edit')) {
//         this.selectedEntity.set(segments[entityIndex]);
//       }
//     });
//   }

//   onEntitySelect(entityName: string) {
//     this.selectedEntity.set(entityName);
//     this.isFormMode.set(false);
//     this.router.navigate(['/admin/entities', entityName]);
//   }

//   onDelete(id: number) {
//     console.log('Eliminado:', id);
//   }

//   onSave(data: any) {
//     console.log('Guardado:', data);
//     this.isFormMode.set(false);
//     const entity = this.selectedEntity();
//     this.router.navigate(['/admin/entities', entity]);
//   }
// }










// src/app/features/admin/dynamic-entity-manager/dynamic-entity-manager.component.ts

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { getEntityConfig } from '../../../shared/constants/entity-registry';
import { EntityConfig } from '../../admin/models/entity-config';
import { EntityCrudService } from '../../../shared/services/sidebar/entity-crud.service';
import { EntitySidebarComponent } from '../../../shared/components/entity-sidebar/entity-sidebar.component';

@Component({
  selector: 'app-dynamic-entity-manager',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    EntitySidebarComponent
],
  templateUrl: './dynamic-entity-manager.component.html',
  styleUrls: ['./dynamic-entity-manager.component.scss']
})
export class DynamicEntityManagerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private crudService = inject(EntityCrudService);

  // ============================================================
  // ESTADO
  // ============================================================
  selectedEntity = signal<string>('UserEntity');
  isFormMode = signal(false);
  isLoading = signal(false);
  entities = signal<any[]>([]);
  editingData = signal<any>(null);
  editingId = signal<number | null>(null);

  // ============================================================
  // COMPUTED
  // ============================================================
  selectedConfig = computed((): EntityConfig | null => {
    const config = getEntityConfig(this.selectedEntity());
    return config || null;
  });

  // ============================================================
  // CICLO DE VIDA
  // ============================================================
  ngOnInit(): void {
    console.log('🚀 DynamicEntityManager - ngOnInit');
    
    // Escuchar cambios en la URL
    this.route.params.subscribe(params => {
      console.log('📌 Params:', params);
      if (params['entity']) {
        this.selectedEntity.set(params['entity']);
        console.log('🔍 Entity seleccionada:', this.selectedEntity());
        this.loadData();
      }
    });

    // Detectar si estamos en modo formulario
    this.route.url.subscribe(url => {
      const path = url.map(s => s.path).join('/');
      const isCreate = path.includes('create');
      const isEdit = path.includes('edit');
      
      this.isFormMode.set(isCreate || isEdit);
      console.log('📋 isFormMode:', this.isFormMode());
      
      if (isEdit) {
        const id = parseInt(this.route.snapshot.params['id']);
        if (id) {
          this.editingId.set(id);
          this.loadItem(id);
        }
      } else if (isCreate) {
        this.editingData.set(null);
        this.editingId.set(null);
      } else {
        this.editingData.set(null);
        this.editingId.set(null);
      }
    });
  }

  // ============================================================
  // MÉTODOS
  // ============================================================
  onEntitySelect(entityName: string): void {
    console.log('🔄 Cambiando a entidad:', entityName);
    this.selectedEntity.set(entityName);
    this.isFormMode.set(false);
    this.router.navigate(['/admin/entities', entityName]);
  }

  loadData(): void {
    const config = this.selectedConfig();
    console.log('📡 loadData() - Iniciando');
    console.log('📡 Config:', config);
    
    if (!config) {
      console.error('❌ No hay configuración para:', this.selectedEntity());
      return;
    }

    console.log('📡 Cargando datos de:', config.displayName);
    console.log('📡 API URL:', config.apiPath);
    
    this.isLoading.set(true);

    this.crudService.getAll(config).subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos:', data);
        console.log('✅ Cantidad:', data?.length || 0);
        this.entities.set(data || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error cargando datos:', error);
        this.entities.set([]);
        this.isLoading.set(false);
      }
    });
  }





  loadItem(id: number): void {
    const config = this.selectedConfig();
    if (!config) return;

    console.log('📡 Cargando item ID:', id);
    this.crudService.getById(config, id).subscribe({
      next: (data) => {
        console.log('✅ Item cargado:', data);
        this.editingData.set(data);
      },
      error: (error) => {
        console.error('❌ Error cargando item:', error);
      }
    });
  }

  onDelete(id: number): void {
    const config = this.selectedConfig();
    if (!config) return;

    if (!confirm(`¿Eliminar este registro?`)) return;

    console.log('🗑️ Eliminando ID:', id);
    this.crudService.delete(config, id).subscribe({
      next: () => {
        console.log('✅ Eliminado correctamente');
        this.loadData();
      },
      error: (error) => {
        console.error('❌ Error eliminando:', error);
      }
    });
  }

  onEdit(id: number): void {
    console.log('✏️ Editando ID:', id);
    this.router.navigate(['/admin/entities', this.selectedEntity(), 'edit', id]);
  }

  onSave(data: any): void {
    const config = this.selectedConfig();
    if (!config) return;

    console.log('💾 Guardando:', data);
    this.isLoading.set(true);

    const isEdit = this.editingId() !== null;
    const request = isEdit
      ? this.crudService.update(config, this.editingId()!, data)
      : this.crudService.create(config, data);

    request.subscribe({
      next: (result) => {
        console.log('✅ Guardado correctamente:', result);
        this.isLoading.set(false);
        this.isFormMode.set(false);
        this.editingId.set(null);
        this.editingData.set(null);
        this.router.navigate(['/admin/entities', this.selectedEntity()]);
        this.loadData();
      },
      error: (error) => {
        console.error('❌ Error guardando:', error);
        this.isLoading.set(false);
      }
    });
  }

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================
  onCreate(): void {
    console.log('➕ Creando nueva entidad');
    this.isFormMode.set(true);
    this.editingId.set(null);
    this.editingData.set(null);
    this.router.navigate(['/admin/entities', this.selectedEntity(), 'create']);
  }

  onCancel(): void {
    console.log('❌ Cancelando formulario');
    this.isFormMode.set(false);
    this.editingId.set(null);
    this.editingData.set(null);
    this.router.navigate(['/admin/entities', this.selectedEntity()]);
  }
}