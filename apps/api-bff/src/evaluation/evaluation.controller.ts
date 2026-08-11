import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { SubmitEvaluationDto } from './dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('evaluation')
@UseGuards(JwtAuthGuard)
export class EvaluationController {
  constructor(private evaluationService: EvaluationService) {}

  // POST /api/evaluation/submit
  @Post('submit')
  submit(@Request() req: any, @Body() dto: SubmitEvaluationDto) {
    return this.evaluationService.submit(req.user.id, dto);
  }
}
