import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CardService {
    constructor(private readonly prisma: PrismaService) {}

    updateCard(input: { id: number; name?: string; description?: string; columnId?: number; position?: number }) {
        const { id, ...data } = input;

        return this.prisma.card.update({
            where: { id },
            data: {
                ...(data.name !== undefined ? { name: data.name.trim() } : {}),
                ...(data.description !== undefined ? { description: data.description } : {}),
                ...(data.columnId !== undefined ? { columnId: data.columnId } : {}),
                ...(data.position !== undefined ? { position: data.position } : {}),
            },
        });
    }

    async createCard(columnId: number, name: string, description?: string) {
        const last = await this.prisma.card.findFirst({
            where: { columnId },
            orderBy: { position: 'desc' },
            select: { position: true },
        });

        const nextPos = (last?.position ?? -1) + 1;

        return this.prisma.card.create({
            data: {
                columnId,
                name: name.trim(),
                description: description ?? '',
                position: nextPos,
            },
        });
    }

    async deleteCard(id: number) {
        return this.prisma.card.delete({
            where: { id },
        });
    }

    async reorderCards(items: { id: number; columnId: number; position: number }[]) {
        const byTargetColumn = new Map<number, { id: number; position: number }[]>();
        for (const it of items) {
            if (!byTargetColumn.has(it.columnId)) byTargetColumn.set(it.columnId, []);
            byTargetColumn.get(it.columnId)!.push({ id: it.id, position: it.position });
        }

        return this.prisma.$transaction(async (tx) => {
            for (const [targetColumnId, cards] of byTargetColumn.entries()) {
                for (let i = 0; i < cards.length; i++) {
                    const c = cards[i];
                    await tx.card.update({
                        where: { id: c.id },
                        data: { columnId: targetColumnId, position: 10000 + i },
                    });
                }
            }

            for (const [targetColumnId, cards] of byTargetColumn.entries()) {
                for (const c of cards) {
                    await tx.card.update({
                        where: { id: c.id },
                        data: { columnId: targetColumnId, position: c.position },
                    });
                }
            }

            return true;
        });
    }



}
