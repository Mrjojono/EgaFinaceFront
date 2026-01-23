import { gql } from 'apollo-angular';

export const GET_USERS = gql`
  query GetUsers {
    clients{
      id,
      nom,
      prenom,
      nationalite
    }
  }
`;

export const GET_ACCOUNTS = gql`
  query GetAccounts($Id: ID!) {
    comptesParClientId(clientId: $Id) {
      id,
      numero,
      solde,
      typeCompte,
      dateCreation,
      libelle
    }
  }
`;



export const GET_TRANSACTIONS = gql`
  query GetTransactions($compteId: String!, $startDate: String!, $endDate: String!) {
    getTransactions(compteId: $compteId, startDate: $startDate, endDate: $endDate) {
      id
      montant
      dateCreation
      dateUpdate
      compteSource {
        id
        numero
        proprietaire {
          id
          nom
          prenom
        }
      }
      compteDestination {
        id
        numero
        proprietaire {
          id
          nom
          prenom
        }
      }
    }
  }
`;

export const GET_PAGED_TRANSACTIONS = gql`
  query GetPagedTransactions($page: Int, $size: Int) {
    transactions(page: $page, size: $size) {
      id
      montant
      dateCreation
      transactionType
      dateUpdate
      compteSource {
        id
        numero
        proprietaire {
          id
          nom
          prenom
          identifiant
          email
        }
      }
      compteDestination {
        id
        numero
        proprietaire {
          id
          nom
          prenom
          identifiant
          email
        }
      }
    }
  }
`;

export const GET_CLIENTS = gql`
  query GetClients($page: Int, $size: Int) {
    clients(page: $page, size: $size) {
      id
      nom
      prenom
      nationalite
      email
      telephone
      sexe
      identifiant
      dateNaissance
      adresse
    }
  }
`;


export const GET_CLIENT_BY_ID = gql`
  query GetClient($id: ID!) {
    client(id: $id) {
      id
      nom
      prenom
      dateNaissance
      sexe
      adresse
      email
      telephone
      nationalite
      identifiant
    }
  }
`;

export const GET_COMPTES = gql`
  query GetComptes($page: Int, $size: Int) {
    comptes(page: $page, size: $size) {
      id
      numero
      typeCompte
      solde
      dateCreation
      libelle
      proprietaire {
        id
        nom
        prenom
        identifiant
        email
      }
    }
  }
`;

export const GET_COMPTES_BY_CLIENT = gql`
  query GetComptesByClient($clientId: ID!) {
    comptesParClientId(clientId: $clientId) {
      id
      numero
      typeCompte
      solde
      dateCreation
    }
  }
`;

export const GET_COMPTE_BY_ID = gql`
  query GetCompteById($id: ID!) {
    accountById(id: $id) {
      id
      numero
      typeCompte
      solde
      dateCreation
      libelle
      proprietaire {
        id
        nom
        prenom
        nationalite
        sexe
        adresse
        telephone
        identifiant
        dateNaissance
      }
    }
  }
`;
export const  GET_ME = gql`
    query GetMyAccountInfo{
      me {
        id
        nom
        prenom
        email
        role
        telephone
        sexe
        nationalite
        dateNaissance
        identifiant
      }
    }
`


export const SEARCH_COMPTES_FOR_TRANSFER = gql`
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






export const GET_RELEVE = gql`
  query GetReleve($compteId: String!, $startDate: String!, $endDate: String!) {
    getReleve(compteId: $compteId, startDate: $startDate, endDate: $endDate) {
      soldeInitial
      soldeFinal
      dateDebut
      dateFin
    }
  }
`;

// Query pour récupérer le PDF en Base64
export const GET_RELEVE_PDF_BASE64 = gql`
  query GetRelevePdfBase64($compteId: String!, $startDate: String!, $endDate: String!) {
    getRelevePdfBase64(compteId: $compteId, startDate: $startDate, endDate: $endDate)
  }
`;

// Mutation pour l'envoi par email
export const SEND_RELEVE_BY_EMAIL = gql`
  mutation SendReleveByEmail($compteId: String!, $startDate: String!, $endDate: String!, $customEmail: String) {
    sendReleveByEmail(compteId: $compteId, startDate: $startDate, endDate: $endDate, customEmail: $customEmail)
  }
`;
