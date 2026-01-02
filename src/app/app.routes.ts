import {Routes} from '@angular/router';
import {Auth} from './auth/auth';
import {Register} from './auth/register/register';

export const routes: Routes = [
  {path: "login", component: Auth},
  {path: "register", component: Register},
  {path: '', redirectTo: '/login', pathMatch: 'full'},
  {path:'dashboard',
    children:[
      {path:"dashboard/hello",}
    ]
  }
];
