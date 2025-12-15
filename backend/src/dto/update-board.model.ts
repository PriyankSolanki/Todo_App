import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateBoardInput {
    @Field(() => Int)
    id: number;

    @Field()
    name: string;
}
