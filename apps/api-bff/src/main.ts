import 'dotenv/config'; // 必须最先加载，确保环境变量可用
import 'reflect-metadata';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 启用 CORS，允许前端跨域访问
  app.enableCors();

  // 所有业务接口统一前缀 /api
  app.setGlobalPrefix('api');

  // 全局校验管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 本地上传文件的静态服务（开发环境 ./uploads）
  const uploadsDir = path.resolve(process.env.OSS_LOCAL_DIR || './uploads');
  app.useStaticAssets(uploadsDir, { prefix: '/uploads/' });

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`🚀 慧听说 BFF 服务已启动: http://localhost:${port}/api`);
}

bootstrap();
