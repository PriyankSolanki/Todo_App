import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class UpdateCardInput {
    @Field(() => Int)
    id: number;

    @Field({ nullable: true })
    name?: string;

    @Field({ nullable: true })
    description?: string;

    @Field(() => Int, { nullable: true })
    columnId?: number;

    @Field(() => Int, { nullable: true })
    position?: number;
}
