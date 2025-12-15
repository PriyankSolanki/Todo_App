import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) {}

    private makeToken(userId: number) {
        return Buffer.from(`user:${userId}:${Date.now()}`).toString('base64');
    }

    async signup(identifiant: string, password: string) {
        const existing = await this.prisma.user.findUnique({ where: { identifiant } });
        if (existing) throw new BadRequestException('Login already used');
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await this.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: { identifiant, passwordHash },
            });
            const board = await tx.board.create({
                data: {
                    name: "Mon board",
                    userId: user.id,
                },
            });
            return { user, board };
        });
        return {
            userId: result.user.id,
            token: this.makeToken(result.user.id),
        };
    }

    async login(identifiant: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { identifiant } });
        if (!user) throw new UnauthorizedException('Login ou mot de passe incorrect');

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) throw new UnauthorizedException('Login ou mot de passe incorrect');

        return { userId: user.id, token: this.makeToken(user.id) };
    }
}
