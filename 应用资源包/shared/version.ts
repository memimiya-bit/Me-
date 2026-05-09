/* 版本模块共享类型 */

export interface Version {
  id: string;
  productId: string;
  productName: string;
  styleNo: string;
  customer: string;
  wave: string;
  category: string;
  sampleStatus: string;
  taskCount: number;
  progress: number;
  keyNodeTime: Record<string, string>;
}

export interface VersionListParams {
  customer?: string;
  wave?: string;
  category?: string;
  sampleStatus?: string;
  page?: number;
  pageSize?: number;
}

export interface VersionListResponse {
  items: Version[];
  total: number;
}

export interface VersionDetail extends Version {
  tasks: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
  }>;
}
