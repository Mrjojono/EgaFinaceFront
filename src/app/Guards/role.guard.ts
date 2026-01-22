import {Injectable} from '@angular/core';
import {AuthService} from '../services/auth';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Role} from '../types/user.type';

@Injectable({providedIn: 'root'})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const allowedRoles: Role[] = route.data['roles'];

    if (!allowedRoles || this.auth.hasRole(allowedRoles)) {
      return true;
    }

    this.router.navigate(['/unauthorized']);
    return false;
  }
}
