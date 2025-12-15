import { gql } from "@apollo/client";

export const UPDATE_CARD = gql`
  mutation UpdateCard($input: UpdateCardInput!) {
    updateCard(input: $input) {
      id
      name
      description
      position
    }
  }
`;
