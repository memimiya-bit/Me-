import { Module } from '@nestjs/common';
import { ProjectTotalController } from './project-total.controller';
import { ProjectTotalService } from './project-total.service';

@Module({
  controllers: [ProjectTotalController],
  providers: [ProjectTotalService],
  exports: [ProjectTotalService],
})
export class ProjectTotalModule {}
