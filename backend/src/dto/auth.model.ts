import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SignupInput {
    @Field() login: string;
    @Field() password: string;
}

@InputType()
export class LoginInput {
    @Field() login: string;
    @Field() password: string;
}
