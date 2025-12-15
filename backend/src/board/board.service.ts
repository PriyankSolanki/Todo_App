import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BoardsService {
    constructor(private readonly prisma: PrismaService) {}

    async boardsByUser(userId: number) {
        return this.prisma.board.findMany({
            where: { userId },
            include: {
                columns: {
                    orderBy: { position: 'asc' },
                    include: {
                        cards: { orderBy: { position: 'asc' } },
                    },
                },
            },
            orderBy: { id: 'desc' },
        });
    }

    async updateBoardName(id: number, name: string) {
        return this.prisma.board.update({
            where: { id },
            data: { name },
        });
    }
}
