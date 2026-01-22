import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import {GET_ACCOUNTS, GET_COMPTE_BY_ID, GET_TRANSACTIONS} from '../graphql/queries';
import {CREATE_COMPTE_MUTATION, UPDATE_COMPTE_MUTATION} from '../graphql/mutations';

// Types
export interface Compte {
  id: string;
  numero: string;
  solde: number;
  typeCompte: string;
  dateCreation: string;
}

export interface Transaction {
  id: string;
  montant: number;
  dateCreation: string;
  dateUpdate: string;
  compteSource: {
    id: string;
    numero: string;
    proprietaire: {
      id: string;
      nom: string;
      prenom: string;
    };
  };
  compteDestination: {
    id: string;
    numero: string;
    proprietaire: {
      id: string;
      nom: string;
      prenom: string;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  constructor(private apollo: Apollo) {}

  /**
   * Récupère tous les comptes d'un client
   */
  getAccountsByClientId(clientId: string): Observable<Compte[]> {
    return this.apollo
      .query<{ comptesParClientId: Compte[] }>({
        query: GET_ACCOUNTS,
        variables: { Id: clientId },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          return result.data?.comptesParClientId ?? [];
        })
      );
  }


  getCompteById(id: string): Observable<Compte | null> {
    return this.apollo
      .query<{ accountById: Compte }>({
        query: GET_COMPTE_BY_ID,
        variables: { id },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => result.data?.accountById ?? null)
      );
  }


  /**
   * Récupère les transactions d'un compte
   */
  getTransactionsByAccountId(
    compteId: string,
    startDate?: string,
    endDate?: string
  ): Observable<Transaction[]> {

    return this.apollo
      .query<{ getTransactions: Transaction[] }>({
        query: GET_TRANSACTIONS,
        variables: {
          compteId,
          startDate: startDate || null,
          endDate: endDate || null
        },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          return result.data?.getTransactions ?? [];
        })
      );
  }

  createAccount(typeCompte: string, solde: number, proprietaireId: string): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_COMPTE_MUTATION,
      variables: {
        input: {
          typeCompte,
          solde,
          proprietaireId
        }
      },
      refetchQueries: [{
        query: GET_ACCOUNTS,
        variables: { Id: proprietaireId }
      }]
    });
  }

  updateAccount(
    compteId: string,
    updates: {
      typeCompte?: string;
      numero?: string;
      solde?: number;
      proprietaireId?: string | null;
    }
  ): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_COMPTE_MUTATION,
      variables: {
        id: compteId,
        input: updates
      }
    });
  }


  deleteAccount(compteId: string): Observable<any> {
    // Implémenter la mutation de suppression si elle existe
    throw new Error('Méthode deleteAccount non implémentée');
  }
}
