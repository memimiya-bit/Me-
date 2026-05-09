import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { axiosForBackend } from "@lark-apaas/client-toolkit/utils/getAxiosForBackend";
import { toast } from "sonner";

interface SyncResult {
  tableName: string;
  totalRecords: number;
  newRecords: number;
  failedRecords: number;
  status: "success" | "partial" | "failed";
  errorMessage?: string;
}

interface SyncLog {
  id: string;
  tableName: string;
  totalRecords: number;
  newRecords: number;
  failedRecords: number;
  status: string;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  triggerType: string;
}

interface SyncLogsResponse {
  items: SyncLog[];
  total: number;
  page: number;
  pageSize: number;
}

const SyncPage = () => {
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchLogs = async (page: number = currentPage) => {
    try {
      const response = await axiosForBackend<SyncLogsResponse>({
        url: `/api/sync/logs?page=${page}&pageSize=${pageSize}`,
        method: "GET",
      });
      setLogs(response.data.items);
      setTotalLogs(response.data.total);
      setCurrentPage(page);
    } catch {
      toast.error("获取同步日志失败");
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await axiosForBackend<SyncResult[]>({
        url: "/api/sync/trigger",
        method: "POST",
      });
      setSyncResults(response.data);
      toast.success("同步任务已启动");
      fetchLogs(1);
    } catch {
      toast.error("同步任务启动失败");
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { icon: typeof CheckCircle; color: string; bg: string; label: string }> = {
      success: { icon: CheckCircle, color: "text-success", bg: "bg-success/10", label: "成功" },
      partial: { icon: AlertCircle, color: "text-warning", bg: "bg-warning/10", label: "部分成功" },
      failed: { icon: XCircle, color: "text-danger", bg: "bg-danger/10", label: "失败" },
    };
    const { icon: Icon, color, bg, label } = config[status] || config.failed;
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${bg} ${color}`}>
        <Icon className="size-3" />
        {label}
      </span>
    );
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "-";
    return new Date(timeStr).toLocaleString("zh-CN");
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">数据同步</h1>
          <p className="text-sm text-muted-foreground mt-1">从飞书多维表格同步数据到本地数据库</p>
        </div>
        <Button onClick={handleSync} disabled={syncing} className="rounded-none">
          <RefreshCw className={`mr-2 size-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "同步中..." : "立即同步"}
        </Button>
      </div>

      {syncResults.length > 0 && (
        <Card className="rounded-none border-border shadow-sm">
          <CardHeader className="px-6 py-4 border-b border-border">
            <CardTitle className="text-base font-medium">本次同步结果</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">表名</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">总记录数</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">新增记录</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">失败记录</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {syncResults.map((result) => (
                    <tr key={result.tableName} className="border-b border-border hover:bg-accent transition-colors">
                      <td className="px-4 py-3 text-sm font-mono">{result.tableName}</td>
                      <td className="px-4 py-3 text-sm font-mono">{result.totalRecords}</td>
                      <td className="px-4 py-3 text-sm font-mono text-success">{result.newRecords}</td>
                      <td className="px-4 py-3 text-sm font-mono text-danger">{result.failedRecords}</td>
                      <td className="px-4 py-3">{getStatusBadge(result.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-none border-border shadow-sm">
        <CardHeader className="px-6 py-4 border-b border-border">
          <CardTitle className="text-base font-medium">同步日志</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Clock className="mx-auto mb-3 size-8 text-muted-foreground/50" />
              <p className="text-sm">暂无同步记录</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">触发方式</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">表名</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">新增记录</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">失败记录</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">状态</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">开始时间</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">完成时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-border hover:bg-accent transition-colors">
                        <td className="px-4 py-3 text-xs">
                          <Badge variant="outline" className="rounded-none">
                            {log.triggerType === "cron" ? "定时" : "手动"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">{log.tableName}</td>
                        <td className="px-4 py-3 text-sm font-mono text-success">{log.newRecords}</td>
                        <td className="px-4 py-3 text-sm font-mono text-danger">{log.failedRecords}</td>
                        <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                        <td className="px-4 py-3 text-xs font-mono">{formatTime(log.startedAt)}</td>
                        <td className="px-4 py-3 text-xs font-mono">{formatTime(log.completedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    共 {totalLogs} 条记录，第 {currentPage} / {totalPages} 页
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none"
                      disabled={currentPage === 1}
                      onClick={() => fetchLogs(currentPage - 1)}
                    >
                      上一页
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-none"
                      disabled={currentPage === totalPages}
                      onClick={() => fetchLogs(currentPage + 1)}
                    >
                      下一页
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SyncPage;
