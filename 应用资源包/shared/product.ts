/* 产品模块共享类型 */

export interface Product {
  id: string;
  name: string;
  color: string;
  launchTime: string;
  productManager: string;
  isFeatured: boolean;
  category: string;
  mainImage: string;
}

export interface ProductListParams {
  isFeatured?: boolean;
  startTime?: string;
  endTime?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
}

export interface ProductDetail extends Product {
  designImages: string[];
  processData: string;
}

export interface ProductVersion {
  id: string;
  styleNo: string;
  sampleStatus: string;
  progress: number;
}

export interface ProductVersionsResponse {
  items: ProductVersion[];
  total: number;
}
