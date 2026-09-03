// import { Service } from '@angular/core';

// @Service()
// export class EntityConfigService {
// }




// // src/app/features/admin/dynamic-entity-manager/services/entity-config.service.ts

// import { Injectable, inject } from '@angular/core';
// import { EntityConfig } from '../models/entity-config';
// import { ENTITY_REGISTRY, getEntityConfig, getEntityList, getEntityListGrouped } from '../constants/entity-registry';
// import { AuthService } from '../../../../core/services/auth.service';

// @Injectable({
//   providedIn: 'root'
// })
// export class EntityConfigService {
//   private authService = inject(AuthService);

//   getConfig(entityName: string): EntityConfig | null {
//     return getEntityConfig(entityName) || null;
//   }

//   getConfigs(): EntityConfig[] {
//     return ENTITY_REGISTRY;
//   }

//   getFilteredConfigs(): EntityConfig[] {
//     const user = this.authService.currentUser();
//     const roles = user?.roles || [];
    
//     return ENTITY_REGISTRY.filter(config => {
//       if (!config.roles || config.roles.length === 0) return true;
//       return config.roles.some(role => roles.includes(role));
//     });
//   }

//   getEntityList() {
//     const user = this.authService.currentUser();
//     const roles = user?.roles || [];
//     return getEntityList(roles);
//   }

//   getEntityListGrouped() {
//     const user = this.authService.currentUser();
//     const roles = user?.roles || [];
//     return getEntityListGrouped(roles);
//   }

//   getFields(entityName: string): EntityConfig['fields'] {
//     const config = this.getConfig(entityName);
//     return config?.fields || [];
//   }

//   getVisibleFields(entityName: string): EntityConfig['fields'] {
//     const fields = this.getFields(entityName);
//     return fields.filter(f => !f.hidden);
//   }

//   getEditableFields(entityName: string): EntityConfig['fields'] {
//     const fields = this.getFields(entityName);
//     return fields.filter(f => !f.readonly && !f.hidden);
//   }
// }












// src/app/features/admin/dynamic-entity-manager/services/entity-config.service.ts

import { Injectable, inject } from '@angular/core';
import { EntityConfig } from '../models/entity-config';
import { AuthService } from '../../../../core/services/auth.service';
import { getEntityListGrouped } from '../../entity-manager/constants/entity-registry';
import { getEntityConfig, ENTITY_REGISTRY, getEntityList } from '../constants/entity-registry';

@Injectable({
  providedIn: 'root'
})
export class EntityConfigService {
  private authService = inject(AuthService);

  getConfig(entityName: string): EntityConfig | null {
    return getEntityConfig(entityName) || null;
  }

  // ✅ CORREGIDO: ENTITY_REGISTRY es un objeto, no un array
  getConfigs(): EntityConfig[] {
    return Object.values(ENTITY_REGISTRY);
  }

  // ✅ CORREGIDO: Usar Object.values() para filtrar
  getFilteredConfigs(): EntityConfig[] {
    const user = this.authService.currentUser();
    const roles = user?.roles || [];
    
    return Object.values(ENTITY_REGISTRY).filter((config: EntityConfig) => {
      if (!config.roles || config.roles.length === 0) return true;
      return config.roles.some((role: string) => roles.includes(role));
    });
  }

  getEntityList() {
    const user = this.authService.currentUser();
    const roles = user?.roles || [];
    return getEntityList(roles);
  }

  getEntityListGrouped() {
    const user = this.authService.currentUser();
    const roles = user?.roles || [];
    return getEntityListGrouped(roles);
  }

  getFields(entityName: string): EntityConfig['fields'] {
    const config = this.getConfig(entityName);
    return config?.fields || [];
  }

  getVisibleFields(entityName: string): EntityConfig['fields'] {
    const fields = this.getFields(entityName);
    return fields.filter((f: any) => !f.hidden);
  }

  getEditableFields(entityName: string): EntityConfig['fields'] {
    const fields = this.getFields(entityName);
    return fields.filter((f: any) => !f.readonly && !f.hidden);
  }
}