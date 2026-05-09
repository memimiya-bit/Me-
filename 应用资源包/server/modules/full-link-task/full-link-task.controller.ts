import { Controller, Get, Query } from '@nestjs/common';
import { FullLinkTaskService } from './full-link-task.service';
import type { FullLinkTaskListParams } from '@shared/api.interface';

@Controller('api/full-link-tasks')
export class FullLinkTaskController {
  constructor(private readonly fullLinkTaskService: FullLinkTaskService) {}

  @Get()
  async getList(
    @Query('executionStatus') executionStatus?: string,
    @Query('urgencyLevel') urgencyLevel?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: FullLinkTaskListParams = {
      executionStatus,
      urgencyLevel,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.fullLinkTaskService.getList(params);
  }
}
