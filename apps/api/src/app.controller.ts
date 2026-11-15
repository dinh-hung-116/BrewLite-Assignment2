import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { AppService } from './app.service.js';
import { PrismaService } from './prisma/prisma.service.js';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /** NFR-04: dùng cho Docker HEALTHCHECK và smoke test sau deploy (qua Tailscale Funnel). */
  @Get('health')
  async healthCheck() {
    const version = process.env.GIT_SHA ?? 'dev';
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      throw new ServiceUnavailableException({ status: 'error', db: 'down', version });
    }
    return { status: 'ok', db: 'up', version };
  }
}
