import { Injectable, Inject, Logger } from '@nestjs/common';
import { DRIZZLE_DATABASE, type PostgresJsDatabase } from '@lark-apaas/fullstack-nestjs-core';
import { count, eq, and } from 'drizzle-orm';
import { productLibrary, versionList } from '@server/database/schema';
import type {
  Product,
  ProductDetail,
  ProductListParams,
  ProductListResponse,
  ProductVersion,
  ProductVersionsResponse,
} from '@shared/product';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(@Inject(DRIZZLE_DATABASE) private readonly db: PostgresJsDatabase) {}

  async getList(params: ProductListParams): Promise<ProductListResponse> {
    try {
      const { isFeatured, startTime, endTime, category, page = 1, pageSize = 10 } = params;
      const offset = (page - 1) * pageSize;

      const conditions = [];
      if (isFeatured !== undefined) {
        conditions.push(eq(productLibrary.isCurrentPromote, isFeatured));
      }

      const itemsQuery =
        conditions.length > 0
          ? this.db
              .select()
              .from(productLibrary)
              .where(and(...conditions))
              .limit(pageSize)
              .offset(offset)
          : this.db.select().from(productLibrary).limit(pageSize).offset(offset);

      const countQuery =
        conditions.length > 0
          ? this.db
              .select({ count: count() })
              .from(productLibrary)
              .where(and(...conditions))
          : this.db.select({ count: count() }).from(productLibrary);

      const [items, totalResult] = await Promise.all([itemsQuery, countQuery]);

      return {
        items: items.map((r) => this.mapToProduct(r)),
        total: Number(totalResult[0]?.count ?? 0),
      };
    } catch (error) {
      this.logger.error('获取产品列表失败', error);
      throw error;
    }
  }

  async getById(id: string): Promise<ProductDetail | null> {
    try {
      const [record] = await this.db
        .select()
        .from(productLibrary)
        .where(eq(productLibrary.id, id));

      if (!record) return null;

      const product = this.mapToProduct(record);

      const designImages: string[] = record.image ?? [];

      let processData = '';
      if (record.productProductDesignTechGalleryProduct) {
        processData = JSON.stringify(record.productProductDesignTechGalleryProduct);
      }

      return {
        ...product,
        designImages,
        processData,
      };
    } catch (error) {
      this.logger.error('获取产品详情失败', error);
      throw error;
    }
  }

  async getVersionsByProductId(id: string): Promise<ProductVersionsResponse> {
    try {
      const [product] = await this.db
        .select()
        .from(productLibrary)
        .where(eq(productLibrary.id, id));

      if (!product) {
        return { items: [], total: 0 };
      }

      const items: ProductVersion[] = [];

      return { items, total: items.length };
    } catch (error) {
      this.logger.error('获取产品版本列表失败', error);
      throw error;
    }
  }

  private mapToProduct(record: typeof productLibrary.$inferSelect): Product {
    const managerList = record.productManager ?? [];
    const productManager = managerList.length > 0 ? managerList[0] : '';

    let category = '';
    if (record.productProductDesignTechGalleryProduct) {
      const data = record.productProductDesignTechGalleryProduct as Record<string, unknown>;
      category = (data.category as string) ?? (data.productCategory as string) ?? '';
    }

    const images = record.image ?? [];
    const mainImage = images.length > 0 ? images[0] : '';

    return {
      id: record.id,
      name: record.multiLineText ?? '',
      color: record.colorName ?? '',
      launchTime: record.launchTime ?? '',
      productManager,
      isFeatured: record.isCurrentPromote ?? false,
      category,
      mainImage,
    };
  }
}
