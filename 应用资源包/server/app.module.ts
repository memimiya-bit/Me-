import { APP_FILTER } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { PlatformModule } from '@lark-apaas/fullstack-nestjs-core';

import { GlobalExceptionFilter } from './common/filters/exception.filter';
import { ViewModule } from './modules/view/view.module';
import { BusinessModule } from './modules/business/business.module';
import { TaskModule } from './modules/task/task.module';
import { VersionModule } from './modules/version/version.module';
import { MaterialModule } from './modules/material/material.module';
import { ProductModule } from './modules/product/product.module';
import { OrganizationModule } from './modules/organization/organization.module';
import { ProjectModule } from './modules/project/project.module';
import { SyncModule } from './modules/sync/sync.module';
import { FeishuAiModule } from './modules/feishu-ai/feishu-ai.module';
import { BaseMaterialModule } from './modules/base-material/base-material.module';
import { BaseTaskModule } from './modules/base-task/base-task.module';
import { FullLinkTaskModule } from './modules/full-link-task/full-link-task.module';
import { ProjectTotalModule } from './modules/project-total/project-total.module';

@Module({
  imports: [
    // 平台 Module，提供平台能力
    PlatformModule.forRoot(),
    // ====== @route-section: business-modules START ======
    // Place all business modules here.Do NOT add fallback modules here.
    BusinessModule,
    TaskModule,
    VersionModule,
    MaterialModule,
    ProductModule,
    OrganizationModule,
    ProjectModule,
    SyncModule,
    FeishuAiModule,
    BaseMaterialModule,
    BaseTaskModule,
    FullLinkTaskModule,
    ProjectTotalModule,
    // ====== @route-section: business-modules END ======

    // ⚠️ @route-order: last
    // ViewModule is the fallback route module, must be registered last.
    ViewModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}
