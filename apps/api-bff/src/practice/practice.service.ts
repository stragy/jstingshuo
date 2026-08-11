import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PracticeService {
  constructor(private prisma: PrismaService) {}

  // 练习列表，支持按类型筛选
  async getList(userId: string, type?: string) {
    const where: { userId: string; type?: string } = { userId };
    if (type) {
      where.type = type;
    }

    const list = await this.prisma.practiceRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // 按类型分组的统计
    const summary = await this.prisma.practiceRecord.groupBy({
      by: ['type'],
      where: { userId },
      _count: { _all: true },
      _avg: { score: true },
    });

    return {
      list,
      summary: summary.map((s) => ({
        type: s.type,
        count: s._count._all,
        avgScore: s._avg.score ? Math.round(s._avg.score) : null,
      })),
    };
  }
}
