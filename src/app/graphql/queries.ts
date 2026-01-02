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
