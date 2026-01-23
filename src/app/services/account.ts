import {inject, Injectable} from '@angular/core';
import {Apollo, gql} from 'apollo-angular';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {GET_ACCOUNTS, GET_COMPTE_BY_ID, GET_COMPTES, GET_TRANSACTIONS} from '../graphql/queries';
import {CREATE_COMPTE_MUTATION, UPDATE_COMPTE_MUTATION} from '../graphql/mutations';
import {AuthService} from "./auth";
import {Role} from '../types/user.type';

export enum StatutCompte {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  FERME='FERME',
  EN_ATTENTE='EN_ATTENTE',
  INACTIF='INACTIF'
}

export interface Proprietaire {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  identifiant: string;
}

export interface Compte {
  id: string;
  numero: string;
  solde: number;
  typeCompte: string;
  dateCreation: string;
  libelle: string;
  proprietaire?: Proprietaire;
  statutCompte: StatutCompte;
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

export interface Client {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  identifiant: string;
}

// Nouvelle interface pour les infos publiques de compte
export interface ComptePublicInfo {
  id: string;
  numero: string;
  typeCompte: string;
  libelle: string;
  proprietaireNom: string;
  proprietaireEmail: string;
}

// Nouvelle query pour la recherche publique
const SEARCH_COMPTES_FOR_TRANSFER = gql`
  query SearchComptesForTransfer($email: String!) {
    searchComptesForTransfer(email: $email) {
      id
      numero
      typeCompte
      libelle
      proprietaireNom
      proprietaireEmail
    }
  }
`;

const SEARCH_CLIENTS = gql`
  query SearchClients {
    clients(page: 0, size: 100) {
      id
      nom
      prenom
      email
      identifiant
    }
  }
`;

@Injectable({providedIn: 'root'})
export class AccountService {
  private authService = inject(AuthService);

  constructor(private apollo: Apollo) {
  }

  /**
   * Récupère tous les comptes d'un client
   */
  getAccountsByClientId(clientId: string): Observable<Compte[]> {
    return this.apollo
      .query<{ comptesParClientId: Compte[] }>({
        query: GET_ACCOUNTS,
        variables: {Id: clientId},
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          return result.data?.comptesParClientId ?? [];
        })
      );
  }

  /**
   * Récupère les comptes d'un client pour un transfert (version publique)
   * N'expose pas les informations sensibles
   */
  getAccountsForTransfer(clientId: string): Observable<Compte[]> {
    return this.apollo
      .query<{ comptesParClientId: Compte[] }>({
        query: GET_ACCOUNTS,
        variables: {
          Id: clientId,
          forTransfer: true // Nouveau paramètre
        },
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
        variables: {id},
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
    startDate?: string | null,
    endDate?: string | null
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

  createAccount(typeCompte: string, solde: number, proprietaireId: string, libelle:string): Observable<any> {
    return this.apollo.mutate({
      mutation: CREATE_COMPTE_MUTATION,
      variables: {
        input: {
          typeCompte,
          solde,
          proprietaireId,
          libelle
        }
      },
      refetchQueries: [{
        query: GET_ACCOUNTS,
        variables: {Id: proprietaireId}
      }]
    });
  }

  updateAccount(
    compteId: string,
    updates: {
      typeCompte?: string;
      numero?: string;
      solde?: number;
      libelle?: string;
      statutCompte?: StatutCompte;
      proprietaireId?: string | null;
    }
  ): Observable<any> {
    return this.apollo.mutate({
      mutation: UPDATE_COMPTE_MUTATION,
      variables: {
        compteId: compteId,
        compte: updates
      }
    });
  }

  deleteAccount(compteId: string): Observable<any> {
    throw new Error('Méthode deleteAccount non implémentée');
  }

  /**
   * Récupère tous les comptes (admin uniquement)
   */
  getAllComptes(page?: number, size?: number): Observable<Compte[]> {
    return this.apollo
      .query<{ comptes: Compte[] }>({
        query: GET_COMPTES,
        variables: {page, size},
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => result.data?.comptes ?? [])
      );
  }

  getComptes(page?: number, size?: number): Observable<Compte[]> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    if (this.authService.hasRole([Role.AGENT_ADMIN, Role.ADMIN, Role.SUPER_ADMIN])) {
      return this.getAllComptes(page, size);
    }

    const clientId = this.authService.getCurrentUserId();
    if (!clientId) {
      throw new Error('ID client introuvable');
    }
    return this.getAccountsByClientId(clientId);
  }

  /**
   * NOUVELLE MÉTHODE : Recherche des comptes par email pour transfert
   * Utilise la query publique qui ne nécessite pas d'autorisation spéciale
   */
  searchComptesForTransfer(email: string): Observable<ComptePublicInfo[]> {
    return this.apollo
      .query<{ searchComptesForTransfer: ComptePublicInfo[] }>({
        query: SEARCH_COMPTES_FOR_TRANSFER,
        variables: { email },
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => result.data?.searchComptesForTransfer ?? [])
      );
  }

  /**
   * Recherche des clients par email (pour trouver les destinataires)
   */
  searchClientsByEmail(email: string): Observable<Client[]> {
    return this.apollo
      .query<{ clients: Client[] }>({
        query: SEARCH_CLIENTS,
        fetchPolicy: 'network-only'
      })
      .pipe(
        map(result => {
          const clients = result.data?.clients ?? [];
          return clients.filter(client =>
            client.email?.toLowerCase().includes(email.toLowerCase())
          );
        })
      );
  }

  /**
   * Récupère les comptes actifs de l'utilisateur connecté
   */
  getMyActiveAccounts(): Observable<Compte[]> {
    const clientId = this.authService.getCurrentUserId();
    if (!clientId) {
      throw new Error('Utilisateur non connecté');
    }

    return this.getAccountsByClientId(clientId).pipe(
      map(comptes => comptes.filter(c => c.statutCompte === StatutCompte.ACTIF))
    );
  }
}
