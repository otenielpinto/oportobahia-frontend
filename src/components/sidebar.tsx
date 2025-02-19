"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/data/menuItems";
import { SideNavItem } from "@/types/sideNavItem.d";
import ButtonLogout from "@/components/ButtonLogout";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import Image from "next/image";
import {
  Calendar,
  Clock,
  Bell,
  ChevronDown,
  TrendingUp,
  ChevronLeftCircle,
  ListFilter,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  LifeBuoy,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getUser } from "@/actions/actSession";

const MenuItem = ({ item }: { item: SideNavItem }) => {
  const pathname = usePathname();
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  //https://usehooks.com/usemediaquery

  return (
    <div>
      {item?.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`flex flex-row items-center p-2 rounded-lg hover-bg-zinc-100 w-full justify-between hover:bg-zinc-100 ${
              pathname.includes(item.path) ? "bg-zinc-100" : ""
            }`}
          >
            <div className="flex flex-row space-x-4 items-center">
              {item.icon}
              <span className="font-medium text-sm  flex">{item.title}</span>
            </div>

            <div className={`${subMenuOpen ? "rotate-180" : ""}  flex`}>
              <ChevronDown />
            </div>
          </button>

          {subMenuOpen && (
            <div className="my-2 ml-12 flex flex-col space-y-4">
              {item.subMenuItems?.map((subItem, idx) => {
                let visible = subItem?.admin && item?.visible;
                if (!subItem.admin) visible = true;

                return visible ? (
                  <Link
                    key={idx}
                    href={subItem.path}
                    className={`
                    rounded-lg text-muted-foreground transition-all hover:text-primary
                    ${subItem.path === pathname ? "font-normal" : ""}`}
                  >
                    <span>{subItem.title}</span>
                  </Link>
                ) : null;
              })}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.path}
          className={`flex flex-row space-x-4 items-center p-2 rounded-lg hover:bg-zinc-100 ${
            item.path === pathname ? "bg-zinc-100" : ""
          }`}
        >
          {item.icon}
          <span className="font-medium text-sm flex">{item.title}</span>
        </Link>
      )}
    </div>
  );
};

const SideNav = () => {
  const brandCompany = "Gestor PRO";
  const [hideMenu, setHideMenu] = useState(false);
  const [empresa, setEmpresa] = useState("");
  const [codEmpresa, setCodEmpresa] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("sidebarExpanded");
      if (saved === null) {
        return true;
      }
      return JSON.parse(saved);
    }
    return true; // default state if window is not defined
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "sidebarExpanded",
        JSON.stringify(isSidebarExpanded)
      );
    }

    const loadEmpresa = async () => {
      let user = await getUser();
      setIsAdmin(user?.isAdmin === 1);

      if (user) {
        setEmpresa(user.name as string);
        setCodEmpresa(user?.empresa as number);
      }
    };

    loadEmpresa();
  }, [isSidebarExpanded]);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };
  const tooggleHideMenu = () => {
    setHideMenu(!hideMenu);
  };

  /* isMediumDevice & isLargeDevice & isExtraLargeDevice */
  return (
    <>
      <div className={hideMenu ? "hidden" : ""}>
        <div className={"hidden border-r $ bg-muted/40 md:block"}>
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link
                href="/home"
                className="flex items-center gap-2 font-semibold"
              >
                <Image src="/logo.png" width={32} height={32} alt="Logo" />
                <span className="font-medium text-sm hidden md:flex">
                  {brandCompany}
                </span>
              </Link>

              <Button
                variant="outline"
                size="icon"
                className="ml-auto h-8 w-8 "
                onClick={tooggleHideMenu}
              >
                <Menu className="h-4 w-4" />
              </Button>

              {/* <Button
                variant="outline"
                size="icon"
                className="ml-auto h-8 w-8 "
              >
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button> */}
            </div>

            <div className="flex h-8 items-center border-b px-4 lg:h-[25px] lg:px-6">
              <span className="font-medium text-sm hidden md:flex">
                {`0${codEmpresa} - ${empresa}`}
              </span>
            </div>

            <Suspense>
              <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-small lg:px-4">
                  {menuItems?.map((item, idx) => {
                    return (
                      <MenuItem
                        key={idx}
                        item={{
                          ...item,
                          isSidebarExpanded,
                          visible: isAdmin,
                        }}
                      />
                    );
                  })}
                </nav>
              </div>
              <div className="mt-auto p-4 grid">
                <ButtonLogout />
              </div>
            </Suspense>
          </div>
        </div>

        <div className={`flex flex-col`}>
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href="#"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Image src="/logo.png" width={32} height={32} alt="Logo" />
                    <span className="font-medium text-sm md:flex">
                      {brandCompany}
                    </span>
                  </Link>

                  {menuItems?.map((item, idx) => {
                    return (
                      <MenuItem
                        key={idx}
                        item={{ ...item, visible: isAdmin }}
                      />
                    );
                  })}
                  <div className="mt-auto gap-2 grid">
                    <ButtonLogout />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </header>
        </div>
      </div>

      {/* Optionally hide the menu */}
      {hideMenu && (
        <div className={`flex fixed`}>
          <Button
            variant="outline"
            size="icon"
            className="ml-auto h-8 w-8 "
            onClick={tooggleHideMenu}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      )}
    </>
  );
};
export default SideNav;

//referencias https://ui.shadcn.com/blocks    https://ui.shadcn.com/blocks#dashboard-02
