// import { Routes } from '@angular/router';
// import { authGuard } from './core/guards/auth.guard';
// import { guestGuard } from './core/guards/guest.guard';
// import { NotFoundComponent } from './features/pages/staticas/not-found/not-found.component';
// import { HomeComponent } from './features/pages/public/home/home.component';

// export const routes: Routes = [
//   // =========================================================================
//   // RUTAS PÚBLICAS (sin autenticación)
//   // =========================================================================
//   {
//     path: 'home',
//     component: HomeComponent,
//     title: 'VozAcción - El universo de la palabra',
//     data: { showTheme: false }
//   },
//   {
//     path: 'welcome',
//     loadComponent: () => import('./features/pages/public/welcome/welcome.component').then(m => m.WelcomeComponent),
//     title: 'Bienvenido - VozAcction',
//     data: { showTheme: false }
//     // 👈 Sin guard: accesible para todos
//   },
//   {
//     path: 'server-down',
//     loadComponent: () => import('./features/pages/staticas/maintenance/maintenance.component').then(m => m.MaintenanceComponent),
//     title: 'Servidor no disponible - VozAcction',
//     data: { showTheme: false }
//     // 👈 Sin guard: accesible para todos (página de error)
//   },
//   {
//     path: 'about',
//     loadComponent: () => import('./features/pages/staticas/about/about.component').then(m => m.AboutComponent),
//     title: 'Acerca de - VozAcction',
//     data: { showTheme: false }
//     // 👈 Sin guard: accesible para todos
//   },

//   // =========================================================================
//   // RUTAS PÚBLICAS (solo para NO autenticados)
//   // =========================================================================
//   {
//     path: 'login',
//     loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
//     canActivate: [guestGuard], // 👈 SOLO si NO estás autenticado
//     title: 'Iniciar Sesión - VozAcction',
//     data: { showTheme: true }
//   },
//   {
//     path: 'register',
//     loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
//     canActivate: [guestGuard], // 👈 SOLO si NO estás autenticado
//     title: 'Registro - VozAcction',
//     data: { showTheme: false }
//   },
//   {
//     path: 'forgot-password',
//     loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
//     canActivate: [guestGuard], // 👈 SOLO si NO estás autenticado
//     title: 'Recuperar Contraseña - VozAcction',
//     data: { showTheme: false }
//   },

//   // =========================================================================
//   // RUTAS PRIVADAS (requieren autenticación)
//   // =========================================================================
//   {
//     path: 'dashboard',
//     loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
//     canActivate: [authGuard], // 👈 SOLO si ESTÁS autenticado
//     title: 'Panel de Control - VozAcction',
//     data: { showTheme: true }
//   },
//   // {
//   //   path: 'profile',
//   //   loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
//   //   canActivate: [authGuard], // 👈 SOLO si ESTÁS autenticado
//   //   title: 'Perfil - VozAcction',
//   //   data: { showTheme: true }
//   // },

//   // =========================================================================
//   // REDIRECCIONES
//   // =========================================================================
//   {
//     path: '',
//     redirectTo: 'welcome',
//     pathMatch: 'full'
//   },
//   { 
//     path: '404', 
//     component: NotFoundComponent,
//     data: { showTheme: false }  
//     // Al no tener data, será false automáticamente
//   }, 
//   { 
//     path: '**', 
//     redirectTo: '404' 
//   }
// ];









// // src/app/app.routes.ts
// import { Routes } from '@angular/router';
// import { authGuard } from './core/guards/auth.guard';
// import { guestGuard } from './core/guards/guest.guard';
// import { NotFoundComponent } from './features/pages/staticas/not-found/not-found.component';

// export const routes: Routes = [
//   // =========================================================================
//   // RUTAS PÚBLICAS (sin autenticación)
//   // =========================================================================
//   {
//     path: 'welcome',
//     loadComponent: () => import('./features/pages/public/welcome/welcome.component').then(m => m.WelcomeComponent),
//     title: 'Bienvenido - VozAcction',
//     data: { showTheme: false }
//   },
//   {
//     path: 'about',
//     loadComponent: () => import('./features/pages/staticas/about/about.component').then(m => m.AboutComponent),
//     title: 'Acerca de - VozAcction',
//     data: { showTheme: false }
//   },
//   {
//     path: 'server-down',
//     loadComponent: () => import('./features/pages/staticas/maintenance/maintenance.component').then(m => m.MaintenanceComponent),
//     title: 'Servidor no disponible - VozAcction',
//     data: { showTheme: false }
//   },

