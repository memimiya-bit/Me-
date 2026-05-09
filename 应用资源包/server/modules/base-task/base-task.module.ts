import { Module } from '@nestjs/common';
import { BaseTaskController } from './base-task.controller';
import { BaseTaskService } from './base-task.service';

@Module({
  controllers: [BaseTaskController],
  providers: [BaseTaskService],
  exports: [BaseTaskService],
})
export class BaseTaskModule {}
