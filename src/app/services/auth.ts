import {Injectable, signal} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {map} from 'rxjs/operators';
import {CREATE_USER_MUTATION, LOGIN_MUTATION} from '../graphql/mutations';
import {AuthResponse, Role, Sexe, User} from '../types/user.type';
import {GET_ME} from '../graphql/queries';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSignal = signal<User | null>(null);

  constructor(private apollo: Apollo) {
    this.loadUserFromSession();
  }

  login(email: string, password: string) {
    return this.apollo.mutate<{ login: AuthResponse }>({
      mutation: LOGIN_MUTATION,
      variables: {
        email: email,
        password: password
      }
    }).pipe(
      map(result => {
        const authData = result.data?.login;
        if (authData) {

          sessionStorage.setItem('token', authData.token);
          sessionStorage.setItem('user', JSON.stringify(authData.user));

          this.currentUserSignal.set(authData.user);

          console.log("Utilisateur connecté :", authData.user.nom);
        }
        return authData?.token;
      })
    );
  }

  register(email: string, password: string, nom: string, prenom: string, sexe: Sexe, nationalite: string) {
    return this.apollo.mutate<{ createUser: User }>({
      mutation: CREATE_USER_MUTATION,
      variables: {
        input: {
          email,
          password,
          nom,
          prenom,
          sexe,
          nationalite,
          role: Role.CLIENT
        }
      }
    }).pipe(
      map(result => {
        return result.data?.createUser
      })
    );
  }

  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('token');
  }

  getUser(): User | null {
    const userJson = sessionStorage.getItem('user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as User;
    } catch (e) {
      return null;
    }
  }


  logout() {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    this.currentUserSignal.set(null);
  }


  getCurrentUserId(): string | null {
    const user = this.getUser();
    return user?.id || null;
  }

  hasRole(roles: Role[]): boolean {
    const role = this.getUser()?.role;
    return role ? roles.includes(role) : false;
  }

  getCurrentUser() {
    return this.currentUserSignal;
  }


  private loadUserFromSession(): void {
    const user = this.getUser();
    if (user) {
      this.currentUserSignal.set(user);
    }
  }

  setUser(user: User): void {
    sessionStorage.setItem('user', JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  getMe() {
    return this.apollo.query({
      query: GET_ME,
      fetchPolicy: 'network-only'
    })
  }


}