//   // =========================================================================
//   // RUTAS PÚBLICAS (solo para NO autenticados)
//   // =========================================================================
//   {
//     path: 'login',
//     loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
//     canActivate: [guestGuard],
//     title: 'Iniciar Sesión - VozAcction',
//     data: { showTheme: true }
//   },
//   {
//     path: 'register',
//     loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
//     canActivate: [guestGuard],
//     title: 'Registro - VozAcction',
//     data: { showTheme: false }
//   },
//   {
//     path: 'forgot-password',
//     loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
//     canActivate: [guestGuard],
//     title: 'Recuperar Contraseña - VozAcction',
//     data: { showTheme: false }
//   },
//   // {
//   //   path: 'dashboard',
//   //   loadComponent: () => import('./features/pages/public/dashboard/dashboard.component').then(m => m.DashboardComponent),
//   //   canActivate: [authGuard],   // ✅ REQUIERE AUTENTICACIÓN
//   //   title: 'Panel de Control - VozAcction',
//   //   data: { showTheme: false }
//   // },
//   {
//     path: 'dashboard-v2',
//     loadComponent: () => import('./features/pages/public/dashboard-v2/dashboard-v2.component').then(m => m.DashboardV2Component),
//     canActivate: [authGuard],  // ← AÑADIR
//     title: 'Panel de Control - VozAcction',
//     data: { showTheme: false }
//   },
//   {
//     path: 'entity',
//     loadComponent: () => import('./features/admin/entity-manager/entity-manager.component').then(m => m.EntityManagerComponent),
//     //canActivate: [authGuard],  
//     title: 'Panel de Control - VozAcction',
//     data: { showTheme: false }
//   },
//   {
//     path: 'dynamic-entity/:entity',
//     loadComponent: () => import('./features/admin/dynamic-entity-manager/dynamic-entity-manager.component')
//       .then(m => m.DynamicEntityManagerComponent),
//     title: 'Gestión Dinámica de Entidades - VozAcction',
//     data: { showTheme: false }
//   },
//   // =========================================================================
//   // REDIRECCIONES
//   // =========================================================================
//   {
//     path: '',
//     redirectTo: 'welcome', // ← Landing page pública
//     pathMatch: 'full'
//   },
//   { 
//     path: '404', 
//     component: NotFoundComponent,
//     data: { showTheme: false }  
//   }, 
//   { 
//     path: '**', 
//     redirectTo: '404' 
//   }
// ];











// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { NotFoundComponent } from './features/pages/staticas/not-found/not-found.component';
import { DynamicEntityManagerComponent } from './features/admin/dynamic-entity-manager/dynamic-entity-manager.component';

export const routes: Routes = [
  // =========================================================================
  // RUTAS PÚBLICAS (sin autenticación)
  // =========================================================================
  {
    path: 'welcome',
    loadComponent: () => import('./features/pages/public/welcome/welcome.component').then(m => m.WelcomeComponent),
    title: 'Bienvenido - VozAcction',
    data: { showTheme: false }
  },
  {
    path: 'about',
    loadComponent: () => import('./features/pages/staticas/about/about.component').then(m => m.AboutComponent),
    title: 'Acerca de - VozAcction',
    data: { showTheme: false }
  },
  {
    path: 'server-down',
    loadComponent: () => import('./features/pages/staticas/maintenance/maintenance.component').then(m => m.MaintenanceComponent),
    title: 'Servidor no disponible - VozAcction',
    data: { showTheme: false }
  },

  // =========================================================================
  // RUTAS DE AUTENTICACIÓN (solo para NO autenticados)
  // =========================================================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    canActivate: [guestGuard],
    title: 'Iniciar Sesión - VozAcction',
    data: { showTheme: true }
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    canActivate: [guestGuard],
    title: 'Registro - VozAcction',
    data: { showTheme: false }
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
    canActivate: [guestGuard],
    title: 'Recuperar Contraseña - VozAcction',
    data: { showTheme: false }
  },

  // =========================================================================
  // RUTAS PRIVADAS (requieren autenticación)
  // =========================================================================
  {
    path: 'dashboard-v2',
    loadComponent: () => import('./features/pages/public/dashboard-v2/dashboard-v2.component').then(m => m.DashboardV2Component),
    canActivate: [authGuard],
    title: 'Panel de Control - VozAcction',
    data: { showTheme: false }
  },

  // =========================================================================
  // ENTITY MANAGER - Versión simple (legado)
  // =========================================================================
  // {
  //   path: 'entity',
  //   loadComponent: () => import('./features/admin/entity-manager/entity-manager.component').then(m => m.EntityManagerComponent),
  //   canActivate: [authGuard],
  //   title: 'Gestión de Entidades - VozAcction',
  //   data: { showTheme: false }
  // },

 // =========================================================================
  // ENTITY MANAGER - RUTAS SEPARADAS (FUNCIONAN)
  // =========================================================================
  {
    path: 'admin/entities/:entity',
    loadComponent: () => import('./features/admin/dynamic-entity-manager/dynamic-entity-manager.component')
      .then(m => m.DynamicEntityManagerComponent),
    canActivate: [authGuard],
    data: { showTheme: false },
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dynamic-entity-manager/components/entity-list/entity-list.component')
          .then(m => m.EntityListComponent),
        title: 'Gestión de Entidades - VozAcction'
      },
      {
        path: 'create',
        loadComponent: () => import('./features/admin/dynamic-entity-manager/components/entity-form/entity-form.component')
          .then(m => m.EntityFormComponent),
        title: 'Crear Entidad - VozAcction'
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./features/admin/dynamic-entity-manager/components/entity-form/entity-form.component')
          .then(m => m.EntityFormComponent),
        title: 'Editar Entidad - VozAcction'
      }
    ]
  },
    // =========================================================================
  // REDIRECCIONES Y ERRORES
  // =========================================================================
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: '404',
    component: NotFoundComponent,
    data: { showTheme: false }
  },
  {
    path: '**',
    redirectTo: '404'
  }
];