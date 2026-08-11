import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('diagnosis')
@UseGuards(JwtAuthGuard)
export class DiagnosisController {
  constructor(private diagnosisService: DiagnosisService) {}

  // GET /api/diagnosis
  @Get()
  get(@Request() req: any) {
    return this.diagnosisService.getDiagnosis(req.user.id);
  }
}
