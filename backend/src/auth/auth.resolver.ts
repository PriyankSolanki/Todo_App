import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { SignupInput, LoginInput } from '../dto/auth.model';
import { AuthPayload } from '../dto/auth.payload';

@Resolver()
export class AuthResolver {
    constructor(private readonly authService: AuthService) {}

    @Mutation(() => AuthPayload)
    signup(@Args('input') input: SignupInput) {
        return this.authService.signup(input.login, input.password);
    }

    @Mutation(() => AuthPayload)
    login(@Args('input') input: LoginInput) {
        return this.authService.login(input.login, input.password);
    }
}
