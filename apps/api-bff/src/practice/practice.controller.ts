import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('practice')
@UseGuards(JwtAuthGuard)
export class PracticeController {
  constructor(private practiceService: PracticeService) {}

  // GET /api/practice/list?type=
  @Get('list')
  list(@Request() req: any, @Query('type') type?: string) {
    return this.practiceService.getList(req.user.id, type);
  }
}
