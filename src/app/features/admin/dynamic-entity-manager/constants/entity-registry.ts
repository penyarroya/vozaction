// // src/app/features/admin/dynamic-entity-manager/constants/entity-registry.ts

// import { EntityConfig } from '../models/entity-config';
// import { environment } from '../../../../../environments/environment';

// const API = `${environment.apiGateway}${environment.apiV1}`;

// export const ENTITY_REGISTRY: Record<string, EntityConfig> = {
//   // ============================================================
//   // USUARIOS
//   // ============================================================
//   UserEntity: {
//     entityName: 'UserEntity',
//     apiPath: `${API}/users`,
//     displayName: 'Usuarios',
//     displayField: 'username',
//     icon: '👤',
//     module: 'users',
//     roles: ['SUPER_ADMIN', 'ADMIN'],
//     fields: [
//       { key: 'id', label: 'ID', type: 'number', hidden: true },
//       { key: 'username', label: 'Usuario', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'email', label: 'Email', type: 'email', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'password', label: 'Contraseña', type: 'password', required: true, showOnCreate: true, showOnEdit: false, showInTable: false },
//       { key: 'firstName', label: 'Nombre', type: 'text', required: true, showOnCreate: true, showOnEdit: true, showInTable: true },
//       { key: 'lastName', label: 'Apellidos', type: 'text', required: true, showOnCreate: true, showOnEdit: true, showInTable: true },
//       { key: 'activo', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
//       { key: 'emailVerified', label: 'Email Verificado', type: 'boolean', readonly: true, showInTable: false },
//       { key: 'roles', label: 'Roles', type: 'text', readonly: true, showInTable: false },
//       { key: 'fechaAlta', label: 'Fecha Alta', type: 'date', readonly: true, showInTable: false },
//       { key: 'fechaActualizacion', label: 'Últ. Actualización', type: 'date', readonly: true, showInTable: false },
//     ],
//     tableSettings: {
//       pageSizeOptions: [5, 10, 25, 50, 100],
//       defaultPageSize: 10,
//       showSearch: true,
//       showActions: true
//     },
//     formSettings: {
//       columns: 2,
//       layout: 'grid'
//     }
//   },

//   // ============================================================
//   // ROLES
//   // ============================================================
//   RoleEntity: {
//     entityName: 'RoleEntity',
//     apiPath: `${API}/roles`,
//     displayName: 'Roles',
//     displayField: 'name',
//     icon: '🛡️',
//     module: 'users',
//     roles: ['SUPER_ADMIN'],
//     fields: [
//       { key: 'id', label: 'ID', type: 'number', hidden: true },
//       { key: 'name', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'isActive', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
//       { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
//     ],
//     tableSettings: {
//       pageSizeOptions: [5, 10, 25],
//       defaultPageSize: 5,
//       showSearch: true,
//       showActions: true
//     },
//     formSettings: {
//       columns: 1,
//       layout: 'stacked'
//     }
//   },

//   // ============================================================
//   // PERMISOS
//   // ============================================================
//   PermissionEntity: {
//     entityName: 'PermissionEntity',
//     apiPath: `${API}/permissions`,
//     displayName: 'Permisos',
//     displayField: 'name',
//     icon: '🔐',
//     module: 'users',
//     roles: ['SUPER_ADMIN'],
//     fields: [
//       { key: 'id', label: 'ID', type: 'number', hidden: true },
//       { key: 'name', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'resource', label: 'Recurso', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'action', label: 'Acción', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
//     ],
//     tableSettings: {
//       pageSizeOptions: [5, 10, 25],
//       defaultPageSize: 5,
//       showSearch: true,
//       showActions: true
//     },
//     formSettings: {
//       columns: 2,
//       layout: 'grid'
//     }
//   },

