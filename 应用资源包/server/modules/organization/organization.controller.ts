import { Controller, Get, Param, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { OrganizationService } from './organization.service';
import type { OrganizationListParams, OrganizationCreateDto, OrganizationUpdateDto } from '@shared/api.interface';

@Controller('api/organizations')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async getList(
    @Query('role') role?: string,
    @Query('name') name?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: OrganizationListParams = {
      role,
      name,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.organizationService.getList(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.organizationService.getById(id);
  }

  @NeedLogin()
  @Post()
  async create(@Body() dto: OrganizationCreateDto) {
    return this.organizationService.create(dto);
  }

  @NeedLogin()
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: OrganizationUpdateDto) {
    return this.organizationService.update(id, dto);
  }

  @NeedLogin()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.organizationService.delete(id);
  }
}
