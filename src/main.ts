// main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS
  app.enableCors();

  // Swagger配置
  const config = new DocumentBuilder()
    .setTitle('GitHub API')
    .setDescription('NestJS GitHub仓库管理API')
    .setVersion('1.0')
    .addBearerAuth() // 添加认证
    .addTag('GitHub', 'GitHub仓库相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // 访问路径: /api

  await app.listen(3001);
}
bootstrap();