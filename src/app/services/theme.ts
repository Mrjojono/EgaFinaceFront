// src/app/services/theme.service.ts
import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  isDarkMode = signal<boolean>(false);

  constructor() {

    this.loadTheme();


    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }

  /**
   * Charge le theme depuis le localStorage
   */
  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      this.isDarkMode.set(true);
    }
  }

  /**
   * Applique le theme en ajoutant/retirant la classe 'dark' sur <html>
   */
  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }

  /**
   * Toggle entre dark et light mode
   */
  toggleTheme(): void {
    this.isDarkMode.update(current => !current);
  }

  /**
   * Set un theme spécifique
   */
  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
  }
}
