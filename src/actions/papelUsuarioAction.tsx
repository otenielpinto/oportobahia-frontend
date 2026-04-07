"use server";

import { TMongo } from "@/infra/mongoClient";
import {
  PapelUsuarioCreateInput,
  PapelUsuarioUpdateInput,
  PapelUsuarioFilters,
} from "@/types/PapelUsuarioTypes";
import { gen_id } from "@/actions/generatorAction";
import { getUser } from "@/actions/sessionAction";
import { revalidatePath } from "next/cache";

// AIDEV-NOTE: multi-tenant-security; todas as operações filtradas por id_tenant e id_empresa

/**
 * Busca todos os papéis de usuário com filtros opcionais
 * @param filters Filtros a serem aplicados (id_usuario, id_papel)
 * @returns Array de papéis de usuário ou mensagem de erro
 */
export async function getPapeisUsuario(filters: PapelUsuarioFilters = {}) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Construir query com filtros obrigatórios de multi-tenancy
    const query: any = {
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    };

    if (filters.id_usuario) {
      query.id_usuario = filters.id_usuario;
    }

    if (filters.id_papel) {
      query.id_papel = Number(filters.id_papel);
    }

    // Busca os papéis de usuário com join das informações relacionadas
    const pipelineQuery = [
      { $match: query },
      {
        $lookup: {
          from: "user",
          let: { id_usuario: "$id_usuario" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id", "$$id_usuario"] },
                    { $eq: ["$id_tenant", user.id_tenant] },
                    { $eq: ["$id_empresa", user.id_empresa] },
                  ],
                },
              },
            },
          ],
          as: "usuario",
        },
      },
      {
        $lookup: {
          from: "papel",
          let: { id_papel: "$id_papel" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$id", "$$id_papel"] },
                    { $eq: ["$id_tenant", user.id_tenant] },
                    { $eq: ["$id_empresa", user.id_empresa] },
                  ],
                },
              },
            },
          ],
          as: "papel",
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const papeisUsuario = await clientdb
      .collection("papel_usuario")
      .aggregate(pipelineQuery)
      .toArray();

    // Formata o array para garantir que os tipos estejam corretos
    const formattedPapeisUsuario = papeisUsuario.map((papelUsuario) => ({
      _id: papelUsuario._id.toString(),
      id: papelUsuario.id,
      id_usuario: papelUsuario.id_usuario,
      id_papel: papelUsuario.id_papel,
      id_empresa: papelUsuario.id_empresa,
      id_tenant: papelUsuario.id_tenant,
      createdAt: papelUsuario.createdAt,
      updatedAt: papelUsuario.updatedAt,
      usuario: papelUsuario.usuario[0]
        ? {
            ...papelUsuario.usuario[0],
            _id: papelUsuario.usuario[0]._id.toString(),
            createdAt:
              papelUsuario.usuario[0].createdAt?.toISOString?.() ||
              papelUsuario.usuario[0].createdAt,
            updatedAt:
              papelUsuario.usuario[0].updatedAt?.toISOString?.() ||
              papelUsuario.usuario[0].updatedAt,
          }
        : null,
      papel: papelUsuario.papel[0]
        ? {
            ...papelUsuario.papel[0],
            _id: papelUsuario.papel[0]._id.toString(),
            createdAt:
              papelUsuario.papel[0].createdAt?.toISOString?.() ||
              papelUsuario.papel[0].createdAt,
            updatedAt:
              papelUsuario.papel[0].updatedAt?.toISOString?.() ||
              papelUsuario.papel[0].updatedAt,
          }
        : null,
    }));

    client.close();

    return { success: true, data: formattedPapeisUsuario };
  } catch (error) {
    console.error("Erro ao buscar papéis de usuário:", error);
    return {
      success: false,
      error: "Não foi possível carregar os papéis de usuário",
    };
  }
}

/**
 * Busca um papel de usuário específico pelo ID
 * @param id ID do papel de usuário
 * @returns Dados do papel de usuário ou mensagem de erro
 */
