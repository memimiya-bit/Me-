import { Injectable, Inject } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and, like } from 'drizzle-orm';
import { material } from '@server/database/schema';
import type {
  Material,
  MaterialListParams,
  ListResponse,
  MaterialCreateDto,
  MaterialUpdateDto,
} from '@shared/api.interface';

@Injectable()
export class BaseMaterialService {
  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: MaterialListParams): Promise<ListResponse<Material>> {
    const { type, styleNo, page = 1, pageSize = 10 } = params;
    const offset = (page - 1) * pageSize;

    const conditions = [];
    if (type) conditions.push(eq(material.type, type));
    if (styleNo) conditions.push(like(material.styleNo, `%${styleNo}%`));

    const itemsQuery =
      conditions.length > 0
        ? this.db
            .select()
            .from(material)
            .where(and(...conditions))
            .limit(pageSize)
            .offset(offset)
        : this.db
            .select()
            .from(material)
            .limit(pageSize)
            .offset(offset);

    const countQuery =
      conditions.length > 0
        ? this.db
            .select({ count: count() })
            .from(material)
            .where(and(...conditions))
        : this.db.select({ count: count() }).from(material);

    const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

    return {
      items: items.map((r) => this.mapToMaterial(r)),
      total: Number(totalResult[0]?.count ?? 0),
    };
  }

  async getById(id: string): Promise<Material | null> {
    const [record] = await this.db
      .select()
      .from(material)
      .where(eq(material.id, id));
    if (!record) return null;
    return this.mapToMaterial(record);
  }

  async create(dto: MaterialCreateDto): Promise<Material> {
    const [record] = await this.db
      .insert(material)
      .values({
        styleNo: dto.styleNo,
        color: dto.color ?? null,
        size: dto.size ?? null,
        type: dto.type,
      })
      .returning();
    return this.mapToMaterial(record);
  }

  async update(id: string, dto: MaterialUpdateDto): Promise<Material> {
    const [record] = await this.db
      .update(material)
      .set({
        ...(dto.styleNo !== undefined && { styleNo: dto.styleNo }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.size !== undefined && { size: dto.size }),
        ...(dto.type !== undefined && { type: dto.type }),
      })
      .where(eq(material.id, id))
      .returning();
    return this.mapToMaterial(record);
  }

  async delete(id: string): Promise<void> {
    await this.db
      .delete(material)
      .where(eq(material.id, id));
  }

  private mapToMaterial(record: typeof material.$inferSelect): Material {
    return {
      id: record.id,
      styleNo: record.styleNo,
      color: record.color,
      size: record.size,
      type: record.type,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
