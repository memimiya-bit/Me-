import { Controller, Get, Post, Query } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { SyncService, type SyncResult } from './sync.service';

@Controller('api/sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @NeedLogin()
  @Post('trigger')
  async triggerSync() {
    return this.syncService.syncAll('manual');
  }

  @NeedLogin()
  @Get('logs')
  async getLogs(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.syncService.getSyncLogs(
      page ? parseInt(page, 10) : 1,
      pageSize ? parseInt(pageSize, 10) : 20,
    );
  }
}
