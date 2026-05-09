/* eslint-disable */
/** auto generated, do not edit */
import { pgTable, pgPolicy, uuid, varchar, text, date, numeric, boolean, jsonb, bigint, index, integer, foreignKey, pgView, customType } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const userProfile = customType<{
  data: string;
  driverData: string;
}>({
  dataType() {
    return 'user_profile';
  },
  toDriver(value: string) {
    return sql`ROW(${value})::user_profile`;
  },
  fromDriver(value: string) {
    const [userId] = value.slice(1, -1).split(',');
    return userId.trim();
  },
});

export type FileAttachment = {
  bucket_id: string;
  file_path: string;
};

export const fileAttachment = customType<{
  data: FileAttachment;
  driverData: string;
}>({
  dataType() {
    return 'file_attachment';
  },
  toDriver(value: FileAttachment) {
    return sql`ROW(${value.bucket_id},${value.file_path})::file_attachment`;
  },
  fromDriver(value: string): FileAttachment {
    const [bucketId, filePath] = value.slice(1, -1).split(',');
    return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
  },
});

/** Escape single quotes in SQL string literals */
function escapeLiteral(str: string): string {
  return `'${str.replace(/'/g, "''")}'`;
}

export const userProfileArray = customType<{
  data: string[];
  driverData: string;
}>({
  dataType() {
    return 'user_profile[]';
  },
  toDriver(value: string[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::user_profile[]`;
    }
    const elements = value.map(id => `ROW(${escapeLiteral(id)})::user_profile`).join(',');
    return sql.raw(`ARRAY[${elements}]::user_profile[]`);
  },
  fromDriver(value: string): string[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => m.slice(1, -1).split(',')[0].trim());
  },
});

export const fileAttachmentArray = customType<{
  data: FileAttachment[];
  driverData: string;
}>({
  dataType() {
    return 'file_attachment[]';
  },
  toDriver(value: FileAttachment[]) {
    if (!value || value.length === 0) {
      return sql`'{}'::file_attachment[]`;
    }
    const elements = value.map(f =>
      `ROW(${escapeLiteral(f.bucket_id)},${escapeLiteral(f.file_path)})::file_attachment`
    ).join(',');
    return sql.raw(`ARRAY[${elements}]::file_attachment[]`);
  },
  fromDriver(value: string): FileAttachment[] {
    if (!value || value === '{}') return [];
    const inner = value.slice(1, -1);
    const matches = inner.match(/\([^)]*\)/g) || [];
    return matches.map(m => {
      const [bucketId, filePath] = m.slice(1, -1).split(',');
      return { bucket_id: bucketId.trim(), file_path: filePath.trim() };
    });
  },
});

export const customTimestamptz = customType<{
  data: Date;
  driverData: string;
  config: { precision?: number};
}>({
  dataType(config) {
    const precision = typeof config?.precision !== 'undefined'
      ? ` (${config.precision})`
      : '';
    return `timestamptz${precision}`;
  },
  toDriver(value: Date | string | number){
    if(value == null) return value as any;
    if (typeof value === 'number') {
      return new Date(value).toISOString();
    }
    if(typeof value === 'string') {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    throw new Error('Invalid timestamp value');
  },
  fromDriver(value: string | Date): Date {
    if(value instanceof Date) return value;
    return new Date(value);
  },
});

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const commonInfo = pgTable("common_info", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  title: text(),
  // Synced field: auto-synced, do not modify or delete
  departmentPartnerName: text("department_partner_name"),
  // Synced field: auto-synced, do not modify or delete
  contactPerson: text("contact_person"),
  // Synced field: auto-synced, do not modify or delete
  contactPhone: text("contact_phone"),
  // Synced field: auto-synced, do not modify or delete
  email: text(),
  // Synced field: auto-synced, do not modify or delete
  responsibilityCooperationContent: text("responsibility_cooperation_content"),
  // Synced field: auto-synced, do not modify or delete
  contactStartTime: date("contact_start_time"),
  // Synced field: auto-synced, do not modify or delete
  remark: text(),
  // Synced field: auto-synced, do not modify or delete
  mainResponsibilityCoreFunction: text("main_responsibility_core_function"),
  // Synced field: auto-synced, do not modify or delete
  industryFeatureValueFeature: text("industry_feature_value_feature"),
  // Synced field: auto-synced, do not modify or delete
  appRecordId: text("app_record_id"),
  // Synced field: auto-synced, do not modify or delete
  recordStatus: text("record_status"),
  // Synced field: auto-synced, do not modify or delete
  connectionType: text("connection_type"),
  // Synced field: auto-synced, do not modify or delete
  priorityLevel: numeric("priority_level"),
  // Synced field: auto-synced, do not modify or delete
  riskScore: numeric("risk_score"),
  // Synced field: auto-synced, do not modify or delete
  cleanedEnterpriseName: text("cleaned_enterprise_name"),
  // Synced field: auto-synced, do not modify or delete
  nextConnectionDate: date("next_connection_date"),
  // Synced field: auto-synced, do not modify or delete
  daysToNextConnection: text("days_to_next_connection"),
  // Synced field: auto-synced, do not modify or delete
  cooperationDurationMonths: text("cooperation_duration_months"),
  // Synced field: auto-synced, do not modify or delete
  responsibleDepartment: text("responsible_department"),
  // Synced field: auto-synced, do not modify or delete
  confidence: numeric(),
  // Synced field: auto-synced, do not modify or delete
  appNeedAudit: boolean("app_need_audit"),
  // Synced field: auto-synced, do not modify or delete
  lastFillTime: date("last_fill_time"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const commonContact = pgTable("common_contact", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appName: text("app_name"),
  // Synced field: auto-synced, do not modify or delete
  appMember: text("app_member"),
  // Synced field: auto-synced, do not modify or delete
  appDepartment: text("app_department"),
  // Synced field: auto-synced, do not modify or delete
  appTask: text("app_task"),
  // Synced field: auto-synced, do not modify or delete
  appProcess: text("app_process"),
  // Synced field: auto-synced, do not modify or delete
  appWorkOrder: text("app_work_order"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const projectTotalTable = pgTable("project_total_table", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appProject: text("app_project"),
  // Synced field: auto-synced, do not modify or delete
  appType: text("app_type"),
  // Synced field: auto-synced, do not modify or delete
  appProjectOwner: userProfile("app_project_owner"),
  // Synced field: auto-synced, do not modify or delete
  appParticipant: userProfileArray("app_participant"),
  // Synced field: auto-synced, do not modify or delete
  appProjectGoal: text("app_project_goal"),
  // Synced field: auto-synced, do not modify or delete
  appProjectTime: text("app_project_time"),
  // Synced field: auto-synced, do not modify or delete
  appStatus: text("app_status"),
  /**
   * 相关任务
   */
  // Synced field: auto-synced, do not modify or delete
  appRelatedTask: jsonb("app_related_task"),
  /**
   * 任务数
   */
  // Synced field: auto-synced, do not modify or delete
  appTaskCount: jsonb("app_task_count"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const productDesignTechLibrary = pgTable("product_design_tech_library", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appRecordId: text("app_record_id"),
  /**
   * 产品
   */
  // Synced field: auto-synced, do not modify or delete
  product: jsonb(),
  // Synced field: auto-synced, do not modify or delete
  dataType: text("data_type"),
  // Synced field: auto-synced, do not modify or delete
  date: date(),
  // Synced field: auto-synced, do not modify or delete
  image: text().array(),
  // Synced field: auto-synced, do not modify or delete
  changeRecord: text("change_record"),
  // Synced field: auto-synced, do not modify or delete
  isLatest: boolean("is_latest"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const seasoningSummary = pgTable("seasoning_summary", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appOrderId: text("app_order_id"),
  // Synced field: auto-synced, do not modify or delete
  orderDate: customTimestamptz('order_date'),
  // Synced field: auto-synced, do not modify or delete
  orderUser: userProfileArray("order_user"),
  // Synced field: auto-synced, do not modify or delete
  orderFile: text("order_file").array(),
  // Synced field: auto-synced, do not modify or delete
  description: text(),
  // Synced field: auto-synced, do not modify or delete
  supplier: text(),
  // Synced field: auto-synced, do not modify or delete
  expectedArrivalTime: date("expected_arrival_time"),
  // Synced field: auto-synced, do not modify or delete
  actualArrivalTime: date("actual_arrival_time"),
  // Synced field: auto-synced, do not modify or delete
  situationDescription: text("situation_description"),
  // Synced field: auto-synced, do not modify or delete
  isCompleted: boolean("is_completed"),
  // Synced field: auto-synced, do not modify or delete
  progressReport: text("progress_report"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const trainingTableGuide = pgTable("training_table_guide", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  title: text(),
  // Synced field: auto-synced, do not modify or delete
  section: text(),
  // Synced field: auto-synced, do not modify or delete
  tag: text(),
  // Synced field: auto-synced, do not modify or delete
  headerImage: text("header_image").array(),
  // Synced field: auto-synced, do not modify or delete
  updater: userProfileArray("updater"),
  // Synced field: auto-synced, do not modify or delete
  introduction: text(),
  // Synced field: auto-synced, do not modify or delete
  courseUrl: text("course_url"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const projectRushSpecial = pgTable("project_rush_special", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  taskName: text("task_name"),
  // Synced field: auto-synced, do not modify or delete
  appResponsiblePerson: userProfileArray("app_responsible_person"),
  // Synced field: auto-synced, do not modify or delete
  coreFocus: text("core_focus"),
  // Synced field: auto-synced, do not modify or delete
  status: text(),
  // Synced field: auto-synced, do not modify or delete
  moduleName: text("module_name"),
  // Synced field: auto-synced, do not modify or delete
  subModule: text("sub_module"),
  // Synced field: auto-synced, do not modify or delete
  startDate: date("start_date"),
  // Synced field: auto-synced, do not modify or delete
  endDate: date("end_date"),
  // Synced field: auto-synced, do not modify or delete
  personDays: numeric("person_days"),
  // Synced field: auto-synced, do not modify or delete
  remark: text(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const versionList = pgTable("version_list", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appStyleNo: text("app_style_no"),
  // Synced field: auto-synced, do not modify or delete
  appCustomer: text("app_customer"),
  // Synced field: auto-synced, do not modify or delete
  appWaveband: text("app_waveband"),
  // Synced field: auto-synced, do not modify or delete
  appCategory: text("app_category"),
  // Synced field: auto-synced, do not modify or delete
  appDesignDraft: text("app_design_draft"),
  // Synced field: auto-synced, do not modify or delete
  appReferenceImage: text("app_reference_image"),
  // Synced field: auto-synced, do not modify or delete
  appColor: text("app_color"),
  // Synced field: auto-synced, do not modify or delete
  appSampleStatus: text("app_sample_status"),
  // Synced field: auto-synced, do not modify or delete
  appBatchImage: customTimestamptz('app_batch_image'),
  // Synced field: auto-synced, do not modify or delete
  appTaskCount: numeric("app_task_count"),
  // Synced field: auto-synced, do not modify or delete
  taskCompletion: text("task_completion"),
  // Synced field: auto-synced, do not modify or delete
  correspondingTask: text("corresponding_task"),
  // Synced field: auto-synced, do not modify or delete
  versionAdjustmentProgress: text("version_adjustment_progress"),
  // Synced field: auto-synced, do not modify or delete
  cutVersionQuotation: text("cut_version_quotation"),
  // Synced field: auto-synced, do not modify or delete
  supplierInfo: text("supplier_info"),
  // Synced field: auto-synced, do not modify or delete
  note: text(),
  // Synced field: auto-synced, do not modify or delete
  cutVersion: date("cut_version"),
  // Synced field: auto-synced, do not modify or delete
  versionEntryDate: date("version_entry_date"),
  // Synced field: auto-synced, do not modify or delete
  versionType: text("version_type").array(),
  // Synced field: auto-synced, do not modify or delete
  checkBlank: date("check_blank"),
  // Synced field: auto-synced, do not modify or delete
  sampleDate: date("sample_date"),
  // Synced field: auto-synced, do not modify or delete
  completedDrawing: text("completed_drawing"),
  // Synced field: auto-synced, do not modify or delete
  reviewDate: date("review_date"),
  // Synced field: auto-synced, do not modify or delete
  order: text(),
  // Synced field: auto-synced, do not modify or delete
  reprint: text(),
  // Synced field: auto-synced, do not modify or delete
  submitMaterial: date("submit_material"),
  // Synced field: auto-synced, do not modify or delete
  orderModification: text("order_modification"),
  // Synced field: auto-synced, do not modify or delete
  usageTable: text("usage_table"),
  // Synced field: auto-synced, do not modify or delete
  preProductionReview: date("pre_production_review"),
  // Synced field: auto-synced, do not modify or delete
  silhouette: text(),
  // Synced field: auto-synced, do not modify or delete
  mpClothingType: text("mp_clothing_type"),
  // Synced field: auto-synced, do not modify or delete
  colorComposition: text("color_composition").array(),
  // Synced field: auto-synced, do not modify or delete
  wearingPurpose: text("wearing_purpose"),
  // Synced field: auto-synced, do not modify or delete
  urgency: text(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const waveDevelopmentSummary = pgTable("wave_development_summary", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  multiLineText: text("multi_line_text"),
  // Synced field: auto-synced, do not modify or delete
  singleSelect: text("single_select"),
  // Synced field: auto-synced, do not modify or delete
  date: text(),
  // Synced field: auto-synced, do not modify or delete
  multiSelect: text("multi_select"),
  // Synced field: auto-synced, do not modify or delete
  attachment: text().array(),
  // Synced field: auto-synced, do not modify or delete
  progressBar: numeric("progress_bar"),
  // Synced field: auto-synced, do not modify or delete
  launchTime: date("launch_time"),
  // Synced field: auto-synced, do not modify or delete
  startResearch: date("start_research"),
  // Synced field: auto-synced, do not modify or delete
  endTime: date("end_time"),
  // Synced field: auto-synced, do not modify or delete
  orderDay: date("order_day"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  // Synced field: auto-synced, do not modify or delete
  developmentCount: bigint("development_count", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  // Synced field: auto-synced, do not modify or delete
  orderCount: bigint("order_count", { mode: "number" }),
  // Synced field: auto-synced, do not modify or delete
  associatedKr: text("associated_kr").array(),
  // Synced field: auto-synced, do not modify or delete
  krWeight: text("kr_weight"),
  // Synced field: auto-synced, do not modify or delete
  execution: text(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const appOkr = pgTable("app_okr", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  multiLineText: text("multi_line_text"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  // Synced field: auto-synced, do not modify or delete
  singleSelect: bigint("single_select", { mode: "number" }),
  // Synced field: auto-synced, do not modify or delete
  date: text(),
  // Synced field: auto-synced, do not modify or delete
  multiSelect: text("multi_select").array(),
  // Synced field: auto-synced, do not modify or delete
  attachment: text(),
  // Synced field: auto-synced, do not modify or delete
  appObjective: text("app_objective"),
  // Synced field: auto-synced, do not modify or delete
  appRelatedTask: text("app_related_task").array(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const appList = pgTable("app_list", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  multiLineText: text("multi_line_text"),
  // Synced field: auto-synced, do not modify or delete
  singleSelect: text("single_select"),
  // Synced field: auto-synced, do not modify or delete
  date: text(),
  // Synced field: auto-synced, do not modify or delete
  multiSelect: text("multi_select").array(),
  // Synced field: auto-synced, do not modify or delete
  attachment: text(),
  // Synced field: auto-synced, do not modify or delete
  date1: date("date_1"),
  // Synced field: auto-synced, do not modify or delete
  type: text(),
  // Synced field: auto-synced, do not modify or delete
  completed: text(),
  // Synced field: auto-synced, do not modify or delete
  file: text(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const appRequirementInbox = pgTable("app_requirement_inbox", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  multiLineText: text("multi_line_text"),
  // Synced field: auto-synced, do not modify or delete
  singleSelect: text("single_select").array(),
  // Synced field: auto-synced, do not modify or delete
  date: text(),
  // Synced field: auto-synced, do not modify or delete
  multiSelect: date("multi_select"),
  // Synced field: auto-synced, do not modify or delete
  attachment: date(),
  // Synced field: auto-synced, do not modify or delete
  followUp: text("follow_up"),
  // Synced field: auto-synced, do not modify or delete
  status: text(),
  // Synced field: auto-synced, do not modify or delete
  referenceImage: text("reference_image"),
  // Synced field: auto-synced, do not modify or delete
  processingProgress: numeric("processing_progress"),
  // Synced field: auto-synced, do not modify or delete
  customer: text(),
  // Synced field: auto-synced, do not modify or delete
  band: text(),
  // Synced field: auto-synced, do not modify or delete
  category: text(),
  // Synced field: auto-synced, do not modify or delete
  cancellation: text(),
  // Synced field: auto-synced, do not modify or delete
  scheduleEntry: text("schedule_entry"),
  // Synced field: auto-synced, do not modify or delete
  silhouette: text(),
  // Synced field: auto-synced, do not modify or delete
  colorComposition: text("color_composition"),
  // Synced field: auto-synced, do not modify or delete
  wearingPurpose: text("wearing_purpose"),
  // Synced field: auto-synced, do not modify or delete
  mpClothingType: text("mp_clothing_type"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

export const syncLog = pgTable("sync_log", {
  id: uuid().defaultRandom().notNull(),
  tableName: varchar("table_name", { length: 255 }).notNull(),
  totalRecords: integer("total_records").default(0),
  newRecords: integer("new_records").default(0),
  failedRecords: integer("failed_records").default(0),
  status: varchar({ length: 255 }).notNull(),
  errorMessage: text("error_message"),
  startedAt: customTimestamptz('started_at').default(sql`CURRENT_TIMESTAMP`),
  completedAt: customTimestamptz('completed_at'),
  triggerType: varchar("trigger_type", { length: 255 }).notNull(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  index("idx_sync_log_started_at").using("btree", table.startedAt.desc().nullsFirst().op("timestamptz_ops")),
  index("idx_sync_log_table_name").using("btree", table.tableName.asc().nullsLast().op("text_ops")),
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = (_created_by)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const fullLinkTaskControlTable = pgTable("full_link_task_control_table", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appRecordId: text("app_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appTaskId: text("app_task_id"),
  // Synced field: auto-synced, do not modify or delete
  urgencyLevel: text("urgency_level"),
  // Synced field: auto-synced, do not modify or delete
  deliverableStatus: text("deliverable_status"),
  // Synced field: auto-synced, do not modify or delete
  deliverableList: text("deliverable_list").array(),
  // Synced field: auto-synced, do not modify or delete
  taskType: text("task_type"),
  // Synced field: auto-synced, do not modify or delete
  sellOutRate: numeric("sell_out_rate"),
  // Synced field: auto-synced, do not modify or delete
  sourceModule: text("source_module"),
  // Synced field: auto-synced, do not modify or delete
  autoAction: text("auto_action"),
  // Synced field: auto-synced, do not modify or delete
  triggerCondition: text("trigger_condition"),
  // Synced field: auto-synced, do not modify or delete
  targetModule: text("target_module"),
  // Synced field: auto-synced, do not modify or delete
  lastUpdateTime: date("last_update_time"),
  // Synced field: auto-synced, do not modify or delete
  collaborativeDepartment: text("collaborative_department").array(),
  // Synced field: auto-synced, do not modify or delete
  plannedCompletionDate: date("planned_completion_date"),
  // Synced field: auto-synced, do not modify or delete
  fabricInventory: numeric("fabric_inventory"),
  // Synced field: auto-synced, do not modify or delete
  returnRate: numeric("return_rate"),
  // Synced field: auto-synced, do not modify or delete
  category: text(),
  // Synced field: auto-synced, do not modify or delete
  safetyWaterLevel: numeric("safety_water_level"),
  // Synced field: auto-synced, do not modify or delete
  skuQuantity: numeric("sku_quantity"),
  // Synced field: auto-synced, do not modify or delete
  drsScore: numeric("drs_score"),
  // Synced field: auto-synced, do not modify or delete
  taskName: text("task_name"),
  // Synced field: auto-synced, do not modify or delete
  responsiblePosition: text("responsible_position"),
  // Synced field: auto-synced, do not modify or delete
  timeWarning: text("time_warning"),
  // Synced field: auto-synced, do not modify or delete
  processStatus: text("process_status"),
  // Synced field: auto-synced, do not modify or delete
  fundOccupation: numeric("fund_occupation"),
  // Synced field: auto-synced, do not modify or delete
  responsibleDepartment: text("responsible_department"),
  // Synced field: auto-synced, do not modify or delete
  executionStatus: text("execution_status"),
  // Synced field: auto-synced, do not modify or delete
  isArchived: text("is_archived"),
  // Synced field: auto-synced, do not modify or delete
  costDeviation: numeric("cost_deviation"),
  // Synced field: auto-synced, do not modify or delete
  blockingReason: text("blocking_reason"),
  // Synced field: auto-synced, do not modify or delete
  appRoi: numeric("app_roi"),
  // Synced field: auto-synced, do not modify or delete
  planStartDate: date("plan_start_date"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const materialReserveLocking = pgTable("material_reserve_locking", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appMaterialCode: text("app_material_code"),
  // Synced field: auto-synced, do not modify or delete
  materialName: text("material_name"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  // Synced field: auto-synced, do not modify or delete
  appRealTimeStock: bigint("app_real_time_stock", { mode: "number" }),
  // Synced field: auto-synced, do not modify or delete
  appStockInDate: date("app_stock_in_date"),
  // Synced field: auto-synced, do not modify or delete
  moduleOwner: text("module_owner"),
  // Synced field: auto-synced, do not modify or delete
  supplierResponseLevel: text("supplier_response_level"),
  // Synced field: auto-synced, do not modify or delete
  fabricType: text("fabric_type"),
  // Synced field: auto-synced, do not modify or delete
  idleWarning: text("idle_warning"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  // Synced field: auto-synced, do not modify or delete
  stayDays: bigint("stay_days", { mode: "number" }),
  // Synced field: auto-synced, do not modify or delete
  fabricIdleRate: text("fabric_idle_rate"),
  // Synced field: auto-synced, do not modify or delete
  supplierName: text("supplier_name"),
  // Synced field: auto-synced, do not modify or delete
  appSku: text("app_sku"),
  // Synced field: auto-synced, do not modify or delete
  reserveStrategy: text("reserve_strategy"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  // Synced field: auto-synced, do not modify or delete
  materialFundOccupation: bigint("material_fund_occupation", { mode: "number" }),
  // Synced field: auto-synced, do not modify or delete
  lockStatus: text("lock_status"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  // Synced field: auto-synced, do not modify or delete
  secondReservePrediction: bigint("second_reserve_prediction", { mode: "number" }),
  /**
   * 关联版单
   */
  // Synced field: auto-synced, do not modify or delete
  appVersionOrder: jsonb("app_version_order"),
  /**
   * 关联产品
   */
  // Synced field: auto-synced, do not modify or delete
  appProduct: jsonb("app_product"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const projectDockingPanoramaTable = pgTable("project_docking_panorama_table", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appId: text("app_id"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const productLibrary = pgTable("product_library", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  multiLineText: text("multi_line_text"),
  // Synced field: auto-synced, do not modify or delete
  isCurrentPromote: boolean("is_current_promote"),
  // Synced field: auto-synced, do not modify or delete
  launchTime: date("launch_time"),
  // Synced field: auto-synced, do not modify or delete
  colorName: text("color_name"),
  // Synced field: auto-synced, do not modify or delete
  image: text().array(),
  // Synced field: auto-synced, do not modify or delete
  productManager: userProfileArray("product_manager"),
  /**
   * 产品|🎁产品设计&工艺图库-产品
   */
  // Synced field: auto-synced, do not modify or delete
  productProductDesignTechGalleryProduct: jsonb("product_product_design_tech_gallery_product"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

// Synced table: data is auto-synced from external source. Do not rename or delete this table.
export const projectFullMap = pgTable("project_full_map", {
  id: uuid().defaultRandom().notNull(),
  // Synced field: auto-synced, do not modify or delete
  baseRecordId: varchar("base_record_id"),
  // Synced field: auto-synced, do not modify or delete
  appTask: text("app_task"),
  // Synced field: auto-synced, do not modify or delete
  progressStatus: text("progress_status"),
  /**
   * 相关项目
   */
  // Synced field: auto-synced, do not modify or delete
  relatedProject: jsonb("related_project"),
  // Synced field: auto-synced, do not modify or delete
  relatedProduct: text("related_product"),
  /**
   * 业务分组
   */
  // Synced field: auto-synced, do not modify or delete
  businessGroup: jsonb("business_group"),
  // Synced field: auto-synced, do not modify or delete
  priority: text(),
  // Synced field: auto-synced, do not modify or delete
  appOwner: userProfile("app_owner"),
  // Synced field: auto-synced, do not modify or delete
  taskDescription: text("task_description"),
  // Synced field: auto-synced, do not modify or delete
  startTime: date("start_time"),
  // Synced field: auto-synced, do not modify or delete
  endTime: date("end_time"),
  // Synced field: auto-synced, do not modify or delete
  overdueStatus: text("overdue_status"),
  // Synced field: auto-synced, do not modify or delete
  deliverable: text(),
  // Synced field: auto-synced, do not modify or delete
  confirmer: userProfileArray("confirmer"),
  // Synced field: auto-synced, do not modify or delete
  confirmationStatus: boolean("confirmation_status"),
  // Synced field: auto-synced, do not modify or delete
  confirmationTime: date("confirmation_time"),
  // Synced field: auto-synced, do not modify or delete
  weeklyChangeFlag: boolean("weekly_change_flag"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  foreignKey({
    columns: [table.relatedProduct],
    foreignColumns: [productLibrary.baseRecordId],
    name: "fk_relation_1863807085657321"
  }).onUpdate("cascade").onDelete("set null"),
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = ((_created_by).user_id)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

export const automationNotificationConfig = pgTable("automation_notification_config", {
  id: uuid().defaultRandom().notNull(),
  ruleKey: varchar("rule_key", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull(),
  enabled: boolean().default(true),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  index("idx_automation_config_rule_key").using("btree", table.ruleKey.asc().nullsLast().op("text_ops")),
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = (_created_by)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

export const project = pgTable("project", {
  id: uuid().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  ownerId: uuid("owner_id"),
  startTime: customTimestamptz('start_time'),
  endTime: customTimestamptz('end_time'),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = (_created_by)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

export const organization = pgTable("organization", {
  id: uuid().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = (_created_by)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

export const automationRuleConfig = pgTable("automation_rule_config", {
  id: uuid().defaultRandom().notNull(),
  ruleKey: varchar("rule_key", { length: 255 }).notNull(),
  ruleName: varchar("rule_name", { length: 255 }).notNull(),
  enabled: boolean().default(true),
  /**
   * @type { drsThreshold: number; conversionRateThreshold: number; riskScoreHigh: number; riskScoreCritical: number; countdownThreshold: number; archiveDays: number }
   */
  threshold: jsonb(),
  description: text(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  index("idx_automation_rule_key").using("btree", table.ruleKey.asc().nullsLast().op("text_ops")),
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = (_created_by)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

export const material = pgTable("material", {
  id: uuid().defaultRandom().notNull(),
  styleNo: varchar("style_no", { length: 255 }).notNull(),
  color: varchar({ length: 255 }),
  size: varchar({ length: 255 }),
  type: varchar({ length: 255 }).notNull(),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = (_created_by)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);

export const task = pgTable("task", {
  id: uuid().defaultRandom().notNull(),
  name: varchar({ length: 255 }).notNull(),
  deadline: customTimestamptz(),
  status: varchar({ length: 255 }).default('pending').notNull(),
  projectId: uuid("project_id"),
  assigneeId: uuid("assignee_id"),
  materialId: uuid("material_id"),
  // System field: Creation time (auto-filled, do not modify)
  createdAt: customTimestamptz('_created_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Creator (auto-filled, do not modify)
  createdBy: userProfile("_created_by"),
  // System field: Update time (auto-filled, do not modify)
  updatedAt: customTimestamptz('_updated_at').default(sql`CURRENT_TIMESTAMP`).notNull(),
  // System field: Updater (auto-filled, do not modify)
  updatedBy: userProfile("_updated_by"),
}, (table) => [
  pgPolicy("修改本人数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"], using: sql`((current_setting('app.user_id'::text) = ANY (ARRAY[]::text[])) AND (current_setting('app.user_id'::text) = (_created_by)::text))` }),
  pgPolicy("查看全部数据", { as: "permissive", for: "select", to: ["anon_workspace_aadj6hzujjqms", "authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("修改全部数据", { as: "permissive", for: "all", to: ["authenticated_workspace_aadj6hzujjqms"] }),
  pgPolicy("service_role_bypass_policy", { as: "permissive", for: "all", to: ["service_role_workspace_aadj6hzujjqms"] }),
]);
export const vProjectFunnelInWorkspaceAadj6Hzujjqms = pgView("v_project_funnel", {
  stage: text(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  count: bigint({ mode: "number" }),
}).as(sql`SELECT '设计定稿'::text AS stage, count(DISTINCT p.id) AS count FROM project_total_table p WHERE p.app_type ~~ '%设计%'::text UNION ALL SELECT '生产下单'::text AS stage, count(DISTINCT p.id) AS count FROM project_total_table p WHERE p.app_type ~~ '%生产%'::text UNION ALL SELECT '物料齐套'::text AS stage, count(DISTINCT m.id) AS count FROM material_reserve_locking m WHERE m.app_stock_in_date IS NOT NULL UNION ALL SELECT '入库完成'::text AS stage, count(DISTINCT s.id) AS count FROM seasoning_summary s WHERE s.is_completed = true`);

export const vProjectStatsInWorkspaceAadj6Hzujjqms = pgView("v_project_stats", {
  projectId: uuid("project_id"),
  projectName: text("project_name"),
  projectType: text("project_type"),
  projectStatus: text("project_status"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  totalTasks: bigint("total_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  completedTasks: bigint("completed_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  pendingTasks: bigint("pending_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  blockedTasks: bigint("blocked_tasks", { mode: "number" }),
  avgDrsScore: numeric("avg_drs_score"),
  avgRiskScore: numeric("avg_risk_score"),
  latestDeadline: date("latest_deadline"),
}).as(sql`SELECT p.id AS project_id, p.app_project AS project_name, p.app_type AS project_type, p.app_status AS project_status, count(t.id) AS total_tasks, count( CASE WHEN t.execution_status = 'completed'::text THEN 1 ELSE NULL::integer END) AS completed_tasks, count( CASE WHEN t.execution_status = 'pending'::text THEN 1 ELSE NULL::integer END) AS pending_tasks, count( CASE WHEN t.execution_status = 'blocked'::text THEN 1 ELSE NULL::integer END) AS blocked_tasks, avg(t.drs_score) AS avg_drs_score, avg(t.return_rate) AS avg_risk_score, max(t.planned_completion_date) AS latest_deadline FROM project_total_table p LEFT JOIN full_link_task_control_table t ON t.source_module = p.app_project GROUP BY p.id, p.app_project, p.app_type, p.app_status`);

export const vTaskRiskTrendInWorkspaceAadj6Hzujjqms = pgView("v_task_risk_trend", {
  taskDate: date("task_date"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  totalTasks: bigint("total_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  highRiskTasks: bigint("high_risk_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  mediumRiskTasks: bigint("medium_risk_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  lowRiskTasks: bigint("low_risk_tasks", { mode: "number" }),
  avgDrsScore: numeric("avg_drs_score"),
}).as(sql`SELECT planned_completion_date AS task_date, count(*) AS total_tasks, count( CASE WHEN urgency_level = '高'::text THEN 1 ELSE NULL::integer END) AS high_risk_tasks, count( CASE WHEN urgency_level = '中'::text THEN 1 ELSE NULL::integer END) AS medium_risk_tasks, count( CASE WHEN urgency_level = '低'::text THEN 1 ELSE NULL::integer END) AS low_risk_tasks, avg(drs_score) AS avg_drs_score FROM full_link_task_control_table t WHERE planned_completion_date IS NOT NULL GROUP BY planned_completion_date ORDER BY planned_completion_date`);

export const vDepartmentWorkloadInWorkspaceAadj6Hzujjqms = pgView("v_department_workload", {
  department: text(),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  totalTasks: bigint("total_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  pendingTasks: bigint("pending_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  inProgressTasks: bigint("in_progress_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  urgentTasks: bigint("urgent_tasks", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  blockedTasks: bigint("blocked_tasks", { mode: "number" }),
}).as(sql`SELECT responsible_department AS department, count(*) AS total_tasks, count( CASE WHEN execution_status = 'pending'::text THEN 1 ELSE NULL::integer END) AS pending_tasks, count( CASE WHEN execution_status = 'in_progress'::text THEN 1 ELSE NULL::integer END) AS in_progress_tasks, count( CASE WHEN urgency_level = '高'::text THEN 1 ELSE NULL::integer END) AS urgent_tasks, count( CASE WHEN blocking_reason IS NOT NULL AND blocking_reason <> ''::text THEN 1 ELSE NULL::integer END) AS blocked_tasks FROM full_link_task_control_table t WHERE responsible_department IS NOT NULL GROUP BY responsible_department ORDER BY (count(*)) DESC`);

export const vMaterialTaskRelationInWorkspaceAadj6Hzujjqms = pgView("v_material_task_relation", {
  materialId: uuid("material_id"),
  materialName: text("material_name"),
  materialStockDate: date("material_stock_date"),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  relatedTaskCount: bigint("related_task_count", { mode: "number" }),
  // You can use { mode: "bigint" } if numbers are exceeding js number limitations
  blockedByMaterialTasks: bigint("blocked_by_material_tasks", { mode: "number" }),
}).as(sql`SELECT m.id AS material_id, m.material_name, m.app_stock_in_date AS material_stock_date, count(t.id) AS related_task_count, count( CASE WHEN t.execution_status = 'blocked'::text THEN 1 ELSE NULL::integer END) AS blocked_by_material_tasks FROM material_reserve_locking m LEFT JOIN full_link_task_control_table t ON t.task_name ~~ (('%'::text || m.material_name) || '%'::text) GROUP BY m.id, m.material_name, m.app_stock_in_date`);

// table aliases
export const appListTable = appList;
export const appOkrTable = appOkr;
export const appRequirementInboxTable = appRequirementInbox;
export const automationNotificationConfigTable = automationNotificationConfig;
export const automationRuleConfigTable = automationRuleConfig;
export const commonContactTable = commonContact;
export const commonInfoTable = commonInfo;
export const fullLinkTaskControlTableTable = fullLinkTaskControlTable;
export const materialTable = material;
export const materialReserveLockingTable = materialReserveLocking;
export const organizationTable = organization;
export const productDesignTechLibraryTable = productDesignTechLibrary;
export const productLibraryTable = productLibrary;
export const projectTable = project;
export const projectDockingPanoramaTableTable = projectDockingPanoramaTable;
export const projectFullMapTable = projectFullMap;
export const projectRushSpecialTable = projectRushSpecial;
export const projectTotalTableTable = projectTotalTable;
export const seasoningSummaryTable = seasoningSummary;
export const syncLogTable = syncLog;
export const taskTable = task;
export const trainingTableGuideTable = trainingTableGuide;
export const versionListTable = versionList;
export const waveDevelopmentSummaryTable = waveDevelopmentSummary;
