import { Module } from '@nestjs/common';
import { FeishuAiController } from './feishu-ai.controller';
import { FeishuAiService } from './feishu-ai.service';
import { TaskCompletionNotification } from './task-completion-notification.automation';
import { WorkflowAutomation } from './feishu-ai.automation';

@Module({
  controllers: [FeishuAiController],
  providers: [FeishuAiService, TaskCompletionNotification, WorkflowAutomation],
  exports: [FeishuAiService],
})
export class FeishuAiModule {}
