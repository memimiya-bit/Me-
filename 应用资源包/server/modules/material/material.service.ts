import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and } from 'drizzle-orm';
import { materialReserveLocking } from '@server/database/schema';
import type {
  Material,
  MaterialListParams,
  MaterialListResponse,
  MaterialDetail,
} from '@shared/material';

@Injectable()
export class MaterialService {
  private readonly logger = new Logger(MaterialService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: MaterialListParams): Promise<MaterialListResponse> {
    try {
      const { fabricType, supplier, isLocked, idleWarning, page = 1, pageSize = 10 } = params;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (fabricType) conditions.push(eq(materialReserveLocking.fabricType, fabricType));
      if (supplier) conditions.push(eq(materialReserveLocking.supplierName, supplier));
      if (isLocked !== undefined) {
        conditions.push(eq(materialReserveLocking.lockStatus, isLocked ? '锁定' : '未锁定'));
      }
      if (idleWarning !== undefined) {
        conditions.push(eq(materialReserveLocking.idleWarning, idleWarning ? '是' : '否'));
      }

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(materialReserveLocking)
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db
              .select()
              .from(materialReserveLocking)
              .limit(pageSize)
              .offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db
              .select({ count: count() })
              .from(materialReserveLocking)
              .where(and(...conditions))
          : this.db.select({ count: count() }).from(materialReserveLocking);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map((r) => this.mapToMaterial(r)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取物料列表失败', error);
      throw error;
    }
  }

  async getById(id: string): Promise<MaterialDetail | null> {
    try {
      const [record] = await this.db
        .select()
        .from(materialReserveLocking)
        .where(eq(materialReserveLocking.id, id));
      if (!record) return null;
      const material = this.mapToMaterial(record);
      return { ...material, relatedVersions: [] };
    } catch (error) {
      this.logger.error('获取物料详情失败', error);
      throw error;
    }
  }

  private mapToMaterial(record: typeof materialReserveLocking.$inferSelect): Material {
    return {
      id: record.id,
      code: record.appMaterialCode ?? '',
      name: record.materialName ?? '',
      stock: Number(record.appRealTimeStock ?? 0),
      storageTime: record.appStockInDate ?? '',
      fabricType: record.fabricType ?? '',
      supplier: record.supplierName ?? '',
      isLocked: record.lockStatus === '锁定',
      idleWarning: record.idleWarning === '是',
      capitalOccupation: Number(record.materialFundOccupation ?? 0),
    };
  }
}
