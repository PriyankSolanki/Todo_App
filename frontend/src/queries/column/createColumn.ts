import { gql } from "@apollo/client";

export const CREATE_COLUMN = gql`
  mutation CreateColumn($input: CreateColumnInput!) {
    createColumn(input: $input) {
      id
      name
      position
    }
  }
`;
