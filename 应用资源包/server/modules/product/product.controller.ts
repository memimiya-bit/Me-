import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import type { ProductListParams } from '@shared/product';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getList(
    @Query('isFeatured') isFeatured?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: ProductListParams = {
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : undefined,
      startTime,
      endTime,
      category,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.productService.getList(params);
  }

  @Get(':id/versions')
  async getVersions(
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.productService.getVersionsByProductId(id);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.productService.getById(id);
  }
}
