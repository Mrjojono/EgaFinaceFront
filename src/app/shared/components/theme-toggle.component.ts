import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../services/theme';
import { LucideAngularModule } from 'lucide-angular';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    HlmButtonImports
  ],
  template: `
    <button
      hlmBtn
      variant="ghost"
      size="icon"
      (click)="toggleTheme()"
      [attr.aria-label]="isDarkMode() ? 'Passer en mode clair' : 'Passer en mode sombre'"
      class="relative w-9 h-9 flex items-center justify-center">

      <!-- Sun icon (visible en dark mode) -->
      <lucide-icon
        name="sun"
        size="18"
        class="absolute transition-all duration-300 dark:-rotate-90 dark:scale-0">
      </lucide-icon>

      <!-- Moon icon (visible en light mode) -->
      <lucide-icon
        name="moon"
        size="18"
        class="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100">
      </lucide-icon>
    </button>
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);

  isDarkMode = this.themeService.isDarkMode;

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
