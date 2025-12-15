import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class ReorderCardItemInput {
    @Field(() => Int)
    id: number;

    @Field(() => Int)
    columnId: number;

    @Field(() => Int)
    position: number;
}

@InputType()
export class ReorderCardsInput {
    @Field(() => [ReorderCardItemInput])
    items: ReorderCardItemInput[];
}
