import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and } from 'drizzle-orm';
import { projectTotalTable } from '@server/database/schema';
import type {
  ProjectTotal,
  ProjectTotalListParams,
  ProjectTotalListResponse,
} from '@shared/api.interface';

@Injectable()
export class ProjectTotalService {
  private readonly logger = new Logger(ProjectTotalService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: ProjectTotalListParams): Promise<ProjectTotalListResponse> {
    try {
      const { appStatus, pageSize = 10 } = params;
      const offset = 0;

      const conditions = [];
      if (appStatus) conditions.push(eq(projectTotalTable.appStatus, appStatus));

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(projectTotalTable)
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db
              .select()
              .from(projectTotalTable)
              .limit(pageSize)
              .offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db
              .select({ count: count() })
              .from(projectTotalTable)
              .where(and(...conditions))
          : this.db.select({ count: count() }).from(projectTotalTable);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map((row) => this.mapToProjectTotal(row)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取项目总览列表失败', JSON.stringify(error));
      throw error;
    }
  }

  private mapToProjectTotal(row: typeof projectTotalTable.$inferSelect): ProjectTotal {
    return {
      id: row.id,
      appProject: row.appProject ?? '',
      appType: row.appType ?? '',
      appProjectOwner: row.appProjectOwner ?? '',
      appStatus: row.appStatus ?? '',
    };
  }
}
