import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncAutomation } from './sync.automation';

@Module({
  controllers: [SyncController],
  providers: [SyncService, SyncAutomation],
  exports: [SyncService],
})
export class SyncModule {}
