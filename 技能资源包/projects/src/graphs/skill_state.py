"""
飞书项目管理技能推荐工作流 - 状态定义
用于在节点之间传递数据
"""
import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class SkillRecommendationState(BaseModel):
    """技能推荐工作流全局状态"""
    # 用户输入
    user_input: str = Field(default="", description="用户问题描述")
    user_role: str = Field(default="项目经理", description="用户岗位")
    problem_scope: str = Field(default="team", description="问题影响范围")
    problem_urgency: str = Field(default="medium", description="问题紧急程度")
    
    # 问题分析结果
    problem_type: str = Field(default="", description="问题分类")
    problem_complexity: str = Field(default="medium", description="问题复杂度")
    key_phrases: List[str] = Field(default_factory=list, description="识别到的关键词")
    matching_scenarios: List[str] = Field(default_factory=list, description="匹配的场景")
    
    # 技能匹配结果
    matched_skills: List[Dict[str, Any]] = Field(default_factory=list, description="匹配的技能列表")
    core_skill: Optional[Dict[str, Any]] = Field(default=None, description="核心推荐技能")
    auxiliary_skills: List[Dict[str, Any]] = Field(default_factory=list, description="辅助推荐技能")
    
    # 技能包结果
    skill_package: Optional[Dict[str, Any]] = Field(default=None, description="生成的技能包")
    recommended_actions: List[str] = Field(default_factory=list, description="推荐操作步骤")
    success_metric: str = Field(default="", description="成功指标")
    
    # 执行结果
    skill_package_generated: bool = Field(default=False, description="是否生成了技能包")
    execution_message: str = Field(default="", description="执行消息")


class SkillGraphInput(BaseModel):
    """技能推荐工作流输入"""
    user_input: str = Field(default="", description="用户问题描述")
    user_role: str = Field(default="项目经理", description="用户岗位")
    problem_scope: str = Field(default="team", description="问题影响范围")
    problem_urgency: str = Field(default="medium", description="问题紧急程度")


class SkillGraphOutput(BaseModel):
    """技能推荐工作流输出"""
    success: bool = Field(default=False, description="工作流执行是否成功")
    problem_type: str = Field(default="", description="问题分类")
    core_skill: Optional[Dict[str, Any]] = Field(default=None, description="核心推荐技能")
    auxiliary_skills: List[Dict[str, Any]] = Field(default_factory=list, description="辅助推荐技能")
    skill_package: Optional[Dict[str, Any]] = Field(default=None, description="生成的技能包")
    recommended_actions: List[str] = Field(default_factory=list, description="推荐操作步骤")
    execution_summary: str = Field(default="", description="执行总结")
