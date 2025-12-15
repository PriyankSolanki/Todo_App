import { gql } from "@apollo/client";

export const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      id
      name
      description
      position
    }
  }
`;
