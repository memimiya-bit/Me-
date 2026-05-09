import React, { useState } from "react";
import { Search, Plus, Filter } from "lucide-react";

import { Button } from "@client/src/components/ui/button";
import { Image } from "@client/src/components/ui/image";

interface Product {
  id: string;
  name: string;
  category: string;
  status: "draft" | "in_progress" | "completed" | "archived";
  creator: string;
  createdDate: string;
  imageUrl: string;
}

const mockProducts: Product[] = [
  {
    id: "P001",
    name: "2024春季连衣裙",
    category: "女装",
    status: "completed",
    creator: "张三",
    createdDate: "2024-01-15",
    imageUrl:
      "https://miaoda.feishu.cn/aily/api/v1/files/static/137022a15497479585903cc60f6d4d45_ve_miaoda",
  },
  {
    id: "P002",
    name: "夏季T恤",
    category: "上衣",
    status: "in_progress",
    creator: "李四",
    createdDate: "2024-02-01",
    imageUrl:
      "https://miaoda.feishu.cn/aily/api/v1/files/static/db666f0eb20c4f279cd9fb8d8c96f51b_ve_miaoda",
  },
  {
    id: "P003",
    name: "秋季外套",
    category: "外套",
    status: "draft",
    creator: "王五",
    createdDate: "2024-02-10",
    imageUrl:
      "https://miaoda.feishu.cn/aily/api/v1/files/static/bff6d089a56644e3864bdd18081a2261_ve_miaoda",
  },
  {
    id: "P004",
    name: "冬季羽绒服",
    category: "外套",
    status: "completed",
    creator: "赵六",
    createdDate: "2024-01-20",
    imageUrl:
      "https://miaoda.feishu.cn/aily/api/v1/files/static/6d392e994d164b1da03cb8f07b42f3c5_ve_miaoda",
  },
  {
    id: "P005",
    name: "运动裤",
    category: "裤装",
    status: "in_progress",
    creator: "孙七",
    createdDate: "2024-02-15",
    imageUrl:
      "https://miaoda.feishu.cn/aily/api/v1/files/static/ba7f5919353c408982bed6234661e5f9_ve_miaoda",
  },
  {
    id: "P006",
    name: "衬衫",
    category: "上衣",
    status: "archived",
    creator: "周八",
    createdDate: "2024-01-10",
    imageUrl:
      "https://miaoda.feishu.cn/aily/api/v1/files/static/ee9d0c3f0f0640dd86a7bb79a6d9cae3_ve_miaoda",
  },
];

const categories = ["全部", "女装", "上衣", "外套", "裤装"];

const statusLabels: Record<Product["status"], string> = {
  draft: "草稿",
  in_progress: "进行中",
  completed: "已完成",
  archived: "已归档",
};

const statusStyles: Record<Product["status"], string> = {
  draft: "border-foreground/20 text-muted-foreground",
  in_progress: "border-foreground text-foreground",
  completed: "border-foreground/20 text-muted-foreground",
  archived: "border-foreground/20 text-muted-foreground",
};

const ProductPage: React.FC = () => {
  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [selectedStatus, setSelectedStatus] = useState<Product["status"] | "all">("all");

  const filteredProducts = mockProducts.filter((p) => {
    const matchKeyword =
      !keyword ||
      p.name.toLowerCase().includes(keyword.toLowerCase()) ||
      p.id.toLowerCase().includes(keyword.toLowerCase());
    const matchCategory = selectedCategory === "全部" || p.category === selectedCategory;
    const matchStatus = selectedStatus === "all" || p.status === selectedStatus;
    return matchKeyword && matchCategory && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold text-[#373c43]">产品库</h1>
          <p className="text-sm text-muted-foreground mt-1">
            产品信息与设计资料管理
          </p>
        </div>
        <Button className="rounded-none h-12 px-8 text-xs uppercase tracking-[0.2em]">
          <Plus className="mr-1 size-4" />
          新增产品
        </Button>
      </div>

      {/* Filter Area */}
      <div className="border border-foreground/10 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Keyword Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="搜索产品名称或编号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border-b border-foreground bg-transparent py-2 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none rounded-none"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border-b border-foreground bg-transparent px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none rounded-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Product["status"] | "all")}
            className="border-b border-foreground bg-transparent px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none rounded-none"
          >
            <option value="all">全部状态</option>
            <option value="draft">草稿</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="archived">已归档</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="border border-foreground/10 p-12 text-center">
          <p className="text-muted-foreground">暂无匹配的产品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border border-foreground/10">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="group border-t border-foreground pt-6 transition-colors hover:border-primary"
            >
              {/* Product Image */}
              <div className="aspect-[3/4] w-full overflow-hidden bg-muted">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="h-full w-full object-cover grayscale transition-all duration-[1500ms] group-hover:grayscale-0"
                />
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-base font-medium leading-normal text-foreground line-clamp-1">
                    {product.name}
                  </h3>
                  <span
                    className={`shrink-0 inline-block px-2 py-1 text-[10px] uppercase tracking-[0.2em] border rounded-none ${statusStyles[product.status]}`}
                  >
                    {statusLabels[product.status]}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>产品编号</span>
                    <span className="font-mono text-foreground">{product.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>类别</span>
                    <span className="text-foreground">{product.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>创建人</span>
                    <span className="text-foreground">{product.creator}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>创建日期</span>
                    <span className="font-mono text-foreground">
                      {product.createdDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPage;
