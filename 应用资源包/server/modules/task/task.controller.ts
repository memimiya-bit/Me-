import { Controller, Get, Param, Query } from '@nestjs/common';
import { TaskService } from './task.service';
import type { TaskListParams } from '@shared/task';

@Controller('api/tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  async getList(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('type') type?: string,
    @Query('department') department?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: TaskListParams = {
      status,
      priority,
      type,
      department,
      startTime,
      endTime,
      sortBy,
      sortOrder,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.taskService.getList(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.taskService.getById(id);
  }
}
