import { useState } from "react";
import {
  LayoutDashboard,
  Radio,
  History,
  Palette,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Control Tower", url: "/control-tower", icon: Radio },
  { title: "Runs / History", url: "/history", icon: History },
  { title: "Templates & Style", url: "/templates", icon: Palette },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Ops / Admin", url: "/ops", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r border-border bg-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-6">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <span className="text-sm font-bold text-foreground tracking-wide">VYRAL</span>
                <span className="text-xs text-muted-foreground block -mt-0.5">Control Tower</span>
              </div>
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      activeClassName="bg-sidebar-accent text-primary font-medium glow-green"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto pb-4">
          <SidebarGroupContent>
            <div className="px-4 py-3 mx-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-2 w-2 rounded-full bg-primary animate-glow-pulse" />
                <span className="text-xs font-mono text-muted-foreground">SYSTEM</span>
              </div>
              <p className="text-xs text-muted-foreground">All agents online</p>
              <p className="text-xs text-muted-foreground">Queue: 1 active</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
