// src/app/core/constants/entity-registry.ts

import { environment } from "../../../../../environments/environment.development";
import { EntityConfig } from "../models/entity-config.interface";

const API = `${environment.apiGateway}${environment.apiV1}`;

/**
 * REGISTRO CENTRAL - TODAS LAS 23 ENTIDADES
 */
export const ENTITY_REGISTRY: EntityConfig[] = [
  // ============================================================
  // ✅ MÓDULO USUARIOS - NUEVO ORDEN
  // ============================================================
  {
    entityName: 'UserEntity',
    apiPath: `${API}/users`,
    displayName: 'Usuarios',
    displayField: 'username',
    icon: '👤',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'],  // 👈 AÑADIR USER para que pueda ver la tabla
    permissions: {
      view: 'users:view',
      create: 'users:create',
      edit: 'users:edit',
      delete: 'users:delete'
    },
    fields: [
      // 🔑 ID - OCULTO
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      
      // 📝 CAMPOS PRINCIPALES - TODOS VISIBLES
      { key: 'username', label: 'Usuario', type: 'text', required: true, maxLength: 40 },
      { key: 'email', label: 'Email', type: 'email', required: true, maxLength: 150 },
      { key: 'activo', label: 'Activo', type: 'boolean' },
      { key: 'emailVerified', label: 'Email Verificado', type: 'boolean' },
      
      // 👇 NUEVO: Mostrar roles como texto
      { key: 'roles', label: 'Roles', type: 'text' },
      
      // 📅 FECHAS COMPLETAS (con hora)
      { key: 'fechaAlta', label: 'Fecha Alta', type: 'date', readonly: true },
      { key: 'fechaActualizacion', label: 'Última Actualización', type: 'date', readonly: true },
      
      // 🔧 CAMPOS ADICIONALES QUE PODRÍAS QUERER MOSTRAR
      // { key: 'provider', label: 'Proveedor', type: 'text', readonly: true },
      // { key: 'providerId', label: 'ID Proveedor', type: 'text', readonly: true },
      // { key: 'version', label: 'Versión', type: 'number', readonly: true },
      
      // ⚠️ CAMPOS SENSIBLES - OCULTOS
      { key: 'password', label: 'Contraseña', type: 'password', hidden: true },
      { key: 'verificationCode', label: 'Código Verificación', type: 'text', hidden: true },
      { key: 'verificationCodeExpiry', label: 'Expiración Código', type: 'date', hidden: true },
      { key: 'passwordResetToken', label: 'Token Reset', type: 'text', hidden: true },
      { key: 'passwordResetTokenExpiry', label: 'Expiración Token', type: 'date', hidden: true },
      { key: 'passwordResetConfirmed', label: 'Reset Confirmado', type: 'boolean', hidden: true },
      { key: 'passwordResetCode', label: 'Código Reset', type: 'text', hidden: true },
      { key: 'passwordResetCodeExpiry', label: 'Expiración Código Reset', type: 'date', hidden: true },
    ]
  },
  {
    entityName: 'RoleEntity',        // ✅ 2️⃣ Roles
    apiPath: `${API}/roles`,
    displayName: 'Roles',
    displayField: 'name',
    icon: '🛡️',
    module: 'users',
    roles: ['SUPER_ADMIN'],          // 👈 SOLO SUPER_ADMIN
    permissions: {
      view: 'roles:view',
      create: 'roles:create',
      edit: 'roles:edit',
      delete: 'roles:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 50 },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'isActive', label: 'Activo', type: 'boolean' },
    ]
  },
  {
    entityName: 'PermissionEntity',  // ✅ 3️⃣ Permisos
    apiPath: `${API}/permissions`,
    displayName: 'Permisos',
    displayField: 'name',
    icon: '🔐',
    module: 'users',
    roles: ['SUPER_ADMIN'],          // 👈 SOLO SUPER_ADMIN
    permissions: {
      view: 'permissions:view',
      create: 'permissions:create',
      edit: 'permissions:edit',
      delete: 'permissions:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
      { key: 'resource', label: 'Recurso', type: 'text', required: true },
      { key: 'action', label: 'Acción', type: 'text', required: true },
      { key: 'description', label: 'Descripción', type: 'textarea' },
    ]
  },
  {
    entityName: 'UserProfile',       // ✅ 4️⃣ Perfiles
    apiPath: `${API}/profiles/entity-manager`,
    displayName: 'Perfiles',
    displayField: 'fullName',
    icon: '📋',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN'], // 👈 SOLO para estos roles
    permissions: {
      view: 'profiles:view',
      create: 'profiles:create',
      edit: 'profiles:edit',
      delete: 'profiles:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true, 
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'fullName', label: 'Nombre Completo', type: 'text', required: true, maxLength: 200 },
      { key: 'bio', label: 'Biografía', type: 'textarea' },
      { key: 'avatar', label: 'Avatar URL', type: 'text' },
      { key: 'birthDate', label: 'Fecha Nacimiento', type: 'date' },
      { key: 'phone', label: 'Teléfono', type: 'text', maxLength: 20 },
    ]
  },
  {
    entityName: 'UserPreference',    // ✅ 5️⃣ Preferencias
    apiPath: `${API}/user-preferences`,
    displayName: 'Preferencias',
    displayField: 'userId',
    icon: '⚙️',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN', 'USER'], // 👈 Todos los roles
    permissions: {
      view: 'preferences:view',
      create: 'preferences:create',
      edit: 'preferences:edit',
      delete: 'preferences:delete'
    },
    fields: [
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'theme', label: 'Tema', type: 'select', options: [
        { label: 'Claro', value: 'LIGHT' },
        { label: 'Oscuro', value: 'DARK' },
        { label: 'Sistema', value: 'SYSTEM' }
      ]},
      { key: 'lastPage', label: 'Última Página', type: 'text' },
      { key: 'selectedInstitutionId', label: 'Institución', type: 'relation',
        relationEntity: 'Institution', relationDisplayField: 'name' },
      { key: 'defaultVoice', label: 'Voz', type: 'text' },
      { key: 'defaultSpeed', label: 'Velocidad', type: 'number', min: 0.5, max: 2 },
      { key: 'defaultLanguage', label: 'Idioma', type: 'text' },
    ]
  },
  {
    entityName: 'UserSession',       // ✅ 6️⃣ Sesiones
    apiPath: `${API}/sessions`,
    displayName: 'Sesiones',
    displayField: 'sessionToken',
    icon: '🔄',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN'], // 👈 SOLO para estos roles
    permissions: {
      view: 'sessions:view',
      create: 'sessions:create',
      edit: 'sessions:edit',
      delete: 'sessions:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'sessionToken', label: 'Token', type: 'text', readonly: true },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'active', label: 'Activa', type: 'boolean' },
      { key: 'ipAddress', label: 'IP', type: 'text' },
      { key: 'deviceInfo', label: 'Dispositivo', type: 'text' },
      { key: 'expiresAt', label: 'Expira', type: 'date', readonly: true },
      { key: 'createdAt', label: 'Creada', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'RefreshTokenEntity', // ✅ 7️⃣ Refresh Tokens
    apiPath: `${API}/refresh-tokens`,
    displayName: 'Refresh Tokens',
    displayField: 'token',
    icon: '🔑',
    module: 'users',
    roles: ['SUPER_ADMIN', 'ADMIN'], // 👈 SOLO para estos roles
    permissions: {
      view: 'tokens:view',
      create: 'tokens:create',
      edit: 'tokens:edit',
      delete: 'tokens:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'token', label: 'Token', type: 'text', readonly: true },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'expiresAt', label: 'Expira', type: 'date', readonly: true },
      { key: 'revoked', label: 'Revocado', type: 'boolean', readonly: true },
      { key: 'expired', label: 'Expirado', type: 'boolean', readonly: true },
      { key: 'used', label: 'Usado', type: 'boolean', readonly: true },
    ]
  },

  // ============================================================
  // MÓDULO VOZ (3)
  // ============================================================
  {
    entityName: 'AudioCacheEntity',
    apiPath: `${API}/audio-cache`,
    displayName: 'Caché Audio',
    displayField: 'id',
    icon: '🎵',
    module: 'voice',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'audio:view',
      create: 'audio:create',
      edit: 'audio:edit',
      delete: 'audio:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'text', label: 'Texto', type: 'text', required: true },
      { key: 'voice', label: 'Voz', type: 'text', required: true },
      { key: 'speed', label: 'Velocidad', type: 'number' },
      { key: 'language', label: 'Idioma', type: 'text' },
      { key: 'audioUrl', label: 'URL Audio', type: 'text' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'PendingSpellingCorrection',
    apiPath: `${API}/pending-corrections`,
    displayName: 'Correcciones Pendientes',
    displayField: 'wrongWord',
    icon: '⏳',
    module: 'voice',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'pending:view',
      create: 'pending:create',
      edit: 'pending:edit',
      delete: 'pending:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'wrongWord', label: 'Palabra Incorrecta', type: 'text', required: true },
      { key: 'suggestions', label: 'Sugerencias', type: 'json' },
      { key: 'userId', label: 'Usuario', type: 'relation',
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'status', label: 'Estado', type: 'select', options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Aprobado', value: 'APPROVED' },
        { label: 'Rechazado', value: 'REJECTED' },
      ]},
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'SpellingCorrection',
    apiPath: `${API}/spelling-corrections`,
    displayName: 'Correcciones',
    displayField: 'wrongWord',
    icon: '✏️',
    module: 'voice',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'corrections:view',
      create: 'corrections:create',
      edit: 'corrections:edit',
      delete: 'corrections:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'wrongWord', label: 'Palabra Incorrecta', type: 'text', required: true, maxLength: 100 },
      { key: 'correctWord', label: 'Palabra Correcta', type: 'text', required: true, maxLength: 100 },
      { key: 'userId', label: 'Usuario', type: 'relation',
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'approved', label: 'Aprobada', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },

  // ============================================================
  // MÓDULO UNIVERSILAB (13)
  // ============================================================
  {
    entityName: 'Institution',
    apiPath: `${API}/institutions`,
    displayName: 'Instituciones',
    displayField: 'name',
    icon: '🏛️',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'institutions:view',
      create: 'institutions:create',
      edit: 'institutions:edit',
      delete: 'institutions:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
      { key: 'email', label: 'Email', type: 'email', required: true, maxLength: 100 },
      { key: 'website', label: 'Web', type: 'text', maxLength: 200 },
      { key: 'phone', label: 'Teléfono', type: 'text', maxLength: 20 },
      { key: 'address', label: 'Dirección', type: 'textarea' },
      { key: 'isActive', label: 'Activa', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Course',
    apiPath: `${API}/courses`,
    displayName: 'Cursos',
    displayField: 'title',
    icon: '📚',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'courses:view',
      create: 'courses:create',
      edit: 'courses:edit',
      delete: 'courses:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, maxLength: 200 },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'institutionId', label: 'Institución', type: 'relation', required: true,
        relationEntity: 'Institution', relationDisplayField: 'name' },
      { key: 'estimatedHours', label: 'Horas', type: 'number', min: 0 },
      { key: 'isActive', label: 'Activo', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Collection',
    apiPath: `${API}/collections`,
    displayName: 'Colecciones',
    displayField: 'name',
    icon: '📁',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'collections:view',
      create: 'collections:create',
      edit: 'collections:edit',
      delete: 'collections:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'courseId', label: 'Curso', type: 'relation', required: true,
        relationEntity: 'Course', relationDisplayField: 'title' },
      { key: 'order', label: 'Orden', type: 'number' },
      { key: 'isActive', label: 'Activo', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Topic',
    apiPath: `${API}/topics`,
    displayName: 'Temas',
    displayField: 'title',
    icon: '📖',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'topics:view',
      create: 'topics:create',
      edit: 'topics:edit',
      delete: 'topics:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, maxLength: 200 },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'collectionId', label: 'Colección', type: 'relation', required: true,
        relationEntity: 'Collection', relationDisplayField: 'name' },
      { key: 'order', label: 'Orden', type: 'number' },
      { key: 'isActive', label: 'Activo', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Subtopic',
    apiPath: `${API}/subtopics`,
    displayName: 'Subtemas',
    displayField: 'title',
    icon: '📄',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'subtopics:view',
      create: 'subtopics:create',
      edit: 'subtopics:edit',
      delete: 'subtopics:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, maxLength: 200 },
      { key: 'content', label: 'Contenido', type: 'textarea' },
      { key: 'topicId', label: 'Tema', type: 'relation', required: true,
        relationEntity: 'Topic', relationDisplayField: 'title' },
      { key: 'order', label: 'Orden', type: 'number' },
      { key: 'isActive', label: 'Activo', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Page',
    apiPath: `${API}/pages`,
    displayName: 'Páginas',
    displayField: 'title',
    icon: '📝',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'pages:view',
      create: 'pages:create',
      edit: 'pages:edit',
      delete: 'pages:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, maxLength: 200 },
      { key: 'content', label: 'Contenido', type: 'textarea' },
      { key: 'subtopicId', label: 'Subtema', type: 'relation', required: true,
        relationEntity: 'Subtopic', relationDisplayField: 'title' },
      { key: 'order', label: 'Orden', type: 'number' },
      { key: 'isPublished', label: 'Publicada', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Resource',
    apiPath: `${API}/resources`,
    displayName: 'Recursos',
    displayField: 'title',
    icon: '📎',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'resources:view',
      create: 'resources:create',
      edit: 'resources:edit',
      delete: 'resources:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, maxLength: 200 },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: [
        { label: 'Video', value: 'VIDEO' },
        { label: 'PDF', value: 'PDF' },
        { label: 'Imagen', value: 'IMAGE' },
        { label: 'Enlace', value: 'LINK' },
      ]},
      { key: 'url', label: 'URL', type: 'text', required: true },
      { key: 'pageId', label: 'Página', type: 'relation', required: true,
        relationEntity: 'Page', relationDisplayField: 'title' },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Comment',
    apiPath: `${API}/comments`,
    displayName: 'Comentarios',
    displayField: 'content',
    icon: '💬',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'comments:view',
      create: 'comments:create',
      edit: 'comments:edit',
      delete: 'comments:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'content', label: 'Contenido', type: 'textarea', required: true },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'pageId', label: 'Página', type: 'relation', required: true,
        relationEntity: 'Page', relationDisplayField: 'title' },
      { key: 'parentId', label: 'Comentario Padre', type: 'relation',
        relationEntity: 'Comment', relationDisplayField: 'content' },
      { key: 'isApproved', label: 'Aprobado', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Contribution',
    apiPath: `${API}/contributions`,
    displayName: 'Contribuciones',
    displayField: 'title',
    icon: '🤝',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'contributions:view',
      create: 'contributions:create',
      edit: 'contributions:edit',
      delete: 'contributions:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'title', label: 'Título', type: 'text', required: true, maxLength: 200 },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'pageId', label: 'Página', type: 'relation', required: true,
        relationEntity: 'Page', relationDisplayField: 'title' },
      { key: 'status', label: 'Estado', type: 'select', options: [
        { label: 'Pendiente', value: 'PENDING' },
        { label: 'Aprobada', value: 'APPROVED' },
        { label: 'Rechazada', value: 'REJECTED' },
      ]},
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Enrollment',
    apiPath: `${API}/enrollments`,
    displayName: 'Inscripciones',
    displayField: 'id',
    icon: '📋',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'enrollments:view',
      create: 'enrollments:create',
      edit: 'enrollments:edit',
      delete: 'enrollments:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'courseId', label: 'Curso', type: 'relation', required: true,
        relationEntity: 'Course', relationDisplayField: 'title' },
      { key: 'status', label: 'Estado', type: 'select', options: [
        { label: 'Activo', value: 'ACTIVE' },
        { label: 'Completado', value: 'COMPLETED' },
        { label: 'Cancelado', value: 'CANCELLED' },
      ]},
      { key: 'progress', label: 'Progreso', type: 'number', min: 0, max: 100 },
      { key: 'enrolledAt', label: 'Inscrito', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'Badge',
    apiPath: `${API}/badges`,
    displayName: 'Insignias',
    displayField: 'name',
    icon: '🏅',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'badges:view',
      create: 'badges:create',
      edit: 'badges:edit',
      delete: 'badges:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 100 },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'icon', label: 'Icono', type: 'text' },
      { key: 'criteria', label: 'Criterios', type: 'json' },
      { key: 'isActive', label: 'Activa', type: 'boolean' },
      { key: 'createdAt', label: 'Creado', type: 'date', readonly: true },
    ]
  },
  {
    entityName: 'UserBadge',
    apiPath: `${API}/user-badges`,
    displayName: 'Insignias Usuario',
    displayField: 'id',
    icon: '⭐',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'userBadges:view',
      create: 'userBadges:create',
      edit: 'userBadges:edit',
      delete: 'userBadges:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'badgeId', label: 'Insignia', type: 'relation', required: true,
        relationEntity: 'Badge', relationDisplayField: 'name' },
      { key: 'earnedAt', label: 'Obtenida', type: 'date', readonly: true },
      { key: 'progress', label: 'Progreso', type: 'number', min: 0, max: 100 },
    ]
  },
  {
    entityName: 'UserProgress',
    apiPath: `${API}/user-progress`,
    displayName: 'Progreso Usuario',
    displayField: 'id',
    icon: '📊',
    module: 'universilab',
    roles: ['SUPER_ADMIN', 'ADMIN'],
    permissions: {
      view: 'progress:view',
      create: 'progress:create',
      edit: 'progress:edit',
      delete: 'progress:delete'
    },
    fields: [
      { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
      { key: 'userId', label: 'Usuario', type: 'relation', required: true,
        relationEntity: 'UserEntity', relationDisplayField: 'username' },
      { key: 'pageId', label: 'Página', type: 'relation', required: true,
        relationEntity: 'Page', relationDisplayField: 'title' },
      { key: 'completed', label: 'Completado', type: 'boolean' },
      { key: 'timeSpent', label: 'Tiempo (min)', type: 'number', min: 0 },
      { key: 'lastAccessed', label: 'Último Acceso', type: 'date', readonly: true },
    ]
  },
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Obtiene la configuración de una entidad por su nombre
 */
export function getEntityConfig(entityName: string): EntityConfig | undefined {
  return ENTITY_REGISTRY.find(e => e.entityName === entityName);
}

/**
 * Obtiene la lista de entidades para el sidebar (filtrada por rol)
 */
export function getEntityList(userRoles?: string[]) {
  let entities = ENTITY_REGISTRY;
  
  // ✅ Filtrar por rol si se proporciona
  if (userRoles && userRoles.length > 0) {
    entities = entities.filter(config => {
      // Si no tiene roles definidos, visible para todos
      if (!config.roles || config.roles.length === 0) return true;
      // Verificar si el usuario tiene alguno de los roles permitidos
      return config.roles.some(role => userRoles.includes(role));
    });
  }
  
  return entities.map(config => ({
    label: config.displayName,
    value: config.entityName,
    icon: config.icon || '📄',
    module: config.module,
    roles: config.roles || []
  }));
}

/**
 * Obtiene entidades agrupadas por módulo (filtrada por rol)
 */
// src/app/core/constants/entity-registry.ts

/**
 * Obtiene entidades agrupadas por módulo (filtrada por rol)
 */
export function getEntityListGrouped(userRoles?: string[]) {
  const groups: { [key: string]: any[] } = {};
  
  let entities = ENTITY_REGISTRY;
  
  // Filtrar por rol si se proporciona
  if (userRoles && userRoles.length > 0) {
    entities = entities.filter(config => {
      if (!config.roles || config.roles.length === 0) return true;
      return config.roles.some(role => userRoles.includes(role));
    });
  }
  
  entities.forEach(config => {
    // ✅ Usar 'otros' como fallback si module es undefined
    const moduleKey = config.module || 'otros';
    
    if (!groups[moduleKey]) {
      groups[moduleKey] = [];
    }
    groups[moduleKey].push({
      label: config.displayName,
      value: config.entityName,
      icon: config.icon || '📄',
      roles: config.roles || []
    });
  });
  
  return groups;
}