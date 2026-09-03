// import { Component } from '@angular/core';

// @Component({
//   imports: [],
//   selector: 'app-entity-list',
//   styleUrl: './entity-list.component.scss',
//   templateUrl: './entity-list.component.html',
// })
// export class EntityListComponent {
// }




// // src/app/features/admin/dynamic-entity-manager/components/entity-list/entity-list.component.ts

// import { Component, input, output, inject, signal, computed, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule } from '@angular/router';
// import { MatTableModule } from '@angular/material/table';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatChipsModule } from '@angular/material/chips';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { EntityCrudService } from '../../services/entity-crud.service';
// import { EntityConfig } from '../../models/entity-config';

// @Component({
//   selector: 'app-entity-list',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterModule,
//     MatTableModule,
//     MatButtonModule,
//     MatIconModule,
//     MatChipsModule,
//     MatProgressSpinnerModule,
//   ],
//   templateUrl: './entity-list.component.html',
//   styleUrls: ['./entity-list.component.scss']
// })
// export class EntityListComponent implements OnInit {
//   private entityService = inject(EntityCrudService);

//   config = input<EntityConfig | null>(null);
//   onDelete = output<number>();

//   data = signal<any[]>([]);
//   loading = signal(true);

//   tableFields = computed(() => {
//     const config = this.config();
//     if (!config) return [];
//     return config.fields.filter(f => f.showInTable !== false && !f.hidden);
//   });

//   displayedColumns = computed(() => {
//     const fields = this.tableFields();
//     const cols = fields.map(f => f.key);
//     if (this.config()?.tableSettings?.showActions !== false) {
//       cols.push('actions');
//     }
//     return cols;
//   });

//   dataSource = computed(() => this.data());

//   ngOnInit() {
//     this.loadData();
//   }

//   loadData() {
//     const config = this.config();
//     if (!config) return;

//     this.loading.set(true);
//     this.entityService.getAll(config).subscribe({
//       next: (data) => {
//         this.data.set(data);
//         this.loading.set(false);
//       },
//       error: (err) => {
//         console.error('Error cargando datos:', err);
//         this.loading.set(false);
//       }
//     });
//   }

//   deleteItem(id: number) {
//     const config = this.config();
//     if (!config) return;

//     if (confirm(`¿Eliminar este ${config.displayName?.slice(0, -1)}?`)) {
//       this.entityService.delete(config, id).subscribe({
//         next: () => {
//           this.loadData();
//           this.onDelete.emit(id);
//         },
//         error: (err) => console.error('Error eliminando:', err)
//       });
//     }
//   }
// }










// src/app/features/admin/dynamic-entity-manager/components/entity-list/entity-list.component.ts

import { Component, output, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntityCrudService } from '../../services/entity-crud.service';
import { EntityConfigService } from '../../services/entity-config.service';
import { EntityConfig } from '../../models/entity-config';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './entity-list.component.html',
  styleUrls: ['./entity-list.component.scss']
})
export class EntityListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private entityService = inject(EntityCrudService);
  private configService = inject(EntityConfigService);

  // 👇 OBTENER EL NOMBRE DE LA ENTIDAD DE LA URL
  entityName = signal<string>('');

  // 👇 CONFIGURACIÓN CALCULADA DESDE EL NOMBRE (USA TU SERVICE)
  config = computed((): EntityConfig | null => {
    return this.configService.getConfig(this.entityName()) || null;
  });

  onDelete = output<number>();

  data = signal<any[]>([]);
  loading = signal(true);

  tableFields = computed(() => {
    const config = this.config();
    if (!config) return [];
    return config.fields.filter(f => f.showInTable !== false && !f.hidden);
  });

  displayedColumns = computed(() => {
    const fields = this.tableFields();
    const cols = fields.map(f => f.key);
    if (this.config()?.tableSettings?.showActions !== false) {
      cols.push('actions');
    }
    return cols;
  });

  dataSource = computed(() => this.data());

  ngOnInit() {
    // 👇 ESCUCHAR EL PARÁMETRO DE LA URL
    this.route.params.subscribe(params => {
      console.log('📌 EntityList - params:', params);
      this.entityName.set(params['entity']);
      this.loadData();
    });
  }

  loadData() {
    const config = this.config();
    console.log('📡 EntityList - config:', config);
    
    if (!config) {
      console.error('❌ No hay configuración para:', this.entityName());
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.entityService.getAll(config).subscribe({
      next: (data) => {
        console.log('✅ EntityList - datos cargados:', data);
        this.data.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('❌ Error cargando datos:', err);
        this.loading.set(false);
      }
    });
  }

  deleteItem(id: number) {
    const config = this.config();
    if (!config) return;

    if (confirm(`¿Eliminar este ${config.displayName?.slice(0, -1)}?`)) {
      this.entityService.delete(config, id).subscribe({
        next: () => {
          this.loadData();
          this.onDelete.emit(id);
        },
        error: (err) => console.error('Error eliminando:', err)
      });
    }
  }
}