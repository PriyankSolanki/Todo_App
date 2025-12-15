import {Args, Int, Mutation, Query, Resolver} from '@nestjs/graphql';
import { BoardsService } from './board.service';
import { BoardModel } from '../dto/board.model';
import {UpdateBoardInput} from "../dto/update-board.model";

@Resolver(() => BoardModel)
export class BoardsResolver {
    constructor(private readonly boardsService: BoardsService) {}

    @Query(() => [BoardModel])
    boardsByUser(@Args('userId', { type: () => Int }) userId: number) {
        return this.boardsService.boardsByUser(userId);
    }

    @Mutation(() => BoardModel)
    updateBoard(@Args('input') input: UpdateBoardInput) {
        return this.boardsService.updateBoardName(input.id, input.name);
    }
}
