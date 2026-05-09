import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and, sql } from 'drizzle-orm';
import { projectTotalTable, fullLinkTaskControlTable, projectFullMap } from '@server/database/schema';
import type {
  Business,
  BusinessDetail,
  BusinessListParams,
  BusinessListResponse,
  DashboardMetrics,
} from '@shared/business';
import type { Task, TaskListResponse } from '@shared/task';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const [totalResult, activeResult, taskResult] = await Promise.all([
        this.db.select({ count: count() }).from(projectTotalTable),
        this.db
          .select({ count: count() })
          .from(projectTotalTable)
          .where(eq(projectTotalTable.appStatus, '进行中')),
        this.db.select({ count: count() }).from(fullLinkTaskControlTable),
      ]);

      const overdueResult = await this.db
        .select({ count: count() })
        .from(fullLinkTaskControlTable)
        .where(
          and(
            eq(fullLinkTaskControlTable.processStatus, '逾期'),
          ),
        );

      return {
        totalBusiness: Number(totalResult[0]?.count ?? 0),
        activeBusiness: Number(activeResult[0]?.count ?? 0),
        totalTasks: Number(taskResult[0]?.count ?? 0),
        overdueTasks: Number(overdueResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取指标失败', error);
      throw error;
    }
  }

  async getList(params: BusinessListParams): Promise<BusinessListResponse> {
    try {
      const { type, riskLevel, owner, startTime, endTime, page = 1, pageSize = 10 } = params;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (type) conditions.push(eq(projectTotalTable.appType, type));
      if (owner) conditions.push(eq(projectTotalTable.appProjectOwner, owner));

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(projectTotalTable)
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db.select().from(projectTotalTable).limit(pageSize).offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db.select({ count: count() }).from(projectTotalTable).where(and(...conditions))
          : this.db.select({ count: count() }).from(projectTotalTable);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map((r) => this.mapToBusiness(r)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取业务列表失败', error);
      throw error;
    }
  }

  async getById(id: string): Promise<BusinessDetail | null> {
    try {
      const [record] = await this.db
        .select()
        .from(projectTotalTable)
        .where(eq(projectTotalTable.id, id));

      if (!record) return null;

      const taskCountJson = record.appTaskCount as Record<string, unknown> | null;
      const totalTasks = typeof taskCountJson?.total === 'number' ? taskCountJson.total : 0;
      const completedTasks = typeof taskCountJson?.completed === 'number' ? taskCountJson.completed : 0;

      return {
        ...this.mapToBusiness(record),
        totalTasks,
        completedTasks,
      };
    } catch (error) {
      this.logger.error('获取业务详情失败', error);
      throw error;
    }
  }

  private mapToBusiness(record: typeof projectTotalTable.$inferSelect): Business {
    return {
      id: record.id,
      name: record.appProject ?? '',
      type: record.appType ?? '',
      owner: record.appProjectOwner ?? '',
      riskLevel: record.appStatus ?? '',
      progress: 0,
      drsScore: 0,
      sellThroughRate: 0,
      riskScore: 0,
      startTime: '',
      endTime: '',
    };
  }

  async getTasksByBusinessId(
    businessId: string,
    status?: string,
    page = 1,
    pageSize = 10,
  ): Promise<TaskListResponse> {
    try {
      const offset = (page - 1) * pageSize;

      const conditions = [eq(fullLinkTaskControlTable.sourceModule, businessId)];
      if (status) conditions.push(eq(fullLinkTaskControlTable.processStatus, status));

      const itemsQuery =
        conditions.length > 1
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
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset);

      const countQuery =
        conditions.length > 1
          ? this.db
              .select({ count: count() })
              .from(fullLinkTaskControlTable)
              .where(and(...conditions))
          : this.db
              .select({ count: count() })
              .from(fullLinkTaskControlTable)
              .where(and(...conditions));

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map(({ task, projectMap }) => this.mapToTask(task, projectMap)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取业务关联任务失败', JSON.stringify(error));
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
