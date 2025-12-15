import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ColumnService {
    constructor(private readonly prisma: PrismaService) {}

    async updateColumnName(id: number, name: string) {
        return this.prisma.boardColumn.update({
            where: { id },
            data: { name },
        });
    }

    async createColumn(boardId: number, name: string) {
        const last = await this.prisma.boardColumn.findFirst({
            where: { boardId },
            orderBy: { position: 'desc' },
            select: { position: true },
        });

        const nextPos = (last?.position ?? -1) + 1;

        return this.prisma.boardColumn.create({
            data: {
                boardId,
                name: name.trim(),
                position: nextPos,
            },
        });
    }

    async deleteColumn(id: number) {
        return this.prisma.boardColumn.delete({
            where: { id },
        });
    }

}
