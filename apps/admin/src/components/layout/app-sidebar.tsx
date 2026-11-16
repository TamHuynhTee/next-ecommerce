"use client";

import { Gem } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { navigation } from "@/lib/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 justify-center px-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Gem className="size-6 shrink-0 text-primary" />
          <span className="group-data-[collapsible=icon]:hidden">Backoffice</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-2">
        {navigation.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      size="lg"
                      isActive={isActive(item.href)}
                      tooltip={item.title}
                      className="rounded-[10px] text-muted-foreground data-[active=true]:font-medium data-[active=true]:text-foreground"
                    >
                      <Link href={item.href}>
                        <item.icon className="data-[active=true]:text-primary" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge className="rounded-full bg-chart-2/40 text-foreground">
                        {item.badge}
                      </SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-4 text-sm group-data-[collapsible=icon]:hidden">
        <p className="font-medium">E-commerce Admin</p>
        <p className="text-muted-foreground">Mock data only. API integration comes later.</p>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
