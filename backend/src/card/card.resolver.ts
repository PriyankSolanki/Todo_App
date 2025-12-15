import {Args, Int, Mutation, Resolver} from '@nestjs/graphql';
import { CardService } from './card.service';
import { CardModel } from '../dto/board.model';
import {UpdateCardInput} from "../dto/update-card.model";
import {CreateCardInput} from "../dto/create-card.model";
import {ReorderCardsInput} from "../dto/reorder-card.model";
@Resolver(() => CardModel)
export class CardResolver {
    constructor(private readonly cardService: CardService) {}

    @Mutation(() => CardModel)
    updateCard(@Args('input') input: UpdateCardInput) {
        return this.cardService.updateCard(input);
    }

    @Mutation(() => CardModel)
    createCard(@Args('input') input: CreateCardInput) {
        return this.cardService.createCard(input.columnId, input.name, input.description);
    }

    @Mutation(() => Boolean)
    async deleteCard(@Args('id' ,{type: () => Int}) id: number) {
        await this.cardService.deleteCard(id);
        return true;
    }

    @Mutation(() => Boolean)
    reorderCards(@Args('input') input: ReorderCardsInput) {
        return this.cardService.reorderCards(input.items);
    }
}
