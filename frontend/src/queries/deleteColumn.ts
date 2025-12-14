import { gql } from "@apollo/client";

export const DELETE_COLUMN = gql`
  mutation DeleteColumn($id: Int!) {
    deleteColumn(id: $id)
  }
`;
