// import { Component } from '@angular/core';

// @Component({
//   imports: [],
//   selector: 'app-entity-sidebar',
//   styleUrl: './entity-sidebar.component.scss',
//   templateUrl: './entity-sidebar.component.html',
// })
// export class EntitySidebarComponent {
// }



// import { Component, input, output, inject, computed, signal, effect, Input } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { MatIconModule } from '@angular/material/icon';
// import { MatSliderModule } from '@angular/material/slider';
// import { FormsModule } from '@angular/forms';
// import { EntityConfigService } from '../../services/entity-config.service';

// @Component({
//   selector: 'app-entity-sidebar',
//   standalone: true,
//   imports: [CommonModule, MatIconModule, MatSliderModule, FormsModule],
//   templateUrl: './entity-sidebar.component.html',
//   styleUrls: ['./entity-sidebar.component.scss']
// })
// export class EntitySidebarComponent {
//   private configService = inject(EntityConfigService);

//   // Inputs
//   selectedEntity = input<string>('');
//   onSelect = output<string>();

//   // 👇 CONFIGURACIÓN DEL USUARIO (persistente)
//   sidebarWidth = signal<number>(this.loadConfig('sidebarWidth', 240));
//   sidebarHeight = signal<string>(this.loadConfig('sidebarHeight', '100%'));
//   backgroundColor = signal<string>(this.loadConfig('backgroundColor', '#f8fafc'));
//   borderColor = signal<string>(this.loadConfig('borderColor', '#e2e8f0'));
//   fontSize = signal<number>(this.loadConfig('fontSize', 14));
//   showIcons = signal<boolean>(this.loadConfig('showIcons', true));
//   scrollable = signal<boolean>(this.loadConfig('scrollable', true));
//   isMinimized = signal<boolean>(this.loadConfig('isMinimized', false));
//   showConfig = signal<boolean>(false);

//   // 👇 NUEVO: Espacio final configurable
//   @Input() bottomPadding: string = '20px';

//   entityList = computed(() => {
//     return this.configService.getConfigs().map(config => ({
//       label: config.displayName,
//       value: config.entityName,
//       icon: config.icon || '📄',
//       module: config.module || 'otros'
//     }));
//   });

//   // Computed para el ancho cuando está minimizado
//   currentWidth = computed(() => {
//     return this.isMinimized() ? 60 : this.sidebarWidth();
//   });

//   selectEntity(entityName: string) {
//     if (entityName !== this.selectedEntity()) {
//       this.onSelect.emit(entityName);
//     }
//   }

//   // 👇 Guardar configuración del usuario
//   private loadConfig(key: string, defaultValue: any): any {
//     const saved = localStorage.getItem(`sidebar_${key}`);
//     if (saved !== null) {
//       try {
//         return JSON.parse(saved);
//       } catch {
//         return defaultValue;
//       }
//     }
//     return defaultValue;
//   }

//   saveConfig(key: string, value: any): void {
//     localStorage.setItem(`sidebar_${key}`, JSON.stringify(value));
//   }

//   // Guardar cuando cambia cualquier valor
//   onWidthChange(value: number): void {
//     this.sidebarWidth.set(value);
//     this.saveConfig('sidebarWidth', value);
//   }

//   onHeightChange(value: string): void {
//     this.sidebarHeight.set(value);
//     this.saveConfig('sidebarHeight', value);
//   }

//   onColorChange(key: string, value: string): void {
//     if (key === 'bg') {
//       this.backgroundColor.set(value);
//       this.saveConfig('backgroundColor', value);
//     } else if (key === 'border') {
//       this.borderColor.set(value);
//       this.saveConfig('borderColor', value);
//     }
//   }

//   onFontSizeChange(value: number): void {
//     this.fontSize.set(value);
//     this.saveConfig('fontSize', value);
//   }

//   toggleIcons(): void {
//     this.showIcons.set(!this.showIcons());
//     this.saveConfig('showIcons', this.showIcons());
//   }

//   toggleScroll(): void {
//     this.scrollable.set(!this.scrollable());
//     this.saveConfig('scrollable', this.scrollable());
//   }

//   toggleMinimize(): void {
//     this.isMinimized.set(!this.isMinimized());
//     this.saveConfig('isMinimized', this.isMinimized());
//   }

//   toggleConfig(): void {
//     this.showConfig.set(!this.showConfig());
//   }

//   resetConfig(): void {
//     this.sidebarWidth.set(240);
//     this.sidebarHeight.set('100%');
//     this.backgroundColor.set('#f8fafc');
//     this.borderColor.set('#e2e8f0');
//     this.fontSize.set(14);
//     this.showIcons.set(true);
//     this.scrollable.set(true);
//     this.isMinimized.set(false);
    
