// import { Component } from '@angular/core';

// @Component({
//   imports: [],
//   selector: 'app-entity-table',
//   styleUrl: './entity-table.component.scss',
//   templateUrl: './entity-table.component.html',
// })
// export class EntityTableComponent {
// }




// src/app/features/admin/dynamic-entity-manager/components/entity-table/entity-table.component.ts

import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntityConfig } from '../../models/entity-config';
import { EntityValuePipe } from '../../pipes/entity-value.pipe';

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
  styleUrls: ['./entity-table.component.scss']
})
export class EntityTableComponent {
  // Inputs
  config = input<EntityConfig | null>(null);
  data = input<any[]>([]);
  loading = input(false);
  total = input(0);
  pageIndex = input(0);
  pageSize = input(10);
  searchTerm = input('');
  showActions = input(true);

  // Outputs
  onEdit = output<number>();
  onDelete = output<number>();
  onSearch = output<string>();
  onPageChange = output<{ pageIndex: number; pageSize: number }>();

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

  // Métodos
  onSearchInput() {
    this.onSearch.emit(this.searchTerm());
  }

  clearSearch() {
    this.onSearch.emit('');
  }

  onPageChangeEvent(event: PageEvent) {
    this.onPageChange.emit({
      pageIndex: event.pageIndex,
      pageSize: event.pageSize
    });
  }
}