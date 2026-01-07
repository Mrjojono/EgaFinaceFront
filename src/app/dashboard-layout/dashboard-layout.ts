import {Component, inject} from '@angular/core';
import {Router, RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {HlmSidebarImports} from '@spartan-ng/helm/sidebar';
import {LucideAngularModule} from 'lucide-angular';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInputImports} from '@spartan-ng/helm/input';
import {HlmAvatarImports} from '@spartan-ng/helm/avatar';
import {AuthService} from '../services/auth';
import {Role, User} from '../types/user.type';


@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink,
    HlmSidebarImports,
    LucideAngularModule,
    HlmButton,
    RouterLinkActive,
    HlmAvatarImports,
    HlmInputImports],
  templateUrl: './dashboard-layout.html',
})
export class DashboardLayout {

  private authService = inject(AuthService);
  private router = inject(Router);

  //protected readonly user: User | null = this.authService.getUser()
  protected readonly user: User | null = {
    id:"kopkjojojo",
    nom:"joan",
    prenom:"kekeli",
    email:"joan@gmail.com",
    telephone:"jaoajaoja",
    role:Role.ADMIN
  }



  constructor() {
    if (!this.user) {
    //  this.router.navigate(['/login']).then(r => (""));
    }
  }

  protected readonly NavItems = [
    {
      title: 'Home',
      url: '/dashboard/home',
      icon: 'Home',
    },
    {
      title: 'Transactions',
      url: '/dashboard/transactions',
      icon: 'CreditCard',
    },
    {
      title: 'Comptes',
      url: '/dashboard/accounts',
      icon: 'Wallet',
    },
    {
      title: 'KYC',
      url: '/dashboard/kyc',
      icon: 'UserCheck', // Nouvelle icône pour la vérification
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: 'Settings',
    },
  ];


}
