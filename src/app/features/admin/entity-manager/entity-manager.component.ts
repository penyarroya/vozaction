// import { Component } from '@angular/core';

// @Component({
//   imports: [],
//   selector: 'app-entity-manager',
//   styleUrl: './entity-manager.component.scss',
//   templateUrl: './entity-manager.component.html',
// })
// export class EntityManagerComponent {
// }




// src/app/features/admin/entity-manager/entity-manager.component.ts

import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { environment } from '../../../../environments/environment.development';


// ============================================================
// INTERFACES
// ============================================================
export interface EntityField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'select' | 'textarea' | 'date' | 'boolean' | 'json' | 'password';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  options?: { label: string; value: any }[];
  hidden?: boolean;
  readonly?: boolean;
  placeholder?: string;
}

export interface EntityConfig {
  entityName: string;
  apiPath: string;
  displayName: string;
  displayField: string;
  fields: EntityField[];
}

@Component({
  selector: 'app-entity-manager',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
  ],
  templateUrl: './entity-manager.component.html',
  styleUrl: './entity-manager.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityManagerComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  // ============================================================
  // ESTADO
  // ============================================================
  selectedEntity: string = 'UserEntity';
  config!: EntityConfig;
  entities: any[] = [];
  displayedColumns: string[] = [];

  isLoading = signal(false);
  isFormVisible = signal(false);
  editingId: number | null = null;

  totalItems = 0;
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions = [5, 10, 25, 50, 100];
  searchTerm: string = '';
  entityForm!: FormGroup;

  // ============================================================
  // LISTA DE ENTIDADES
  // ============================================================
  get entityList(): { label: string; value: string }[] {
    return [
      { label: 'Usuarios', value: 'UserEntity' },
      { label: 'Refresh Tokens', value: 'RefreshTokenEntity' },
      { label: 'Preferencias', value: 'UserPreference' },
      { label: 'Roles', value: 'RoleEntity' },
      { label: 'Correcciones Ortográficas', value: 'SpellingCorrection' },
      { label: 'Sesiones', value: 'UserSession' },
      { label: 'Instituciones', value: 'Institution' },
      { label: 'Cursos', value: 'Course' },
    ];
  }

  // ============================================================
  // CONFIGURACIÓN DE ENTIDADES
  // ============================================================
  private getEntityConfigs(): EntityConfig[] {

     console.log('📦 getEntityConfigs() - Configurando entidades...');

    return [
      {
        entityName: 'UserEntity',
        apiPath: `${environment.apiGateway}${environment.apiV1}/users`,
        displayName: 'Usuarios',
        displayField: 'username',
        fields: [
          { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
          { key: 'username', label: 'Usuario', type: 'text', required: true, maxLength: 40 },
          { key: 'email', label: 'Email', type: 'email', required: true, maxLength: 150 },
          { key: 'activo', label: 'Activo', type: 'boolean' },
          { key: 'emailVerified', label: 'Email Verificado', type: 'boolean' },
          { key: 'provider', label: 'Proveedor', type: 'text', readonly: true },
          { key: 'providerId', label: 'ID Proveedor', type: 'text', readonly: true },
        ]
      },
      {
        entityName: 'RefreshTokenEntity',
        apiPath: `${environment.apiGateway}${environment.apiV1}/refresh-tokens`,
        displayName: 'Refresh Tokens',
        displayField: 'token',
        fields: [
          { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
          { key: 'token', label: 'Token', type: 'text', readonly: true },
          { key: 'userId', label: 'ID Usuario', type: 'number', required: true },
          { key: 'expiresAt', label: 'Expira', type: 'date', readonly: true },
          { key: 'revoked', label: 'Revocado', type: 'boolean', readonly: true },
          { key: 'expired', label: 'Expirado', type: 'boolean', readonly: true },
          { key: 'used', label: 'Usado', type: 'boolean', readonly: true },
        ]
      },
      {
        entityName: 'UserPreference',
        apiPath: `${environment.apiGateway}${environment.apiV1}/users`,
        displayName: 'Preferencias',
        displayField: 'userId',
        fields: [
          { key: 'userId', label: 'ID Usuario', type: 'number', required: true },
          { key: 'theme', label: 'Tema', type: 'select', options: [
            { label: 'Claro', value: 'LIGHT' },
            { label: 'Oscuro', value: 'DARK' }
          ]},
          { key: 'lastPage', label: 'Última Página', type: 'text' },
          { key: 'selectedInstitutionId', label: 'Institución', type: 'number' },
          { key: 'defaultVoice', label: 'Voz', type: 'text' },
          { key: 'defaultSpeed', label: 'Velocidad', type: 'number' },
          { key: 'defaultLanguage', label: 'Idioma', type: 'text' },
        ]
      },
      {
        entityName: 'RoleEntity',
        apiPath: `${environment.apiGateway}${environment.apiV1}/roles`,
        displayName: 'Roles',
        displayField: 'name',
        fields: [
          { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
          { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 50 },
        ]
      },
      {
        entityName: 'SpellingCorrection',
        apiPath: `${environment.apiGateway}${environment.apiV1}/spelling-corrections`,
        displayName: 'Correcciones Ortográficas',
        displayField: 'wrongWord',
        fields: [
          { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
          { key: 'wrongWord', label: 'Palabra Incorrecta', type: 'text', required: true, maxLength: 100 },
          { key: 'correctWord', label: 'Palabra Correcta', type: 'text', required: true, maxLength: 100 },
        ]
      },
      {
        entityName: 'UserSession',
        apiPath: `${environment.apiGateway}${environment.apiV1}/sessions`,
        displayName: 'Sesiones',
        displayField: 'sessionToken',
        fields: [
          { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
          { key: 'sessionToken', label: 'Token', type: 'text', readonly: true },
          { key: 'userId', label: 'ID Usuario', type: 'number', required: true },
          { key: 'active', label: 'Activa', type: 'boolean' },
          { key: 'ipAddress', label: 'IP', type: 'text' },
          { key: 'deviceInfo', label: 'Dispositivo', type: 'text' },
          { key: 'expiresAt', label: 'Expira', type: 'date', readonly: true },
        ]
      },
      {
        entityName: 'Institution',
        apiPath: `${environment.apiGateway}${environment.apiV1}/institutions`,
        displayName: 'Instituciones',
        displayField: 'name',
        fields: [
          { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
          { key: 'name', label: 'Nombre', type: 'text', required: true, maxLength: 200 },
          { key: 'email', label: 'Email', type: 'email', required: true, maxLength: 100 },
          { key: 'website', label: 'Web', type: 'text', maxLength: 200 },
          { key: 'phone', label: 'Teléfono', type: 'text', maxLength: 20 },
          { key: 'isActive', label: 'Activa', type: 'boolean' },
        ]
      },
      {
        entityName: 'Course',
        apiPath: `${environment.apiGateway}${environment.apiV1}/courses`,
        displayName: 'Cursos',
        displayField: 'title',
        fields: [
          { key: 'id', label: 'ID', type: 'number', readonly: true, hidden: true },
          { key: 'title', label: 'Título', type: 'text', required: true, maxLength: 200 },
          { key: 'institutionId', label: 'ID Institución', type: 'number', required: true },
          { key: 'estimatedHours', label: 'Horas', type: 'number' },
          { key: 'isActive', label: 'Activo', type: 'boolean' },
        ]
      }
    ];
  }

  private getEntityConfig(entityName: string): EntityConfig | undefined {
    return this.getEntityConfigs().find(c => c.entityName === entityName);
  }

  // ============================================================
  // CICLO DE VIDA
  // ============================================================
  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['entity']) {
          this.selectedEntity = params['entity'];
        }
        this.loadEntity();
      });
  }

  // ============================================================
  // MÉTODOS PÚBLICOS
  // ============================================================
  onEntityChange(entityName: string): void {
    this.selectedEntity = entityName;
    this.router.navigate(['/admin/entities', entityName]);
    this.loadEntity();
  }

  // loadEntity(): void {
  //   this.config = this.getEntityConfig(this.selectedEntity)!;
  //   if (!this.config) {
  //     this.snackBar.open('Entidad no encontrada', 'Cerrar', { duration: 3000 });
  //     return;
  //   }
  //   this.initTable();
  //   this.initForm();
  //   this.loadData();
  // }



  loadEntity(): void {
    console.log('🔍 loadEntity() - selectedEntity:', this.selectedEntity);  // 👈 AÑADE ESTO
    
    this.config = this.getEntityConfig(this.selectedEntity)!;
    console.log('🔍 config:', this.config);  // 👈 AÑADE ESTO
    
    if (!this.config) {
      console.error('❌ Config no encontrada para:', this.selectedEntity);  // 👈 AÑADE ESTO
      this.snackBar.open('Entidad no encontrada', 'Cerrar', { duration: 3000 });
      return;
    }
    this.initTable();
    this.initForm();
    this.loadData();
  }


  // ============================================================
  // INICIALIZACIÓN
  // ============================================================
  private initTable(): void {
    this.displayedColumns = this.config.fields
      .filter(f => !f.hidden)
      .map(f => f.key);
    this.displayedColumns.push('actions');
  }

  private initForm(): void {
    const formGroup: any = {};
    this.config.fields.forEach(field => {
      const validators = [];
      if (field.required) validators.push(Validators.required);
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));
      if (field.min !== undefined) validators.push(Validators.min(field.min));
      if (field.max !== undefined) validators.push(Validators.max(field.max));
      if (field.type === 'email') validators.push(Validators.email);
      formGroup[field.key] = ['', validators];
    });
    this.entityForm = this.fb.group(formGroup);
  }

  // ============================================================
  // DATOS
  // ============================================================
  loadData(): void {
    this.isLoading.set(true);
    this.http.get<any[]>(this.config.apiPath, { withCredentials: true })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (data) => {
          this.entities = data || [];
          this.totalItems = data?.length || 0;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error loading data:', error);
          this.snackBar.open('Error al cargar datos', 'Cerrar', { duration: 3000 });
        }
      });
  }

  // ============================================================
  // CRUD
  // ============================================================
  createEntity(): void {
    this.editingId = null;
    this.isFormVisible.set(true);
    this.entityForm.reset();
    this.cdr.markForCheck();
  }

  editEntity(entity: any): void {
    this.editingId = entity.id;
    this.isFormVisible.set(true);
    this.config.fields.forEach(field => {
      const control = this.entityForm.get(field.key);
      if (control) {
        control.setValue(entity[field.key] !== undefined ? entity[field.key] : '');
        if (field.readonly) control.disable();
        else control.enable();
      }
    });
    this.cdr.markForCheck();
  }

  cancelForm(): void {
    this.isFormVisible.set(false);
    this.editingId = null;
    this.entityForm.reset();
    this.cdr.markForCheck();
  }

  saveEntity(): void {
    if (this.entityForm.invalid) {
      this.entityForm.markAllAsTouched();
      this.snackBar.open('Corrige los errores del formulario', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading.set(true);
    const data = this.entityForm.value;
    const url = this.config.apiPath;

    const request = this.editingId
      ? this.http.put(`${url}/${this.editingId}`, data, { withCredentials: true })
      : this.http.post(url, data, { withCredentials: true });

    request
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.snackBar.open(
            `${this.editingId ? 'Actualizado' : 'Creado'} correctamente`,
            'Cerrar',
            { duration: 3000 }
          );
          this.cancelForm();
          this.loadData();
        },
        error: (error) => {
          console.error('Error saving:', error);
          this.snackBar.open('Error al guardar', 'Cerrar', { duration: 3000 });
        }
      });
  }

  deleteEntity(id: number, displayValue: string): void {
    if (!confirm(`¿Eliminar ${this.config.displayName} "${displayValue}"?`)) return;

    this.isLoading.set(true);
    this.http.delete(`${this.config.apiPath}/${id}`, { withCredentials: true })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          this.snackBar.open('Eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadData();
        },
        error: (error) => {
          console.error('Error deleting:', error);
          this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 3000 });
        }
      });
  }

  // ============================================================
  // UTILIDADES
  // ============================================================
  getFieldValue(entity: any, key: string): string {
    const value = entity[key];
    if (value === undefined || value === null) return '-';
    if (typeof value === 'boolean') return value ? '✅ Sí' : '❌ No';
    if (value instanceof Date || typeof value === 'string' && value.includes('T')) {
      return new Date(value).toLocaleString();
    }
    return String(value);
  }

  getFieldType(key: string): string {
    const field = this.config.fields.find(f => f.key === key);
    return field?.type || 'text';
  }

  isFieldRequired(key: string): boolean {
    const field = this.config.fields.find(f => f.key === key);
    return field?.required || false;
  }

  getFieldOptions(key: string): { label: string; value: any }[] {
    const field = this.config.fields.find(f => f.key === key);
    return field?.options || [];
  }

  getDisplayValue(entity: any): string {
    return entity[this.config.displayField] || `#${entity.id}`;
  }

  getFieldLabel(key: string): string {
    const field = this.config.fields.find(f => f.key === key);
    return field?.label || key;
  }

  getInputType(field: EntityField): string {
    if (field.type === 'password') return 'password';
    if (field.type === 'email') return 'email';
    if (field.type === 'number') return 'number';
    return 'text';
  }

  // ============================================================
  // PAGINACIÓN
  // ============================================================
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadData();
  }

  // ============================================================
  // DESTRUCCIÓN
  // ============================================================
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}