import { gql } from "@apollo/client";

export const GET_BOARDS = gql`
  query GetBoards($userId: Int!) {
    boardsByUser(userId: $userId) {
      id
      name
      columns {
        id
        name
        position
        cards {
          id
          name
          description
          position
        }
      }
    }
  }
`;
