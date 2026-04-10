"use server";

import { TMongo } from "@/infra/mongoClient";
import {
  PapelCreateInput,
  PapelUpdateInput,
  PapelFilters,
} from "@/types/PapelTypes";
import { gen_id } from "@/actions/generatorAction";
import { getUser } from "@/actions/sessionAction";
import { revalidatePath } from "next/cache";
import { serializeMongoData } from "@/lib/serializeMongoData";

/**
 * Busca todos os papéis com filtros opcionais
 * @param filters Filtros a serem aplicados (nome, ativo)
 * @returns Array de papéis ou mensagem de erro
 */
export async function getPapeis(filters: PapelFilters = {}) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Construir query com filtros
    const query: any = {
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    };

    if (filters.nome) {
      query.nome = { $regex: filters.nome, $options: "i" };
    }

    if (filters.ativo === "true") {
      query.ativo = true;
    } else if (filters.ativo === "false") {
      query.ativo = false;
    }

    // Busca os papéis
    const papeis = await clientdb
      .collection("papel")
      .find(query)
      .sort({ nome: 1 })
      .toArray();

    // Formata o array para garantir que os tipos estejam corretos
    const formattedPapeis = papeis.map((papel) => ({
      _id: papel._id.toString(),
      id: papel.id,
      nome: papel.nome,
      ativo: papel.ativo,
      id_tenant: papel.id_tenant,
      id_empresa: papel.id_empresa,
      createdAt: papel.createdAt,
      updatedAt: papel.updatedAt,
    }));

    client.close();

    return { success: true, data: serializeMongoData(formattedPapeis) };
  } catch (error) {
    console.error("Erro ao buscar papéis:", error);
    return {
      success: false,
      error: "Não foi possível carregar os papéis",
    };
  }
}

/**
 * Busca um papel específico pelo ID
 * @param id ID do papel
 * @returns Dados do papel ou mensagem de erro
 */
export async function getPapelById(id: number) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const papel = await clientdb.collection("papel").findOne({
      id: Number(id),
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });
    await TMongo.mongoDisconnect(client);

    if (!papel) {
      return { success: false, error: "Papel não encontrado." };
    }

    const serializedPapel = {
      ...papel,
      _id: papel._id.toString(),
      createdAt: papel.createdAt?.toISOString(),
      updatedAt: papel.updatedAt?.toISOString(),
    };

    return { success: true, data: serializedPapel };
  } catch (error: any) {
    console.error(`Erro ao buscar papel com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o papel.",
    };
  }
}

/**
 * Cria um novo papel
 * @param data Dados do papel a ser criado
 * @returns Resultado da operação
 */
export async function createPapel(data: PapelCreateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    const row = await gen_id("papel");
    if (!row.success || !row.data) {
      await TMongo.mongoDisconnect(client);
      return { success: false, error: "Falha ao gerar ID para o papel." };
    }
    const newId = parseInt(String(row.data));

    const papelData = {
      ...data,
      id: newId,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
      createdAt: new Date(),
      updatedAt: new Date(),
      nome: data.nome || "Novo Papel",
      ativo: data.ativo !== undefined ? data.ativo : true,
    };

    const result = await clientdb.collection("papel").insertOne(papelData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar papel." };
    }

    revalidatePath("/papel");
    return { success: true, message: "Papel criado com sucesso." };
  } catch (error: any) {
    console.error("Erro ao criar papel:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar o papel.",
    };
  }
}

/**
 * Atualiza um papel existente
 * @param data Dados do papel a ser atualizado
 * @returns Resultado da operação
 */
export async function updatePapel(data: PapelUpdateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("papel").updateOne(
      {
        id: Number(id),
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      },
      {
        $set: {
          ...updateFields,
          updatedAt: new Date(),
        },
      },
    );
    await TMongo.mongoDisconnect(client);

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Papel não encontrado ou não pertence ao seu tenant.",
      };
    }
    if (result.modifiedCount === 0) {
      return { success: false, message: "Nenhuma alteração detectada." };
    }

    revalidatePath("/papel");
    revalidatePath(`/papel/view/${id}`);
    revalidatePath(`/papel/edit/${id}`);
    return { success: true, message: "Papel atualizado com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao atualizar papel com ID ${data.id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível atualizar o papel.",
    };
  }
}

/**
 * Exclui um papel
 * @param id ID do papel a ser excluído
 * @returns Resultado da operação
 */
export async function deletePapel(id: number) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("papel").deleteOne({
      id: Number(id),
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Papel não encontrado ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/papel");
    return { success: true, message: "Papel excluído com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao excluir papel com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir o papel.",
    };
  }
}
