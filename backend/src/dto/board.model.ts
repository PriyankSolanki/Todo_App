import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class CardModel {
    @Field(() => Int) id: number;
    @Field() name: string;
    @Field({ nullable: true }) description?: string;
    @Field(() => Int) position: number;
}

@ObjectType()
export class BoardColumnModel {
    @Field(() => Int) id: number;
    @Field() name: string;
    @Field(() => Int) position: number;
    @Field(() => [CardModel]) cards: CardModel[];
}

@ObjectType()
export class BoardModel {
    @Field(() => Int) id: number;
    @Field() name: string;
    @Field(() => [BoardColumnModel]) columns: BoardColumnModel[];
}
