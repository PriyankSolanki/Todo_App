import { gql } from "@apollo/client";

export const REORDER_CARDS = gql`
  mutation ReorderCards($input: ReorderCardsInput!) {
    reorderCards(input: $input)
  }
`;
