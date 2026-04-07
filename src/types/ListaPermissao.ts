import { getUser } from "@/actions/sessionAction";
import { navigationData } from "@/lib/navigation-data";

export const tiposPermissao = [
  { value: "visualizar", label: "Visualizar" },
  { value: "incluir", label: "Incluir" },
  { value: "editar", label: "Editar" },
  { value: "excluir", label: "Excluir" },
  { value: "mais-acoes", label: "Mais ações" },
];

export const listaPermissao = [
  {
    id: "1",
    nome: "empresa",
  },
  {
    id: "2",
    nome: "usuario",
  },
  {
    id: "3",
    nome: "papel",
  },
  {
    id: "4",
    nome: "papel-usuario",
  },
  {
    id: "5",
    nome: "permissao",
  },
  {
    id: "6",
    nome: "cliente",
  },
  {
    id: "7",
    nome: "contacorrente",
  },
  {
    id: "8",
    nome: "extrato",
  },
];

export const tipoAcao = "acao";
export const tipoMenu = "menu";
export const tipoSubmenu = "submenu";

/**
 * Interface para o objeto de permissão que será inserido no MongoDB
 */
export interface PermissaoInsert {
  id: string;
  tipo: string;
  nome: string;
  id_empresa: number;
  id_tenant: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Função que faz o cruzamento entre tiposPermissao e listaPermissao
 * Cria um array de permissões para ser inserido no MongoDB via insertMany
 * @returns Array de permissões para inserção ou erro
 */
export async function cruzarPermissoes(): Promise<{
  success: boolean;
  data?: PermissaoInsert[];
  error?: string;
}> {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant || !user?.id_empresa) {
      return {
        success: false,
        error: "Usuário não autorizado ou dados incompletos",
      };
    }

    const permissoesParaInserir: PermissaoInsert[] = [];
    const agora = new Date();

    // Converter para number para garantir tipagem correta
    const idEmpresa = Number(user.id_empresa);
    const idTenant = Number(user.id_tenant);

    // Iterar sobre cada item da listaPermissao
    for (const itemPermissao of listaPermissao) {
      // Para cada item da listaPermissao, iterar sobre tiposPermissao
      for (const tipoPermissao of tiposPermissao) {
        // Compor o nome da permissão
        const nomePermissao = `${itemPermissao.nome}-${tipoPermissao.value}`;

        // Compor o ID usando tipo + nome
        const id = `${tipoAcao}-${nomePermissao}`;

        const novaPermissao: PermissaoInsert = {
          id: id,
          tipo: tipoAcao,
          nome: nomePermissao,
          id_empresa: idEmpresa,
          id_tenant: idTenant,
          createdAt: agora,
          updatedAt: agora,
        };

        permissoesParaInserir.push(novaPermissao);
      }
    }

    return { success: true, data: permissoesParaInserir };
  } catch (error: any) {
    console.error("Erro ao cruzar permissões:", error);
    return {
      success: false,
      error: error.message || "Erro interno ao processar permissões",
    };
  }
}

/**
 * Função que lista os menus e submenus da propriedade navMain do sidebarData
 * Cria um array de permissões de menu/submenu para ser inserido no MongoDB via insertMany
 * @returns Array de permissões de menu/submenu para inserção ou erro
 */
export async function cruzarMenusSubmenus(): Promise<{
  success: boolean;
  data?: PermissaoInsert[];
  error?: string;
}> {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant || !user?.id_empresa) {
      return {
        success: false,
        error: "Usuário não autorizado ou dados incompletos",
      };
    }

    const permissoesParaInserir: PermissaoInsert[] = [];
    const agora = new Date();

    // Converter para number para garantir tipagem correta
    const idEmpresa = Number(user.id_empresa);
    const idTenant = Number(user.id_tenant);

    // Iterar sobre cada item do navMain do sidebarData
    for (const menuItem of navigationData.navMain) {
      // Criar permissão para o menu principal
      const nomeMenu = menuItem.title.toLowerCase().replace(/\s+/g, "-");
      const menuId = `${tipoMenu}-${nomeMenu}`;

      const permissaoMenu: PermissaoInsert = {
        id: menuId,
        tipo: tipoMenu,
        nome: nomeMenu,
        id_empresa: idEmpresa,
        id_tenant: idTenant,
        createdAt: agora,
        updatedAt: agora,
      };

      permissoesParaInserir.push(permissaoMenu);

      // Se o menu tem itens (submenus), criar permissões para cada submenu
      if (menuItem.items && menuItem.items.length > 0) {
        for (const subItem of menuItem.items) {
          const nomeSubmenu = subItem.title.toLowerCase().replace(/\s+/g, "-");
          const submenuId = `${tipoSubmenu}-${nomeSubmenu}`;

          const permissaoSubmenu: PermissaoInsert = {
            id: submenuId,
            tipo: tipoSubmenu,
            nome: nomeSubmenu,
            id_empresa: idEmpresa,
            id_tenant: idTenant,
            createdAt: agora,
            updatedAt: agora,
          };

          permissoesParaInserir.push(permissaoSubmenu);
        }
      }
    }

    return { success: true, data: permissoesParaInserir };
  } catch (error: any) {
    console.error("Erro ao cruzar menus e submenus:", error);
    return {
      success: false,
      error: error.message || "Erro interno ao processar menus e submenus",
    };
  }
}
