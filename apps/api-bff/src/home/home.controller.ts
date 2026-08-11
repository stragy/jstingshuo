import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { HomeService } from './home.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('home')
@UseGuards(JwtAuthGuard)
export class HomeController {
  constructor(private homeService: HomeService) {}

  // GET /api/home/dashboard
  @Get('dashboard')
  dashboard(@Request() req: any) {
    return this.homeService.getDashboard(req.user.id);
  }
}
