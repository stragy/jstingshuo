import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { CacheModule } from './cache/cache.module';
import { OssModule } from './oss/oss.module';
import { AuthModule } from './auth/auth.module';
import { HomeModule } from './home/home.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { PracticeModule } from './practice/practice.module';
import { ExamModule } from './exam/exam.module';
import { EvaluationModule } from './evaluation/evaluation.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // 基础设施
    PrismaModule,
    CacheModule,
    OssModule,
    // 业务模块
    AuthModule,
    HomeModule,
    DiagnosisModule,
    PracticeModule,
    ExamModule,
    EvaluationModule,
    UploadModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
