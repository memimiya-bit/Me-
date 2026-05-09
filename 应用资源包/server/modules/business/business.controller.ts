import { Controller, Get, Param, Query } from '@nestjs/common';
import { BusinessService } from './business.service';
import type { BusinessListParams } from '@shared/business';

@Controller('api/businesses')
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @Get('metrics')
  async getMetrics() {
    return this.businessService.getMetrics();
  }

  @Get()
  async getList(
    @Query('type') type?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('owner') owner?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: BusinessListParams = {
      type,
      riskLevel,
      owner,
      startTime,
      endTime,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.businessService.getList(params);
  }

  @Get(':id/tasks')
  async getTasksByBusinessId(
    @Param('id') id: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.businessService.getTasksByBusinessId(id, status, page ? parseInt(page, 10) : 1, pageSize ? parseInt(pageSize, 10) : 10);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.businessService.getById(id);
  }
}
