import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitEvaluationDto } from './dto';

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);

  constructor(private prisma: PrismaService) {}

  // 提交评测：调用 AI Service 评分，失败时降级返回 mock 评分（78 分）
  async submit(userId: string, dto: SubmitEvaluationDto) {
    const aiBaseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000/api';
    let result: any;

    try {
      const resp = await fetch(`${aiBaseUrl}/eval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audio_url: dto.audioUrl,
          text: dto.text,
          type: dto.type,
          user_id: userId,
        }),
      });
      if (!resp.ok) {
        throw new Error(`AI 服务响应状态 ${resp.status}`);
      }
      result = await resp.json();
    } catch (e) {
      // 降级：AI 服务不可用时返回 mock 评分
      this.logger.warn(`AI 服务不可用，降级返回 mock 评分: ${(e as Error).message}`);
      result = {
        score: 78,
        detail: { pronunciation: 78, fluency: 76, completeness: 80 },
        mock: true,
        message: 'AI 服务不可用，已返回 mock 评分',
      };
    }

    // 评测结果落库为练习记录
    await this.prisma.practiceRecord.create({
      data: {
        userId,
        type: dto.type || 'reading',
        title: `评测 - ${dto.text?.slice(0, 12) ?? ''}`,
        score: typeof result.score === 'number' ? result.score : 78,
        duration: 0,
      },
    });

    return result;
  }
}
