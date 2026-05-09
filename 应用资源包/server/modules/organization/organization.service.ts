import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and, like } from 'drizzle-orm';
import { organization } from '@server/database/schema';
import type {
  Organization,
  OrganizationListParams,
  ListResponse,
  OrganizationCreateDto,
  OrganizationUpdateDto,
} from '@shared/api.interface';

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: OrganizationListParams): Promise<ListResponse<Organization>> {
    try {
      const { role, name, page = 1, pageSize = 10 } = params;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (role) conditions.push(eq(organization.role, role));
      if (name) conditions.push(like(organization.name, `%${name}%`));

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(organization)
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db
              .select()
              .from(organization)
              .limit(pageSize)
              .offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db
              .select({ count: count() })
              .from(organization)
              .where(and(...conditions))
          : this.db.select({ count: count() }).from(organization);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map((r) => this.mapToOrganization(r)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取组织列表失败', error);
      throw error;
    }
  }

  async getById(id: string): Promise<Organization | null> {
    try {
      const [record] = await this.db
        .select()
        .from(organization)
        .where(eq(organization.id, id));
      if (!record) return null;
      return this.mapToOrganization(record);
    } catch (error) {
      this.logger.error('获取组织详情失败', error);
      throw error;
    }
  }

  async create(dto: OrganizationCreateDto): Promise<Organization> {
    try {
      const [record] = await this.db
        .insert(organization)
        .values({
          name: dto.name,
          role: dto.role,
        })
        .returning();
      return this.mapToOrganization(record);
    } catch (error) {
      this.logger.error('创建组织失败', error);
      throw error;
    }
  }

  async update(id: string, dto: OrganizationUpdateDto): Promise<Organization> {
    try {
      const [record] = await this.db
        .update(organization)
        .set({
          ...(dto.name !== undefined && { name: dto.name }),
          ...(dto.role !== undefined && { role: dto.role }),
        })
        .where(eq(organization.id, id))
        .returning();
      return this.mapToOrganization(record);
    } catch (error) {
      this.logger.error('更新组织失败', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.db
        .delete(organization)
        .where(eq(organization.id, id));
    } catch (error) {
      this.logger.error('删除组织失败', error);
      throw error;
    }
  }

  private mapToOrganization(record: typeof organization.$inferSelect): Organization {
    return {
      id: record.id,
      name: record.name,
      role: record.role,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
