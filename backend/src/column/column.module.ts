import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ColumnResolver } from './column.resolver';
import { ColumnService } from './column.service';

@Module({
    imports: [PrismaModule],
    providers: [ColumnResolver, ColumnService],
})
export class ColumnModule {}
