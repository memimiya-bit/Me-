import React from "react";
import { Badge } from "@/components/ui/badge";

interface StatusTagProps {
  value: string;
  type?: "status" | "priority" | "risk";
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  阻塞: { color: "text-[#373c43]", bg: "bg-[hsl(var(--danger))]/10", label: "阻塞" },
  已逾期: { color: "text-[#373c43]", bg: "bg-[hsl(var(--danger))]/10", label: "逾期" },
  紧急: { color: "text-[#373c43]", bg: "bg-[hsl(var(--danger))]/10", label: "紧急" },
  极高: { color: "text-[#373c43]", bg: "bg-[hsl(var(--danger))]/10", label: "极高" },
  预警: { color: "text-[#373c43]", bg: "bg-[hsl(var(--warning))]/10", label: "预警" },
  高: { color: "text-[#373c43]", bg: "bg-[hsl(var(--warning))]/10", label: "高" },
  执行中: { color: "text-[#373c43]", bg: "bg-[hsl(var(--caution))]/10", label: "执行中" },
  中: { color: "text-[#373c43]", bg: "bg-[hsl(var(--caution))]/10", label: "中" },
  待开始: { color: "text-[#373c43]", bg: "bg-[hsl(var(--success))]/10", label: "待开始" },
  已完成: { color: "text-[#373c43]", bg: "bg-[hsl(var(--success))]/10", label: "已完成" },
  低: { color: "text-[#373c43]", bg: "bg-muted", label: "低" },
};

export const StatusTag: React.FC<StatusTagProps> = ({ value, type = "status" }) => {
  const config = statusConfig[value] ?? {
    color: "text-[#373c43]",
    bg: "bg-muted",
    label: value,
  };

  return (
    <Badge className={`rounded-none ${config.bg} ${config.color} text-xs font-medium border-0`}>
      {config.label}
    </Badge>
  );
};

export default StatusTag;
