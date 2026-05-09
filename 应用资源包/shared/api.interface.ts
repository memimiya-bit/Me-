/* 前后端共享的类型写在这里 */

export interface FullLinkTask {
  id: string;
  taskName: string;
  taskType: string;
  urgencyLevel: string;
  responsibleDepartment: string;
  plannedCompletionDate: string;
  executionStatus: string;
  blockingReason: string;
  sourceModule: string;
}

export interface FullLinkTaskListParams {
  executionStatus?: string;
  urgencyLevel?: string;
  pageSize?: number;
}

export interface FullLinkTaskListResponse {
  items: FullLinkTask[];
  total: number;
}

export interface ProjectTotal {
  id: string;
  appProject: string;
  appType: string;
  appProjectOwner: string;
  appStatus: string;
}

export interface ProjectTotalListParams {
  appStatus?: string;
  pageSize?: number;
}

export interface ProjectTotalListResponse {
  items: ProjectTotal[];
  total: number;
}

// ====== 基础数据模型 ======

export interface Organization {
  id: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: string;
  styleNo: string;
  color: string | null;
  size: string | null;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  ownerId: string | null;
  ownerName?: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  name: string;
  deadline: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  projectId: string | null;
  projectName?: string;
  assigneeId: string | null;
  assigneeName?: string;
  materialId: string | null;
  materialStyleNo?: string;
  createdAt: string;
  updatedAt: string;
}

// ====== 通用分页 ======

export interface ListParams {
  page?: number;
  pageSize?: number;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}

// ====== 组织模块 ======

export interface OrganizationListParams extends ListParams {
  role?: string;
  name?: string;
}

export interface OrganizationCreateDto {
  name: string;
  role: string;
}

export interface OrganizationUpdateDto {
  name?: string;
  role?: string;
}

// ====== 物料模块 ======

export interface MaterialListParams extends ListParams {
  type?: string;
  styleNo?: string;
}

export interface MaterialCreateDto {
  styleNo: string;
  color?: string;
  size?: string;
  type: string;
}

export interface MaterialUpdateDto {
  styleNo?: string;
  color?: string;
  size?: string;
  type?: string;
}

// ====== 项目模块 ======

export interface ProjectListParams extends ListParams {
  name?: string;
  ownerId?: string;
}

export interface ProjectCreateDto {
  name: string;
  ownerId?: string;
  startTime?: string;
  endTime?: string;
}

export interface ProjectUpdateDto {
  name?: string;
  ownerId?: string;
  startTime?: string;
  endTime?: string;
}

// ====== 任务模块 ======

export interface TaskListParams extends ListParams {
  status?: string;
  projectId?: string;
  assigneeId?: string;
  name?: string;
}

export interface TaskCreateDto {
  name: string;
  deadline?: string;
  status?: string;
  projectId?: string;
  assigneeId?: string;
  materialId?: string;
}

export interface TaskUpdateDto {
  name?: string;
  deadline?: string;
  status?: string;
  projectId?: string;
  assigneeId?: string;
  materialId?: string;
}
