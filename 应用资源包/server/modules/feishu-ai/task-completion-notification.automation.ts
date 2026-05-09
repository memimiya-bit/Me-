import { Injectable, Logger } from '@nestjs/common';
import { Automation, BindTrigger } from '@lark-apaas/fullstack-nestjs-core';
import { FeishuAiService } from '../feishu-ai/feishu-ai.service';

@Automation()
export class TaskCompletionNotification {
  private readonly logger = new Logger(TaskCompletionNotification.name);

  constructor(private readonly feishuAiService: FeishuAiService) {}

  @BindTrigger('task_completion_feishu_notification_trigger')
  async handle(data: Record<string, unknown>) {
    this.logger.log('任务状态变更触发器执行', JSON.stringify(data));

    const record = data.record as Record<string, unknown> | undefined;
    const taskId = record?.id as string | undefined;
    const newStatus = record?.processStatus as string | undefined;

    if (!taskId || newStatus !== '已完成') {
      this.logger.log('跳过非完成状态变更');
      return;
    }

    await this.feishuAiService.sendTaskCompletionNotification(taskId);
  }
}
