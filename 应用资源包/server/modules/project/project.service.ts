import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and, like } from 'drizzle-orm';
import { project, organization } from '@server/database/schema';
import type {
  Project,
  ProjectListParams,
  ProjectCreateDto,
  ProjectUpdateDto,
  ListResponse,
} from '@shared/api.interface';

@Injectable()
export class ProjectService {
  private readonly logger = new Logger(ProjectService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: ProjectListParams): Promise<ListResponse<Project>> {
    try {
      const { page = 1, pageSize = 10, name, ownerId } = params;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (name) conditions.push(like(project.name, `%${name}%`));
      if (ownerId) conditions.push(eq(project.ownerId, ownerId));

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(project)
              .leftJoin(organization, eq(project.ownerId, organization.id))
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db
              .select()
              .from(project)
              .leftJoin(organization, eq(project.ownerId, organization.id))
              .limit(pageSize)
              .offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db
              .select({ count: count() })
              .from(project)
              .where(and(...conditions))
          : this.db.select({ count: count() }).from(project);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map((r) => this.mapToProject(r)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取项目列表失败', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Project | null> {
    try {
      const [record] = await this.db
        .select()
        .from(project)
        .leftJoin(organization, eq(project.ownerId, organization.id))
        .where(eq(project.id, id));
      if (!record) return null;
      return this.mapToProject(record);
    } catch (error) {
      this.logger.error('获取项目详情失败', error);
      throw error;
    }
  }

  async create(dto: ProjectCreateDto): Promise<Project> {
    try {
      const [record] = await this.db
        .insert(project)
        .values({
          name: dto.name,
          ownerId: dto.ownerId ?? null,
          startTime: dto.startTime ? new Date(dto.startTime) : null,
          endTime: dto.endTime ? new Date(dto.endTime) : null,
        })
        .returning();
      const [withOwner] = await this.db
        .select()
        .from(project)
        .leftJoin(organization, eq(project.ownerId, organization.id))
        .where(eq(project.id, record.id));
      return this.mapToProject(withOwner);
    } catch (error) {
      this.logger.error('创建项目失败', error);
      throw error;
    }
  }

  async update(id: string, dto: ProjectUpdateDto): Promise<Project | null> {
    try {
      const data: Record<string, unknown> = {};
      if (dto.name !== undefined) data.name = dto.name;
      if (dto.ownerId !== undefined) data.ownerId = dto.ownerId;
      if (dto.startTime !== undefined) data.startTime = dto.startTime ? new Date(dto.startTime) : null;
      if (dto.endTime !== undefined) data.endTime = dto.endTime ? new Date(dto.endTime) : null;

      const [record] = await this.db
        .update(project)
        .set(data)
        .where(eq(project.id, id))
        .returning();
      if (!record) return null;
      const [withOwner] = await this.db
        .select()
        .from(project)
        .leftJoin(organization, eq(project.ownerId, organization.id))
        .where(eq(project.id, record.id));
      return this.mapToProject(withOwner);
    } catch (error) {
      this.logger.error('更新项目失败', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db.delete(project).where(eq(project.id, id));
    } catch (error) {
      this.logger.error('删除项目失败', error);
      throw error;
    }
  }

  private mapToProject(
    record: {
      project: typeof project.$inferSelect;
      organization: typeof organization.$inferSelect | null;
    },
  ): Project {
    return {
      id: record.project.id,
      name: record.project.name,
      ownerId: record.project.ownerId,
      ownerName: record.organization?.name ?? null,
      startTime: record.project.startTime?.toISOString() ?? null,
      endTime: record.project.endTime?.toISOString() ?? null,
      createdAt: record.project.createdAt.toISOString(),
      updatedAt: record.project.updatedAt.toISOString(),
    };
  }
}
