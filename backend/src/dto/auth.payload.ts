import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class AuthPayload {
    @Field(() => Int) userId: number;
    @Field() token: string;
}
