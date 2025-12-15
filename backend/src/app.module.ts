import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GraphQLModule } from '@nestjs/graphql';
import { AppService } from './app.service';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import {PrismaModule} from "./prisma/prisma.module";
import {BoardsModule} from "./board/board.module";
import {ColumnModule} from "./column/column.module";
import {CardModule} from "./card/card.module";
import {AuthModule} from "./auth/auth.module";

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    PrismaModule,
    BoardsModule,
    ColumnModule,
    CardModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
