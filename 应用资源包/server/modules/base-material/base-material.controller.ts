import { Controller, Get, Param, Post, Put, Delete, Body, Query } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { BaseMaterialService } from './base-material.service';
import type { MaterialListParams, MaterialCreateDto, MaterialUpdateDto } from '@shared/api.interface';

@Controller('api/base-data/materials')
export class BaseMaterialController {
  constructor(private readonly baseMaterialService: BaseMaterialService) {}

  @Get()
  async getList(
    @Query('type') type?: string,
    @Query('styleNo') styleNo?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const params: MaterialListParams = {
      type,
      styleNo,
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    };
    return this.baseMaterialService.getList(params);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.baseMaterialService.getById(id);
  }

  @NeedLogin()
  @Post()
  async create(@Body() dto: MaterialCreateDto) {
    return this.baseMaterialService.create(dto);
  }

  @NeedLogin()
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: MaterialUpdateDto) {
    return this.baseMaterialService.update(id, dto);
  }

  @NeedLogin()
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.baseMaterialService.delete(id);
  }
}