//   // ============================================================
//   // PERFILES DE USUARIO
//   // ============================================================
//   UserProfile: {
//     entityName: 'UserProfile',
//     apiPath: `${API}/profiles`,
//     displayName: 'Perfiles',
//     displayField: 'fullName',
//     icon: '📋',
//     module: 'users',
//     roles: ['SUPER_ADMIN', 'ADMIN'],
//     fields: [
//       { key: 'id', label: 'ID', type: 'number', hidden: true },
//       { key: 'userId', label: 'ID Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'firstName', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'lastName', label: 'Apellidos', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'phone', label: 'Teléfono', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
//       { key: 'bio', label: 'Biografía', type: 'textarea', showInTable: false, showOnCreate: true, showOnEdit: true },
//       { key: 'avatar', label: 'Avatar', type: 'text', showInTable: false, showOnCreate: true, showOnEdit: true },
//       { key: 'birthDate', label: 'Fecha Nacimiento', type: 'date', showInTable: false, showOnCreate: true, showOnEdit: true },
//       { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
//     ],
//     tableSettings: {
//       pageSizeOptions: [5, 10, 25, 50],
//       defaultPageSize: 10,
//       showSearch: true,
//       showActions: true
//     },
//     formSettings: {
//       columns: 2,
//       layout: 'grid'
//     }
//   },

//   // ... y así sucesivamente para las 23 entidades
// };

// // ============================================================
// // HELPERS
// // ============================================================

// export function getEntityConfig(entityName: string): EntityConfig | undefined {
//   return ENTITY_REGISTRY[entityName];
// }

// export function getEntityList(roles?: string[]): { label: string; value: string; icon: string }[] {
//   return Object.values(ENTITY_REGISTRY)
//     .filter(config => {
//       if (!roles || roles.length === 0) return true;
//       if (!config.roles || config.roles.length === 0) return true;
//       return config.roles.some(role => roles.includes(role));
//     })
//     .map(config => ({
//       label: config.displayName,
//       value: config.entityName,
//       icon: config.icon || '📄'
//     }));
// }

// export function getEntityListGrouped(roles?: string[]): { [key: string]: any[] } {
//   const groups: { [key: string]: any[] } = {};
  
//   Object.values(ENTITY_REGISTRY)
//     .filter(config => {
//       if (!roles || roles.length === 0) return true;
//       if (!config.roles || config.roles.length === 0) return true;
//       return config.roles.some(role => roles.includes(role));
//     })
//     .forEach(config => {
//       const moduleKey = config.module || 'otros';
//       if (!groups[moduleKey]) {
//         groups[moduleKey] = [];
//       }
//       groups[moduleKey].push({
//         label: config.displayName,
//         value: config.entityName,
//         icon: config.icon || '📄'
//       });
//     });
  
//   return groups;
// }










// src/app/features/admin/dynamic-entity-manager/constants/entity-registry.ts

import { EntityConfig } from '../models/entity-config';
import { environment } from '../../../../../environments/environment';

const API = `${environment.apiGateway}${environment.apiV1}`;

