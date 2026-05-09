import { Controller, Get, Query } from '@nestjs/common';
import { ProjectTotalService } from './project-total.service';
import type { ProjectTotalListParams } from '@shared/api.interface';

@Controller('api/project-totals')
export class ProjectTotalController {
  constructor(private readonly projectTotalService: ProjectTotalService) {}

  @Get()
  async getList(
    @Query('appStatus') appStatus?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: ProjectTotalListParams = {
      appStatus,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.projectTotalService.getList(params);
  }
}
