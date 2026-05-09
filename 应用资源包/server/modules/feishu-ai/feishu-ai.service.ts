import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase, CapabilityService } from '@lark-apaas/fullstack-nestjs-core';
import { fullLinkTaskControlTable, projectTotalTable } from '@server/database/schema';
import { count, eq, and } from 'drizzle-orm';

@Injectable()
export class FeishuAiService {
  private readonly logger = new Logger(FeishuAiService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly capabilityService: CapabilityService,
  ) {}

  async recognizeIntent(message: string) {
    try {
      const result = await this.capabilityService
        .load('user_message_intent_recognition_1')
        .call('aiCategorize', { user_message: message }) as { categories: string[] };

      const categories = result.categories;
      return { intent: categories?.[0] ?? '其他请求', confidence: 'high' };
    } catch (error) {
      this.logger.error('意图识别失败', error);
      return { intent: '其他请求', confidence: 'low' };
    }
  }

  async generateProgressBrief(params: {
    taskBasicInfo: string;
    taskCompletionData: string;
    pendingItems?: string;
    riskAndChallenge?: string;
  }) {
    try {
      const stream = await this.capabilityService
        .load('task_progress_briefing_generate_1')
        .call('textGenerate', {
          task_basic_info: params.taskBasicInfo,
          task_completion_data: params.taskCompletionData,
          pending_items: params.pendingItems ?? '',
          risk_and_challenge: params.riskAndChallenge ?? '',
        }) as AsyncIterable<{ content?: string }>;

      let content = '';
      for await (const chunk of stream) {
        content += chunk.content ?? '';
      }

      return { brief: content };
    } catch (error) {
      this.logger.error('进度简报生成失败', error);
      throw error;
    }
  }

  async sendTaskCompletionNotification(taskId: string) {
    try {
      const [task] = await this.db
        .select()
        .from(fullLinkTaskControlTable)
        .where(eq(fullLinkTaskControlTable.id, taskId));

      if (!task) return;

      await this.capabilityService
        .load('send_task_completion_feishu_notification_1')
        .call('send_feishu_message', {
          task_name: task.taskName ?? '',
          task_completion_time: new Date().toISOString().split('T')[0],
          task_assignee: '',
          task_detail_url: `/tasks/${taskId}`,
          notification_content: '',
        });

      this.logger.log(`任务完成通知已发送: ${task.taskName}`);
    } catch (error) {
      this.logger.error('发送任务完成通知失败', error);
    }
  }

  async getTaskMetrics() {
    const totalResult = await this.db
      .select({ count: count() })
      .from(fullLinkTaskControlTable);

    const completedResult = await this.db
      .select({ count: count() })
      .from(fullLinkTaskControlTable)
      .where(eq(fullLinkTaskControlTable.processStatus, '已完成'));

    const overdueResult = await this.db
      .select({ count: count() })
      .from(fullLinkTaskControlTable)
      .where(eq(fullLinkTaskControlTable.processStatus, '已逾期'));

    const blockedResult = await this.db
      .select({ count: count() })
      .from(fullLinkTaskControlTable)
      .where(eq(fullLinkTaskControlTable.processStatus, '阻塞'));

    return {
      totalTasks: Number(totalResult[0]?.count ?? 0),
      completedTasks: Number(completedResult[0]?.count ?? 0),
      overdueTasks: Number(overdueResult[0]?.count ?? 0),
      blockedTasks: Number(blockedResult[0]?.count ?? 0),
    };
  }
}
