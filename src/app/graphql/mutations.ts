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
`;
