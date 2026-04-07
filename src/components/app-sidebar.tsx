"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useQuery } from "@tanstack/react-query";
import { getUser } from "@/hooks/useUser";
import { getUserEmpresas } from "@/actions/userAction";
import { navigationData } from "@/lib/navigation-data";
import { getPermissoesByUsuario } from "@/actions/papelPermissaoAction";
import { Loader2 } from "lucide-react";

// Cache: 5 min stale, 10 min garbage-collect
const STALE_5MIN = 5 * 60 * 1000;
const GC_10MIN = 10 * 60 * 1000;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: xuser, isLoading } = useQuery<any>({
    queryKey: ["nav-user"],
    queryFn: async () => await getUser(),
    staleTime: STALE_5MIN,
    gcTime: GC_10MIN,
  });

  const { data: empresas, isLoading: isLoadingEmpresas } = useQuery<any>({
    queryKey: ["nav-empresas", xuser?.id],
    queryFn: async () => await getUserEmpresas(xuser?.id),
    enabled: !!xuser?.id,
    staleTime: STALE_5MIN,
    gcTime: GC_10MIN,
  });

  const { data: permissoes, isLoading: isLoadingPermissoes } = useQuery<any>({
    queryKey: ["nav-permissoes", xuser?.id],
    queryFn: async () => await getPermissoesByUsuario(xuser?.id),
    enabled: !!xuser?.id && xuser?.isAdmin !== 1,
    staleTime: STALE_5MIN,
    gcTime: GC_10MIN,
  });

  if (isLoading || isLoadingEmpresas) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Aguarde...</span>
      </div>
    );
  }

  // Build nav items respecting permissions for non-admin users
  let navMainItems = navigationData.navMain;

  if (xuser?.isAdmin !== 1) {
    if (isLoadingPermissoes) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Aguarde...</span>
        </div>
      );
    }

    if (permissoes && Array.isArray(permissoes.data)) {
      navMainItems = navigationData.navMain
        .filter((item) => {
          const menuPermissionId = `menu-${item.title.toLowerCase().replace(/\s+/g, "-")}`;
          const hasMenuPermission = permissoes.data.some(
            (p: any) => p === menuPermissionId,
          );
          if (!hasMenuPermission) return false;

          if (item.items && item.items.length > 0) {
            const filtered = item.items.filter((sub) => {
              const subId = `submenu-${sub.title.toLowerCase().replace(/\s+/g, "-")}`;
              return permissoes.data.some((p: any) => p === subId);
            });
            return filtered.length > 0;
          }
          return true;
        })
        .map((item) => ({
          ...item,
          items: item.items
            ? item.items.filter((sub) => {
                const subId = `submenu-${sub.title.toLowerCase().replace(/\s+/g, "-")}`;
                return permissoes.data.some((p: any) => p === subId);
              })
            : item.items,
        }));
    } else {
      navMainItems = [];
    }
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={isLoadingEmpresas ? [] : empresas} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={xuser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
