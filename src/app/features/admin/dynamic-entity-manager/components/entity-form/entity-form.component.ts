// // src/app/features/admin/dynamic-entity-manager/components/entity-form/entity-form.component.ts

// import { Component, input, output, inject, computed, effect, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';
// import { MatCheckboxModule } from '@angular/material/checkbox';
// import { MatSelectModule } from '@angular/material/select';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { EntityConfig } from '../../models/entity-config';

// @Component({
//   selector: 'app-entity-form',
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatButtonModule,
//     MatIconModule,
//     MatCheckboxModule,
//     MatSelectModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     MatProgressSpinnerModule,
//   ],
//   templateUrl: './entity-form.component.html',
//   styleUrls: ['./entity-form.component.scss']
// })
// export class EntityFormComponent {
//   private fb = inject(FormBuilder);

//   // Inputs
//   config = input<EntityConfig | null>(null);
//   visible = input(false);
//   loading = input(false);
//   data = input<any>(null);
//   isEditing = input(false);

//   // Outputs
//   onSave = output<any>();
//   onCancel = output<void>();

//   // Estado
//   form!: FormGroup;
//   private isReady = signal(false);

//   // Computed
//   editableFields = computed(() => {
//     const config = this.config();
//     if (!config) return [];
//     return config.fields.filter(f => !f.hidden);
//   });

//   gridColumns = computed(() => {
//     const config = this.config();
//     const cols = config?.formSettings?.columns || 2;
//     return `repeat(${cols}, 1fr)`;
//   });

//   constructor() {
//     effect(() => {
//       const config = this.config();
//       if (config && this.visible()) {
//         this.initForm(config);
//       }
//     });

//     effect(() => {
//       const data = this.data();
//       const config = this.config();
//       if (data && config && this.form) {
//         this.patchForm(data, config);
//       }
//     });
//   }

//   private initForm(config: EntityConfig) {
//     const group: any = {};
//     const isEditing = this.isEditing();

//     config.fields.forEach(field => {
//       if (field.hidden) return;

//       const validators = [];
      
//       // ✅ En creación, todos los campos required son obligatorios
//       // ✅ En edición, password NO es requerido
//       if (field.required && !(isEditing && field.key === 'password')) {
//         validators.push(Validators.required);
//       }
      
//       if (field.type === 'email') validators.push(Validators.email);
//       if (field.minLength) validators.push(Validators.minLength(field.minLength));
//       if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));

//       let initialValue = this.getDefaultValue(field.type);
      
//       // ✅ Si es edición, deshabilitar campos readonly
//       // ✅ En edición, password también se deshabilita (no se puede cambiar)
//       const isDisabled = isEditing && (field.readonly || field.key === 'password');
      
//       group[field.key] = [{ value: initialValue, disabled: isDisabled }, validators];
//     });

//     this.form = this.fb.group(group);
//     this.isReady.set(true);
//   }

//   private patchForm(data: any, config: EntityConfig) {
//     if (!this.form) return;
    
//     const patchData: any = {};
//     config.fields.forEach(field => {
//       if (data[field.key] !== undefined && !field.hidden) {
//         patchData[field.key] = data[field.key];
//       }
//     });
    
//     this.form.patchValue(patchData);
//   }

//   private getDefaultValue(type: string): any {
//     switch (type) {
//       case 'boolean': return false;
//       case 'number': return null;
//       case 'date': return null;
//       default: return '';
//     }
//   }

//   onSubmit() {
//     if (this.form.valid) {
//       const formValue = this.form.getRawValue();
      
//       // ✅ Si es edición y password está vacío, eliminarlo del payload
//       if (this.isEditing() && !formValue.password) {
//         delete formValue.password;
//       }
      
//       this.onSave.emit(formValue);
//     } else {
//       this.form.markAllAsTouched();
//     }
//   }
// }











// src/app/features/admin/dynamic-entity-manager/components/entity-form/entity-form.component.ts

import { Component, input, output, inject, computed, signal, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EntityConfigService } from '../../services/entity-config.service';
import { EntityCrudService } from '../../services/entity-crud.service';
import { EntityConfig } from '../../models/entity-config';

@Component({
  selector: 'app-entity-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './entity-form.component.html',
  styleUrls: ['./entity-form.component.scss']
})
export class EntityFormComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configService = inject(EntityConfigService);
  private crudService = inject(EntityCrudService);

  // 👇 REFERENCIA AL PRIMER CAMPO
  @ViewChild('firstInput') firstInput!: ElementRef;

  // Inputs
  visible = input(false);
  loading = input(false);
  data = input<any>(null);
  isEditing = input(false);
  onSave = output<any>();
  onCancel = output<void>();

  // Estado
  entityName = signal<string>('');
  editingId = signal<number | null>(null);

  // Computed
  config = computed((): EntityConfig | null => {
    return this.configService.getConfig(this.entityName()) || null;
  });

  editableFields = computed(() => {
    const config = this.config();
    if (!config) return [];
    return config.fields.filter(f => !f.hidden);
  });

  gridColumns = computed(() => {
    const config = this.config();
    const cols = config?.formSettings?.columns || 2;
    return `repeat(${cols}, 1fr)`;
  });

  // Formulario
  form!: FormGroup;

  // ============================================================
  // CICLO DE VIDA
  // ============================================================
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.entityName.set(params['entity']);
      
      const id = params['id'];
      if (id) {
        this.editingId.set(parseInt(id));
        this.loadItem(parseInt(id));
      }
      
      this.initForm();
    });
  }

  // 👇 PONER FOCO EN EL PRIMER CAMPO
  ngAfterViewInit() {
    setTimeout(() => {
      if (this.firstInput) {
        this.firstInput.nativeElement.focus();
      }
    }, 150);
  }

  // ============================================================
  // MÉTODOS
  // ============================================================
  loadItem(id: number) {
    const config = this.config();
    if (!config) return;

    this.crudService.getById(config, id).subscribe({
      next: (data) => {
        if (this.form) {
          this.form.patchValue(data);
        }
      },
      error: (err) => {
        console.error('Error cargando item:', err);
      }
    });
  }

  initForm() {
    const config = this.config();
    if (!config) return;

    const group: any = {};
    const isEditing = this.isEditing();

    config.fields.forEach(field => {
      if (field.hidden) return;

      const validators = [];
      if (field.required && !(isEditing && field.key === 'password')) {
        validators.push(Validators.required);
      }
      if (field.type === 'email') validators.push(Validators.email);
      if (field.minLength) validators.push(Validators.minLength(field.minLength));
      if (field.maxLength) validators.push(Validators.maxLength(field.maxLength));

      let initialValue = this.getDefaultValue(field.type);
      const isDisabled = isEditing && (field.readonly || field.key === 'password');

      group[field.key] = [{ value: initialValue, disabled: isDisabled }, validators];
    });

    this.form = this.fb.group(group);
  }

  private getDefaultValue(type: string): any {
    switch (type) {
      case 'boolean': return false;
      case 'number': return null;
      case 'date': return null;
      default: return '';
    }
  }

  // ============================================================
  // ACCIONES
  // ============================================================
  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();

      if (this.isEditing() && !formValue.password) {
        delete formValue.password;
      }

      this.onSave.emit(formValue);
    } else {
      this.form.markAllAsTouched();
    }
  }

  cancelar() {
    console.log('❌ Cancelando formulario');
    this.router.navigate(['/admin/entities', this.entityName()]);
    this.onCancel.emit();
  }
}