export const ENTITY_REGISTRY: Record<string, EntityConfig> = {
  // ============================================================
  // MÓDULO USUARIOS (7 entidades)
  // ============================================================
  
  UserEntity: {
    entityName: 'UserEntity',
    apiPath: `${API}/users`,
    displayName: 'Usuarios',
    displayField: 'username',
    icon: '👤',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'username', label: 'Usuario', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'email', label: 'Email', type: 'email', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'password', label: 'Contraseña', type: 'password', required: true, showOnCreate: true, showOnEdit: false, showInTable: false },
      { key: 'firstName', label: 'Nombre', type: 'text', required: true, showOnCreate: true, showOnEdit: true, showInTable: true },
      { key: 'lastName', label: 'Apellidos', type: 'text', required: true, showOnCreate: true, showOnEdit: true, showInTable: true },
      { key: 'activo', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'emailVerified', label: 'Email Verificado', type: 'boolean', readonly: true, showInTable: false },
      { key: 'roles', label: 'Roles', type: 'text', readonly: true, showInTable: false },
      { key: 'fechaAlta', label: 'Fecha Alta', type: 'date', readonly: true, showInTable: false },
      { key: 'fechaActualizacion', label: 'Últ. Actualización', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50, 100], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  RoleEntity: {
    entityName: 'RoleEntity',
    apiPath: `${API}/roles`,
    displayName: 'Roles',
    displayField: 'name',
    icon: '🛡️',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isActive', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25], defaultPageSize: 5, showSearch: true, showActions: true },
    formSettings: { columns: 1, layout: 'stacked' }
  },

  PermissionEntity: {
    entityName: 'PermissionEntity',
    apiPath: `${API}/permissions`,
    displayName: 'Permisos',
    displayField: 'name',
    icon: '🔐',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'resource', label: 'Recurso', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'action', label: 'Acción', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25], defaultPageSize: 5, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  UserProfile: {
    entityName: 'UserProfile',
    apiPath: `${API}/profiles`,
    displayName: 'Perfiles de Usuario',
    displayField: 'fullName',
    icon: '📋',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'userId', label: 'ID Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'firstName', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'lastName', label: 'Apellidos', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'phone', label: 'Teléfono', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'bio', label: 'Biografía', type: 'textarea', showInTable: false, showOnCreate: true, showOnEdit: true },
      { key: 'avatar', label: 'Avatar', type: 'text', showInTable: false, showOnCreate: true, showOnEdit: true },
      { key: 'birthDate', label: 'Fecha Nacimiento', type: 'date', showInTable: false, showOnCreate: true, showOnEdit: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  UserPreference: {
    entityName: 'UserPreference',
    apiPath: `${API}/users/preferences/all`,
    displayName: 'Preferencias',
    displayField: 'userId',
    icon: '⚙️',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'userId', label: 'ID Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'theme', label: 'Tema', type: 'select', options: [
        { label: 'Claro', value: 'LIGHT' },
        { label: 'Oscuro', value: 'DARK' },
        { label: 'Sistema', value: 'SYSTEM' }
      ], showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'lastPage', label: 'Última Página', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'defaultVoice', label: 'Voz', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'defaultSpeed', label: 'Velocidad', type: 'number', min: 0.5, max: 2, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'defaultLanguage', label: 'Idioma', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  UserSession: {
    entityName: 'UserSession',
    apiPath: `${API}/sessions`,
    displayName: 'Sesiones',
    displayField: 'sessionToken',
    icon: '🔄',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'userId', label: 'ID Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'sessionToken', label: 'Token', type: 'text', readonly: true, showInTable: true },
      { key: 'active', label: 'Activa', type: 'boolean', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'ipAddress', label: 'IP', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'deviceInfo', label: 'Dispositivo', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'expiresAt', label: 'Expira', type: 'date', readonly: true, showInTable: false },
      { key: 'createdAt', label: 'Creada', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  RefreshTokenEntity: {
    entityName: 'RefreshTokenEntity',
    apiPath: `${API}/refresh-tokens`,
    displayName: 'Refresh Tokens',
    displayField: 'token',
    icon: '🔑',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'userId', label: 'ID Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'token', label: 'Token', type: 'text', readonly: true, showInTable: true },
      { key: 'expiresAt', label: 'Expira', type: 'date', readonly: true, showInTable: false },
      { key: 'revoked', label: 'Revocado', type: 'boolean', readonly: true, showInTable: true },
      { key: 'expired', label: 'Expirado', type: 'boolean', readonly: true, showInTable: true },
      { key: 'used', label: 'Usado', type: 'boolean', readonly: true, showInTable: true },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  // ============================================================
  // MÓDULO UNIVERSILAB (16 entidades)
  // ============================================================

  InstitutionEntity: {
    entityName: 'InstitutionEntity',
    apiPath: '/api/universilab/institutions',
    displayName: 'Instituciones',
    displayField: 'name',
    icon: '🏛️',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'email', label: 'Email', type: 'email', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'phone', label: 'Teléfono', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'address', label: 'Dirección', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'website', label: 'Web', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isActive', label: 'Activa', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  CourseEntity: {
    entityName: 'CourseEntity',
    apiPath: `${API}/courses`,
    displayName: 'Cursos',
    displayField: 'title',
    icon: '📚',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'institutionId', label: 'Institución', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'estimatedHours', label: 'Horas Estimadas', type: 'number', min: 0, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isActive', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  CollectionEntity: {
    entityName: 'CollectionEntity',
    apiPath: `${API}/collections`,
    displayName: 'Colecciones',
    displayField: 'name',
    icon: '📁',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'courseId', label: 'Curso', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'order', label: 'Orden', type: 'number', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isActive', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  TopicEntity: {
    entityName: 'TopicEntity',
    apiPath: `${API}/topics`,
    displayName: 'Temas',
    displayField: 'title',
    icon: '📖',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'collectionId', label: 'Colección', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'order', label: 'Orden', type: 'number', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isActive', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  SubtopicEntity: {
    entityName: 'SubtopicEntity',
    apiPath: `${API}/subtopics`,
    displayName: 'Subtemas',
    displayField: 'title',
    icon: '📄',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'content', label: 'Contenido', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'topicId', label: 'Tema', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'order', label: 'Orden', type: 'number', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isActive', label: 'Activo', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  PageEntity: {
    entityName: 'PageEntity',
    apiPath: `${API}/pages`,
    displayName: 'Páginas',
    displayField: 'title',
    icon: '📝',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'content', label: 'Contenido', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'subtopicId', label: 'Subtema', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'order', label: 'Orden', type: 'number', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isPublished', label: 'Publicada', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  ResourceEntity: {
    entityName: 'ResourceEntity',
    apiPath: `${API}/resources`,
    displayName: 'Recursos',
    displayField: 'title',
    icon: '📎',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'type', label: 'Tipo', type: 'select', options: [
        { label: 'Video', value: 'VIDEO' },
        { label: 'PDF', value: 'PDF' },
        { label: 'Imagen', value: 'IMAGE' },
        { label: 'Enlace', value: 'LINK' },
        { label: 'Documento', value: 'DOCUMENT' }
      ], showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'url', label: 'URL', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'pageId', label: 'Página', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  CommentEntity: {
    entityName: 'CommentEntity',
    apiPath: `${API}/comments`,
    displayName: 'Comentarios',
    displayField: 'content',
    icon: '💬',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'content', label: 'Contenido', type: 'textarea', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'userId', label: 'Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'pageId', label: 'Página', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'parentId', label: 'Comentario Padre', type: 'number', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isApproved', label: 'Aprobado', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  ContributionEntity: {
    entityName: 'ContributionEntity',
    apiPath: `${API}/contributions`,
    displayName: 'Contribuciones',
    displayField: 'title',
    icon: '🤝',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'userId', label: 'Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'pageId', label: 'Página', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'status', label: 'Estado', type: 'select', options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Aprobado', value: 'APPROVED' },
        { label: 'Rechazado', value: 'REJECTED' }
      ], showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  EnrollmentEntity: {
    entityName: 'EnrollmentEntity',
    apiPath: `${API}/enrollments`,
    displayName: 'Inscripciones',
    displayField: 'id',
    icon: '📋',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'userId', label: 'Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'courseId', label: 'Curso', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'status', label: 'Estado', type: 'select', options: [
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Completado', value: 'COMPLETED' },
        { label: 'Cancelado', value: 'CANCELLED' }
      ], showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'progress', label: 'Progreso', type: 'number', min: 0, max: 100, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'enrolledAt', label: 'Inscrito', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  BadgeEntity: {
    entityName: 'BadgeEntity',
    apiPath: `${API}/badges`,
    displayName: 'Insignias',
    displayField: 'name',
    icon: '🏅',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'description', label: 'Descripción', type: 'textarea', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'icon', label: 'Icono', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'criteria', label: 'Criterios', type: 'json', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'isActive', label: 'Activa', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  UserBadgeEntity: {
    entityName: 'UserBadgeEntity',
    apiPath: `${API}/user-badges`,
    displayName: 'Insignias Usuario',
    displayField: 'id',
    icon: '⭐',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'userId', label: 'Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'badgeId', label: 'Insignia', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'earnedAt', label: 'Obtenida', type: 'date', readonly: true, showInTable: false },
      { key: 'progress', label: 'Progreso', type: 'number', min: 0, max: 100, showInTable: true, showOnCreate: true, showOnEdit: true },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  UserProgressEntity: {
    entityName: 'UserProgressEntity',
    apiPath: `${API}/user-progress`,
    displayName: 'Progreso Usuario',
    displayField: 'id',
    icon: '📊',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'userId', label: 'Usuario', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'pageId', label: 'Página', type: 'number', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'completed', label: 'Completado', type: 'boolean', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'timeSpent', label: 'Tiempo (min)', type: 'number', min: 0, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'lastAccessed', label: 'Último Acceso', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  AudioCacheEntity: {
    entityName: 'AudioCacheEntity',
    apiPath: `${API}/audio-cache`,
    displayName: 'Caché Audio',
    displayField: 'id',
    icon: '🎵',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'text', label: 'Texto', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'voice', label: 'Voz', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'speed', label: 'Velocidad', type: 'number', min: 0.5, max: 2, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'language', label: 'Idioma', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'audioUrl', label: 'URL Audio', type: 'text', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  PendingSpellingCorrection: {
    entityName: 'PendingSpellingCorrection',
    apiPath: `${API}/pending-corrections`,
    displayName: 'Correcciones Pendientes',
    displayField: 'wrongWord',
    icon: '⏳',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'wrongWord', label: 'Palabra Incorrecta', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'suggestions', label: 'Sugerencias', type: 'json', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'userId', label: 'Usuario', type: 'number', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'status', label: 'Estado', type: 'select', options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Aprobado', value: 'APPROVED' },
        { label: 'Rechazado', value: 'REJECTED' }
      ], showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  },

  SpellingCorrection: {
    entityName: 'SpellingCorrection',
    apiPath: `${API}/spelling-corrections`,
    displayName: 'Correcciones Ortográficas',
    displayField: 'wrongWord',
    icon: '✏️',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],
    fields: [
      { key: 'id', label: 'ID', type: 'number', hidden: true },
      { key: 'wrongWord', label: 'Palabra Incorrecta', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'correctWord', label: 'Palabra Correcta', type: 'text', required: true, showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'userId', label: 'Usuario', type: 'number', showInTable: true, showOnCreate: true, showOnEdit: true },
      { key: 'approved', label: 'Aprobada', type: 'boolean', showOnCreate: false, showOnEdit: true, showInTable: true },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true, showInTable: false },
    ],
    tableSettings: { pageSizeOptions: [5, 10, 25, 50], defaultPageSize: 10, showSearch: true, showActions: true },
    formSettings: { columns: 2, layout: 'grid' }
  }
};

// ============================================================
// HELPERS
// ============================================================

export function getEntityConfig(entityName: string): EntityConfig | undefined {
  return ENTITY_REGISTRY[entityName];
}

export function getEntityList(roles?: string[]): { label: string; value: string; icon: string }[] {
  return Object.values(ENTITY_REGISTRY)
    .filter(config => {
      if (!roles || roles.length === 0) return true;
      if (!config.roles || config.roles.length === 0) return true;
      return config.roles.some(role => roles.includes(role));
    })
    .map(config => ({
      label: config.displayName,
      value: config.entityName,
      icon: config.icon || '📄'
    }));
}