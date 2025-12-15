import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResolver } from './auth.resolver';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    providers: [AuthService, AuthResolver, PrismaService],
})
export class AuthModule {}
