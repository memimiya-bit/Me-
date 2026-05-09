"""
飞书项目管理技能推荐工作流 - 主图编排
基于技能迭代方案V4.0的岗位技能赋能体系
"""
from langgraph.graph import StateGraph, END
from graphs.skill_state import (
    SkillRecommendationState,
    SkillGraphInput,
    SkillGraphOutput,
)
from graphs.skill_nodes import (
    analyze_problem_node,
    match_skills_node,
    generate_skill_package_node,
    summarize_results_node,
)


def create_skill_workflow():
    """创建技能推荐工作流"""
    
    # 创建状态图
    builder = StateGraph(
        SkillRecommendationState,
        input_schema=SkillGraphInput,
        output_schema=SkillGraphOutput
    )
    
    # 添加节点
    builder.add_node("analyze_problem", analyze_problem_node)
    builder.add_node("match_skills", match_skills_node)
    builder.add_node("generate_skill_package", generate_skill_package_node)
    builder.add_node("summarize_results", summarize_results_node)
    
    # 设置入口点
    builder.set_entry_point("analyze_problem")
    
    # 添加边
    builder.add_edge("analyze_problem", "match_skills")
    builder.add_edge("match_skills", "generate_skill_package")
    builder.add_edge("generate_skill_package", "summarize_results")
    builder.add_edge("summarize_results", END)
    
    # 编译图
    return builder.compile()


# 创建全局工作流实例
skill_main_graph = create_skill_workflow()
