"use server";

import { TMongo } from "@/infra/mongoClient";
import {
  PermissaoCreateInput,
  PermissaoUpdateInput,
  PermissaoFilters,
} from "@/types/PermissaoTypes";
import { gen_id } from "@/actions/generatorAction";
import { getUser } from "@/actions/sessionAction";
import { revalidatePath } from "next/cache";
import { cruzarPermissoes, cruzarMenusSubmenus } from "@/types/ListaPermissao";
import { v4 as uuidv4 } from "uuid";

/**
 * Busca todas as permissões com filtros opcionais
 * @param filters Filtros a serem aplicados (tipo, nome)
 * @returns Array de permissões ou mensagem de erro
 */
export async function getPermissoes(filters: PermissaoFilters = {}) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // AIDEV-NOTE: multi-tenant-security; sempre filtrar por id_tenant e id_empresa
    const query: any = {
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    };

    // Aplicar filtros se fornecidos
    if (filters.tipo) {
      query.tipo = { $regex: filters.tipo, $options: "i" };
    }
    if (filters.nome) {
      query.nome = { $regex: filters.nome, $options: "i" };
    }

    const permissoes = await clientdb
      .collection("permissao")
      .find(query)
      .sort({ nome: 1 })
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Serializar documentos MongoDB para Client Components
    const serializedPermissoes = permissoes.map((permissao) => ({
      ...permissao,
      _id: permissao._id.toString(),
    }));

    return { success: true, data: serializedPermissoes };
  } catch (error: any) {
    console.error("Erro ao buscar permissões:", error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar as permissões.",
    };
  }
}

/**
 * Busca uma permissão específica pelo ID
 * @param id ID da permissão
 * @returns Dados da permissão ou mensagem de erro
 */
export async function getPermissaoById(id: string) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const permissao = await clientdb.collection("permissao").findOne({
      id: id,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });
    await TMongo.mongoDisconnect(client);

    if (!permissao) {
      return { success: false, error: "Permissão não encontrada." };
    }

    const serializedPermissao = {
      ...permissao,
      _id: permissao._id.toString(),
    };

    return { success: true, data: serializedPermissao };
  } catch (error: any) {
    console.error(`Erro ao buscar permissão com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar a permissão.",
    };
  }
}

/**
 * Cria uma nova permissão
 * @param data Dados da permissão a ser criada
 * @returns Resultado da operação
 */
export async function createPermissao(data: PermissaoCreateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Generate UUID for the new permission
    const newId = uuidv4();

    const permissaoData = {
      ...data,
      id: newId,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await clientdb
      .collection("permissao")
      .insertOne(permissaoData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar a permissão." };
    }

    revalidatePath("/permissao");
    return { success: true, message: "Permissão criada com sucesso." };
  } catch (error: any) {
    console.error("Erro ao criar permissão:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar a permissão.",
    };
  }
}

/**
 * Atualiza uma permissão existente
 * @param data Dados da permissão a ser atualizada
 * @returns Resultado da operação
 */
export async function updatePermissao(data: PermissaoUpdateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("permissao").updateOne(
      {
        id: id,
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      }
    );
    await TMongo.mongoDisconnect(client);

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Permissão não encontrada ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/permissao");
    revalidatePath(`/permissao/view/${id}`);
    revalidatePath(`/permissao/edit/${id}`);
    return { success: true, message: "Permissão atualizada com sucesso." };
  } catch (error: any) {
    console.error("Erro ao atualizar permissão:", error);
    return {
      success: false,
      error: error.message || "Não foi possível atualizar a permissão.",
    };
  }
}

/**
 * Exclui uma permissão
 * @param id ID da permissão a ser excluída
 * @returns Resultado da operação
 */
export async function deletePermissao(id: string) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("permissao").deleteOne({
      id: id,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Permissão não encontrada ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/permissao");
    return { success: true, message: "Permissão excluída com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao excluir permissão com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir a permissão.",
    };
  }
}

/**
 * Cria múltiplas permissões baseadas no cruzamento entre tiposPermissao e listaPermissao
 * e também inclui permissões de menus e submenus
 * @returns Resultado da operação de inserção em lote
 */
export async function createPermissoesBatch() {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    // Obter o array de permissões cruzadas (ações)
    const cruzamentoResult = await cruzarPermissoes();
    if (!cruzamentoResult.success || !cruzamentoResult.data) {
      return {
        success: false,
        error:
          cruzamentoResult.error ||
          "Erro ao processar cruzamento de permissões",
      };
    }

    // Obter o array de permissões de menus/submenus
    const menusSubmenusResult = await cruzarMenusSubmenus();
    if (!menusSubmenusResult.success || !menusSubmenusResult.data) {
      return {
        success: false,
        error:
          menusSubmenusResult.error ||
          "Erro ao processar cruzamento de menus e submenus",
      };
    }

    // Combinar as duas listas de permissões
    const todasPermissoes = [
      ...cruzamentoResult.data,
      ...menusSubmenusResult.data,
    ];

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Inserir todas as permissões de uma vez usando insertMany
    const result = await clientdb
      .collection("permissao")
      .insertMany(todasPermissoes);

    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar permissões em lote." };
    }

    revalidatePath("/permissao");
    return {
      success: true,
      message: `${result.insertedCount} permissões criadas com sucesso (${cruzamentoResult.data.length} ações + ${menusSubmenusResult.data.length} menus/submenus).`,
      insertedCount: result.insertedCount,
      detalhes: {
        acoes: cruzamentoResult.data.length,
        menusSubmenus: menusSubmenusResult.data.length,
      },
    };
  } catch (error: any) {
    console.error("Erro ao criar permissões em lote:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar as permissões em lote.",
    };
  }
}

/**
 * Deleta todas as permissões do tenant/empresa
 * @returns Resultado da operação de exclusão em lote
 */
export async function deleteAllPermissoes() {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Deletar todas as permissões do tenant/empresa atual
    const result = await clientdb.collection("permissao").deleteMany({
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });

    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Nenhuma permissão encontrada para exclusão.",
      };
    }

    revalidatePath("/permissao");
    return {
      success: true,
      message: `${result.deletedCount} permissões excluídas com sucesso.`,
      deletedCount: result.deletedCount,
    };
  } catch (error: any) {
    console.error("Erro ao excluir todas as permissões:", error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir as permissões.",
    };
  }
}
