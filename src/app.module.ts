import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubModule } from './github/github.module';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
// import { PrismaService } from './database/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true, // 设为全局模块
    envFilePath: '.env',
    cache: true, // 缓存环境变量
  }),GithubModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
  // exports: []
})

export class AppModule {}
