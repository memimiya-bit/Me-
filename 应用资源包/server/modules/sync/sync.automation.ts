import { Logger } from '@nestjs/common';
import { Automation, BindTrigger } from '@lark-apaas/fullstack-nestjs-core';
import { SyncService } from './sync.service';

@Automation()
export class SyncAutomation {
  private readonly logger = new Logger(SyncAutomation.name);

  constructor(private readonly syncService: SyncService) {}

  @BindTrigger('auto_sync_bitable_data')
  async autoSyncBitableData() {
    this.logger.log('定时任务触发：开始自动同步飞书多维表格数据');
    try {
      const results = await this.syncService.syncAll('cron');
      const successCount = results.filter((r) => r.status === 'success').length;
      const failedCount = results.filter((r) => r.status === 'failed').length;
      this.logger.log(
        `自动同步完成，共 ${results.length} 张表，成功 ${successCount} 张，失败 ${failedCount} 张`,
      );
    } catch (error) {
      this.logger.error('自动同步任务执行失败', error);
      throw error;
    }
  }
}
