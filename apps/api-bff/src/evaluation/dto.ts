import { IsString } from 'class-validator';

// 评测提交 DTO
export class SubmitEvaluationDto {
  @IsString()
  audioUrl: string; // 音频文件 URL

  @IsString()
  text: string; // 朗读/对话文本

  @IsString()
  type: string; // listening/reading/dialogue/vocab
}
