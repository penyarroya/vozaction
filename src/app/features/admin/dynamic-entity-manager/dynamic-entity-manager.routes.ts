// src/app/features/admin/dynamic-entity-manager/dynamic-entity-manager.routes.ts

import { Routes } from '@angular/router';
import { DynamicEntityManagerComponent } from './dynamic-entity-manager.component';

export const routes: Routes = [
  {
    path: ':entity',
    component: DynamicEntityManagerComponent
  },
  {
    path: '',
    redirectTo: 'UserEntity',
    pathMatch: 'full'
  }
];