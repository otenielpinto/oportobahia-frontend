export type SideNavItem = {
  title: string;
  path: string;
  icon?: JSX.Element;
  submenu?: boolean;
  subMenuItems?: SideNavItem[];
  isSidebarExpanded?: boolean;
  admin?: boolean;
  visible?: boolean;
};
