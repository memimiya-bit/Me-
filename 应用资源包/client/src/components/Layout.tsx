import { Outlet } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useLocation, Link } from "react-router-dom";
import { useAppInfo } from "@lark-apaas/client-toolkit/hooks/useAppInfo";
import { useCurrentUserProfile } from "@lark-apaas/client-toolkit/hooks/useCurrentUserProfile";
import { getDataloom } from "@lark-apaas/client-toolkit/dataloom";
import { logger } from "@lark-apaas/client-toolkit/logger";
import {
  LayoutDashboard,
  ListChecks,
  GitBranch,
  Package,
  Library,
  FileText,
  ChevronRight,
  LogOut,
  LogIn,
  Database,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

const primaryNav = [
  { path: "/", label: "业务总览", icon: LayoutDashboard, title: "业务总览" },
];

const secondaryNav = [
  { path: "/base-data", label: "基础数据", icon: Database, title: "基础数据" },
  { path: "/business", label: "业务详情", icon: FileText, title: "业务详情" },
  { path: "/tasks", label: "任务管理", icon: ListChecks, title: "任务管理" },
  { path: "/versions", label: "版本管理", icon: GitBranch, title: "版本管理" },
  { path: "/materials", label: "物料管理", icon: Package, title: "物料管理" },
  { path: "/products", label: "产品库", icon: Library, title: "产品库" },
  { path: "/data-map", label: "数据地图", icon: GitBranch, title: "数据地图" },
  { path: "/sync", label: "数据同步", icon: Database, title: "数据同步" },
];

const navItems = [...primaryNav, ...secondaryNav];

const LayoutContent = () => {
  const { pathname } = useLocation();
  const { appName } = useAppInfo();
  const userInfo = useCurrentUserProfile();
  const [open, setOpen] = useState(false);

  const activeItem = navItems.find((item) => {
    if (item.path === "/") return pathname === "/";
    return pathname.startsWith(item.path);
  });
  const activeTitle = activeItem?.title || "";

  const handleLogout = async () => {
    const dataloom = await getDataloom();
    const result = await dataloom.service.session.signOut();
    if (result.error) {
      logger.error("退出登录失败:", result.error.message);
      return;
    }
    window.location.reload();
  };

  const handleLogin = async () => {
    const dataloom = await getDataloom();
    dataloom.service.session.redirectToLogin();
  };

  const isLoggedIn = !!userInfo?.user_id;
  const avatarUrl = userInfo?.avatar || "https://lf3-static.bytednsdoc.com/obj/eden-cn/LMfspH/ljhwZthlaukjlkulzlp/miao/no-person.svg";
  const displayName = (typeof userInfo?.name === "string" ? userInfo.name : (userInfo?.name as any)?.zh_cn || (userInfo?.name as any)?.en_us) || (isLoggedIn ? "用户" : "游客");

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                  <Link to="/">
                    <div className="flex aspect-square size-8 items-center justify-center rounded-none bg-transparent text-foreground">
                      <LayoutDashboard className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                      <span className="truncate font-semibold text-foreground">{appName || "QR-7S快反系统"}</span>
                    </div>
                 </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
         <SidebarContent>
           <SidebarGroup>
             <SidebarGroupContent>
               <SidebarMenu>
                  {primaryNav.map((item) => {
                    const isActive = pathname === item.path;
                    return (
                    <SidebarMenuItem key={item.path}>
                     <SidebarMenuButton asChild isActive={isActive}>
                         <Link to={item.path}>
                           {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-primary rounded-none" />}
                           <item.icon className={`size-4 ${isActive ? "text-primary" : ""}`} />
                           <span>{item.label}</span>
                         </Link>
                       </SidebarMenuButton>
                    </SidebarMenuItem>
                    );
                  })}
               </SidebarMenu>
             </SidebarGroupContent>
           </SidebarGroup>
           <SidebarGroup>
             <SidebarGroupContent>
               <SidebarMenu>
                  {secondaryNav.map((item) => {
                    const isActive = pathname.startsWith(item.path);
                    return (
                    <SidebarMenuItem key={item.path}>
                     <SidebarMenuButton asChild isActive={isActive}>
                         <Link to={item.path}>
                           {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 bg-primary rounded-none" />}
                           <item.icon className={`size-4 ${isActive ? "text-primary" : ""}`} />
                           <span>{item.label}</span>
                         </Link>
                       </SidebarMenuButton>
                    </SidebarMenuItem>
                    );
                  })}
               </SidebarMenu>
             </SidebarGroupContent>
           </SidebarGroup>
         </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu open={open} onOpenChange={setOpen}>
                <DropdownMenuTrigger asChild>
                   <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
                     <Avatar className="size-6 rounded-none">
                       <AvatarImage src={avatarUrl} alt={displayName} />
                       <AvatarFallback className="rounded-none text-xs">{displayName.charAt(0)}</AvatarFallback>
                     </Avatar>
                     <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                       <span className="truncate text-foreground">{displayName}</span>
                     </div>
                    <ChevronRight className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {isLoggedIn ? (
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 size-4" />
                      退出登录
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={handleLogin}>
                      <LogIn className="mr-2 size-4" />
                      登录
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
        <main className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center gap-2 px-6 py-4 border-b border-border bg-background">
            <SidebarTrigger className="text-foreground hover:bg-accent" />
           <Separator orientation="vertical" className="h-4 bg-border" />
           <Breadcrumb className="self-center">
             <BreadcrumbList>
               <BreadcrumbItem className="text-foreground font-medium truncate max-w-[200px]">
                 {activeTitle}
               </BreadcrumbItem>
             </BreadcrumbList>
           </Breadcrumb>
         </header>
          <div className="flex-1 overflow-auto p-6 bg-background">
           <Outlet />
         </div>
       </main>
    </>
  );
};

const Layout = () => (
  <SidebarProvider>
    <LayoutContent />
  </SidebarProvider>
);

export default Layout;
