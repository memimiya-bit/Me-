import { Injectable, Inject, Logger } from '@nestjs/common';
import { Automation, BindTrigger, DRIZZLE_DATABASE, type PostgresJsDatabase, CapabilityService } from '@lark-apaas/fullstack-nestjs-core';
import { fullLinkTaskControlTable, automationRuleConfig, automationNotificationConfig } from '@server/database/schema';
import { eq, and, lt, sql, inArray } from 'drizzle-orm';

interface RuleThreshold {
  drsThreshold?: number;
  conversionRateThreshold?: number;
  riskScoreHigh?: number;
  riskScoreCritical?: number;
  countdownThreshold?: number;
  archiveDays?: number;
}

@Automation()
export class WorkflowAutomation {
  private readonly logger = new Logger(WorkflowAutomation.name);
  private readonly debounceCache = new Map<string, number>();

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    private readonly capabilityService: CapabilityService,
  ) {}

  @BindTrigger('cross_business_routing_trigger')
  async handleCrossBusinessRouting(data: Record<string, unknown>) {
    const record = (data.record ?? data.after ?? data.before) as Record<string, unknown> | undefined;
    if (!record?.id) return;

    const taskId = record.id as string;
    if (!this.checkDebounce(`cross_business_routing:${taskId}`)) return;

    const taskType = (record.taskType as string) ?? '';
    const drsScore = parseFloat(record.drsScore as string);
    const processStatus = (record.processStatus as string) ?? '';

    const [ruleConfig] = await this.db
      .select()
      .from(automationRuleConfig)
      .where(eq(automationRuleConfig.ruleKey, 'cross_business_routing'));

    if (!ruleConfig?.enabled) {
      this.logger.log('跨业务路由规则已关闭，跳过');
      return;
    }

    const threshold = (ruleConfig.threshold ?? {}) as RuleThreshold;
    const drsThreshold = threshold.drsThreshold ?? 3;

    if (taskType.includes('服装快反') && !isNaN(drsScore) && drsScore > drsThreshold) {
      await this.db
        .update(fullLinkTaskControlTable)
        .set({
          urgencyLevel: 'P0-紧急',
          autoAction: '战略压仓',
        })
        .where(eq(fullLinkTaskControlTable.id, taskId));

      this.logger.log(`任务 ${taskId} 已标记为战略压仓，优先级P0-紧急`);
    }

    if (taskType.includes('AI') && processStatus === '失败') {
      await this.db
        .update(fullLinkTaskControlTable)
        .set({
          processStatus: '排队中',
          blockingReason: '系统自动重试',
        })
        .where(eq(fullLinkTaskControlTable.id, taskId));

      this.logger.log(`任务 ${taskId} 已标记为排队中，自动重试`);
    }
  }

  @BindTrigger('urgency_reminder_trigger')
  async handleUrgencyReminder() {
    this.logger.log('时效预警任务触发');

    const [ruleConfig] = await this.db
      .select()
      .from(automationRuleConfig)
      .where(eq(automationRuleConfig.ruleKey, 'urgency_reminder'));

    if (!ruleConfig?.enabled) {
      this.logger.log('时效预警规则已关闭，跳过');
      return;
    }

    const threshold = (ruleConfig.threshold ?? {}) as RuleThreshold;
    const countdownThreshold = threshold.countdownThreshold ?? 3;

    const today = new Date();
    const thresholdDate = new Date(today);
    thresholdDate.setDate(thresholdDate.getDate() + countdownThreshold);

    const urgentTasks = await this.db
      .select()
      .from(fullLinkTaskControlTable)
      .where(
        and(
          lt(fullLinkTaskControlTable.plannedCompletionDate, thresholdDate.toISOString().split('T')[0]),
          sql`${fullLinkTaskControlTable.processStatus} NOT IN ('已完成', '已归档')`,
        ),
      );

    if (!urgentTasks.length) {
      this.logger.log('无时效预警任务');
      return;
    }

    const notifyUsers = await this.getNotifyUsers('urgency_reminder');

    for (const task of urgentTasks) {
      const taskName = task.taskName ?? '';
      const completionDate = task.plannedCompletionDate as string;
      const daysLeft = completionDate
        ? Math.ceil((new Date(completionDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        : countdownThreshold;

      const message = `【时效预警】任务《${taskName}》距截止仅剩${daysLeft}天，请及时处理！`;

      this.logger.log(`发送时效预警: ${taskName}`);
      await this.sendFeishuMessage(message, taskName, `/tasks`);
    }
  }

  @BindTrigger('risk_escalation_trigger')
  async handleRiskEscalation(data: Record<string, unknown>) {
    const record = (data.record ?? data.after ?? data.before) as Record<string, unknown> | undefined;
    if (!record?.id) return;

    const taskId = record.id as string;
    if (!this.checkDebounce(`risk_escalation:${taskId}`)) return;

    const riskScore = parseFloat(record.riskScore as string);
    if (isNaN(riskScore)) return;

    const [ruleConfig] = await this.db
      .select()
      .from(automationRuleConfig)
      .where(eq(automationRuleConfig.ruleKey, 'risk_escalation'));

    if (!ruleConfig?.enabled) {
      this.logger.log('风险升级规则已关闭，跳过');
      return;
    }

    const threshold = (ruleConfig.threshold ?? {}) as RuleThreshold;
    const riskScoreHigh = threshold.riskScoreHigh ?? 60;
    const riskScoreCritical = threshold.riskScoreCritical ?? 80;

    let riskLevel = '';
    if (riskScore > riskScoreCritical) {
      riskLevel = '极高';
    } else if (riskScore > riskScoreHigh) {
      riskLevel = '高';
    } else {
      return;
    }

    await this.db
      .update(fullLinkTaskControlTable)
      .set({ urgencyLevel: riskLevel })
      .where(eq(fullLinkTaskControlTable.id, taskId));

    const taskName = (record.taskName as string) ?? '';
    const message = `【风险升级】任务《${taskName}》风险评分已达${riskScore}，请立即关注！`;

    this.logger.log(`任务 ${taskId} 风险升级至${riskLevel}`);
    await this.sendFeishuMessage(message, taskName, `/tasks`);
  }

  @BindTrigger('daily_archive_trigger')
  async handleDailyArchive() {
    this.logger.log('交付物归档任务触发');

    const [ruleConfig] = await this.db
      .select()
      .from(automationRuleConfig)
      .where(eq(automationRuleConfig.ruleKey, 'daily_archive'));

    if (!ruleConfig?.enabled) {
      this.logger.log('交付物归档规则已关闭，跳过');
      return;
    }

    const threshold = (ruleConfig.threshold ?? {}) as RuleThreshold;
    const archiveDays = threshold.archiveDays ?? 30;

    const archiveDate = new Date();
    archiveDate.setDate(archiveDate.getDate() - archiveDays);

    const tasksToArchive = await this.db
      .select()
      .from(fullLinkTaskControlTable)
      .where(
        and(
          eq(fullLinkTaskControlTable.processStatus, '已完成'),
          lt(fullLinkTaskControlTable.updatedAt, archiveDate),
        ),
      );

    if (!tasksToArchive.length) {
      this.logger.log('无需要归档的任务');
      return;
    }

    const taskIds = tasksToArchive.map((t) => t.id);
    await this.db
      .update(fullLinkTaskControlTable)
      .set({
        processStatus: '已归档',
        isArchived: '已归档',
      })
      .where(inArray(fullLinkTaskControlTable.id, taskIds));

    this.logger.log(`已归档 ${tasksToArchive.length} 个任务`);
  }

  private async getNotifyUsers(ruleKey: string): Promise<string[]> {
    const configs = await this.db
      .select()
      .from(automationNotificationConfig)
      .where(
        and(
          eq(automationNotificationConfig.ruleKey, ruleKey),
          eq(automationNotificationConfig.enabled, true),
        ),
      );

    return configs.map((c) => c.userId);
  }

  private async sendFeishuMessage(
    message: string,
    taskName: string,
    taskUrl: string,
  ) {
    try {
      await this.capabilityService
        .load('send_task_completion_feishu_notification_1')
        .call('send_feishu_message', {
          task_name: taskName,
          task_completion_time: new Date().toISOString().split('T')[0],
          task_assignee: '',
          task_detail_url: taskUrl,
          notification_content: message,
        });
    } catch (error) {
      this.logger.error('发送飞书消息失败', error);
    }
  }

  private checkDebounce(key: string): boolean {
    const now = Date.now();
    const lastTime = this.debounceCache.get(key);
    if (lastTime && now - lastTime < 5 * 60 * 1000) {
      this.logger.log(`${key} 在5分钟内已触发，跳过`);
      return false;
    }
    this.debounceCache.set(key, now);
    return true;
  }
}
