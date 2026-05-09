import { Controller, Get, Param, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { BaseTaskService } from './base-task.service';
import type { TaskCreateDto, TaskUpdateDto } from '@shared/api.interface';

@Controller('api/base-data/tasks')
export class BaseTaskController {
  constructor(private readonly baseTaskService: BaseTaskService) {}

  @Get()
  async getList(
    @Query('status') status?: string,
    @Query('projectId') projectId?: string,
    @Query('assigneeId') assigneeId?: string,
    @Query('name') name?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.baseTaskService.getList({
      status,
      projectId,
      assigneeId,
      name,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.baseTaskService.getById(id);
  }

  @NeedLogin()
  @Post()
  async create(@Body() dto: TaskCreateDto) {
    return this.baseTaskService.create(dto);
  }

  @NeedLogin()
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: TaskUpdateDto) {
    return this.baseTaskService.update(id, dto);
  }

  @NeedLogin()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.baseTaskService.delete(id);
  }
}
