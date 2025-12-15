import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { BoardsResolver } from './board.resolver';
import { BoardsService } from './board.service';

@Module({
    imports: [PrismaModule],
    providers: [BoardsResolver, BoardsService],
})
export class BoardsModule {}
