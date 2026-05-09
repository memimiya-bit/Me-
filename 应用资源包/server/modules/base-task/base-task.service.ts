import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and, like } from 'drizzle-orm';
import { task, project, organization, material } from '@server/database/schema';
import type {
  Task,
  TaskListParams,
  TaskCreateDto,
  TaskUpdateDto,
  ListResponse,
} from '@shared/api.interface';

@Injectable()
export class BaseTaskService {
  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: TaskListParams): Promise<ListResponse<Task>> {
    const { page = 1, pageSize = 10, status, projectId, assigneeId, name } = params;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (status) conditions.push(eq(task.status, status));
    if (projectId) conditions.push(eq(task.projectId, projectId));
    if (assigneeId) conditions.push(eq(task.assigneeId, assigneeId));
    if (name) conditions.push(like(task.name, `%${name}%`));

    const itemsQuery =
      conditions.length > 0
        ? this.db
            .select()
            .from(task)
            .leftJoin(project, eq(task.projectId, project.id))
            .leftJoin(organization, eq(project.ownerId, organization.id))
            .leftJoin(material, eq(task.materialId, material.id))
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset)
        : this.db
            .select()
            .from(task)
            .leftJoin(project, eq(task.projectId, project.id))
            .leftJoin(organization, eq(project.ownerId, organization.id))
            .leftJoin(material, eq(task.materialId, material.id))
            .limit(pageSize)
            .offset(offset);

    const countQuery =
      conditions.length > 0
        ? this.db.select({ count: count() }).from(task).where(and(...conditions))
        : this.db.select({ count: count() }).from(task);

    const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

    return {
      items: items.map((r) => this.mapToTask(r)),
      total: Number(totalResult[0]?.count ?? 0),
    };
  }

  async getById(id: string): Promise<Task | null> {
    const [record] = await this.db
      .select()
      .from(task)
      .leftJoin(project, eq(task.projectId, project.id))
      .leftJoin(organization, eq(project.ownerId, organization.id))
      .leftJoin(material, eq(task.materialId, material.id))
      .where(eq(task.id, id));
    if (!record) return null;
    return this.mapToTask(record);
  }

  async create(dto: TaskCreateDto): Promise<Task> {
    const [record] = await this.db
      .insert(task)
      .values({
        name: dto.name,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        status: dto.status ?? 'pending',
        projectId: dto.projectId ?? null,
        assigneeId: dto.assigneeId ?? null,
        materialId: dto.materialId ?? null,
      })
      .returning();

    const [withJoins] = await this.db
      .select()
      .from(task)
      .leftJoin(project, eq(task.projectId, project.id))
      .leftJoin(organization, eq(project.ownerId, organization.id))
      .leftJoin(material, eq(task.materialId, material.id))
      .where(eq(task.id, record.id));
    return this.mapToTask(withJoins);
  }

  async update(id: string, dto: TaskUpdateDto): Promise<Task | null> {
    const data: Record<string, unknown> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.deadline !== undefined) data.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.projectId !== undefined) data.projectId = dto.projectId;
    if (dto.assigneeId !== undefined) data.assigneeId = dto.assigneeId;
    if (dto.materialId !== undefined) data.materialId = dto.materialId;

    const [record] = await this.db
      .update(task)
      .set(data)
      .where(eq(task.id, id))
      .returning();
    if (!record) return null;

    const [withJoins] = await this.db
      .select()
      .from(task)
      .leftJoin(project, eq(task.projectId, project.id))
      .leftJoin(organization, eq(project.ownerId, organization.id))
      .leftJoin(material, eq(task.materialId, material.id))
      .where(eq(task.id, record.id));
    return this.mapToTask(withJoins);
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(task).where(eq(task.id, id));
  }

  private mapToTask(
    record: {
      task: typeof task.$inferSelect;
      project: typeof project.$inferSelect | null;
      organization: typeof organization.$inferSelect | null;
      material: typeof material.$inferSelect | null;
    },
  ): Task {
    return {
      id: record.task.id,
      name: record.task.name,
      deadline: record.task.deadline ? record.task.deadline.toISOString() : null,
      status: record.task.status as Task['status'],
      projectId: record.task.projectId,
      projectName: record.project?.name ?? null,
      assigneeId: record.task.assigneeId,
      assigneeName: record.organization?.name ?? null,
      materialId: record.task.materialId,
      materialStyleNo: record.material?.styleNo ?? null,
      createdAt: record.task.createdAt.toISOString(),
      updatedAt: record.task.updatedAt.toISOString(),
    };
  }
}
