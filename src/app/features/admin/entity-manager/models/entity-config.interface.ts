// src/app/core/models/entity-config.interface.ts

export interface EntityField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date' | 'boolean' | 'json' | 'password' | 'relation';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: { label: string; value: any }[];
  hidden?: boolean;
  readonly?: boolean;
  placeholder?: string;
  // Para relaciones
  relationEntity?: string;
  relationDisplayField?: string;
}

export interface EntityConfig {
  entityName: string;
  apiPath: string;
  displayName: string;
  displayField: string;
  icon?: string;
  description?: string;
  module?: string;
  // ✅ NUEVA PROPIEDAD
  roles?: string[];  // 👈 Roles que pueden acceder a esta entidad
  permissions?: {
    view: string;
    create: string;
    edit: string;
    delete: string;
  };
  fields: EntityField[];
}