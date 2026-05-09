import React from "react";
import { Table, TableProps } from "@lark-apaas/client-toolkit/antd-table";
import { StatusTag } from "./StatusTag";
import { UserDisplay } from "@/components/business-ui/user-display";
import type { Task } from "@shared/task";

interface TaskListProps {
  data: Task[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onRowClick?: (record: Task) => void;
}

const columns: TableProps<Task>["columns"] = [
  {
    title: "任务名称",
    dataIndex: "name",
    fixed: "left",
    width: 200,
    ellipsis: true,
  },
  {
    title: "优先级",
    dataIndex: "priority",
    width: 100,
    render: (v: string) => <StatusTag value={v} type="priority" />,
  },
  {
    title: "状态",
    dataIndex: "status",
    width: 100,
    render: (v: string) => <StatusTag value={v} type="status" />,
  },
  {
    title: "负责人",
    dataIndex: "owner",
    width: 120,
    render: (v: string) => (v ? <UserDisplay userId={v} /> : "-"),
  },
  {
    title: "负责部门",
    dataIndex: "department",
    width: 120,
  },
  {
    title: "计划完成时间",
    dataIndex: "planEndTime",
    width: 140,
    sorter: true,
  },
  {
    title: "DRS评分",
    dataIndex: "drsScore",
    width: 100,
    render: (v: number) => <span className="font-mono">{v.toFixed(1)}</span>,
  },
  {
    title: "售罄率",
    dataIndex: "sellThroughRate",
    width: 100,
    render: (v: number) => <span className="font-mono">{(v * 100).toFixed(1)}%</span>,
  },
];

export const TaskList: React.FC<TaskListProps> = ({
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}) => {
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      scroll={{ x: 1200, y: 500 }}
      pagination={{
        current: page,
        pageSize,
        total,
        showSizeChanger: true,
        showTotal: (t) => `共 ${t} 条`,
        onChange: onPageChange,
      }}
      onRow={(record) => ({
        onClick: () => onRowClick?.(record),
        className: onRowClick ? "cursor-pointer" : "",
      })}
    />
  );
};

export default TaskList;
