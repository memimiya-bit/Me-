import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and } from 'drizzle-orm';
import { fullLinkTaskControlTable } from '@server/database/schema';
import type {
  FullLinkTask,
  FullLinkTaskListParams,
  FullLinkTaskListResponse,
} from '@shared/api.interface';

@Injectable()
export class FullLinkTaskService {
  private readonly logger = new Logger(FullLinkTaskService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: FullLinkTaskListParams): Promise<FullLinkTaskListResponse> {
    try {
      const { executionStatus, urgencyLevel, pageSize = 10 } = params;
      const offset = 0;

      const conditions = [];
      if (executionStatus) conditions.push(eq(fullLinkTaskControlTable.executionStatus, executionStatus));
      if (urgencyLevel) conditions.push(eq(fullLinkTaskControlTable.urgencyLevel, urgencyLevel));

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(fullLinkTaskControlTable)
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db
              .select()
              .from(fullLinkTaskControlTable)
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
        items: items.map((row) => this.mapToFullLinkTask(row)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取全链路任务列表失败', JSON.stringify(error));
      throw error;
    }
  }

  private mapToFullLinkTask(row: typeof fullLinkTaskControlTable.$inferSelect): FullLinkTask {
    return {
      id: row.id,
      taskName: row.taskName ?? '',
      taskType: row.taskType ?? '',
      urgencyLevel: row.urgencyLevel ?? '',
      responsibleDepartment: row.responsibleDepartment ?? '',
      plannedCompletionDate: row.plannedCompletionDate ?? '',
      executionStatus: row.executionStatus ?? '',
      blockingReason: row.blockingReason ?? '',
      sourceModule: row.sourceModule ?? '',
    };
  }
}
