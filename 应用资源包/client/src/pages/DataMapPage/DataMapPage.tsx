import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Database, Layers, BarChart3, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TableNode {
  name: string;
  label: string;
  definition: string;
  upstream?: string;
  downstream?: string;
  linkField?: string;
  route: string;
}

const baseLayerTables: TableNode[] = [
  { name: 'common_info', label: '合作企业信息', definition: '合作企业基础信息、负责人、联系方式、优先级', route: '/business' },
  { name: 'common_contact', label: '内部联系人', definition: '应用成员、部门、任务、流程、工单关联', route: '/base-data' },
  { name: 'product_library', label: '产品库', definition: '产品基础信息、图片、版本管理', route: '/products' },
  { name: 'material_reserve_locking', label: '物料预备锁库', definition: '物料库存锁定信息、库存管控', route: '/materials' },
  { name: 'training_table_guide', label: '培训表格指南', definition: '培训资料库、章节、标签、课程链接', route: '/sync' },
];

const coreLayerTables: TableNode[] = [
  { name: 'full_link_task_control_table', label: '全链路任务管控', definition: '任务名称、类型、DRS评分、风险评分、进度状态、紧急程度', upstream: '所有业务表', downstream: '自动化规则', linkField: 'taskType/riskScore', route: '/tasks' },
  { name: 'project_total_table', label: '项目总览', definition: '项目名称、类型、负责人、目标、时间、状态、任务统计', upstream: 'common_info', downstream: '业务详情', linkField: 'appProject', route: '/business' },
  { name: 'version_list', label: '版本列表', definition: '版本管理信息、关联产品', upstream: 'product_library', downstream: '版本管理', linkField: 'productId', route: '/versions' },
  { name: 'product_design_tech_library', label: '产品设计技术库', definition: '产品JSON数据、数据类型、变更记录、是否最新', upstream: 'product_library', downstream: '产品详情', linkField: 'product', route: '/products' },
  { name: 'project_rush_special', label: '快反特案项目', definition: '快反专项项目信息', upstream: 'project_total_table', downstream: '任务管控', linkField: 'projectId', route: '/tasks' },
  { name: 'project_docking_panorama_table', label: '项目对接全景表', definition: '项目对接整体视图', upstream: 'project_total_table', downstream: '业务详情', linkField: 'projectId', route: '/business' },
  { name: 'project_full_map', label: '项目全图', definition: '项目整体信息地图', upstream: '所有项目表', downstream: '业务总览', linkField: 'projectId', route: '/business' },
  { name: 'wave_development_summary', label: '波段开发总结', definition: '波段开发进度信息', upstream: 'version_list', downstream: '版本管理', linkField: 'versionId', route: '/versions' },
  { name: 'seasoning_summary', label: '大货总结', definition: '订单ID、订户、供应商、预计/实际到货时间、完成状态', upstream: 'project_total_table', downstream: '业务详情', linkField: 'orderId', route: '/business' },
];

const resultLayerTables: TableNode[] = [
  { name: 'app_okr', label: 'OKR目标管理', definition: '应用OKR目标信息、目标追踪', upstream: '所有业务表', route: '/sync' },
  { name: 'app_list', label: '应用列表', definition: '应用清单信息、应用管理', upstream: '所有业务表', route: '/sync' },
  { name: 'app_requirement_inbox', label: '需求收件箱', definition: '需求收集管理、需求跟进', upstream: '用户输入', route: '/sync' },
];

const allTables: TableNode[] = [...baseLayerTables, ...coreLayerTables, ...resultLayerTables];

const layerConfig = [
  { title: '基础数据层', icon: Database, color: 'hsl(212 80% 45%)', tables: baseLayerTables, description: '静态基础数据，人员/供应商/产品/物料' },
  { title: '核心业务层', icon: Layers, color: 'hsl(24 95% 50%)', tables: coreLayerTables, description: '强关联业务数据，任务/项目/版本' },
  { title: '结果分析层', icon: BarChart3, color: 'hsl(142 72% 35%)', tables: resultLayerTables, description: '结果汇总数据，OKR/应用/需求' },
];

const DataMapPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">数据架构地图</h1>
        <p className="text-sm text-muted-foreground mt-1">
          17张业务表的分组关系、上下游关联与数据流向可视化
        </p>
      </div>

      {/* Three-Layer Architecture */}
      <div className="space-y-4">
        {layerConfig.map((layer, idx) => {
          const LayerIcon = layer.icon;
          return (
            <Card key={layer.title} className="rounded-none shadow-sm border-border">
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-none flex items-center justify-center"
                  style={{ backgroundColor: layer.color + '15' }}
                >
                  <LayerIcon className="size-4" style={{ color: layer.color }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-foreground">{layer.title}</h2>
                  <p className="text-xs text-muted-foreground">{layer.description}</p>
                </div>
                <Badge variant="outline" className="rounded-none font-mono">
                  {layer.tables.length} 张表
                </Badge>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {layer.tables.map((table) => (
                    <button
                      key={table.name}
                      type="button"
                      className="group text-left p-3 border border-border rounded-none hover:border-primary hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => navigate(table.route)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary truncate">
                          {table.label}
                        </span>
                        <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0 mt-0.5" />
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                        {table.definition}
                      </p>
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm block truncate">
                        {table.name}
                      </code>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Data Flow Arrows */}
      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">核心数据流向</h2>
          <p className="text-xs text-muted-foreground mt-1">表与表之间的主要数据关联路径</p>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {[
              { from: 'product_library', to: 'version_list', label: '产品 → 版本（一对多）', route: '/products' },
              { from: 'product_library', to: 'product_design_tech_library', label: '产品 → 技术资料库', route: '/products' },
              { from: 'common_info', to: 'project_total_table', label: '合作企业 → 项目总览', route: '/business' },
              { from: 'project_total_table', to: 'full_link_task_control_table', label: '项目 → 任务管控（核心）', route: '/tasks' },
              { from: 'project_total_table', to: 'seasoning_summary', label: '项目 → 大货总结', route: '/business' },
              { from: 'version_list', to: 'wave_development_summary', label: '版本 → 波段开发', route: '/versions' },
              { from: 'material_reserve_locking', to: 'material库', label: '物料锁库 → 物料管理', route: '/materials' },
              { from: '所有业务表', to: 'app_okr / app_list', label: '业务数据 → OKR/应用汇总', route: '/sync' },
            ].map((flow, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 border border-border rounded-none hover:bg-accent transition-colors cursor-pointer"
                onClick={() => navigate(flow.route)}
              >
                <code className="text-xs font-mono text-primary bg-accent px-2 py-1 rounded-sm">
                  {flow.from}
                </code>
                <ArrowRight className="size-4 text-muted-foreground flex-shrink-0" />
                <code className="text-xs font-mono text-primary bg-accent px-2 py-1 rounded-sm">
                  {flow.to}
                </code>
                <span className="text-xs text-muted-foreground ml-auto">{flow.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Data Dictionary Table */}
      <Card className="rounded-none shadow-sm border-border">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">数据字典</h2>
          <p className="text-xs text-muted-foreground mt-1">17张业务表的元数据说明</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">表名</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">业务定义</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">上游来源</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">下游消费</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">关联字段</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap w-20">操作</th>
              </tr>
            </thead>
            <tbody>
              {allTables.map((table) => (
                <tr
                  key={table.name}
                  className="border-b border-border last:border-b-0 hover:bg-accent transition-colors"
                >
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-primary">{table.name}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{table.definition}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{table.upstream || '-'}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{table.downstream || '-'}</td>
                  <td className="px-4 py-3">
                    {table.linkField ? (
                      <code className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm">
                        {table.linkField}
                      </code>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                      onClick={() => navigate(table.route)}
                    >
                      跳转 <ExternalLink className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DataMapPage;
