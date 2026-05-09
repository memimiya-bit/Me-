import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getBaseMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getBaseTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/api";
import { logger } from "@lark-apaas/client-toolkit/logger";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2 } from "lucide-react";
import type {
  Organization,
  OrganizationCreateDto,
  OrganizationUpdateDto,
  OrganizationListParams,
  Material as BaseMaterial,
  MaterialCreateDto,
  MaterialUpdateDto,
  MaterialListParams,
  Project,
  ProjectCreateDto,
  ProjectUpdateDto,
  ProjectListParams,
  Task as BaseTask,
  TaskCreateDto,
  TaskUpdateDto,
  TaskListParams,
  ListResponse,
} from "@shared/api.interface";
import { showConfirm } from '@lark-apaas/client-toolkit';

/* ---------- shared helpers ---------- */

const STATUS_OPTIONS = [
  { value: "pending", label: "待处理" },
  { value: "in_progress", label: "进行中" },
  { value: "completed", label: "已完成" },
  { value: "cancelled", label: "已取消" },
];

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    in_progress: "bg-[hsl(var(--primary))] text-white",
    completed: "bg-[hsl(var(--success))] text-white",
    cancelled: "bg-[hsl(var(--danger))] text-white",
  };
  const labelMap: Record<string, string> = {
    pending: "待处理",
    in_progress: "进行中",
    completed: "已完成",
    cancelled: "已取消",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${map[s] ?? "bg-muted text-muted-foreground"}`}
    >
      {labelMap[s] ?? s}
    </span>
  );
};

const fmtDate = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleDateString("zh-CN") : "-";

const fmtDateTime = (v: string | null | undefined) =>
  v ? new Date(v).toLocaleString("zh-CN") : "-";

/* ---------- pagination bar ---------- */

function PaginationBar({
  page,
  totalPages,
  total,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  if (total <= 0) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-xs text-muted-foreground">
        共 {total} 条，第 {page}/{totalPages} 页
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-none h-8"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="rounded-none h-8"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}

/* ---------- generic table shell ---------- */

function DataTable({
  columns,
  data,
  loading,
  total,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  label,
  renderCell,
}: {
  columns: { key: string; title: string }[];
  data: { id: string }[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onEdit: (item: { id: string }) => void;
  onDelete: (item: { id: string }) => void;
  label: string;
  renderCell: (item: { id: string }, key: string) => React.ReactNode;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="border border-border rounded-none">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap"
                >
                  {c.title}
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  加载中...
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  暂无{label}数据
                </td>
              </tr>
            )}
            {!loading &&
              data.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-b-0 hover:bg-accent transition-colors"
                >
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-sm">
                      {renderCell(item, c.key)}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none h-7 px-2"
                        onClick={() => onEdit(item)}
                      >
                        <Pencil className="size-3.5 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-none h-7 px-2 text-[hsl(var(--danger))] hover:text-[hsl(var(--danger))]"
                        onClick={() => onDelete(item)}
                      >
                        <Trash2 className="size-3.5 mr-1" />
                        删除
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <PaginationBar
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={onPageChange}
      />
    </div>
  );
}

/* ---------- generic form dialog ---------- */

function FormDialog({
  open,
  onOpenChange,
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  fields: {
    key: string;
    label: string;
    type?: "text" | "date" | "datetime-local" | "select";
    options?: { value: string; label: string }[];
  }[];
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-none max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-xs text-muted-foreground mb-1 block">
                {f.label}
              </label>
              {f.type === "select" ? (
                <Select
                  value={values[f.key] ?? ""}
                  onValueChange={(v) => onChange(f.key, v)}
                >
                  <SelectTrigger className="rounded-none">
                    <SelectValue placeholder={`请选择${f.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {f.options?.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type ?? "text"}
                  value={values[f.key] ?? ""}
                  onChange={(e) => onChange(f.key, e.target.value)}
                  className="rounded-none"
                  placeholder={`请输入${f.label}`}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="rounded-none"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
          <Button
            className="rounded-none"
            onClick={onSubmit}
            disabled={submitting}
          >
            {submitting ? "提交中..." : "确定"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ========== Tab 1: 组织架构 ========== */

function OrgTab() {
  const [data, setData] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [form, setForm] = useState({ name: "", role: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrganizations({ page, pageSize });
      setData(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      logger.error("组织架构列表获取失败", e);
      toast.error("组织架构列表获取失败");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", role: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Organization) => {
    setEditing(item);
    setForm({ name: item.name, role: item.role });
    setDialogOpen(true);
  };

  const handleDelete = async (item: Organization) => {
    if (!await showConfirm(`确定删除 "${item.name}"？`)) return;
    try {
      await deleteOrganization(item.id);
      toast.success("删除成功");
      fetchData();
    } catch (e) {
      logger.error("组织架构删除失败", e);
      toast.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      if (editing) {
        await updateOrganization(editing.id, form as OrganizationUpdateDto);
        toast.success("更新成功");
      } else {
        await createOrganization(form as OrganizationCreateDto);
        toast.success("创建成功");
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      logger.error("组织架构提交失败", e);
      toast.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "name", title: "名称" },
    { key: "role", title: "角色" },
    { key: "createdAt", title: "创建时间" },
  ];

  const renderCell = (item: Organization, key: string) => {
    if (key === "createdAt") return fmtDate((item as any)[key]);
    return (item as any)[key] ?? "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          共 {total} 条
        </p>
        <Button onClick={openCreate} className="rounded-none h-9">
          <Plus className="mr-1 size-4" />
          新增
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onEdit={(item) => openEdit(item as Organization)}
        onDelete={(item) => handleDelete(item as Organization)}
        label="组织架构"
        renderCell={renderCell}
      />
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "编辑组织" : "新增组织"}
        fields={[
          { key: "name", label: "名称" },
          { key: "role", label: "角色" },
        ]}
        values={form}
        onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}

/* ========== Tab 2: 物料管理 ========== */

function MaterialTab() {
  const [data, setData] = useState<BaseMaterial[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BaseMaterial | null>(null);
  const [form, setForm] = useState({
    styleNo: "",
    color: "",
    size: "",
    type: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBaseMaterials({ page, pageSize });
      setData(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      logger.error("物料列表获取失败", e);
      toast.error("物料列表获取失败");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ styleNo: "", color: "", size: "", type: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: BaseMaterial) => {
    setEditing(item);
    setForm({
      styleNo: item.styleNo,
      color: item.color ?? "",
      size: item.size ?? "",
      type: item.type,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (item: BaseMaterial) => {
    if (!await showConfirm(`确定删除 "${item.styleNo}"？`)) return;
    try {
      await deleteMaterial(item.id);
      toast.success("删除成功");
      fetchData();
    } catch (e) {
      logger.error("物料删除失败", e);
      toast.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dto = {
        styleNo: form.styleNo,
        color: form.color || undefined,
        size: form.size || undefined,
        type: form.type,
      };
      if (editing) {
        await updateMaterial(editing.id, dto as MaterialUpdateDto);
        toast.success("更新成功");
      } else {
        await createMaterial(dto as MaterialCreateDto);
        toast.success("创建成功");
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      logger.error("物料提交失败", e);
      toast.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "styleNo", title: "款号" },
    { key: "color", title: "颜色" },
    { key: "size", title: "尺码" },
    { key: "type", title: "类型" },
    { key: "createdAt", title: "创建时间" },
  ];

  const renderCell = (item: BaseMaterial, key: string) => {
    if (key === "createdAt") return fmtDate((item as any)[key]);
    return (item as any)[key] ?? "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">共 {total} 条</p>
        <Button onClick={openCreate} className="rounded-none h-9">
          <Plus className="mr-1 size-4" />
          新增
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onEdit={(item) => openEdit(item as BaseMaterial)}
        onDelete={(item) => handleDelete(item as BaseMaterial)}
        label="物料"
        renderCell={renderCell}
      />
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "编辑物料" : "新增物料"}
        fields={[
          { key: "styleNo", label: "款号" },
          { key: "color", label: "颜色" },
          { key: "size", label: "尺码" },
          { key: "type", label: "类型" },
        ]}
        values={form}
        onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}

/* ========== Tab 3: 项目管理 ========== */

function ProjectTab() {
  const [data, setData] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState({
    name: "",
    ownerId: "",
    startTime: "",
    endTime: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getProjects({ page, pageSize });
      setData(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      logger.error("项目列表获取失败", e);
      toast.error("项目列表获取失败");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", ownerId: "", startTime: "", endTime: "" });
    setDialogOpen(true);
  };

  const openEdit = (item: Project) => {
    setEditing(item);
    setForm({
      name: item.name,
      ownerId: item.ownerId ?? "",
      startTime: item.startTime ?? "",
      endTime: item.endTime ?? "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (item: Project) => {
    if (!await showConfirm(`确定删除 "${item.name}"？`)) return;
    try {
      await deleteProject(item.id);
      toast.success("删除成功");
      fetchData();
    } catch (e) {
      logger.error("项目删除失败", e);
      toast.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dto = {
        name: form.name,
        ownerId: form.ownerId || undefined,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
      };
      if (editing) {
        await updateProject(editing.id, dto as ProjectUpdateDto);
        toast.success("更新成功");
      } else {
        await createProject(dto as ProjectCreateDto);
        toast.success("创建成功");
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      logger.error("项目提交失败", e);
      toast.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "name", title: "项目名称" },
    { key: "ownerName", title: "负责人" },
    { key: "startTime", title: "开始时间" },
    { key: "endTime", title: "结束时间" },
  ];

  const renderCell = (item: Project, key: string) => {
    if (key === "startTime" || key === "endTime")
      return fmtDate((item as any)[key]);
    return (item as any)[key] ?? "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">共 {total} 条</p>
        <Button onClick={openCreate} className="rounded-none h-9">
          <Plus className="mr-1 size-4" />
          新增
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onEdit={(item) => openEdit(item as Project)}
        onDelete={(item) => handleDelete(item as Project)}
        label="项目"
        renderCell={renderCell}
      />
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "编辑项目" : "新增项目"}
        fields={[
          { key: "name", label: "项目名称" },
          { key: "ownerId", label: "负责人ID" },
          { key: "startTime", label: "开始时间", type: "date" },
          { key: "endTime", label: "结束时间", type: "date" },
        ]}
        values={form}
        onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}

/* ========== Tab 4: 任务管理 ========== */

function TaskTab() {
  const [data, setData] = useState<BaseTask[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BaseTask | null>(null);
  const [form, setForm] = useState({
    name: "",
    status: "pending",
    deadline: "",
    projectId: "",
    assigneeId: "",
    materialId: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getBaseTasks({ page, pageSize });
      setData(res.items ?? []);
      setTotal(res.total ?? 0);
    } catch (e) {
      logger.error("任务列表获取失败", e);
      toast.error("任务列表获取失败");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      status: "pending",
      deadline: "",
      projectId: "",
      assigneeId: "",
      materialId: "",
    });
    setDialogOpen(true);
  };

  const openEdit = (item: BaseTask) => {
    setEditing(item);
    setForm({
      name: item.name,
      status: item.status,
      deadline: item.deadline ?? "",
      projectId: item.projectId ?? "",
      assigneeId: item.assigneeId ?? "",
      materialId: item.materialId ?? "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (item: BaseTask) => {
    if (!await showConfirm(`确定删除 "${item.name}"？`)) return;
    try {
      await deleteTask(item.id);
      toast.success("删除成功");
      fetchData();
    } catch (e) {
      logger.error("任务删除失败", e);
      toast.error("删除失败");
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const dto = {
        name: form.name,
        status: form.status,
        deadline: form.deadline || undefined,
        projectId: form.projectId || undefined,
        assigneeId: form.assigneeId || undefined,
        materialId: form.materialId || undefined,
      };
      if (editing) {
        await updateTask(editing.id, dto as TaskUpdateDto);
        toast.success("更新成功");
      } else {
        await createTask(dto as TaskCreateDto);
        toast.success("创建成功");
      }
      setDialogOpen(false);
      fetchData();
    } catch (e) {
      logger.error("任务提交失败", e);
      toast.error(editing ? "更新失败" : "创建失败");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { key: "name", title: "任务名称" },
    { key: "status", title: "状态" },
    { key: "deadline", title: "截止时间" },
    { key: "projectName", title: "所属项目" },
    { key: "assigneeName", title: "执行人" },
    { key: "materialStyleNo", title: "物料款号" },
  ];

  const renderCell = (item: BaseTask, key: string) => {
    if (key === "status") return statusBadge((item as any)[key]);
    if (key === "deadline") return fmtDateTime((item as any)[key]);
    return (item as any)[key] ?? "-";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">共 {total} 条</p>
        <Button onClick={openCreate} className="rounded-none h-9">
          <Plus className="mr-1 size-4" />
          新增
        </Button>
      </div>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onEdit={(item) => openEdit(item as BaseTask)}
        onDelete={(item) => handleDelete(item as BaseTask)}
        label="任务"
        renderCell={renderCell}
      />
      <FormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "编辑任务" : "新增任务"}
        fields={[
          { key: "name", label: "任务名称" },
          {
            key: "status",
            label: "状态",
            type: "select",
            options: STATUS_OPTIONS,
          },
          { key: "deadline", label: "截止时间", type: "datetime-local" },
          { key: "projectId", label: "项目ID" },
          { key: "assigneeId", label: "执行人ID" },
          { key: "materialId", label: "物料ID" },
        ]}
        values={form}
        onChange={(k, v) => setForm((p) => ({ ...p, [k]: v }))}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
}

/* ========== Page ========== */

const BaseDataPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">基础数据管理</h1>
        <p className="text-sm text-muted-foreground mt-1">
          组织架构、物料、项目、任务统一管理
        </p>
      </div>

      <Tabs defaultValue="org">
        <TabsList className="rounded-none bg-muted/50 h-10">
          <TabsTrigger value="org" className="rounded-none">
            组织架构
          </TabsTrigger>
          <TabsTrigger value="material" className="rounded-none">
            物料管理
          </TabsTrigger>
          <TabsTrigger value="project" className="rounded-none">
            项目管理
          </TabsTrigger>
          <TabsTrigger value="task" className="rounded-none">
            任务管理
          </TabsTrigger>
        </TabsList>

        <TabsContent value="org" className="mt-4">
          <OrgTab />
        </TabsContent>
        <TabsContent value="material" className="mt-4">
          <MaterialTab />
        </TabsContent>
        <TabsContent value="project" className="mt-4">
          <ProjectTab />
        </TabsContent>
        <TabsContent value="task" className="mt-4">
          <TaskTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BaseDataPage;
