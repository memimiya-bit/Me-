import { Module } from '@nestjs/common';
import { BaseMaterialController } from './base-material.controller';
import { BaseMaterialService } from './base-material.service';

@Module({
  controllers: [BaseMaterialController],
  providers: [BaseMaterialService],
  exports: [BaseMaterialService],
})
export class BaseMaterialModule {}
