// src/app/shared/components/footer/footer.component.ts

import { Component, Input, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../../services/themes/themes.service';

export type FooterPosition = 'fixed' | 'sticky' | 'relative' | 'static';

// ✅ INTERFACES PARA ENLACES CONFIGURABLES
export interface FooterNavLink {
  label: string;
  route: string;
  icon?: string;
}

export interface FooterSocialLink {
  label: string;
  url: string;
  icon: string;
}

export interface FooterLegalLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  // ============================================================
  // INPUTS - CONFIGURACIÓN DEL FOOTER
  // ============================================================
  
  // Posición
  @Input() position: FooterPosition = 'relative';
  @Input() bottom: string = '0';
  @Input() zIndex: number = 100;
  @Input() noMargin: boolean = false;
  @Input() compact: boolean = false;
  @Input() customClass: string = '';

  // Mostrar/ocultar secciones
  @Input() showSocial: boolean = true;
  @Input() showNav: boolean = true;
  @Input() showLegal: boolean = true;
  @Input() showVersion: boolean = true;
  @Input() showCopyright: boolean = true;

  // ✅ ENLACES CONFIGURABLES (con valores por defecto)
  @Input() navLinks: FooterNavLink[] = [
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard' },
    { label: 'Acciones', route: '/voice-actions', icon: 'flash_on' },
    { label: 'Comandos', route: '/voice-commands', icon: 'settings_voice' },
    { label: 'Perfil', route: '/profile', icon: 'person' },
    { label: 'Configuración', route: '/settings', icon: 'settings' }
  ];

  @Input() socialLinks: FooterSocialLink[] = [
    { label: 'GitHub', url: 'https://github.com/tu-usuario', icon: 'code' },
    { label: 'Twitter', url: 'https://twitter.com/tu-usuario', icon: 'alternate_email' },
    { label: 'YouTube', url: 'https://youtube.com/tu-usuario', icon: 'smart_display' },
    { label: 'LinkedIn', url: 'https://linkedin.com/in/tu-usuario', icon: 'work' }
  ];

  @Input() legalLinks: FooterLegalLink[] = [
    { label: 'Política de Privacidad', url: '/privacy' },
    { label: 'Términos de Servicio', url: '/terms' },
    { label: 'Cookies', url: '/cookies' }
  ];

  // ============================================================
  // ESTADO
  // ============================================================
  currentYear = new Date().getFullYear();

  // ============================================================
  // INYECCIONES
  // ============================================================
  private themeService = inject(ThemeService);

  // ============================================================
  // SIGNALS COMPUTADAS
  // ============================================================
  isDarkTheme = computed(() => {
    return this.themeService.currentTheme() === 'dark';
  });

  footerClasses = computed(() => {
    const classes: string[] = ['app-footer'];
    
    if (this.isDarkTheme()) {
      classes.push('dark');
    }
    
    if (this.compact) {
      classes.push('compact');
    }
    
    if (this.customClass) {
      classes.push(this.customClass);
    }

    if (this.position === 'fixed') {
      classes.push('position-fixed');
    } else if (this.position === 'sticky') {
      classes.push('position-sticky');
    } else if (this.position === 'relative') {
      classes.push('position-relative');
    }

    if (this.noMargin) {
      classes.push('no-margin');
    }
    
    return classes.join(' ');
  });

  footerStyles = computed(() => {
    const styles: any = {};

    if (this.position === 'fixed' || this.position === 'sticky') {
      styles.bottom = this.bottom;
      styles.zIndex = this.zIndex;
    }

    return styles;
  });
}