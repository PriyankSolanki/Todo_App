import { gql } from "@apollo/client";

export const UPDATE_COLUMN = gql`
  mutation UpdateColumnName($id: Int!, $name: String!) {
    updateColumnName(id: $id, name: $name) {
      id
      name
    }
  }
`;
