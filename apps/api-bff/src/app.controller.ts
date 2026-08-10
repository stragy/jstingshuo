import { Controller, Get } from '@nestjs/common';

// 应用级控制器：健康检查
@Controller()
export class AppController {
  // GET /api/health
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'bff',
      time: new Date().toISOString(),
    };
  }
}
