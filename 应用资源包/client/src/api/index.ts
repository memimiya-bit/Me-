import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  BusinessListParams,
  BusinessListResponse,
  BusinessDetail,
  DashboardMetrics,
} from '@shared/business';
import type {
  TaskListParams,
  TaskListResponse,
  TaskDetail,
} from '@shared/task';
import type {
  VersionListParams,
  VersionListResponse,
  VersionDetail,
} from '@shared/version';
import type {
  MaterialListParams,
  MaterialListResponse,
  MaterialDetail,
} from '@shared/material';
import type {
  ProductListParams,
  ProductListResponse,
  ProductDetail,
  ProductVersionsResponse,
} from '@shared/product';
import type {
  FullLinkTaskListParams,
  FullLinkTaskListResponse,
  ProjectTotalListParams,
  ProjectTotalListResponse,
} from '@shared/api.interface';
import type {
  Organization,
  OrganizationListParams,
  OrganizationCreateDto,
  OrganizationUpdateDto,
  ListResponse,
  Project,
  ProjectListParams,
  ProjectCreateDto,
  ProjectUpdateDto,
  TaskCreateDto,
  TaskUpdateDto,
  Material as BaseMaterial,
  MaterialCreateDto as BaseMaterialCreateDto,
  MaterialUpdateDto as BaseMaterialUpdateDto,
  MaterialListParams as BaseMaterialListParams,
  Task as BaseTask,
  TaskListParams as BaseTaskListParams,
} from '@shared/api.interface';

interface SyncResult {
  tableName: string;
  totalRecords: number;
  newRecords: number;
  failedRecords: number;
  status: 'success' | 'partial' | 'failed';
  errorMessage?: string;
}

interface SyncLog {
  id: string;
  tableName: string;
  totalRecords: number;
  newRecords: number;
  failedRecords: number;
  status: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  triggerType: string;
}

interface SyncLogsResponse {
  items: SyncLog[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const response = await axiosForBackend({
      url: '/api/businesses/metrics',
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取仪表盘数据失败', error);
    throw error;
  }
}

export async function getBusinesses(params: BusinessListParams): Promise<BusinessListResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/businesses',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取业务列表失败', error);
    throw error;
  }
}

export async function getBusinessDetail(id: string): Promise<BusinessDetail> {
  try {
    const response = await axiosForBackend({
      url: `/api/businesses/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取业务详情失败', error);
    throw error;
  }
}

export async function getBusinessTasks(
  businessId: string,
  status?: string,
  page = 1,
  pageSize = 10,
): Promise<TaskListResponse> {
  try {
    const response = await axiosForBackend({
      url: `/api/businesses/${businessId}/tasks`,
      method: 'GET',
      params: { status, page, pageSize },
    });
    return response.data;
  } catch (error) {
    logger.error('获取业务关联任务失败', error);
    throw error;
  }
}

export async function getTasks(params: TaskListParams): Promise<TaskListResponse> {
  try {
    const response = await axiosForBackend({ url: '/api/base-data/tasks', method: 'GET', params });
    return response.data;
  } catch (error) {
    logger.error('获取任务列表失败', error);
    throw error;
  }
}

export async function getTaskDetail(id: string): Promise<TaskDetail> {
  try {
    const response = await axiosForBackend({
      url: `/api/tasks/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取任务详情失败', error);
    throw error;
  }
}

export async function getVersions(params: VersionListParams): Promise<VersionListResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/versions',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取版本列表失败', error);
    throw error;
  }
}

export async function getVersionDetail(id: string): Promise<VersionDetail> {
  try {
    const response = await axiosForBackend({
      url: `/api/versions/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取版本详情失败', error);
    throw error;
  }
}

export async function getMaterials(params: MaterialListParams): Promise<MaterialListResponse> {
  try {
    const response = await axiosForBackend({ url: '/api/base-data/materials', method: 'GET', params });
    return response.data;
  } catch (error) {
    logger.error('获取物料列表失败', error);
    throw error;
  }
}

export async function getMaterialDetail(id: string): Promise<MaterialDetail> {
  try {
    const response = await axiosForBackend({
      url: `/api/materials/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取物料详情失败', error);
    throw error;
  }
}

export async function getProducts(params: ProductListParams): Promise<ProductListResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/products',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取产品列表失败', error);
    throw error;
  }
}

