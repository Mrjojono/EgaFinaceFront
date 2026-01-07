import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {map} from 'rxjs/operators';
import {LOGIN_MUTATION} from '../graphql/mutations';
import {AuthResponse, User} from '../types/user.type';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apollo: Apollo) {
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

          console.log("Utilisateur connecté :", authData.user.nom);
        }
        return authData?.token;
      })
    );
  }


  isLoggedIn(): boolean {
    return !!sessionStorage.getItem('auth_token');
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
    sessionStorage.removeItem('auth_token');
  }
}
