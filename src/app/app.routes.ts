import {Routes} from '@angular/router';
import {Auth} from './auth/auth';
import {Register} from './auth/register/register';
import {DashboardLayout} from './dashboard-layout/dashboard-layout';
import {Home} from './dashboard-layout/home/home';
import {Comptes} from './dashboard-layout/comptes/comptes';

export const routes: Routes = [
  {path: "login", component: Auth},
  {path: "register", component: Register},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {path: "home", component:Home},
      {path: "accounts", component:Comptes}
    ]
  }
];
