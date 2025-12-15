import {Args, Int, Mutation, Resolver} from '@nestjs/graphql';
import { ColumnService } from './column.service';
import { BoardColumnModel } from '../dto/board.model';
import {CreateColumnInput} from "../dto/create-column.model";

@Resolver(() => BoardColumnModel)
export class ColumnResolver {
    constructor(private readonly columnService: ColumnService) {}

    @Mutation(() => BoardColumnModel)
    updateColumnName(
        @Args('id', { type: () => Int }) id: number,
        @Args('name') name: string,
    ) {
        return this.columnService.updateColumnName(id, name.trim());
    }

    @Mutation(() => BoardColumnModel)
    createColumn(@Args('input') input: CreateColumnInput) {
        return this.columnService.createColumn(input.boardId, input.name);
    }

    @Mutation(() => Boolean)
    async deleteColumn(@Args('id', {type: () => Int}) id: number) {
        await this.columnService.deleteColumn(id);
        return true;
    }
}
