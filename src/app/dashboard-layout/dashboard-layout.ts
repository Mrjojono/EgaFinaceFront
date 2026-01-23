import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {HlmSidebarImports} from '@spartan-ng/helm/sidebar';
import {LucideAngularModule} from 'lucide-angular';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmAvatarImports} from '@spartan-ng/helm/avatar';
import {AuthService} from '../services/auth';
import {Role} from '../types/user.type';
import {ThemeToggleComponent} from '../shared/components/theme-toggle.component';


@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    HlmSidebarImports,
    LucideAngularModule,
    HlmButton,
    RouterLinkActive,
    HlmAvatarImports,
    ThemeToggleComponent,
  ],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {

  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly user = this.authService.getCurrentUser();

  constructor() {
    if (!this.authService.getUser()) {
      this.router.navigate(['/login']).then(r => (""));
    }
  }

  hasAccess(roles: Role[]): boolean {
    return this.authService.hasRole(roles);
  }

  protected readonly NavItems = [
    {
      title: 'Home',
      url: '/dashboard/home',
      icon: 'Home',
      roles: [Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN]
    },
    {
      title: 'Transactions',
      url: '/dashboard/transactions',
      icon: 'CreditCard',
      roles: [Role.CLIENT, Role.ADMIN]
    },
    {
      title: 'Comptes',
      url: '/dashboard/accounts',
      icon: 'Wallet',
      roles: [Role.CLIENT, Role.ADMIN, Role.AGENT_ADMIN]
    },
    {
      title: 'Clients',
      url: '/dashboard/clients',
      icon: 'Users',
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.AGENT_ADMIN]
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: 'Settings',
      roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.CLIENT]
    },
  ];

  logout() {
    this.authService.logout()
    this.router.navigate(['/login']).then(r => (""));
  }
}
