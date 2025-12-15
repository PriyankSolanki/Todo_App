import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateColumnInput {

    @Field()
    name: string;

    @Field(() => Int)
    position: number;

    @Field(() => Int)
    boardId: number;
}
