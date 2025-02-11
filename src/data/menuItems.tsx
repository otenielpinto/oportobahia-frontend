import { SideNavItem } from "@/types/sideNavItem.d";
import {
  Home,
  FolderDot,
  MessageSquareDashed,
  Settings,
  HelpingHand,
  CircleDollarSign,
  Users,
  AlarmClockMinus,
  Workflow,
  Plus,
  PackageSearch,
  CandlestickChart,
  ReceiptText,
} from "lucide-react";

export const menuItems: SideNavItem[] = [
  {
    title: "Home",
    path: "/home",
    icon: <Home />,
  },

  {
    title: "Catalogo",
    path: "/catalogo",
    icon: <FolderDot />,
  },

  {
    title: "Cadastros",
    path: "/home",
    icon: <Plus />,
    submenu: true,
    subMenuItems: [
      { title: "Usuários", path: "/usuario", admin: true },
      { title: "Editoras", path: "/editora", admin: true },
      { title: "Formatos", path: "/formato", admin: true },
    ],
  },

  {
    title: "Relatorio",
    path: "/home",
    icon: <ReceiptText />,
    submenu: true,
    subMenuItems: [
      {
        title: "Direitos Autorais",
        path: "/relatorio/direitos-autorais",
        admin: true,
      },
    ],
  },

  {
    title: "Alertas",
    path: "/home",
    icon: <AlarmClockMinus />,
  },
];
