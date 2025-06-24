import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaReadWriteService implements OnModuleInit, OnModuleDestroy {
  private writeClient: PrismaClient;
  private readClient: PrismaClient;

  constructor() {
    // 写数据库连接
    this.writeClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });

    // 读数据库连接
    this.readClient = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_READ_URL,
        },
      },
    });
  }

  async onModuleInit() {
    await this.writeClient.$connect();
    await this.readClient.$connect();
  }

  async onModuleDestroy() {
    await this.writeClient.$disconnect();
    await this.readClient.$disconnect();
  }

  // 获取写数据库实例
  get write(): PrismaClient {
    return this.writeClient;
  }

  // 获取读数据库实例
  get read(): PrismaClient {
    return this.readClient;
  }
}