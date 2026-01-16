import { gql } from 'apollo-angular';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password){
      token,
      user {
        id,
        nom,
        prenom
        telephone,
        role
      }
    }
  }
  mutation Register($email: String!, $nom: String!, $prenom: String!, $nationalite: String!, $password: String!) {
    createClient(input: {email: $email, nom: $nom, prenom: $prenom, nationalite: $nationalite, password: $password}) {
      id,
      nom,
      prenom,
      email
      telephone,
      adresse,
      dateNaissance
    }
  }
`;
