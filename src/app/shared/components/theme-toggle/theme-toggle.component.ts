import { Component, inject, signal, effect, input } from '@angular/core';
import { ThemeService } from '../../services/themes/themes.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme-toggle.component.html',
  styleUrl: './theme-toggle.component.scss',
})
export class ThemeToggleComponent {
  private themeService = inject(ThemeService);
  
  isDark = signal(false);
  isVisible = input<boolean>(false);

  constructor() {
    // 🔥 Effect reactivo para signals (sin Subscription)
    effect(() => {
      this.isDark.set(this.themeService.currentTheme() === 'dark');
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}