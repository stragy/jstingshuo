import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ExamService } from './exam.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('exam')
@UseGuards(JwtAuthGuard)
export class ExamController {
  constructor(private examService: ExamService) {}

  // GET /api/exam/list?year=
  @Get('list')
  list(@Query('year') year?: string) {
    return this.examService.getList(year);
  }
}
