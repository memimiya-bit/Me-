/* 任务模块共享类型 */

export interface Task {
  id: string;
  businessId: string;
  name: string;
  type: string;
  priority: string;
  status: string;
  owner: string;
  department: string;
  collaboratorDepartments: string[];
  planStartTime: string;
  planEndTime: string;
  drsScore: number;
  sellThroughRate: number;
  riskScore: number;
  blockReason: string;
}

export interface TaskListParams {
  status?: string;
  priority?: string;
  type?: string;
  department?: string;
  startTime?: string;
  endTime?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface TaskListResponse {
  items: Task[];
  total: number;
}

export interface TaskDetail extends Task {}
