import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class CreateCardInput {
    @Field(() => Int)
    columnId: number;

    @Field()
    name: string;

    @Field({ nullable: true })
    description?: string;
}
