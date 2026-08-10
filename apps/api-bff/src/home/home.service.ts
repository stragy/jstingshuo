import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  // 首页 dashboard：进度环 + 统计网格 + AI 推荐 + 雷达图
  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const records = await this.prisma.practiceRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const diagnosis = await this.prisma.diagnosis.findUnique({
      where: { userId },
    });

    // 进度环：平均分 / 目标分
    const targetScore = user?.targetScore ?? 85;
    const scored = records.filter((r) => r.score != null);
    const avgScore = scored.length
      ? Math.round(scored.reduce((s, r) => s + (r.score ?? 0), 0) / scored.length)
      : 0;
    const percent = Math.min(100, Math.round((avgScore / targetScore) * 100));

    // 统计网格
    const totalPractice = records.length;
    const totalDuration = records.reduce((s, r) => s + r.duration, 0);
    const todayCount = records.filter((r) => this.isSameDay(r.createdAt, new Date())).length;
    const streak = this.calcStreak(records);

    // 雷达图数据
    const radar = diagnosis
      ? [
          { name: '听力', value: diagnosis.listening },
          { name: '发音', value: diagnosis.pronunciation },
          { name: '词汇', value: diagnosis.vocabulary },
          { name: '语法', value: diagnosis.grammar },
          { name: '流利度', value: diagnosis.fluency },
        ]
      : [];

    // AI 推荐：按弱项排序取前 3
    const recommendations = this.buildRecommendations(diagnosis);

    return {
      progressRing: { current: avgScore, target: targetScore, percent },
      stats: {
        totalPractice,
        totalDuration,
        todayCount,
        streak,
      },
      radar,
      recommendations,
    };
  }

  private buildRecommendations(diagnosis: any) {
    if (!diagnosis) return [];
    const items = [
      { name: '听力', value: diagnosis.listening, type: 'listening', title: '听力专项训练 - 短对话精听' },
      { name: '发音', value: diagnosis.pronunciation, type: 'reading', title: '发音矫正 - 易错音跟读' },
      { name: '词汇', value: diagnosis.vocabulary, type: 'vocab', title: '词汇巩固 - 高频词打卡' },
      { name: '语法', value: diagnosis.grammar, type: 'dialogue', title: '语法实战 - 情景对话' },
      { name: '流利度', value: diagnosis.fluency, type: 'reading', title: '流利度提升 - 篇章朗读' },
    ];
    return items
      .sort((a, b) => a.value - b.value)
      .slice(0, 3)
      .map((i) => ({
        type: i.type,
        title: i.title,
        reason: `${i.name}偏弱（${i.value}分），建议优先加强`,
      }));
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // 计算连续练习天数
  private calcStreak(records: { createdAt: Date }[]): number {
    if (!records.length) return 0;
    const days = new Set(records.map((r) => new Date(r.createdAt).toDateString()));
    let streak = 0;
    const cur = new Date();
    while (days.has(cur.toDateString())) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    }
    return streak;
  }
}
