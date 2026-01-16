import {Routes} from '@angular/router';
import {Auth} from './auth/auth';
import {Register} from './auth/register/register';
import {DashboardLayout} from './dashboard-layout/dashboard-layout';
import {Home} from './dashboard-layout/home/home';
import {Comptes} from './dashboard-layout/comptes/comptes';
import {NotFound} from './not-found/not-found';
import {Transactions} from './transactions/transactions';
import {Settings} from './settings/settings';
export const routes: Routes = [
  {path: "login", component: Auth},
  {path: "register", component: Register},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {
    path: 'dashboard',
    component: DashboardLayout,
    children: [
      {path: "home", component:Home},
      {path: "accounts", component:Comptes},
      {path: "transactions", component:Transactions},
      {path: "settings", component:Settings}
    ]
  },
  {path:'**',component:NotFound}
];
