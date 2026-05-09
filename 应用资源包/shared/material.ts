/* 物料模块共享类型 */

export interface Material {
  id: string;
  code: string;
  name: string;
  stock: number;
  storageTime: string;
  fabricType: string;
  supplier: string;
  isLocked: boolean;
  idleWarning: boolean;
  capitalOccupation: number;
}

export interface MaterialListParams {
  fabricType?: string;
  supplier?: string;
  isLocked?: boolean;
  idleWarning?: boolean;
  page?: number;
  pageSize?: number;
}

export interface MaterialListResponse {
  items: Material[];
  total: number;
}

export interface MaterialDetail extends Material {
  relatedVersions: Array<{
    id: string;
    styleNo: string;
    productName: string;
  }>;
}
