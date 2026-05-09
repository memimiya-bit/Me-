import { Controller, Get, Param, Post, Put, Delete, Query, Body } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { ProjectService } from './project.service';
import type { ProjectListParams, ProjectCreateDto, ProjectUpdateDto } from '@shared/api.interface';

@Controller('api/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getList(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('name') name?: string,
    @Query('ownerId') ownerId?: string,
  ) {
    const params: ProjectListParams = {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      name,
      ownerId,
    };
    return this.projectService.getList(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.projectService.getById(id);
  }

  @NeedLogin()
  @Post()
  async create(@Body() dto: ProjectCreateDto) {
    return this.projectService.create(dto);
  }

  @NeedLogin()
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: ProjectUpdateDto) {
    return this.projectService.update(id, dto);
  }

  @NeedLogin()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.projectService.delete(id);
  }
}
