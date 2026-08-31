import { Component, inject, computed, input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ThemeService } from '../../services/themes/themes.service';
import { UserPreferencesService } from '../../services/user-preferences/user-preferences.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
  private themeService = inject(ThemeService);
  private userPreferences = inject(UserPreferencesService);
  private authService = inject(AuthService);
  
  private authSubscription?: Subscription;
  
  // ✅ Usamos computed directamente (reacciona automáticamente)
  isDark = computed(() => this.themeService.currentTheme() === 'dark');
  isVisible = input<boolean>(false);

  ngOnInit(): void {
    // ✅ SIEMPRE intentar cargar el theme del backend
    const userId = this.userPreferences.getUserId();
    
    if (userId) {
      console.log('🔄 [ThemeToggle] Cargando theme del backend para usuario:', userId);
      this.userPreferences.syncThemeWithBackend(userId);
    } else {
      // ✅ Si no hay usuario, usar LIGHT por defecto
      console.log('ℹ️ [ThemeToggle] Usuario no autenticado, usando theme LIGHT por defecto');
      this.themeService.setTheme('light');
      
      // ✅ Suscribirse a cambios de autenticación para cargar el theme cuando el usuario haga login
      this.authSubscription = this.authService.currentUser$.subscribe(user => {
        if (user?.id) {
          console.log('🔄 [ThemeToggle] Usuario autenticado, cargando theme del backend');
          this.userPreferences.syncThemeWithBackend(user.id);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  toggleTheme(): void {
    // ✅ Cambiar tema
    this.themeService.toggleTheme();
    const newTheme = this.themeService.currentTheme();
    
    // ✅ Verificar userId
    const userId = this.userPreferences.getUserId();
    console.log('🔄 Tema cambiado a:', newTheme);
    console.log('👤 userId:', userId);
    
    // ✅ Guardar en backend si está autenticado
    if (userId) {
      console.log(`📤 Guardando tema en backend: ${newTheme}`);
      
      this.userPreferences.sendPreferenceUpdateTheme(userId, newTheme as 'light' | 'dark').subscribe({
        next: () => console.log('✅ Tema guardado en backend:', newTheme),
        error: (error) => console.error('❌ Error guardando tema:', error)
      });
    } else {
      console.log('💾 Tema guardado solo en localStorage (usuario no autenticado)');
    }
  }
}