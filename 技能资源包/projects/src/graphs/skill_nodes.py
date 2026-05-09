"""
飞书项目管理技能推荐工作流 - 节点定义
基于技能迭代方案V4.0的岗位技能赋能体系
"""
import os
import json
from typing import List, Dict, Any, Optional
from langchain_core.runnables import RunnableConfig
from langgraph.runtime import Runtime
from coze_coding_utils.runtime_ctx.context import Context
from graphs.skill_state import (
    SkillRecommendationState,
    SkillGraphOutput,
)


def load_skill_matrix() -> Dict[str, Any]:
    """加载技能矩阵配置"""
    config_path = os.path.join(os.getenv("COZE_WORKSPACE_PATH", ""), "data/skill_matrix_config.json")
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}


def analyze_problem_node(
    state: SkillRecommendationState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: 问题分析
    desc: 分析用户输入的问题，识别问题类型、复杂度并匹配相关场景
    integrations: 
    """
    user_input = state.user_input or ""
    
    # 问题关键词映射
    problem_keywords = {
        "efficiency": ["效率", "慢", "拖延", "堆积", "延迟", "进度", "管理"],
        "quality": ["质量", "返工", "缺陷", "bug", "错误", "审核", "检查"],
        "communication": ["沟通", "协作", "协调", "对齐", "同步", "会议", "跨部门"],
        "risk": ["风险", "逾期", "延期", "预警", "问题", "突发", "应急"]
    }
    
    # 场景关键词映射
    scenario_keywords = {
        "project_kickoff": ["立项", "启动", "新项目", "章程", "依赖", "资源"],
        "progress_control": ["进度", "管控", "追踪", "监控", "甘特", "里程碑"],
        "quality_assurance": ["质量", "审核", "交付", "检查", "审批", "追溯"],
        "risk_response": ["风险", "预警", "逾期", "应急", "突发", "响应"],
        "retrospect_optimize": ["复盘", "总结", "改进", "优化", "经验", "沉淀"]
    }
    
    # 分析问题类型
    problem_type = "efficiency"
    max_keyword_count = 0
    key_phrases = []
    
    for ptype, keywords in problem_keywords.items():
        count = sum(1 for kw in keywords if kw in user_input)
        if count > max_keyword_count:
            max_keyword_count = count
            problem_type = ptype
        key_phrases.extend([kw for kw in keywords if kw in user_input])
    
    # 匹配场景
    matching_scenarios = []
    for scenario, keywords in scenario_keywords.items():
        if any(kw in user_input for kw in keywords):
            matching_scenarios.append(scenario)
    
    # 如果没有匹配到场景，根据问题类型推断
    if not matching_scenarios:
        if problem_type == "efficiency":
            matching_scenarios = ["progress_control"]
        elif problem_type == "quality":
            matching_scenarios = ["quality_assurance"]
        elif problem_type == "risk":
            matching_scenarios = ["risk_response"]
        elif problem_type == "communication":
            matching_scenarios = ["project_kickoff", "progress_control"]
    
    # 分析问题复杂度
    complexity_indicators = ["多个", "复杂", "跨部门", "大型", "重要", "紧急"]
    if any(ind in user_input for ind in complexity_indicators):
        problem_complexity = "complex"
    elif len(user_input) > 50 or len(matching_scenarios) > 1:
        problem_complexity = "medium"
    else:
        problem_complexity = "simple"
    
    return {
        "problem_type": problem_type,
        "problem_complexity": problem_complexity,
        "key_phrases": list(set(key_phrases))[:10],
        "matching_scenarios": matching_scenarios
    }


def match_skills_node(
    state: SkillRecommendationState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: 技能匹配
    desc: 基于问题分析和用户岗位，匹配最合适的技能
    integrations: 
    """
    skill_matrix = load_skill_matrix()
    user_role = state.user_role or "项目经理"
    problem_type = state.problem_type or "efficiency"
    matching_scenarios = state.matching_scenarios or []
    problem_urgency = state.problem_urgency or "medium"
    problem_complexity = state.problem_complexity or "medium"
    
    matched_skills = []
    match_scores = []
    
    # 场景到技能包的映射
    scenario_skill_map = {
        "project_kickoff": ["skill_charter_gen_v1", "skill_dependency_v2", "skill_resource_preemption"],
        "progress_control": ["skill_dependency_viz", "skill_smart_alert", "skill_bottleneck"],
        "quality_assurance": ["skill_checklist", "skill_multi_approval", "skill_traceability"],
        "risk_response": ["skill_emergency_response", "skill_impact_assessment", "skill_comm_template"],
        "retrospect_optimize": ["skill_data_retro", "skill_experience_extract", "skill_improve_track"]
    }
    
    # 收集所有匹配场景的技能
    candidate_skill_ids = set()
    for scenario in matching_scenarios:
        if scenario in scenario_skill_map:
            candidate_skill_ids.update(scenario_skill_map[scenario])
    
    # 从技能矩阵中提取技能详情
    skill_details = {}
    for scenario_key, scenario_data in skill_matrix.get("skill_matrix", {}).items():
        for skill in scenario_data.get("core_skills", []):
            skill_details[skill.get("skill_id", "")] = skill
    
    # 计算匹配分数并收集技能
    for skill_id in candidate_skill_ids:
        if skill_id in skill_details:
            skill = skill_details[skill_id]
            score = 80  # 基础分数
            
            # 根据问题紧急程度调整
            if problem_urgency == "high":
                if "alert" in skill_id or "emergency" in skill_id or "smart" in skill_id:
                    score += 15
            
            # 根据问题复杂度调整
            if problem_complexity == "complex":
                if "analysis" in skill_id or "assessment" in skill_id or "viz" in skill_id:
                    score += 10
            
            matched_skills.append({
                "skill": skill,
                "score": min(score, 99)
            })
    
    # 按分数排序
    matched_skills.sort(key=lambda x: x["score"], reverse=True)
    
    # 选取核心技能和辅助技能
    core_skill = matched_skills[0]["skill"] if matched_skills else None
    auxiliary_skills = [m["skill"] for m in matched_skills[1:4]] if len(matched_skills) > 1 else []
    
    return {
        "matched_skills": [m["skill"] for m in matched_skills],
        "core_skill": core_skill,
        "auxiliary_skills": auxiliary_skills
    }


def generate_skill_package_node(
    state: SkillRecommendationState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> Dict[str, Any]:
    """
    title: 生成技能包
    desc: 根据核心技能和辅助技能生成完整的技能包
    integrations: 
    """
    core_skill = state.core_skill
    auxiliary_skills = state.auxiliary_skills or []
    user_role = state.user_role or "项目经理"
    problem_urgency = state.problem_urgency or "medium"
    
    if not core_skill:
        return {
            "skill_package": None,
            "recommended_actions": [],
            "success_metric": "",
            "skill_package_generated": False
        }
    
    # 构建技能包
    skill_package = {
        "package_name": f"{user_role}技能包",
        "target_role": user_role,
        "core_skill": {
            "skill_id": core_skill.get("skill_id", ""),
            "skill_name": core_skill.get("skill_name", ""),
            "description": core_skill.get("description", ""),
            "priority": 1
        },
        "auxiliary_skills": [
            {
                "skill_id": s.get("skill_id", ""),
                "skill_name": s.get("skill_name", ""),
                "description": s.get("description", ""),
                "priority": i + 2
            }
            for i, s in enumerate(auxiliary_skills[:3])
        ],
        "tools": core_skill.get("tools", []),
        "success_metric": core_skill.get("success_metric", ""),
        "practices": core_skill.get("practice_path", [])
    }
    
    # 生成推荐操作步骤
    recommended_actions = []
    if core_skill.get("steps"):
        for i, step in enumerate(core_skill.get("steps", [])[:5], 1):
            recommended_actions.append(f"步骤{i}: {step}")
    
    # 根据紧急程度添加额外建议
    if problem_urgency == "high":
        recommended_actions.append("建议：优先使用快速启动模板")
        recommended_actions.append("建议：同时启用智能预警功能")
    
    return {
        "skill_package": skill_package,
        "recommended_actions": recommended_actions,
        "success_metric": core_skill.get("success_metric", ""),
        "skill_package_generated": True
    }


def summarize_results_node(
    state: SkillRecommendationState,
    config: RunnableConfig,
    runtime: Runtime[Context]
) -> SkillGraphOutput:
    """
    title: 汇总结果
    desc: 汇总技能推荐结果，生成最终输出
    integrations: 
    """
    core_skill = state.core_skill
    auxiliary_skills = state.auxiliary_skills or []
    recommended_actions = state.recommended_actions or []
    
    # 生成执行总结
    summary_parts = []
    
    if core_skill:
        summary_parts.append(f"根据您的问题，推荐核心技能：{core_skill.get('skill_name', '')}")
        summary_parts.append(f"技能描述：{core_skill.get('description', '')}")
        
        tools = core_skill.get('tools', [])
        if tools:
            summary_parts.append(f"配套工具：{', '.join(tools)}")
        
        if core_skill.get('success_metric'):
            summary_parts.append(f"预期效果：{core_skill.get('success_metric')}")
    
    if auxiliary_skills:
        summary_parts.append(f"\n辅助技能推荐（{len(auxiliary_skills)}个）：")
        for skill in auxiliary_skills[:3]:
            summary_parts.append(f"  - {skill.get('skill_name', '')}")
    
    if recommended_actions:
        summary_parts.append("\n推荐操作步骤：")
        for action in recommended_actions[:5]:
            summary_parts.append(f"  {action}")
    
    execution_summary = "\n".join(summary_parts)
    
    return SkillGraphOutput(
        success=True,
        problem_type=state.problem_type,
        core_skill=core_skill,
        auxiliary_skills=auxiliary_skills,
        skill_package=state.skill_package,
        recommended_actions=recommended_actions,
        execution_summary=execution_summary
    )
