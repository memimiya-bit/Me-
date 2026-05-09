import { Controller, Get, Param, Query } from '@nestjs/common';
import { MaterialService } from './material.service';
import type { MaterialListParams } from '@shared/material';

@Controller('api/materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  async getList(
    @Query('fabricType') fabricType?: string,
    @Query('supplier') supplier?: string,
    @Query('isLocked') isLocked?: string,
    @Query('idleWarning') idleWarning?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: MaterialListParams = {
      fabricType,
      supplier,
      isLocked: isLocked !== undefined ? isLocked === 'true' : undefined,
      idleWarning: idleWarning !== undefined ? idleWarning === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.materialService.getList(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.materialService.getById(id);
  }
}
