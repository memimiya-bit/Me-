import React, { useEffect, useState } from 'react';
import { Table, TableProps } from '@lark-apaas/client-toolkit/antd-table';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Database,
  Layers,
  BarChart3,
} from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusTag } from '@/components/common/StatusTag';
import { UserDisplay } from '@/components/business-ui/user-display';
import { getFullLinkTasks, getProjectTotals } from '@/api';
import type { FullLinkTask, ProjectTotal } from '@shared/api.interface';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<FullLinkTask[]>([]);
  const [todosLoading, setTodosLoading] = useState(true);
  const [risks, setRisks] = useState<ProjectTotal[]>([]);
  const [risksLoading, setRisksLoading] = useState(true);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const res = await getFullLinkTasks({ executionStatus: 'pending', pageSize: 10 });
        setTodos(res.items);
      } catch {
        // handled by logger
      } finally {
        setTodosLoading(false);
      }
    };
    fetchTodos();
  }, []);

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const res = await getProjectTotals({ appStatus: 'risk', pageSize: 5 });
        setRisks(res.items);
      } catch {
        // handled by logger
      } finally {
        setRisksLoading(false);
      }
    };
    fetchRisks();
  }, []);

  const todoColumns: TableProps<FullLinkTask>['columns'] = [
    {
      title: '任务名称',
      dataIndex: 'taskName',
      fixed: 'left',
      width: 220,
      ellipsis: true,
      render: (v: string) => (
        <span className="text-sm font-medium text-primary">{v || '-'}</span>
      ),
    },
    {
      title: '任务类型',
      dataIndex: 'taskType',
      width: 120,
      render: (v: string) => <span className="text-sm">{v || '-'}</span>,
    },
    {
      title: '紧急程度',
      dataIndex: 'urgencyLevel',
      width: 100,
      render: (v: string) => {
        const colorMap: Record<string, string> = {
          '高': 'text-[hsl(var(--danger))]',
          '中': 'text-[hsl(var(--warning))]',
          '低': 'text-[hsl(var(--success))]',
        };
        return <span className={`text-sm font-medium ${colorMap[v] || 'text-muted-foreground'}`}>{v || '-'}</span>;
      },
    },
    {
      title: '负责部门',
      dataIndex: 'responsibleDepartment',
      width: 120,
      render: (v: string) => <span className="text-sm">{v || '-'}</span>,
    },
    {
      title: '计划完成日期',
      dataIndex: 'plannedCompletionDate',
      width: 140,
      render: (v: string) => <span className="text-sm font-mono">{v || '-'}</span>,
    },
  ];

  const riskColumns: TableProps<ProjectTotal>['columns'] = [
    {
      title: '项目名称',
      dataIndex: 'appProject',
      fixed: 'left',
      width: 220,
      ellipsis: true,
      render: (v: string, record: ProjectTotal) => (
        <span
          className="text-sm font-medium text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/business/${record.id}`)}
        >
          {v || '-'}
        </span>
      ),
    },
    {
      title: '项目类型',
      dataIndex: 'appType',
      width: 120,
      render: (v: string) => <span className="text-sm">{v || '-'}</span>,
    },
    {
      title: '项目状态',
      dataIndex: 'appStatus',
      width: 100,
      render: (v: string) => <StatusTag value={v} type="risk" />,
    },
    {
      title: '项目负责人',
      dataIndex: 'appProjectOwner',
      width: 120,
      render: (v: string) => (v ? <UserDisplay userId={v} /> : '-'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">QR-7S 快反系统</h1>
        <p className="text-sm text-muted-foreground mt-1">
          今天有 {todosLoading ? '-' : todos.length} 项待办，{risksLoading ? '-' : risks.length} 项风险预警需处理
        </p>
      </div>

      {/* Agent Guide Card */}
      <Card className="rounded-none shadow-sm border-border border-l-4 border-l-[hsl(var(--primary))]">
        <div className="px-5 py-4 flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-none bg-accent flex items-center justify-center">
            <MessageSquare className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">对话即管理</h3>
            <p className="text-sm text-muted-foreground mt-1">
              直接告诉我你的需求，我来帮你查进度、建任务、发通知。零学习成本，人在哪入口就在哪。
            </p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" className="rounded-none" asChild>
                <Link to="/tasks">
                  <MessageSquare className="mr-1.5 size-3.5" />
                  查看任务管理
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="rounded-none" asChild>
                <Link to="/business">
                  查看业务详情
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Data Map Quick Entry */}
      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Database className="size-4 text-primary" />
            数据架构地图
          </h2>
          <Link to="/data-map" className="text-xs text-primary hover:underline flex items-center gap-1">
            查看完整地图 <ArrowRight className="size-3" />
          </Link>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link
            to="/data-map"
            className="group p-4 border border-border rounded-none hover:border-primary hover:bg-accent transition-colors block"
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="size-4 text-primary" />
              <span className="text-sm font-medium text-foreground group-hover:text-primary">基础数据层</span>
            </div>
            <p className="text-xs text-muted-foreground">人员/供应商/产品/物料等静态基础数据</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">5 张表</p>
          </Link>
          <Link
            to="/data-map"
            className="group p-4 border border-border rounded-none hover:border-[hsl(var(--warning))] hover:bg-accent transition-colors block"
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="size-4 text-[hsl(var(--warning))]" />
              <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--warning))]">核心业务层</span>
            </div>
            <p className="text-xs text-muted-foreground">任务/项目/版本等强关联业务数据</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">10 张表</p>
          </Link>
          <Link
            to="/data-map"
            className="group p-4 border border-border rounded-none hover:border-[hsl(var(--success))] hover:bg-accent transition-colors block"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="size-4 text-[hsl(var(--success))]" />
              <span className="text-sm font-medium text-foreground group-hover:text-[hsl(var(--success))]">结果分析层</span>
            </div>
            <p className="text-xs text-muted-foreground">OKR/应用/需求等结果汇总数据</p>
            <p className="text-xs font-mono text-muted-foreground mt-1">3 张表</p>
          </Link>
        </div>
      </Card>

      {/* My Todos */}
      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="size-4 text-[hsl(var(--caution))]" />
            我的待办
          </h2>
          <Link to="/tasks" className="text-xs text-primary hover:underline flex items-center gap-1">
            查看全部 <ArrowRight className="size-3" />
          </Link>
        </div>
        {todosLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">加载中...</div>
        ) : todos.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="size-8 text-[hsl(var(--success))] mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">暂无待办，一切正常</p>
          </div>
        ) : (
          <div className="p-4">
            <Table
              columns={todoColumns}
              dataSource={todos}
              loading={todosLoading}
              rowKey="id"
              scroll={{ x: 800 }}
              pagination={false}
            />
          </div>
        )}
      </Card>

      {/* Risk Alerts */}
      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="size-4 text-[hsl(var(--danger))]" />
            风险预警
          </h2>
          <Link to="/business" className="text-xs text-primary hover:underline flex items-center gap-1">
            查看全部 <ArrowRight className="size-3" />
          </Link>
        </div>
        {risksLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">加载中...</div>
        ) : risks.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="size-8 text-[hsl(var(--success))] mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">暂无风险预警</p>
          </div>
        ) : (
          <div className="p-4">
            <Table
              columns={riskColumns}
              dataSource={risks}
              loading={risksLoading}
              rowKey="id"
              scroll={{ x: 800 }}
              pagination={false}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default HomePage;
