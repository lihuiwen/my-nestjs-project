import { Controller, Get, HttpException, HttpStatus, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaReadWriteService } from './database/prisma-read-write.service';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prismaService: PrismaReadWriteService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get application status' })
  @ApiResponse({ status: 200, description: 'Application is running' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('migrate')
  @ApiOperation({ summary: 'Run database migration' })
  @ApiResponse({ status: 200, description: 'Migration completed successfully' })
  async runMigration() {
    console.log('🔧 开始数据库迁移...');
    
    try {
      // 直接使用原始SQL创建表
      await this.prismaService.write.$executeRaw`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" SERIAL PRIMARY KEY,
          "email" TEXT NOT NULL UNIQUE,
          "name" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      await this.prismaService.write.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Post" (
          "id" SERIAL PRIMARY KEY,
          "title" TEXT NOT NULL,
          "content" TEXT,
          "published" BOOLEAN NOT NULL DEFAULT false,
          "authorId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `;
      
      console.log('✅ 数据库表创建成功');
      
      return {
        success: true,
        message: '数据库迁移完成',
        timestamp: new Date().toISOString(),
        tables: ['User', 'Post']
      };
      
    } catch (error) {
      console.error('❌ 数据库迁移失败:', error);
      throw new HttpException(
        `Migration failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Health check successful' })
  async healthCheck() {
    console.log('🔍 开始健康检查...');
    
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV,
      awsRegion: process.env.AWS_REGION,
      isLambda: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
      databaseUrlExists: !!process.env.DATABASE_URL,
      readDatabaseUrlExists: !!process.env.READ_DATABASE_URL,
      // 只显示连接字符串的前缀，不暴露敏感信息
      databaseHost: process.env.DATABASE_URL ? 
        process.env.DATABASE_URL.match(/@([^:]+)/)?.[1] : 'undefined',
    };

    console.log('🔍 环境信息:', environmentInfo);

    let databaseStatus = 'disconnected';
    let databaseError = null;

    try {
      // 使用PrismaReadWriteService来检查数据库连接
      const isHealthy = await this.prismaService.healthCheck();
      databaseStatus = isHealthy ? 'connected' : 'error';
    } catch (error) {
      console.error('❌ 健康检查数据库连接失败:', error);
      databaseStatus = 'error';
      databaseError = error.message;
    }

    const healthStatus = {
      status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: environmentInfo,
      database: {
        status: databaseStatus,
        error: databaseError,
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    };

    console.log('🏥 健康检查结果:', healthStatus);
    
    return healthStatus;
  }

  @Get('network-test')
  @ApiOperation({ summary: 'Test network connectivity' })
  @ApiResponse({ status: 200, description: 'Network test results' })
  async testNetwork() {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AWS_REGION: process.env.AWS_REGION,
        DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      },
      networking: {} as any,
      dns: {} as any
    };

    try {
      // 测试 DNS 解析
      const { exec } = await import('child_process');
      const util = await import('util');
      const execPromise = util.promisify(exec);
      
      // 提取数据库主机名
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl) {
        const match = dbUrl.match(/postgresql:\/\/[^@]+@([^:]+)/);
        if (match) {
          const hostname = match[1];
          results.dns.hostname = hostname;
          
          try {
            const { stdout } = await execPromise(`nslookup ${hostname}`);
            results.dns.resolution = 'SUCCESS';
            results.dns.details = stdout.split('\n').slice(0, 5).join('\n');
          } catch (error) {
            results.dns.resolution = 'FAILED';
            results.dns.error = error.message;
          }
        }
      }

      // 测试网络连接（使用 nc 命令）
      if (results.dns.hostname) {
        try {
          const { stdout } = await execPromise(`nc -z -v ${results.dns.hostname} 5432 2>&1`);
          results.networking.postgres = 'REACHABLE';
          results.networking.details = stdout;
        } catch (error) {
          results.networking.postgres = 'UNREACHABLE';
          results.networking.error = error.message;
        }
      }

    } catch (error) {
      throw new HttpException(
        `Network test failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return results;
  }

  @Get('network-debug')
  @ApiOperation({ summary: 'Network debugging endpoint' })
  @ApiResponse({ status: 200, description: 'Network debug information' })
  async networkDebug() {
    const results = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        AWS_REGION: process.env.AWS_REGION,
        DATABASE_URL: process.env.DATABASE_URL ? 
          process.env.DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'undefined',
        READ_DATABASE_URL: process.env.READ_DATABASE_URL ? 
          process.env.READ_DATABASE_URL.replace(/:[^:@]*@/, ':***@') : 'undefined',
      },
      networking: {
        vpc: 'Check if Lambda is in VPC',
        subnet: 'Check subnet configuration',
        security_groups: 'Check security group rules',
        dns: 'Check DNS resolution',
      },
      database: {
        endpoint_extraction: null as any,
        port_check: null as any,
      }
    };

    // 解析数据库端点信息
    try {
      if (process.env.DATABASE_URL) {
        const url = new URL(process.env.DATABASE_URL);
        results.database.endpoint_extraction = {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port || 'default',
          pathname: url.pathname,
          searchParams: Object.fromEntries(url.searchParams.entries()),
        };
        
        // 检查端点格式是否符合预期
        if (url.hostname.includes('nestjs-lambda-api-serverless-cluster')) {
          results.database.port_check = {
            expected_port: '5432',
            actual_port_in_url: url.port || '5432',
            hostname_format: 'correct',
            cluster_name: 'nestjs-lambda-api-serverless-cluster'
          };
        } else {
          results.database.port_check = {
            hostname_format: 'unexpected',
            actual_hostname: url.hostname
          };
        }
      }
    } catch (error) {
      results.database.endpoint_extraction = { error: error.message };
    }

    console.log('🔍 网络诊断结果:', JSON.stringify(results, null, 2));
    
    return results;
  }
}
