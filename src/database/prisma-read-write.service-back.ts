import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Injectable()
export class PrismaReadWriteService implements OnModuleInit, OnModuleDestroy {
  private writeClient: PrismaClient;
  private readClient: PrismaClient;

  constructor() {
    // 📍 Lambda 环境特殊配置
    const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;
    
    console.log('🔍 环境检测:', {
      isLambda,
      awsRegion: process.env.AWS_REGION,
      nodeEnv: process.env.NODE_ENV,
    });

    // 获取数据库连接字符串
    const writeDbUrl = process.env.DATABASE_URL;
    const readDbUrl = process.env.READ_DATABASE_URL || process.env.DATABASE_URL;

    console.log('🔗 数据库连接配置:', {
      writeDbUrl: writeDbUrl ? `${writeDbUrl.substring(0, 50)}...` : 'undefined',
      readDbUrl: readDbUrl ? `${readDbUrl.substring(0, 50)}...` : 'undefined',
    });

    const clientConfig: Prisma.PrismaClientOptions = {
      datasources: {
        db: {
          url: writeDbUrl,
        },
      },
      log: isLambda ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
      // Lambda环境优化
      ...(isLambda && {
        __internal: {
          engine: {
            binaryTarget: 'rhel-openssl-3.0.x',
          }
        }
      }),
    };

    const readClientConfig: Prisma.PrismaClientOptions = {
      datasources: {
        db: {
          url: readDbUrl,
        },
      },
      log: isLambda ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
      // Lambda环境优化
      ...(isLambda && {
        __internal: {
          engine: {
            binaryTarget: 'rhel-openssl-3.0.x',
          }
        }
      }),
    };

    // 写数据库连接
    this.writeClient = new PrismaClient(clientConfig);

    // 读数据库连接（如果没有单独的读取URL，则使用写入连接）
    this.readClient = readDbUrl !== writeDbUrl ? new PrismaClient(readClientConfig) : this.writeClient;
  }

  async onModuleInit() {
    if (process.env.SKIP_DB_CONNECTION === 'true') {
      console.log('🚫 跳过数据库连接（SKIP_DB_CONNECTION=true）');
      return;
    }

    const maxRetries = 3;
    const retryDelay = 2000; // 2秒

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 正在连接数据库... (尝试 ${attempt}/${maxRetries})`);
        
        // 首先连接写数据库
        await this.writeClient.$connect();
        console.log('✅ 写数据库连接成功');
        
        // 如果读写数据库是不同的实例，则连接读数据库
        if (this.readClient !== this.writeClient) {
          await this.readClient.$connect();
          console.log('✅ 读数据库连接成功');
        } else {
          console.log('ℹ️ 使用同一数据库实例进行读写操作');
        }
        
        // 测试连接
        await this.writeClient.$queryRaw`SELECT 1`;
        console.log('✅ 数据库连接测试成功');
        
        return; // 成功连接，退出重试循环
        
      } catch (error) {
        console.error(`❌ 数据库连接失败 (尝试 ${attempt}/${maxRetries}):`, error);
        
        if (attempt === maxRetries) {
          console.error('❌ 所有重试尝试均失败，抛出错误');
          throw new Error(`数据库连接失败，已重试 ${maxRetries} 次: ${error.message}`);
        }
        
        // 等待后重试
        console.log(`⏳ 等待 ${retryDelay}ms 后重试...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }

  async onModuleDestroy() {
    try {
      if (this.readClient !== this.writeClient) {
        await this.readClient.$disconnect();
        console.log('✅ 读数据库连接已断开');
      }
      await this.writeClient.$disconnect();
      console.log('✅ 写数据库连接已断开');
    } catch (error) {
      console.error('❌ 断开数据库连接时出错:', error);
    }
  }

  // 获取写数据库实例
  get write(): PrismaClient {
    return this.writeClient;
  }

  // 获取读数据库实例
  get read(): PrismaClient {
    return this.readClient;
  }

  // 健康检查方法
  async healthCheck(): Promise<boolean> {
    try {
      await this.writeClient.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('❌ 数据库健康检查失败:', error);
      return false;
    }
  }
}