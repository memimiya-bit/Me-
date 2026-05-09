import { Module } from '@nestjs/common';
import { FullLinkTaskController } from './full-link-task.controller';
import { FullLinkTaskService } from './full-link-task.service';

@Module({
  controllers: [FullLinkTaskController],
  providers: [FullLinkTaskService],
  exports: [FullLinkTaskService],
})
export class FullLinkTaskModule {}
