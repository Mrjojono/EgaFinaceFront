import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import { HlmSidebarImports } from '@spartan-ng/helm/sidebar';
import { LucideAngularModule } from 'lucide-angular';
import {HlmButton} from '@spartan-ng/helm/button';
import {HlmInputImports} from '@spartan-ng/helm/input';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';


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
  protected readonly NavItems = [
    {
      title: 'Home',
      url: '/dashboard/home',
      icon: 'Home',
    },
    {
      title: 'Payments',
      url: '/dashboard/payments',
      icon: 'CreditCard', // Changé de Settings2 à CreditCard
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
