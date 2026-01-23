import {Injectable} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {map, catchError} from 'rxjs/operators';
import {Observable, of} from 'rxjs';
import {REGISTER_MUTATION, UPDATE_CLIENT_MUTATION, DELETE_CLIENT_MUTATION} from '../graphql/mutations';
import {GET_CLIENTS} from '../graphql/queries';

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  nationalite?: string;
  email?: string;
  telephone?: string;
  sexe?: string;
  identifiant?: string;
  adresse?: string;
  dateNaissance?: string;
}

@Injectable({providedIn: 'root'})
export class ClientsService {
  constructor(private apollo: Apollo) {
  }

  /**
   * Récupère les clients paginés
   */
  getClients(page: number = 1, size: number = 20): Observable<Client[]> {
    return this.apollo
      .query<{ clients: Client[] }>({
        query: GET_CLIENTS,
        variables: {page, size},
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => result.data?.clients ?? []),
        catchError(err => {
          console.error('Erreur getClients', err);
          return of([]);
        })
      );
  }

  /**
   * Crée un client (wrapper autour de REGISTER_MUTATION)
   * ATTENTION: REGISTER_MUTATION attend 5 variables obligatoires dans ta définition ($email, $nom, $prenom, $nationalite, $password).
   * Nous acceptons aussi des champs optionnels et les transmettons si présents.
   */
  createClient(input: {
    email: string;
    nom: string;
    prenom: string;
    nationalite: string;
    password: string;
    telephone?: string;
    adresse?: string;
    dateNaissance?: string;
    sexe?: string;
  }) {
    // Construire variables selon la mutation fournie
    const variables: any = {
      email: input.email,
      nom: input.nom,
      prenom: input.prenom,
      nationalite: input.nationalite,
      password: input.password
    };

    return this.apollo.mutate({
      mutation: REGISTER_MUTATION,
      variables
      // tu peux ajouter refetchQueries ici si besoin
    });
  }

  /**
   * Met à jour un client
   */
  updateClient(id: string, client: Partial<Client>) {
    return this.apollo.mutate({
      mutation: UPDATE_CLIENT_MUTATION,
      variables: {id, client}
    });
  }

  /**
   * Supprime un client
   */
  deleteClient(id: string) {
    return this.apollo.mutate({
      mutation: DELETE_CLIENT_MUTATION,
      variables: {id}
    });
  }
}
