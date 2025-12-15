import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { CardResolver } from './card.resolver';
import { CardService } from './card.service';

@Module({
    imports: [PrismaModule],
    providers: [CardResolver, CardService],
})
export class CardModule {}
