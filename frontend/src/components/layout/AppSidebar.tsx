import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { CreateDialog } from "@/components/create/CreateDialog";
import {
  Plus,
  Home,
  Link2,
  QrCode,
  BarChart3,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const AppSidebar: React.FC = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const mainNavItems = [
    { label: "Home", path: "/home", icon: Home },
    { label: "Links", path: "/links", icon: Link2 },
    { label: "QR Codes", path: "/qrcodes", icon: QrCode },
  ];

  const placeholderNavItems = [
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      <Sidebar collapsible="icon" className="border-r border-border">
        <SidebarHeader className="p-4 flex flex-col gap-4">
          {/* Logo Branding */}
          <Link
            to="/home"
            className="flex items-center gap-1 text-xl font-extrabold tracking-tight overflow-hidden whitespace-nowrap"
          >
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
              Link
            </span>
            {!isCollapsed && <span className="text-foreground">Snap</span>}
          </Link>

          {/* Create Button */}
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className={`bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 transition-all ${
              isCollapsed ? "h-9 w-9 p-0" : "w-full h-10 px-4"
            }`}
            title="Create new"
          >
            <Plus className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="font-semibold">Create new</span>}
          </Button>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => navigate(item.path)}
                        tooltip={item.label}
                        className={isActive ? "bg-accent text-accent-foreground font-semibold" : ""}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {placeholderNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => navigate(item.path)}
                        tooltip={item.label}
                        className={isActive ? "bg-accent text-accent-foreground font-semibold" : ""}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarRail />
      </Sidebar>

      <CreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </>
  );
};