export async function getPapelUsuarioById(id: number) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const papelUsuario = await clientdb.collection("papel_usuario").findOne({
      id: Number(id),
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });
    await TMongo.mongoDisconnect(client);

    if (!papelUsuario) {
      return { success: false, error: "Papel de usuário não encontrado." };
    }

    const serializedPapelUsuario = {
      ...papelUsuario,
      _id: papelUsuario._id.toString(),
      createdAt: papelUsuario.createdAt?.toISOString(),
      updatedAt: papelUsuario.updatedAt?.toISOString(),
    };

    return { success: true, data: serializedPapelUsuario };
  } catch (error: any) {
    console.error(`Erro ao buscar papel de usuário com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o papel de usuário.",
    };
  }
}

/**
 * Cria um novo papel de usuário
 * @param data Dados do papel de usuário a ser criado
 * @returns Resultado da operação
 */
export async function createPapelUsuario(data: PapelUsuarioCreateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Verifica se a associação já existe
    const existingAssociation = await clientdb
      .collection("papel_usuario")
      .findOne({
        id_usuario: data.id_usuario,
        id_papel: Number(data.id_papel),
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      });

    if (existingAssociation) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        error: "Esta associação usuário-papel já existe.",
      };
    }

    const row = await gen_id("papel_usuario");
    if (!row.success || !row.data) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        error: "Falha ao gerar ID para o papel de usuário.",
      };
    }
    const newId = parseInt(String(row.data));

    const papelUsuarioData = {
      ...data,
      id: newId,
      id_papel: Number(data.id_papel),
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await clientdb
      .collection("papel_usuario")
      .insertOne(papelUsuarioData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar papel de usuário." };
    }

    revalidatePath("/papel-usuario");
    return { success: true, message: "Papel de usuário criado com sucesso." };
  } catch (error: any) {
    console.error("Erro ao criar papel de usuário:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar o papel de usuário.",
    };
  }
}

/**
 * Atualiza um papel de usuário existente
 * @param data Dados do papel de usuário a ser atualizado
 * @returns Resultado da operação
 */
export async function updatePapelUsuario(data: PapelUsuarioUpdateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    // Converte id_papel para number se fornecido
    if (updateFields.id_papel) {
      updateFields.id_papel = Number(updateFields.id_papel);
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Se está alterando a associação, verifica se não existe duplicata
    if (updateFields.id_usuario || updateFields.id_papel) {
      const currentRecord = await clientdb.collection("papel_usuario").findOne({
        id: Number(id),
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      });

      if (!currentRecord) {
        await TMongo.mongoDisconnect(client);
        return { success: false, error: "Papel de usuário não encontrado." };
      }

      const checkDuplicate = await clientdb
        .collection("papel_usuario")
        .findOne({
          id_usuario: updateFields.id_usuario || currentRecord.id_usuario,
          id_papel: updateFields.id_papel || currentRecord.id_papel,
          id_tenant: user.id_tenant,
          id_empresa: user.id_empresa,
          id: { $ne: Number(id) }, // Exclui o registro atual
        });

      if (checkDuplicate) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          error: "Esta associação usuário-papel já existe.",
        };
      }
    }

    const result = await clientdb.collection("papel_usuario").updateOne(
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
      }
    );
    await TMongo.mongoDisconnect(client);

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Papel de usuário não encontrado ou não pertence ao seu tenant.",
      };
    }
    if (result.modifiedCount === 0) {
      return { success: false, message: "Nenhuma alteração detectada." };
    }

    revalidatePath("/papel-usuario");
    revalidatePath(`/papel-usuario/view/${id}`);
    revalidatePath(`/papel-usuario/edit/${id}`);
    return {
      success: true,
      message: "Papel de usuário atualizado com sucesso.",
    };
  } catch (error: any) {
    console.error(
      `Erro ao atualizar papel de usuário com ID ${data.id}:`,
      error
    );
    return {
      success: false,
      error: error.message || "Não foi possível atualizar o papel de usuário.",
    };
  }
}

/**
 * Exclui um papel de usuário
 * @param id ID do papel de usuário a ser excluído
 * @returns Resultado da operação
 */
export async function deletePapelUsuario(id: number) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("papel_usuario").deleteOne({
      id: Number(id),
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Papel de usuário não encontrado ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/papel-usuario");
    return { success: true, message: "Papel de usuário excluído com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao excluir papel de usuário com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir o papel de usuário.",
    };
  }
}
