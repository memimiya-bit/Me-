import { Controller, Get, Param, Query } from '@nestjs/common';
import { VersionService } from './version.service';
import type { VersionListParams } from '@shared/version';

@Controller('api/versions')
export class VersionController {
  constructor(private readonly versionService: VersionService) {}

  @Get()
  async getList(
    @Query('customer') customer?: string,
    @Query('wave') wave?: string,
    @Query('category') category?: string,
    @Query('sampleStatus') sampleStatus?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: VersionListParams = {
      customer,
      wave,
      category,
      sampleStatus,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.versionService.getList(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.versionService.getById(id);
  }
}
