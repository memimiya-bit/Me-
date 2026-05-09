import React, { useState, useEffect } from "react";
import { axiosForBackend } from "@lark-apaas/client-toolkit/utils/getAxiosForBackend";
import { logger } from "@lark-apaas/client-toolkit/logger";
import type { Task, TaskListParams, TaskListResponse, TaskDetail } from "@shared/task";
import { TaskList } from "@/components/common/TaskList";
import { StatusTag } from "@/components/common/StatusTag";
import { UserDisplay } from "@/components/business-ui/user-display";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar } from "lucide-react";

const TaskPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [type, setType] = useState("");
  const [department, setDepartment] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<TaskDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: TaskListParams = {
        status: status || undefined,
        priority: priority || undefined,
        type: type || undefined,
        department: department || undefined,
        page,
        pageSize,
      };
      const res = await axiosForBackend({ url: "/api/tasks", method: "GET", params });
      const data = res.data as TaskListResponse;
      setTasks(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      logger.error("获取任务列表失败", err);
      setError("获取任务列表失败，请稍后重试");
      setTasks([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await axiosForBackend({ url: `/api/tasks/${id}`, method: "GET" });
      setDetailData(res.data as TaskDetail);
    } catch (err) {
      logger.error("获取任务详情失败", err);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [page, pageSize, status, priority, type, department]);

  const handlePageChange = (newPage: number, newPageSize: number) => {
    setPage(newPage);
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setPage(1);
    }
  };

  const handleRowClick = (record: Task) => {
    fetchDetail(record.id);
    setDetailOpen(true);
  };

  const resetFilters = () => {
    setStatus("");
    setPriority("");
    setType("");
    setDepartment("");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#373c43]">任务管理</h1>
        <p className="text-sm text-muted-foreground mt-1">全链路任务集中管控，支持多维度筛选与详情查看</p>
      </div>

      {/* 筛选区 */}
      <Card className="rounded-none">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">任务状态</label>
              <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="全部" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="待开始">待开始</SelectItem>
                  <SelectItem value="执行中">执行中</SelectItem>
                  <SelectItem value="阻塞">阻塞</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已逾期">已逾期</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block">优先级</label>
              <Select value={priority} onValueChange={(v) => { setPriority(v); setPage(1); }}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="全部" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="紧急">紧急</SelectItem>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block">任务类型</label>
              <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="全部" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="M1">M1</SelectItem>
                  <SelectItem value="M2">M2</SelectItem>
                  <SelectItem value="M4">M4</SelectItem>
                  <SelectItem value="M5">M5</SelectItem>
                  <SelectItem value="M6">M6</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block">负责部门</label>
              <Select value={department} onValueChange={(v) => { setDepartment(v); setPage(1); }}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="全部" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="商品部">商品部</SelectItem>
                  <SelectItem value="设计部">设计部</SelectItem>
                  <SelectItem value="电商运营部">电商运营部</SelectItem>
                  <SelectItem value="质量部">质量部</SelectItem>
                  <SelectItem value="经管办">经管办</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" className="rounded-none h-10" onClick={resetFilters}>重置</Button>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <Card className="rounded-none">
        <CardContent className="p-4">
          {error && (
            <div className="py-8 text-center text-muted-foreground">
              <p className="text-sm">{error}</p>
              <Button variant="outline" className="mt-2 rounded-none" onClick={fetchTasks}>重试</Button>
            </div>
          )}
          {!error && (
            <TaskList
              data={tasks}
              loading={loading}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onRowClick={handleRowClick}
            />
          )}
        </CardContent>
      </Card>

      {/* 任务详情面板 */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto rounded-none">
          <DialogHeader>
            <DialogTitle>任务详情</DialogTitle>
            <DialogDescription>查看任务完整信息与关联指标</DialogDescription>
          </DialogHeader>
          {detailLoading ? (
            <div className="py-8 text-center text-muted-foreground">加载中...</div>
          ) : detailData ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><span className="text-muted-foreground">任务名称</span><p className="font-medium">{detailData.name}</p></div>
                <div><span className="text-muted-foreground">任务类型</span><p>{detailData.type}</p></div>
                <div><span className="text-muted-foreground">优先级</span><div className="mt-1"><StatusTag value={detailData.priority} type="priority" /></div></div>
                <div><span className="text-muted-foreground">状态</span><div className="mt-1"><StatusTag value={detailData.status} type="status" /></div></div>
                <div><span className="text-muted-foreground">负责人</span><div className="mt-1">{detailData.owner ? <UserDisplay userId={detailData.owner} /> : "-"}</div></div>
                <div><span className="text-muted-foreground">负责部门</span><p>{detailData.department}</p></div>
                <div><span className="text-muted-foreground">计划开始</span><p className="font-mono">{detailData.planStartTime || "-"}</p></div>
                <div><span className="text-muted-foreground">计划完成</span><p className="font-mono">{detailData.planEndTime || "-"}</p></div>
                <div><span className="text-muted-foreground">DRS评分</span><p className="font-mono">{detailData.drsScore.toFixed(1)}</p></div>
                <div><span className="text-muted-foreground">售罄率</span><p className="font-mono">{(detailData.sellThroughRate * 100).toFixed(1)}%</p></div>
              </div>
              {detailData.blockReason && (
                <div className="border border-border rounded-none p-3 bg-[hsl(var(--danger))]/5">
                  <span className="text-[hsl(var(--danger))] font-medium">阻塞原因</span>
                  <p className="mt-1 text-sm">{detailData.blockReason}</p>
                </div>
              )}
              {detailData.collaboratorDepartments?.length > 0 && (
                <div>
                  <span className="text-muted-foreground">协作部门</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {detailData.collaboratorDepartments.map((d, i) => (
                      <Badge key={i} variant="outline" className="rounded-none">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskPage;