export async function getProductDetail(id: string): Promise<ProductDetail> {
  try {
    const response = await axiosForBackend({
      url: `/api/products/${id}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取产品详情失败', error);
    throw error;
  }
}

export async function getProductVersions(id: string, page = 1, pageSize = 20): Promise<ProductVersionsResponse> {
  try {
    const response = await axiosForBackend({
      url: `/api/products/${id}/versions`,
      method: 'GET',
      params: { page, pageSize },
    });
    return response.data;
  } catch (error) {
    logger.error('获取产品关联版本失败', error);
    throw error;
  }
}

export async function triggerSync(): Promise<SyncResult[]> {
  try {
    const response = await axiosForBackend({
      url: '/api/sync/trigger',
      method: 'POST',
    });
    return response.data;
  } catch (error) {
    logger.error('触发同步失败', error);
    throw error;
  }
}

export async function getSyncLogs(page = 1, pageSize = 20): Promise<SyncLogsResponse> {
  try {
    const response = await axiosForBackend({
      url: `/api/sync/logs?page=${page}&pageSize=${pageSize}`,
      method: 'GET',
    });
    return response.data;
  } catch (error) {
    logger.error('获取同步日志失败', error);
    throw error;
  }
}

export async function getFullLinkTasks(params?: FullLinkTaskListParams): Promise<FullLinkTaskListResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/full-link-tasks',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取全链路任务失败', error);
    throw error;
  }
}

export async function getProjectTotals(params?: ProjectTotalListParams): Promise<ProjectTotalListResponse> {
  try {
    const response = await axiosForBackend({
      url: '/api/project-totals',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取项目总览失败', error);
    throw error;
  }
}

// ====== 基础数据 API ======

export async function getOrganizations(params: OrganizationListParams): Promise<ListResponse<Organization>> {
  const response = await axiosForBackend({ url: '/api/organizations', method: 'GET', params });
  return response.data;
}

export async function createOrganization(dto: OrganizationCreateDto): Promise<Organization> {
  const response = await axiosForBackend({ url: '/api/organizations', method: 'POST', data: dto });
  return response.data;
}

export async function updateOrganization(id: string, dto: OrganizationUpdateDto): Promise<Organization> {
  const response = await axiosForBackend({ url: `/api/organizations/${id}`, method: 'PUT', data: dto });
  return response.data;
}

export async function deleteOrganization(id: string): Promise<void> {
  await axiosForBackend({ url: `/api/organizations/${id}`, method: 'DELETE' });
}

export async function getProjects(params: ProjectListParams): Promise<ListResponse<Project>> {
  const response = await axiosForBackend({ url: '/api/projects', method: 'GET', params });
  return response.data;
}

export async function createProject(dto: ProjectCreateDto): Promise<Project> {
  const response = await axiosForBackend({ url: '/api/projects', method: 'POST', data: dto });
  return response.data;
}

export async function updateProject(id: string, dto: ProjectUpdateDto): Promise<Project> {
  const response = await axiosForBackend({ url: `/api/projects/${id}`, method: 'PUT', data: dto });
  return response.data;
}

export async function deleteProject(id: string): Promise<void> {
  await axiosForBackend({ url: `/api/projects/${id}`, method: 'DELETE' });
}

export async function createTask(dto: TaskCreateDto): Promise<TaskDetail> {
  const response = await axiosForBackend({ url: '/api/base-data/tasks', method: 'POST', data: dto });
  return response.data;
}

export async function updateTask(id: string, dto: TaskUpdateDto): Promise<TaskDetail> {
  const response = await axiosForBackend({ url: `/api/base-data/tasks/${id}`, method: 'PUT', data: dto });
  return response.data;
}

export async function deleteTask(id: string): Promise<void> {
  await axiosForBackend({ url: `/api/base-data/tasks/${id}`, method: 'DELETE' });
}

export async function createMaterial(dto: import('@shared/api.interface').MaterialCreateDto): Promise<import('@shared/api.interface').Material> {
  const response = await axiosForBackend({ url: '/api/base-data/materials', method: 'POST', data: dto });
  return response.data;
}

export async function updateMaterial(id: string, dto: import('@shared/api.interface').MaterialUpdateDto): Promise<import('@shared/api.interface').Material> {
  const response = await axiosForBackend({ url: `/api/base-data/materials/${id}`, method: 'PUT', data: dto });
  return response.data;
}

export async function deleteMaterial(id: string): Promise<void> {
  await axiosForBackend({ url: `/api/base-data/materials/${id}`, method: 'DELETE' });
}

export async function getBaseMaterials(params: BaseMaterialListParams): Promise<ListResponse<BaseMaterial>> {
  const response = await axiosForBackend({ url: '/api/base-data/materials', method: 'GET', params });
  return response.data;
}

export async function getBaseTasks(params: BaseTaskListParams): Promise<ListResponse<BaseTask>> {
  const response = await axiosForBackend({ url: '/api/base-data/tasks', method: 'GET', params });
  return response.data;
}
