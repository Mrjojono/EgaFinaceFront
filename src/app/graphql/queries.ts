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
    }
  }
`;



export const GET_TRANSACTIONS = gql`
  query GetTransactions($compteId: String!, $startDate: String, $endDate: String) {
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



