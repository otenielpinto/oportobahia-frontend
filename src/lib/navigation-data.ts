import { is } from "date-fns/locale";
import {
  Map,
  Settings2,
  Folder,
  Landmark,
  MessageCircle,
  PlusIcon,
  ShoppingCart,
  ReceiptText,
  FileSpreadsheet,
} from "lucide-react";

export const navigationData = {
  navMain: [
    {
      title: "Cadastro",
      url: "#",
      icon: PlusIcon,
      isActive: true,
      items: [
        {
          title: "Empresa",
          url: "/empresa",
        },
        {
          title: "Usuários",
          url: "/usuario",
        },
        {
          title: "Editoras",
          url: "/editora",
        },
        {
          title: "Formatos",
          url: "/formato",
        },
        {
          title: "Produtos copyright",
          url: "/catalogo",
        },

        {
          title: "Produtos Royalties",
          url: "/produto-copyright",
        },
      ],
    },

    {
      title: "Configuracao",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Usuarios",
          url: "/usuario",
        },
        {
          title: "Papel",
          url: "/papel",
        },
        {
          title: "Papel x Usuario",
          url: "/papel-usuario",
        },
        {
          title: "Permissoes",
          url: "/permissao",
        },

        {
          title: "Permissoes x Papel",
          url: "/papel-permissao",
        },
        {
          title: "Gerenciar Permissoes",
          url: "/papel-permissao/manage",
        },
      ],
    },

    {
      title: "Relatorio",
      url: "#",
      icon: ReceiptText,
      items: [
        {
          title: "Gerar apuração",
          url: "/relatorio/direitos-autorais",
        },
        {
          title: "Consultar apuração",
          url: "/relatorio/consulta-apuracoes",
        },
        {
          title: "Copyright em Aberto",
          url: "/relatorio/copyright-em-aberto",
        },
      ],
    },

    {
      title: "Arquivo",
      url: "#",
      icon: FileSpreadsheet,
      items: [
        {
          title: "Importar produtos via Planilha",
          url: "/arquivo/importar-planilha-copyright",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};
