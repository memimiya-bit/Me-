import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, FileText, AlertTriangle } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableProps } from '@lark-apaas/client-toolkit/antd-table';
import { UserDisplay } from '@/components/business-ui/user-display';
import { StatusTag } from '@/components/common/StatusTag';
import { getBusinessDetail, getBusinesses, getBusinessTasks } from '@/api';
import type { BusinessDetail as IBusinessDetail, Business } from '@shared/business';
import type { Task } from '@shared/task';

const TASK_STATUS_OPTIONS = ['全部', '待开始', '执行中', '已逾期', '已完成', '阻塞'];

/* ── Business List View (no id) ── */
const BusinessListView: React.FC = () => {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await getBusinesses({
          type: filterType || undefined,
          riskLevel: filterStatus || undefined,
          page,
          pageSize,
        });
        setBusinesses(res.items);
        setTotal(res.total);
      } catch {
        // handled by logger
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filterType, filterStatus, page, pageSize]);

  const columns: TableProps<Business>['columns'] = [
    {
      title: '业务名称',
      dataIndex: 'name',
      fixed: 'left',
      width: 200,
      ellipsis: true,
      render: (v: string, record: Business) => (
        <span
          className="text-sm font-medium text-primary cursor-pointer hover:underline"
          onClick={() => navigate(`/business/${record.id}`)}
        >
          {v || '-'}
        </span>
      ),
    },
    {
      title: '业务类型',
      dataIndex: 'type',
      width: 120,
      render: (v: string) => (
        <Badge className="rounded-none border-border text-xs font-normal">{v || '-'}</Badge>
      ),
    },
    {
      title: '状态',
      dataIndex: 'riskLevel',
      width: 100,
      render: (v: string) => <StatusTag value={v} type="risk" />,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      width: 120,
      render: (v: string) => (v ? <UserDisplay userId={v} /> : '-'),
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 140,
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-accent overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${v}%` }} />
          </div>
          <span className="text-xs font-mono text-muted-foreground">{v}%</span>
        </div>
      ),
    },
    {
      title: 'DRS评分',
      dataIndex: 'drsScore',
      width: 100,
      render: (v: number) => <span className="font-mono">{v.toFixed(1)}</span>,
    },
    {
      title: '售罄率',
      dataIndex: 'sellThroughRate',
      width: 100,
      render: (v: number) => <span className="font-mono">{(v * 100).toFixed(1)}%</span>,
    },
    {
      title: '风险评分',
      dataIndex: 'riskScore',
      width: 100,
      render: (v: number) => <span className="font-mono">{v.toFixed(1)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">业务详情</h1>
        <p className="text-sm text-muted-foreground mt-1">业务列表与关联任务</p>
      </div>

      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-3 border-b border-border bg-accent/30">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="w-[160px]">
              <label className="text-xs text-muted-foreground mb-1 block">业务类型</label>
              <Select value={filterType || '全部'} onValueChange={(v) => { setFilterType(v === '全部' ? '' : v); setPage(1); }}>
                <SelectTrigger className="rounded-none border-border">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  {['全部', 'M1企划', '设计开发', '供应链管控', '运营决策'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[160px]">
              <label className="text-xs text-muted-foreground mb-1 block">状态</label>
              <Select value={filterStatus || '全部'} onValueChange={(v) => { setFilterStatus(v === '全部' ? '' : v); setPage(1); }}>
                <SelectTrigger className="rounded-none border-border">
                  <SelectValue placeholder="全部" />
                </SelectTrigger>
                <SelectContent>
                  {['全部', '进行中', '预警', '逾期', '已完成'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={businesses}
            loading={loading}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              showTotal: (t: number) => `共 ${t} 条`,
              onChange: (p: number, ps: number) => { setPage(p); setPageSize(ps); },
            }}
            onRow={(record: Business) => ({
              onClick: () => navigate(`/business/${record.id}`),
              className: 'cursor-pointer',
            })}
          />
        </div>
      </Card>
    </div>
  );
};

/* ── Business Detail View (with id) ── */
const BusinessDetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<IBusinessDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTotal, setTaskTotal] = useState(0);
  const [taskLoading, setTaskLoading] = useState(true);
  const [taskPage, setTaskPage] = useState(1);
  const [taskPageSize] = useState(10);
  const [taskStatus, setTaskStatus] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setDetailLoading(true);
      try {
        const data = await getBusinessDetail(id);
        setDetail(data);
      } catch {
        // handled by logger
      } finally {
        setDetailLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchTasks = async () => {
      setTaskLoading(true);
      try {
        const res = await getBusinessTasks(id, taskStatus || undefined, taskPage, taskPageSize);
        setTasks(res.items);
        setTaskTotal(res.total);
      } catch {
        // handled by logger
      } finally {
        setTaskLoading(false);
      }
    };
    fetchTasks();
  }, [id, taskStatus, taskPage, taskPageSize]);

  if (detailLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="rounded-none" onClick={() => navigate('/business')}>
            <ArrowLeft className="size-4 mr-1" />
            返回列表
          </Button>
        </div>
        <div className="text-muted-foreground text-sm">加载中...</div>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" className="rounded-none" onClick={() => navigate('/business')}>
            <ArrowLeft className="size-4 mr-1" />
            返回列表
          </Button>
        </div>
        <Card className="rounded-none shadow-sm border-border p-8 text-center">
          <p className="text-muted-foreground">未找到该业务信息</p>
        </Card>
      </div>
    );
  }

  const completionRate = detail.totalTasks > 0
    ? Math.round((detail.completedTasks / detail.totalTasks) * 100)
    : 0;

  const taskColumns: TableProps<Task>['columns'] = [
    {
      title: '任务名称',
      dataIndex: 'name',
      fixed: 'left',
      width: 200,
      ellipsis: true,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (v: string) => <StatusTag value={v} type="priority" />,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (v: string) => <StatusTag value={v} type="status" />,
    },
    {
      title: '负责人',
      dataIndex: 'owner',
      width: 120,
      render: (v: string) => (v ? <UserDisplay userId={v} /> : '-'),
    },
    {
      title: '负责部门',
      dataIndex: 'department',
      width: 120,
    },
    {
      title: '计划完成时间',
      dataIndex: 'planEndTime',
      width: 140,
    },
    {
      title: 'DRS评分',
      dataIndex: 'drsScore',
      width: 100,
      render: (v: number) => <span className="font-mono">{v.toFixed(1)}</span>,
    },
    {
      title: '售罄率',
      dataIndex: 'sellThroughRate',
      width: 100,
      render: (v: number) => <span className="font-mono">{(v * 100).toFixed(1)}%</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm" className="rounded-none" onClick={() => navigate('/business')}>
          <ArrowLeft className="size-4 mr-1" />
          返回列表
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{detail.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">业务详细信息与关联任务</p>
        </div>
      </div>

      {/* Business Info */}
      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="size-4" />
            业务信息
          </h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">业务类型</p>
            <Badge className="rounded-none border-border text-sm font-normal">{detail.type || '-'}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">状态</p>
            <StatusTag value={detail.riskLevel} type="risk" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">负责人</p>
            {detail.owner ? <UserDisplay userId={detail.owner} /> : <span className="text-sm text-muted-foreground">-</span>}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">风险评分</p>
            <span className="text-lg font-mono font-bold text-foreground">{detail.riskScore.toFixed(1)}</span>
          </div>
        </div>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Task Completion */}
        <Card className="rounded-none shadow-sm border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Calendar className="size-4" />
              任务完成情况
            </h3>
          </div>
          <div className="p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-primary">{detail.completedTasks}</span>
              <span className="text-sm text-muted-foreground">/ {detail.totalTasks}</span>
            </div>
            <div className="mt-3 h-2 bg-accent overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">完成率 {completionRate}%</p>
          </div>
        </Card>

        {/* Business Progress */}
        <Card className="rounded-none shadow-sm border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUpIcon className="size-4" />
              业务进度
            </h3>
          </div>
          <div className="p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-[hsl(var(--success))]">{detail.progress}</span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="mt-3 h-2 bg-accent overflow-hidden">
              <div
                className="h-full bg-[hsl(var(--success))] transition-all"
                style={{ width: `${detail.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">整体进度</p>
          </div>
        </Card>

        {/* Risk Info */}
        <Card className="rounded-none shadow-sm border-border">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="size-4" />
              风险信息
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">风险评分</span>
              <span className="text-lg font-mono font-bold text-[hsl(var(--danger))]">{detail.riskScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">DRS评分</span>
              <span className="text-lg font-mono font-bold text-foreground">{detail.drsScore.toFixed(1)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">售罄率</span>
              <span className="text-lg font-mono font-bold text-foreground">{(detail.sellThroughRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Task List */}
      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">关联任务</h2>
          <div className="w-[140px]">
            <Select value={taskStatus || '全部'} onValueChange={(v) => { setTaskStatus(v === '全部' ? '' : v); setTaskPage(1); }}>
              <SelectTrigger className="rounded-none border-border text-xs">
                <SelectValue placeholder="全部状态" />
              </SelectTrigger>
              <SelectContent>
                {TASK_STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="p-4">
          <Table
            columns={taskColumns}
            dataSource={tasks}
            loading={taskLoading}
            rowKey="id"
            scroll={{ x: 1200 }}
            pagination={{
              current: taskPage,
              pageSize: taskPageSize,
              total: taskTotal,
              showSizeChanger: false,
              showTotal: (t: number) => `共 ${t} 条`,
              onChange: (p: number) => setTaskPage(p),
            }}
          />
        </div>
      </Card>
    </div>
  );
};

/* Simple TrendingUp icon to avoid naming conflict */
const TrendingUpIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

/* ── Main Component: route dispatcher ── */
const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return id ? <BusinessDetailView /> : <BusinessListView />;
};

export default BusinessDetailPage;
