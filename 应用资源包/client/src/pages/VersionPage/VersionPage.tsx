import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosForBackend } from "@lark-apaas/client-toolkit/utils/getAxiosForBackend";
import { logger } from "@lark-apaas/client-toolkit/logger";
import type { Version, VersionListParams, VersionListResponse, VersionDetail } from "@shared/version";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";

const SAMPLE_STATUS_STYLES: Record<string, string> = {
  "逾期": "border-foreground font-semibold",
  "阻塞": "border-foreground font-semibold",
  "预警": "border-primary text-primary",
  "高风险": "border-primary text-primary",
  "关注": "border-foreground text-foreground",
  "中风险": "border-foreground text-foreground",
  "正常": "border-foreground/20 text-muted-foreground",
  "已完成": "border-foreground/20 text-muted-foreground",
};

const VersionPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [customer, setCustomer] = useState<string>("");
  const [wave, setWave] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [sampleStatus, setSampleStatus] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<VersionDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchVersions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: VersionListParams = {
        customer: customer || undefined,
        wave: wave || undefined,
        category: category || undefined,
        sampleStatus: sampleStatus || undefined,
        page,
        pageSize,
      };
      const response = await axiosForBackend({
        url: "/api/versions",
        method: "GET",
        params,
      });
      const data = response.data as VersionListResponse;
      setVersions(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      logger.error("获取版本列表失败", err);
      setError("获取版本列表失败，请稍后重试");
      setVersions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [page, pageSize, customer, wave, category, sampleStatus]);

  const handleSearch = () => {
    setPage(1);
    fetchVersions();
  };

  const handleReset = () => {
    setCustomer("");
    setWave("");
    setCategory("");
    setSampleStatus("");
    setPage(1);
  };

  const handleRowClick = async (version: Version) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const response = await axiosForBackend({
        url: `/api/versions/${version.id}`,
        method: "GET",
      });
      setDetailData(response.data as VersionDetail);
    } catch (err) {
      logger.error("获取版本详情失败", err);
      setDetailData({
        ...version,
        tasks: [],
      });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleGoToProduct = (productId: string) => {
    if (productId) {
      navigate(`/products`);
    }
    setDetailOpen(false);
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const getSampleStatusBadge = (status: string) => {
    const cls = SAMPLE_STATUS_STYLES[status] || "border-foreground/20 text-muted-foreground";
    return (
      <span className={`inline-block px-2 py-1 text-[10px] uppercase tracking-[0.2em] border rounded-none ${cls}`}>
        {status || "未知"}
      </span>
    );
  };

  const isAbnormalStatus = (status: string) => {
    return ["逾期", "阻塞", "预警", "高风险"].includes(status);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-[#373c43]">版本管理</h1>
        <p className="text-sm text-muted-foreground mt-1">版本列表与样衣状态管控</p>
      </div>

      {/* Filter Area */}
      <div className="border border-foreground/10 p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">客户</label>
            <Input
              placeholder="输入客户名称"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="rounded-none border-b border-foreground focus:border-primary"
            />
          </div>
          <div className="w-[160px]">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">波段</label>
            <Select value={wave} onValueChange={setWave}>
              <SelectTrigger className="rounded-none border-b border-foreground focus:border-primary">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                <SelectItem value="春">春</SelectItem>
                <SelectItem value="夏">夏</SelectItem>
                <SelectItem value="秋">秋</SelectItem>
                <SelectItem value="冬">冬</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[160px]">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">品类</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="rounded-none border-b border-foreground focus:border-primary">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                <SelectItem value="上装">上装</SelectItem>
                <SelectItem value="下装">下装</SelectItem>
                <SelectItem value="外套">外套</SelectItem>
                <SelectItem value="裙装">裙装</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-[160px]">
            <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 block">样衣状态</label>
            <Select value={sampleStatus} onValueChange={setSampleStatus}>
              <SelectTrigger className="rounded-none border-b border-foreground focus:border-primary">
                <SelectValue placeholder="全部" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">全部</SelectItem>
                <SelectItem value="正常">正常</SelectItem>
                <SelectItem value="预警">预警</SelectItem>
                <SelectItem value="逾期">逾期</SelectItem>
                <SelectItem value="阻塞">阻塞</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} className="rounded-none h-12 px-8 text-xs uppercase tracking-[0.2em]">
              <Search className="mr-1 size-4" />
              查询
            </Button>
            <Button variant="outline" onClick={handleReset} className="rounded-none h-12 px-8 text-xs uppercase tracking-[0.2em]">
              重置
            </Button>
          </div>
        </div>
      </div>

      {/* Version List */}
      <div className="border border-foreground/10">
        {error && (
          <div className="p-6 text-center text-primary text-sm">{error}</div>
        )}
        {!error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">款号</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">产品名称</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">客户</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">波段</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">品类</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">样衣状态</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">任务数</th>
                    <th className="text-left px-4 py-3 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">进度</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        加载中...
                      </td>
                    </tr>
                  )}
                  {!loading && versions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                        暂无版本数据
                      </td>
                    </tr>
                  )}
                  {!loading && versions.map((v) => (
                    <tr
                      key={v.id}
                      className={`border-b border-foreground/10 py-6 transition-colors hover:border-primary cursor-pointer ${
                        isAbnormalStatus(v.sampleStatus) ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleRowClick(v)}
                    >
                      <td className="px-4 py-6 text-sm font-mono">{v.styleNo}</td>
                      <td className="px-4 py-6 text-sm font-medium">{v.productName || "-"}</td>
                      <td className="px-4 py-6 text-sm">{v.customer}</td>
                      <td className="px-4 py-6 text-sm">{v.wave}</td>
                      <td className="px-4 py-6 text-sm">{v.category}</td>
                      <td className="px-4 py-6">{getSampleStatusBadge(v.sampleStatus)}</td>
                      <td className="px-4 py-6 text-sm font-mono">{v.taskCount}</td>
                      <td className="px-4 py-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-[2px] bg-accent overflow-hidden">
                            <div
                              className="h-full bg-foreground transition-all"
                              style={{ width: `${v.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-muted-foreground">{v.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-foreground/10">
                <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  共 {total} 条，第 {page}/{totalPages} 页
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none h-8"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-none h-8"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Version Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle>版本详情</DialogTitle>
            <DialogDescription>
              {detailData?.styleNo && `款号: ${detailData.styleNo}`}
            </DialogDescription>
          </DialogHeader>
          {detailLoading && (
            <div className="py-8 text-center text-muted-foreground text-sm">加载中...</div>
          )}
          {!detailLoading && detailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">款号</span>
                  <p className="font-mono font-medium">{detailData.styleNo || "-"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">产品名称</span>
                  <p className="font-medium">{detailData.productName || "-"}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">客户</span>
                  <p>{detailData.customer}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">波段</span>
                  <p>{detailData.wave}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">品类</span>
                  <p>{detailData.category}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">样衣状态</span>
                  <p>{getSampleStatusBadge(detailData.sampleStatus)}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">任务数</span>
                  <p className="font-mono">{detailData.taskCount}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">进度</span>
                  <p className="font-mono">{detailData.progress}%</p>
                </div>
              </div>

              {detailData.productId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  onClick={() => handleGoToProduct(detailData.productId)}
                >
                  <ExternalLink className="mr-1 size-4" />
                  跳转至所属产品详情
                </Button>
              )}

              {detailData.tasks && detailData.tasks.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-2">关联任务</h3>
                  <div className="border border-foreground/10">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-foreground/10">
                          <th className="text-left px-3 py-2 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">任务名称</th>
                          <th className="text-left px-3 py-2 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">状态</th>
                          <th className="text-left px-3 py-2 text-xs uppercase tracking-[0.2em] font-normal text-muted-foreground">优先级</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detailData.tasks.map((task) => (
                          <tr key={task.id} className="border-b border-foreground/10 last:border-b-0">
                            <td className="px-3 py-2 text-sm">{task.name}</td>
                            <td className="px-3 py-2 text-sm">{task.status}</td>
                            <td className="px-3 py-2 text-sm">{task.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VersionPage;
