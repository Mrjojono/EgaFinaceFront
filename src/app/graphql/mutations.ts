import { gql } from 'apollo-angular';

/* ===================== AUTH ===================== */

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        nom
        prenom
        telephone
        role
      }
    }
  }
`;

export const INITIATE_ACTIVATION_MUTATION = gql`
  mutation InitiateAccountActivation($identifiant: String!, $email: String!) {
    initiateActivation(identifiant: $identifiant, email: $email) {
      success
      message
    }
  }
`;

export const COMPLETE_ACTIVATION_MUTATION = gql`
  mutation ActivateAccount($token: String!, $password: String!) {
    completeActivation(token: $token, password: $password) {
      success
      message
    }
  }
`;

/* ===================== CLIENT ===================== */

export const REGISTER_MUTATION = gql`
  mutation Register(
    $email: String!
    $nom: String!
    $prenom: String!
    $nationalite: String!
    $password: String!
  ) {
    createClient(
      input: {
        email: $email
        nom: $nom
        prenom: $prenom
        nationalite: $nationalite
        password: $password
      }
    ) {
      id
      nom
      prenom
      email
      telephone
      adresse
      dateNaissance
    }
  }
`;

export const UPDATE_CLIENT_MUTATION = gql`
  mutation UpdateClient($id: ID!, $client: ClientInput!) {
    updateClient(id: $id, client: $client) {
      id
      nom
      prenom
      email
      telephone
      adresse
    }
  }
`;

export const DELETE_CLIENT_MUTATION = gql`
  mutation DeleteClient($id: ID!) {
    deleteClient(id: $id)
  }
`;

/* ===================== COMPTE ===================== */

export const CREATE_COMPTE_MUTATION = gql`
  mutation CreateCompte($input: CompteInput!) {
    createCompte(input: $input) {
      id
      typeCompte
      libelle
      solde
      proprietaire {
        id
      }
    }
  }
`;

export const UPDATE_COMPTE_MUTATION = gql`
  mutation UpdateCompte($compteId: ID!, $compte: CompteInput!) {
    updateCompte(id: $compteId, compte: $compte) {
      id
      typeCompte
      solde
      libelle
      statutCompte
      numero
      dateCreation
      proprietaire {
        id
        identifiant
      }
    }
  }
`;

export const DELETE_COMPTE_MUTATION = gql`
  mutation DeleteCompte($id: ID!) {
    deleteCompte(id: $id)
  }
`;

/* ===================== TRANSACTION ===================== */

export const VERSEMENT_MUTATION = gql`
  mutation Versement($input: TransactionInput!) {
    versement(input: $input) {
      id
      montant
      dateCreation
      compteSource {
        id
      }
      compteDestination {
        id
      }
    }
  }
`;

/* ===================== USER ===================== */

export const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: UserInput!) {
    createUser(input: $input) {
      email,
      password,
      nom,
      prenom,
      sexe,
      nationalite,
      role
    }
  }
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($id: ID!, $user: UserInput!) {
    updateUser(id: $id, user: $user) {
      id
      nom
      email
      role
    }
  }
`;

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;
