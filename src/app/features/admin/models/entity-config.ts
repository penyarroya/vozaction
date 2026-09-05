// src/app/features/admin/dynamic-entity-manager/models/entity-config.ts

export interface EntityField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'boolean' | 'date' | 'textarea' | 'select' | 'json';
  required?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  options?: { label: string; value: any }[];
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  // ✅ Control de visibilidad por modo
  showOnCreate?: boolean;
  showOnEdit?: boolean;
  // ✅ Para la tabla
  showInTable?: boolean;
}

export interface EntityConfig {
  entityName: string;
  apiPath: string;
  displayName: string;
  displayField: string;
  icon?: string;
  module?: string;
  roles?: string[];
  fields: EntityField[];
  tableSettings?: {
    pageSizeOptions?: number[];
    defaultPageSize?: number;
    showSearch?: boolean;
    showActions?: boolean;
  };
  formSettings?: {
    columns?: number;
    layout?: 'grid' | 'stacked';
  };
}