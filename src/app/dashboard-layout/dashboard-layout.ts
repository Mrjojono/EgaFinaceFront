import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {HlmSidebarImports} from '@spartan-ng/helm/sidebar';
import {LucideAngularModule} from 'lucide-angular';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmAvatarImports} from '@spartan-ng/helm/avatar';
import {AuthService} from '../services/auth';
import {Role} from '../types/user.type';


@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink,
    HlmSidebarImports,
    LucideAngularModule,
    HlmButton,
    RouterLinkActive,
    HlmAvatarImports,
  ],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {

  private authService = inject(AuthService);
  private router = inject(Router);

  protected readonly user = this.authService.getCurrentUser();


  /**
   *
   *  protected readonly user: User | null = {
   *     id: "kopkjojojo",
   *     nom: "joan",
   *     prenom: "kekeli",
   *     email: "joan@gmail.com",
   *     telephone: "jaoajaoja",
   *     role: Role.ADMIN
   *   }
   */

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
      roles: [Role.CLIENT, Role.ADMIN]
    },
    {
      title: 'Clients',
      url: '/dashboard/clients',
      icon: 'Users',
      roles: [Role.ADMIN, Role.SUPER_ADMIN]
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: 'Settings',
      roles: [Role.ADMIN, Role.SUPER_ADMIN,Role.CLIENT]
    },
  ];


  logout() {
    this.authService.logout()
    this.router.navigate(['/login']).then(r => (""));
  }
}
