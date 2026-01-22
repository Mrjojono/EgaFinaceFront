import {Routes} from '@angular/router';
import {Auth} from './auth/auth';
import {Register} from './auth/register/register';
import {DashboardLayout} from './dashboard-layout/dashboard-layout';
import {Home} from './dashboard-layout/home/home';
import {Comptes} from './dashboard-layout/comptes/comptes';
import {NotFound} from './not-found/not-found';
import {Transactions} from './transactions/transactions';
import {Settings} from './settings/settings';
import {Graphs} from './graphs/graphs';
import {ClientsComponent} from './clients/clients';
import {CompteDetailsPage} from './shared/components/compte-details/compte-details';
import {RoleGuard} from './Guards/role.guard';
import {Role} from './types/user.type';
import {AuthGuard} from './Guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: Auth },
  { path: 'register', component: Register },
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  {
    path: 'dashboard',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [

      {
        path: 'home',
        component: Home
      },

      {
        path: 'accounts',
        component: Comptes,
        canActivate: [RoleGuard],
        data: { roles: [Role.CLIENT] }
      },

      {
        path: 'transactions',
        component: Transactions,
        canActivate: [RoleGuard],
        data: { roles: [Role.CLIENT] }
      },
      {
        path: 'settings',
        component: Settings,
        canActivate: [RoleGuard],
        data: { roles: [Role.CLIENT] }
      },

      {
        path: 'graphs',
        component: Graphs,
        canActivate: [RoleGuard],
        data: { roles: [Role.ADMIN, Role.SUPER_ADMIN] }
      },

      {
        path: 'clients',
        component: ClientsComponent,
        canActivate: [RoleGuard],
        data: { roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.AGENT_ADMIN] }
      },

      {
        path: 'comptes/:id',
        component: CompteDetailsPage,
        canActivate: [RoleGuard],
        data: { roles: [Role.CLIENT, Role.ADMIN, Role.SUPER_ADMIN] }
      },

      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  { path: '**', component: NotFound }
];

