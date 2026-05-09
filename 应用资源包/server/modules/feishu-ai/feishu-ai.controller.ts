import { Controller, Post, Body, Logger } from '@nestjs/common';
import { FeishuAiService } from './feishu-ai.service';

@Controller('api/feishu-ai')
export class FeishuAiController {
  private readonly logger = new Logger(FeishuAiController.name);

  constructor(private readonly feishuAiService: FeishuAiService) {}

  @Post('intent')
  async recognizeIntent(@Body() body: { message: string }) {
    return this.feishuAiService.recognizeIntent(body.message);
  }

  @Post('progress-brief')
  async generateProgressBrief(@Body() body: {
    taskBasicInfo: string;
    taskCompletionData: string;
    pendingItems?: string;
    riskAndChallenge?: string;
  }) {
    return this.feishuAiService.generateProgressBrief(body);
  }
}
