import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
  CapabilityService,
} from '@lark-apaas/fullstack-nestjs-core';
import { eq, desc, sql } from 'drizzle-orm';
import { syncLog } from '@server/database/schema';

export interface SyncTableConfig {
  tableName: string;
  pluginInstanceId: string;
  baseRecordIdColumn: string;
}

export interface SyncResult {
  tableName: string;
  totalRecords: number;
  newRecords: number;
  failedRecords: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

const SYNC_TABLE_CONFIG: SyncTableConfig[] = [
  { tableName: 'common_info', pluginInstanceId: 'sync_common_info', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'common_contact', pluginInstanceId: 'sync_common_contact', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'project_total_table', pluginInstanceId: 'sync_project_total_table', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'product_design_tech_library', pluginInstanceId: 'sync_product_design_tech_library', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'seasoning_summary', pluginInstanceId: 'sync_seasoning_summary', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'training_table_guide', pluginInstanceId: 'sync_training_table_guide', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'project_rush_special', pluginInstanceId: 'sync_project_rush_special', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'version_list', pluginInstanceId: 'sync_version_list', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'wave_development_summary', pluginInstanceId: 'sync_wave_development_summary', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'app_okr', pluginInstanceId: 'sync_app_okr', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'app_list', pluginInstanceId: 'sync_app_list', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'app_requirement_inbox', pluginInstanceId: 'sync_app_requirement_inbox', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'full_link_task_control_table', pluginInstanceId: 'sync_full_link_task_control_table', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'material_reserve_locking', pluginInstanceId: 'sync_material_reserve_locking', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'project_docking_panorama_table', pluginInstanceId: 'sync_project_docking_panorama_table', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'product_library', pluginInstanceId: 'sync_product_library', baseRecordIdColumn: 'base_record_id' },
  { tableName: 'project_full_map', pluginInstanceId: 'sync_project_full_map', baseRecordIdColumn: 'base_record_id' },
];

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase,
    @Inject() private readonly capabilityService: CapabilityService,
  ) {}

  async syncAll(triggerType: 'cron' | 'manual' = 'cron'): Promise<SyncResult[]> {
    this.logger.log(`开始全量同步，触发类型: ${triggerType}`);
    const results: SyncResult[] = [];

    for (const config of SYNC_TABLE_CONFIG) {
      try {
        const result = await this.syncTable(config, triggerType);
        results.push(result);
      } catch (error) {
        this.logger.error(`同步表 ${config.tableName} 失败`, error);
        results.push({
          tableName: config.tableName,
          totalRecords: 0,
          newRecords: 0,
          failedRecords: 0,
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : String(error),
        });
      }
    }

    this.logger.log(`全量同步完成，共 ${results.length} 张表`);
    return results;
  }

  private async syncTable(config: SyncTableConfig, triggerType: 'cron' | 'manual'): Promise<SyncResult> {
    const startTime = new Date();
    this.logger.log(`开始同步表: ${config.tableName}`);

    try {
      const plugin = this.capabilityService.load(config.pluginInstanceId);

      const allRecords: Record<string, unknown>[] = [];
      let pageToken: string | undefined;

      do {
        const response = await plugin.call('searchRecords', {
          pageToken,
          pageSize: 500,
        });

        const records = (response as Record<string, unknown>).records as Record<string, unknown>[] | undefined;
        if (records?.length) {
          allRecords.push(...records);
        }

        pageToken = (response as Record<string, unknown>).hasMore ? (response as Record<string, unknown>).pageToken as string | undefined : undefined;
      } while (pageToken);

      const totalRecords = allRecords.length;
      this.logger.log(`表 ${config.tableName} 获取到 ${totalRecords} 条记录`);

      if (totalRecords === 0) {
        await this.logSync(config, triggerType, startTime, 0, 0, 0, 'success');
        return { tableName: config.tableName, totalRecords: 0, newRecords: 0, failedRecords: 0, status: 'success' };
      }

      const existingIds = await this.getExistingBaseRecordIds(config.tableName, config.baseRecordIdColumn);
      const newRecords = allRecords.filter(
        (r) => !existingIds.has((r.fields as Record<string, unknown>)?.[config.baseRecordIdColumn] as string),
      );

      this.logger.log(`表 ${config.tableName} 新增 ${newRecords.length} 条记录`);

      let failedCount = 0;
      for (const record of newRecords) {
        try {
          await this.insertRecord(config.tableName, record);
        } catch (error) {
          this.logger.error(`插入记录失败: ${JSON.stringify(record)}`, error);
          failedCount++;
        }
      }

      const status: SyncResult['status'] = failedCount === 0 ? 'success' : failedCount === newRecords.length ? 'failed' : 'partial';

      await this.logSync(config, triggerType, startTime, totalRecords, newRecords.length, failedCount, status);

      return {
        tableName: config.tableName,
        totalRecords,
        newRecords: newRecords.length,
        failedRecords: failedCount,
        status,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.logSync(config, triggerType, startTime, 0, 0, 0, 'failed', errorMessage);
      throw error;
    }
  }

  private async getExistingBaseRecordIds(tableName: string, columnName: string): Promise<Set<string>> {
    try {
      const query = sql.raw(`SELECT ${columnName} FROM ${tableName} WHERE ${columnName} IS NOT NULL`);
      const result = await this.db.execute(query);
      const ids = new Set<string>();
      for (const row of result) {
        const val = (row as Record<string, unknown>)[columnName];
        if (val) ids.add(String(val));
      }
      return ids;
    } catch {
      return new Set();
    }
  }

  private async insertRecord(tableName: string, record: Record<string, unknown>): Promise<void> {
    const fields = (record.fields as Record<string, unknown>) || {};
    const columns = Object.keys(fields).map((k) => this.camelToSnake(k));
    const values = Object.values(fields);

    if (columns.length === 0) return;

    const columnList = columns.join(', ');
    const valuePlaceholders = values.map((v) => sql`${v}`);
    const insertSql = sql.raw(`INSERT INTO ${tableName} (${columnList}) VALUES (`)
      .append(sql.join(valuePlaceholders, sql`, `))
      .append(sql.raw(`) ON CONFLICT DO NOTHING`));

    await this.db.execute(insertSql);
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private async logSync(
    config: SyncTableConfig,
    triggerType: string,
    startTime: Date,
    totalRecords: number,
    newRecords: number,
    failedRecords: number,
    status: string,
    errorMessage?: string,
  ): Promise<void> {
    await this.db.insert(syncLog).values({
      tableName: config.tableName,
      totalRecords,
      newRecords,
      failedRecords,
      status,
      errorMessage: errorMessage || null,
      startedAt: startTime,
      completedAt: new Date(),
      triggerType,
    });
  }

  async getSyncLogs(page: number = 1, pageSize: number = 20) {
    const offset = (page - 1) * pageSize;

    const items = await this.db
      .select()
      .from(syncLog)
      .orderBy(desc(syncLog.startedAt))
      .limit(pageSize)
      .offset(offset);

    const totalResult = await this.db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(syncLog);
    const total = totalResult[0]?.count ?? 0;

    return { items, total, page, pageSize };
  }
}
