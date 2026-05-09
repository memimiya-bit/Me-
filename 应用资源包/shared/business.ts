/* 业务模块共享类型 */

export interface Business {
  id: string;
  name: string;
  type: string;
  owner: string;
  riskLevel: string;
  progress: number;
  drsScore: number;
  sellThroughRate: number;
  riskScore: number;
  startTime: string;
  endTime: string;
}

export interface BusinessListParams {
  type?: string;
  riskLevel?: string;
  owner?: string;
  startTime?: string;
  endTime?: string;
  page?: number;
  pageSize?: number;
}

export interface BusinessListResponse {
  items: Business[];
  total: number;
}

export interface BusinessDetail extends Business {
  completedTasks: number;
  totalTasks: number;
}

export interface DashboardMetrics {
  totalBusiness: number;
  activeBusiness: number;
  totalTasks: number;
  overdueTasks: number;
}