//     // Limpiar localStorage
//     ['sidebarWidth', 'sidebarHeight', 'backgroundColor', 'borderColor', 'fontSize', 'showIcons', 'scrollable', 'isMinimized'].forEach(key => {
//       localStorage.removeItem(`sidebar_${key}`);
//     });
//   }
// }





// src/app/features/admin/dynamic-entity-manager/components/entity-sidebar/entity-sidebar.component.ts

import { Component, input, output, inject, computed, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { EntityConfigService } from '../../services/entity-config.service';

@Component({
  selector: 'app-entity-sidebar',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './entity-sidebar.component.html',
  styleUrls: ['./entity-sidebar.component.scss']
})
export class EntitySidebarComponent {
  private configService = inject(EntityConfigService);

  // ============================================================
  // INPUTS / OUTPUTS
  // ============================================================
  selectedEntity = input<string>('');
  onSelect = output<string>();
  @Input() bottomPadding: string = '20px';

  // ============================================================
  // ESTADO DEL SIDEBAR (persistente en localStorage)
  // ============================================================
  sidebarWidth = signal<number>(this.loadConfig('sidebarWidth', 240));
  sidebarHeight = signal<string>(this.loadConfig('sidebarHeight', '100%'));
  backgroundColor = signal<string>(this.loadConfig('backgroundColor', '#f8fafc'));
  borderColor = signal<string>(this.loadConfig('borderColor', '#e2e8f0'));
  fontSize = signal<number>(this.loadConfig('fontSize', 14));
  showIcons = signal<boolean>(this.loadConfig('showIcons', true));
  scrollable = signal<boolean>(this.loadConfig('scrollable', true));
  isMinimized = signal<boolean>(this.loadConfig('isMinimized', false));
  showConfig = signal<boolean>(false);

  // ============================================================
  // COMPUTED
  // ============================================================
  entityList = computed(() => {
    return this.configService.getConfigs().map(config => ({
      label: config.displayName,
      value: config.entityName,
      icon: config.icon || '📄',
      module: config.module || 'otros'
    }));
  });

  // 
  isActive = computed(() => {
    return (entityName: string) => this.selectedEntity() === entityName;
  });

  currentWidth = computed(() => {
    return this.isMinimized() ? 60 : this.sidebarWidth();
  });

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================
  selectEntity(entityName: string) {
    if (entityName !== this.selectedEntity()) {
      this.onSelect.emit(entityName);
    }
  }

  toggleMinimize(): void {
    this.isMinimized.set(!this.isMinimized());
    this.saveConfig('isMinimized', this.isMinimized());
  }

  toggleConfig(): void {
    this.showConfig.set(!this.showConfig());
  }

  onWidthChange(value: number): void {
    this.sidebarWidth.set(value);
    this.saveConfig('sidebarWidth', value);
  }

  onHeightChange(value: string): void {
    this.sidebarHeight.set(value);
    this.saveConfig('sidebarHeight', value);
  }

  onColorChange(key: string, value: string): void {
    if (key === 'bg') {
      this.backgroundColor.set(value);
      this.saveConfig('backgroundColor', value);
    } else if (key === 'border') {
      this.borderColor.set(value);
      this.saveConfig('borderColor', value);
    }
  }

  onFontSizeChange(value: number): void {
    this.fontSize.set(value);
    this.saveConfig('fontSize', value);
  }

  toggleIcons(): void {
    this.showIcons.set(!this.showIcons());
    this.saveConfig('showIcons', this.showIcons());
  }

  toggleScroll(): void {
    this.scrollable.set(!this.scrollable());
    this.saveConfig('scrollable', this.scrollable());
  }

  resetConfig(): void {
    this.sidebarWidth.set(240);
    this.sidebarHeight.set('100%');
    this.backgroundColor.set('#f8fafc');
    this.borderColor.set('#e2e8f0');
    this.fontSize.set(14);
    this.showIcons.set(true);
    this.scrollable.set(true);
    this.isMinimized.set(false);
    
    ['sidebarWidth', 'sidebarHeight', 'backgroundColor', 'borderColor', 'fontSize', 'showIcons', 'scrollable', 'isMinimized'].forEach(key => {
      localStorage.removeItem(`sidebar_${key}`);
    });
  }

  // ============================================================
  // MÉTODOS PRIVADOS
  // ============================================================
  private loadConfig(key: string, defaultValue: any): any {
    const saved = localStorage.getItem(`sidebar_${key}`);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }

  private saveConfig(key: string, value: any): void {
    localStorage.setItem(`sidebar_${key}`, JSON.stringify(value));
  }
}