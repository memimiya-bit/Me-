// ---- plugin:send_task_completion_feishu_notification_1 ----
// ============================================================
// 插件 send_task_completion_feishu_notification_1 (任务完成时自动发送飞书群通知) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface SendTaskCompletionFeishuNotificationOneInput {
  /** 任务详情页跳转链接 */
  task_detail_url: string;
  /** 通知正文补充内容（支持markdown格式） */
  notification_content?: string;
  /** 已完成的任务名称 */
  task_name: string;
  /** 任务完成时间 */
  task_completion_time: string;
  /** 任务负责人名称 */
  task_assignee: string;
}

/**
 * capabilityClient.load('send_task_completion_feishu_notification_1').call<SendTaskCompletionFeishuNotificationOneOutput>('send_feishu_message', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { success } = result;
 */
export interface SendTaskCompletionFeishuNotificationOneOutput {
  /** [object Object] */
  success: boolean;
}
// ---- end:send_task_completion_feishu_notification_1 ----

// ---- plugin:user_message_intent_recognition_1 ----
// ============================================================
// 插件 user_message_intent_recognition_1 (用户消息意图识别) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface UserMessageIntentRecognitionOneInput {
  /** 待识别意图的用户输入消息文本 */
  user_message: string;
}

/**
 * capabilityClient.load('user_message_intent_recognition_1').call<UserMessageIntentRecognitionOneOutput>('aiCategorize', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { categories } = result;
 */
export interface UserMessageIntentRecognitionOneOutput {
  /** [object Object] */
  categories: string[];
}
// ---- end:user_message_intent_recognition_1 ----

// ---- plugin:task_progress_briefing_generate_1 ----
// ============================================================
// 插件 task_progress_briefing_generate_1 (任务进度简报自动生成) 的类型定义
// 由 get_plugin_ai_json 自动生成
// ============================================================

export interface TaskProgressBriefingGenerateOneInput {
  /** 任务基本信息，包含任务名称、负责人、周期等 */
  task_basic_info: string;
  /** 任务完成数据，包含已完成项、完成率、关键成果等 */
  task_completion_data: string;
  /** 待办事项和下一步计划 */
  pending_items?: string;
  /** 遇到的风险和挑战，以及应对措施 */
  risk_and_challenge?: string;
}

/**
 * capabilityClient.load('task_progress_briefing_generate_1').call<TaskProgressBriefingGenerateOneOutput>('textGenerate', input)
 * 直接返回此类型，无 .data 包装，直接解构使用：
 * const { content, response } = result;
 */
export interface TaskProgressBriefingGenerateOneOutput {
  /** [object Object] */
  content: string;
  /** [object Object] */
  response?: string;
}
// ---- end:task_progress_briefing_generate_1 ----