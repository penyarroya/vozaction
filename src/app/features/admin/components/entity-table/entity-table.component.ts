// import { Component } from '@angular/core';

// @Component({
//   imports: [],
//   selector: 'app-entity-table',
//   styleUrl: './entity-table.component.scss',
//   templateUrl: './entity-table.component.html',
// })
// export class EntityTableComponent {
// }




// // src/app/features/admin/dynamic-entity-manager/components/entity-table/entity-table.component.ts

// import { Component, input, output, computed, model } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule } from '@angular/forms';
// import { MatTableModule } from '@angular/material/table';
// import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatIconModule } from '@angular/material/icon';
// import { MatButtonModule } from '@angular/material/button';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { EntityValuePipe } from '../../../../shared/pipes/entity-value.pipe';
// import { EntityConfig } from '../../../admin/models/entity-config';

// @Component({
//   selector: 'app-entity-table',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MatTableModule,
//     MatPaginatorModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatIconModule,
//     MatButtonModule,
//     MatTooltipModule,
//     MatProgressSpinnerModule,
//     EntityValuePipe,
//   ],
//   templateUrl: './entity-table.component.html',
//   styleUrls: ['./entity-table.component.scss']
// })
// export class EntityTableComponent {
//   // Inputs
//   config = input<EntityConfig | null>(null);
//   data = input<any[]>([]);
//   loading = input(false);
//   total = input(0);
//   pageIndex = input(0);
//   pageSize = input(10);
  
//   // Cambiamos input() por model() para permitir two-way binding con ngModel
//   searchTerm = model(''); 
  
//   showActions = input(true);

//   // Outputs
//   onEdit = output<number>();
//   onDelete = output<number>();
//   onSearch = output<string>();
//   onPageChange = output<{ pageIndex: number; pageSize: number }>();

//   // Computed
//   visibleFields = computed(() => {
//     const config = this.config();
//     if (!config) return [];
//     return config.fields.filter(f => !f.hidden);
//   });

//   displayedColumns = computed(() => {
//     const fields = this.visibleFields().map(f => f.key);
//     if (this.showActions() && this.config()?.tableSettings?.showActions !== false) {
//       return [...fields, 'actions'];
//     }
//     return fields;
//   });

//   // Métodos
//   onSearchInput() {
//     this.onSearch.emit(this.searchTerm());
//   }

//   clearSearch() {
//     this.searchTerm.set('');
//     this.onSearch.emit('');
//   }

//   onPageChangeEvent(event: PageEvent) {
//     this.onPageChange.emit({
//       pageIndex: event.pageIndex,
//       pageSize: event.pageSize
//     });
//   }
// }







// src/app/features/admin/dynamic-entity-manager/components/entity-table/entity-table.component.ts

import { Component, input, output, computed, model, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntityValuePipe } from '../../../../shared/pipes/entity-value.pipe';
import { EntityConfig } from '../../models/entity-config';


// 1. Función para personalizar las etiquetas del paginador al español
export function getSpanishPaginatorIntl(): MatPaginatorIntl {
  const paginatorIntl = new MatPaginatorIntl();
  
  paginatorIntl.itemsPerPageLabel = 'Registros por página:';
  paginatorIntl.nextPageLabel = 'Página siguiente';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.firstPageLabel = 'Primera página';
  paginatorIntl.lastPageLabel = 'Última página';
  
  paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }
    const startIndex = page * pageSize;
    const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
    return `${startIndex + 1} – ${endIndex} de ${length}`;
  };
  
  return paginatorIntl;
}

@Component({
  selector: 'app-entity-table',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    EntityValuePipe,
  ],
  templateUrl: './entity-table.component.html',
  styleUrls: ['./entity-table.component.scss'],
  providers: [
    // 2. Registramos el proveedor aquí para que la tabla use el español automáticamente
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() }
  ]
})
export class EntityTableComponent {
  private http = inject(HttpClient);

  // Inputs basados en Signals (limpiamos las duplicidades con @Input decorator)
  config = input<EntityConfig | null>(null);
  showActions = input(true);

  // Estado interno de datos y paginación
  data = signal<any[]>([]);
  loading = signal(false);
  total = signal(0);
  pageIndex = signal(0);
  pageSize = signal(10);
  searchTerm = model('');

  // Outputs basados en Signals (utilizando la nueva API moderna de Angular)
  onEdit = output<number>();
  onDelete = output<number>();
  onCrear = output<void>();

  constructor() {
    effect(() => {
      const cfg = this.config();
      const page = this.pageIndex();
      const size = this.pageSize();
      const search = this.searchTerm();

      if (cfg) {
        this.fetchData(cfg.apiPath, page, size, search);
      }
    });
  }

  private fetchData(apiPath: string, page: number, size: number, search: string) {
    this.loading.set(true);
    
    this.http.get<any>(apiPath).subscribe({
      next: (response) => {
        const items = Array.isArray(response) ? response : (response.content || response.data || []);
        this.data.set(items);
        this.total.set(response.totalElements || items.length);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos de la entidad:', err);
        this.data.set([]);
        this.total.set(0);
        this.loading.set(false);
      }
    });
  }

  // Computed
  visibleFields = computed(() => {
    const config = this.config();
    if (!config) return [];
    return config.fields.filter(f => !f.hidden);
  });

  displayedColumns = computed(() => {
    const fields = this.visibleFields().map(f => f.key);
    if (this.showActions() && this.config()?.tableSettings?.showActions !== false) {
      return [...fields, 'actions'];
    }
    return fields;
  });

  // Métodos de interacción
  onSearchInput() {
    this.pageIndex.set(0);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.pageIndex.set(0);
  }

  onPageChangeEvent(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  reload() {
    const cfg = this.config();
    if (cfg) {
      this.fetchData(cfg.apiPath, this.pageIndex(), this.pageSize(), this.searchTerm());
    }
  }
}