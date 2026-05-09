import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and } from 'drizzle-orm';
import { versionList } from '@server/database/schema';
import type {
  Version,
  VersionListParams,
  VersionListResponse,
  VersionDetail,
} from '@shared/version';

@Injectable()
export class VersionService {
  private readonly logger = new Logger(VersionService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: VersionListParams): Promise<VersionListResponse> {
    try {
      const { customer, wave, category, sampleStatus, page = 1, pageSize = 10 } = params;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (customer) conditions.push(eq(versionList.appCustomer, customer));
      if (wave) conditions.push(eq(versionList.appWaveband, wave));
      if (category) conditions.push(eq(versionList.appCategory, category));
      if (sampleStatus) conditions.push(eq(versionList.appSampleStatus, sampleStatus));

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(versionList)
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db.select().from(versionList).limit(pageSize).offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db.select({ count: count() }).from(versionList).where(and(...conditions))
          : this.db.select({ count: count() }).from(versionList);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map((r) => this.mapToVersion(r)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取版本列表失败', error);
      throw error;
    }
  }

  async getById(id: string): Promise<VersionDetail | null> {
    try {
      const [record] = await this.db
        .select()
        .from(versionList)
        .where(eq(versionList.id, id));
      if (!record) return null;
      const version = this.mapToVersion(record);
      return { ...version, tasks: [] };
    } catch (error) {
      this.logger.error('获取版本详情失败', error);
      throw error;
    }
  }

  private mapToVersion(record: typeof versionList.$inferSelect): Version {
    let progress = 0;
    if (record.versionAdjustmentProgress) {
      const parsed = Number(record.versionAdjustmentProgress);
      if (!isNaN(parsed)) progress = parsed;
    }

    const keyNodeTime: Record<string, string> = {};
    if (record.cutVersion) keyNodeTime.cutVersion = record.cutVersion;
    if (record.versionEntryDate) keyNodeTime.versionEntryDate = record.versionEntryDate;
    if (record.sampleDate) keyNodeTime.sampleDate = record.sampleDate;
    if (record.reviewDate) keyNodeTime.reviewDate = record.reviewDate;
    if (record.preProductionReview) keyNodeTime.preProductionReview = record.preProductionReview;
    if (record.checkBlank) keyNodeTime.checkBlank = record.checkBlank;
    if (record.submitMaterial) keyNodeTime.submitMaterial = record.submitMaterial;

    return {
      id: record.id,
      productId: '',
      productName: '',
      styleNo: record.appStyleNo ?? '',
      customer: record.appCustomer ?? '',
      wave: record.appWaveband ?? '',
      category: record.appCategory ?? '',
      sampleStatus: record.appSampleStatus ?? '',
      taskCount: Number(record.appTaskCount ?? 0),
      progress,
      keyNodeTime,
    };
  }
}
