import { Module } from '@nestjs/common';
import { DatabaseController } from './database.controller';
import { DatabaseService } from './database.service';
import { PrismaReadWriteService } from './prisma-read-write.service';

@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService, PrismaReadWriteService],
  exports: [DatabaseService, PrismaReadWriteService], // 导出供其他模块使用
})
export class DatabaseModule {}
