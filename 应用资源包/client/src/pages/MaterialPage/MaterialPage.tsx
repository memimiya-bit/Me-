import React, { useState, useEffect } from "react";
import { axiosForBackend } from "@lark-apaas/client-toolkit/utils/getAxiosForBackend";
import { logger } from "@lark-apaas/client-toolkit/logger";
import type { Material, MaterialListParams, MaterialListResponse, MaterialDetail } from "@shared/material";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const MaterialPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [fabricType, setFabricType] = useState("");
  const [supplier, setSupplier] = useState("");
  const [isLocked, setIsLocked] = useState("");
  const [idleWarning, setIdleWarning] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<MaterialDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: MaterialListParams = {
        fabricType: fabricType || undefined,
        supplier: supplier || undefined,
        isLocked: isLocked === "" ? undefined : isLocked === "true",
        idleWarning: idleWarning === "" ? undefined : idleWarning === "true",
        page,
        pageSize,
      };
      const res = await axiosForBackend({ url: "/api/materials", method: "GET", params });
      const data = res.data as MaterialListResponse;
      setMaterials(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch (err) {
      logger.error("获取物料列表失败", err);
      setError("获取物料列表失败，请稍后重试");
      setMaterials([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMaterials(); }, [page, fabricType, supplier, isLocked, idleWarning]);

  const handleSearch = () => { setPage(1); fetchMaterials(); };
  const handleReset = () => { setFabricType(""); setSupplier(""); setIsLocked(""); setIdleWarning(""); setPage(1); };

  const handleRowClick = async (material: Material) => {
    setDetailOpen(true);
    setDetailLoading(true);
    setDetailData(null);
    try {
      const res = await axiosForBackend({ url: `/api/materials/${material.id}`, method: "GET" });
      setDetailData(res.data as MaterialDetail);
    } catch (err) {
      logger.error("获取物料详情失败", err);
      setDetailData({ ...material, relatedVersions: [] });
    } finally {
      setDetailLoading(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const fmtCurrency = (v: number) => `¥${v.toLocaleString("zh-CN", { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">物料管理</h1>
        <p className="text-sm text-muted-foreground mt-1">物料库存、锁定状态与资金占用管控</p>
      </div>

      <Card className="rounded-none border-border shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">面料类型</label>
              <Select value={fabricType} onValueChange={setFabricType}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="全部" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  {["棉", "涤纶", "丝绸", "麻", "混纺"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-xs text-muted-foreground mb-1 block">供应商</label>
              <Input placeholder="输入供应商名称" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="rounded-none" />
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block">锁定状态</label>
              <Select value={isLocked} onValueChange={setIsLocked}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="全部" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="true">已锁定</SelectItem>
                  <SelectItem value="false">未锁定</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <label className="text-xs text-muted-foreground mb-1 block">闲置预警</label>
              <Select value={idleWarning} onValueChange={setIdleWarning}>
                <SelectTrigger className="rounded-none"><SelectValue placeholder="全部" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">全部</SelectItem>
                  <SelectItem value="true">有预警</SelectItem>
                  <SelectItem value="false">无预警</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSearch} className="rounded-none h-9"><Search className="mr-1 size-4" />查询</Button>
              <Button variant="outline" onClick={handleReset} className="rounded-none h-9">重置</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border-border shadow-sm">
        <CardContent className="p-0">
          {error && <div className="p-6 text-center text-[hsl(var(--danger))] text-sm">{error}</div>}
          {!error && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">物料编码</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">名称</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">实时库存</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">入库时间</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">面料类型</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">供应商</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">锁定状态</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">闲置预警</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">资金占用</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">加载中...</td></tr>}
                    {!loading && materials.length === 0 && <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">暂无物料数据</td></tr>}
                    {!loading && materials.map((m) => (
                      <tr key={m.id} className={`border-b border-border hover:bg-accent transition-colors cursor-pointer ${m.idleWarning ? "bg-[hsl(var(--warning))]/5" : ""} ${m.isLocked ? "bg-muted/30" : ""}`} onClick={() => handleRowClick(m)}>
                        <td className="px-4 py-3 text-sm font-mono">{m.code}</td>
                        <td className="px-4 py-3 text-sm font-medium">{m.name}</td>
                        <td className="px-4 py-3 text-sm font-mono">{m.stock}</td>
                        <td className="px-4 py-3 text-sm font-mono">{m.storageTime}</td>
                        <td className="px-4 py-3 text-sm">{m.fabricType}</td>
                        <td className="px-4 py-3 text-sm">{m.supplier}</td>
                        <td className="px-4 py-3">
                          {m.isLocked ? <Badge className="rounded-full bg-[hsl(var(--caution))] text-black text-xs font-medium">已锁定</Badge> : <Badge className="rounded-full bg-muted text-muted-foreground text-xs font-medium">未锁定</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          {m.idleWarning ? <Badge className="rounded-full bg-[hsl(var(--warning))] text-white text-xs font-medium">预警</Badge> : <Badge className="rounded-full bg-muted text-muted-foreground text-xs font-medium">正常</Badge>}
                        </td>
                        <td className="px-4 py-3 text-sm font-mono">{fmtCurrency(m.capitalOccupation)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {total > 0 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <span className="text-xs text-muted-foreground">共 {total} 条，第 {page}/{totalPages} 页</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-none h-8" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="size-4" /></Button>
                    <Button variant="outline" size="sm" className="rounded-none h-8" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight className="size-4" /></Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl rounded-none">
          <DialogHeader>
            <DialogTitle>物料详情</DialogTitle>
            <DialogDescription>{detailData?.code && `编码: ${detailData.code}`}</DialogDescription>
          </DialogHeader>
          {detailLoading && <div className="py-8 text-center text-muted-foreground text-sm">加载中...</div>}
          {!detailLoading && detailData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">物料编码</span><p className="font-mono font-medium">{detailData.code}</p></div>
                <div><span className="text-muted-foreground">名称</span><p className="font-medium">{detailData.name}</p></div>
                <div><span className="text-muted-foreground">实时库存</span><p className="font-mono">{detailData.stock}</p></div>
                <div><span className="text-muted-foreground">入库时间</span><p className="font-mono">{detailData.storageTime}</p></div>
                <div><span className="text-muted-foreground">面料类型</span><p>{detailData.fabricType}</p></div>
                <div><span className="text-muted-foreground">供应商</span><p>{detailData.supplier}</p></div>
                <div><span className="text-muted-foreground">锁定状态</span><p>{detailData.isLocked ? <Badge className="rounded-full bg-[hsl(var(--caution))] text-black text-xs font-medium">已锁定</Badge> : <Badge className="rounded-full bg-muted text-muted-foreground text-xs font-medium">未锁定</Badge>}</p></div>
                <div><span className="text-muted-foreground">闲置预警</span><p>{detailData.idleWarning ? <Badge className="rounded-full bg-[hsl(var(--warning))] text-white text-xs font-medium">预警</Badge> : <Badge className="rounded-full bg-muted text-muted-foreground text-xs font-medium">正常</Badge>}</p></div>
                <div><span className="text-muted-foreground">资金占用</span><p className="font-mono">{fmtCurrency(detailData.capitalOccupation)}</p></div>
              </div>
              {detailData.relatedVersions?.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold mb-2">关联版单</h3>
                  <div className="border border-border rounded-none">
                    <table className="w-full">
                      <thead><tr className="border-b border-border bg-muted/50">
                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">款号</th>
                        <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">产品名称</th>
                      </tr></thead>
                      <tbody>{detailData.relatedVersions.map(v => (
                        <tr key={v.id} className="border-b border-border last:border-b-0">
                          <td className="px-3 py-2 text-sm font-mono">{v.styleNo}</td>
                          <td className="px-3 py-2 text-sm">{v.productName}</td>
                        </tr>
                      ))}</tbody>
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

export default MaterialPage;
