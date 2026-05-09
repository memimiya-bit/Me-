import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and } from 'drizzle-orm';
import { fullLinkTaskControlTable, projectFullMap } from '@server/database/schema';
import type {
  Task,
  TaskDetail,
  TaskListParams,
  TaskListResponse,
} from '@shared/task';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: TaskListParams): Promise<TaskListResponse> {
    try {
      const {
        status,
        priority,
        type,
        department,
        startTime,
        endTime,
        page = 1,
        pageSize = 10,
      } = params;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (status) conditions.push(eq(fullLinkTaskControlTable.processStatus, status));
      if (priority) conditions.push(eq(fullLinkTaskControlTable.urgencyLevel, priority));
      if (type) conditions.push(eq(fullLinkTaskControlTable.taskType, type));
      if (department) conditions.push(eq(fullLinkTaskControlTable.responsibleDepartment, department));

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select({
                task: fullLinkTaskControlTable,
                projectMap: projectFullMap,
              })
              .from(fullLinkTaskControlTable)
              .leftJoin(
                projectFullMap,
                eq(fullLinkTaskControlTable.sourceModule, projectFullMap.relatedProduct),
              )
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db
              .select({
                task: fullLinkTaskControlTable,
                projectMap: projectFullMap,
              })
              .from(fullLinkTaskControlTable)
              .leftJoin(
                projectFullMap,
                eq(fullLinkTaskControlTable.sourceModule, projectFullMap.relatedProduct),
              )
              .limit(pageSize)
              .offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db
              .select({ count: count() })
              .from(fullLinkTaskControlTable)
              .where(and(...conditions))
          : this.db.select({ count: count() }).from(fullLinkTaskControlTable);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map(({ task, projectMap }) => this.mapToTask(task, projectMap)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取任务列表失败', error);
      throw error;
    }
  }

  async getById(id: string): Promise<TaskDetail | null> {
    try {
      const [result] = await this.db
        .select({
          task: fullLinkTaskControlTable,
          projectMap: projectFullMap,
        })
        .from(fullLinkTaskControlTable)
        .leftJoin(
          projectFullMap,
          eq(fullLinkTaskControlTable.sourceModule, projectFullMap.relatedProduct),
        )
        .where(eq(fullLinkTaskControlTable.id, id));

      if (!result) return null;

      return this.mapToTask(result.task, result.projectMap);
    } catch (error) {
      this.logger.error('获取任务详情失败', error);
      throw error;
    }
  }

  private mapToTask(
    task: typeof fullLinkTaskControlTable.$inferSelect,
    projectMap: typeof projectFullMap.$inferSelect | null,
  ): Task {
    return {
      id: task.id,
      businessId: task.sourceModule ?? '',
      name: task.taskName ?? '',
      type: task.taskType ?? '',
      priority: task.urgencyLevel ?? '',
      status: task.processStatus ?? '',
      owner: projectMap?.appOwner ?? '',
      department: task.responsibleDepartment ?? '',
      collaboratorDepartments: task.collaborativeDepartment ?? [],
      planStartTime: task.planStartDate ?? '',
      planEndTime: task.plannedCompletionDate ?? '',
      drsScore: Number(task.drsScore ?? 0),
      sellThroughRate: Number(task.sellOutRate ?? 0),
      riskScore: Number(task.fundOccupation ?? 0),
      blockReason: task.blockingReason ?? '',
    };
  }
}
