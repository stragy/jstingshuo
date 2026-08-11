import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiagnosisService {
  constructor(private prisma: PrismaService) {}

  // 能力诊断数据
  async getDiagnosis(userId: string) {
    let diagnosis = await this.prisma.diagnosis.findUnique({
      where: { userId },
    });
    // 没有诊断记录时自动初始化
    if (!diagnosis) {
      diagnosis = await this.prisma.diagnosis.create({ data: { userId } });
    }

    const dimensions = [
      { key: 'listening', name: '听力', value: diagnosis.listening },
      { key: 'pronunciation', name: '发音', value: diagnosis.pronunciation },
      { key: 'vocabulary', name: '词汇', value: diagnosis.vocabulary },
      { key: 'grammar', name: '语法', value: diagnosis.grammar },
      { key: 'fluency', name: '流利度', value: diagnosis.fluency },
    ];

    const overall = Math.round(
      dimensions.reduce((s, d) => s + d.value, 0) / dimensions.length,
    );
    const weakPoints = [...dimensions].sort((a, b) => a.value - b.value).slice(0, 2);
    const strongPoints = [...dimensions].sort((a, b) => b.value - a.value).slice(0, 1);

    return {
      dimensions,
      overall,
      weakPoints,
      strongPoints,
      updatedAt: diagnosis.updatedAt,
    };
  }
}
