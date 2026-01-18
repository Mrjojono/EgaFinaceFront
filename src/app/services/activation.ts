import {Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {map} from 'rxjs/operators';
import {INITIATE_ACTIVATION_MUTATION,COMPLETE_ACTIVATION_MUTATION} from '../graphql/mutations';
import {User, ActivationResponse} from '../types/user.type';

@Injectable({
  providedIn: 'root',
})
export class Activation {
  constructor(private apollo: Apollo) {
  }


  initiateActivation(identifiant: string, email: string) {
    return this.apollo.mutate<{ initiateActivation: ActivationResponse }>({
      mutation: INITIATE_ACTIVATION_MUTATION,
      variables: {
        identifiant: identifiant,
        email: email
      }
    }).pipe(
      map(result => {
        return result.data?.initiateActivation;
      })
    );
  }

  completeActivation(token: string, password: string) {
    return this.apollo.mutate<{ completeActivation: ActivationResponse }>({
      mutation: COMPLETE_ACTIVATION_MUTATION,
      variables: {
        token: token,
        password: password
      }
    }).pipe(
      map(result => {
        return result.data?.completeActivation;
      })
    );
  }

}
