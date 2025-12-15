import { gql } from "@apollo/client";

export const UPDATE_BOARD = gql`
  mutation UpdateBoard($input: UpdateBoardInput!) {
    updateBoard(input: $input) {
      id
      name
    }
  }
`;
