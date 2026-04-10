"use server";

import { TMongo } from "@/infra/mongoClient";
import {
  PapelPermissaoCreateInput,
  PapelPermissaoUpdateInput,
  PapelPermissaoFilters,
} from "@/types/PapelPermissaoTypes";
import { getUser } from "@/actions/sessionAction";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { serializeMongoData } from "@/lib/serializeMongoData";

/**
 * Busca todos os papel_permissao com filtros opcionais
 * @param filters Filtros a serem aplicados (id_permissao, id_papel)
 * @returns Array de papel_permissao ou mensagem de erro
 */
export async function getPapelPermissoes(filters: PapelPermissaoFilters = {}) {
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

    if (filters.id_permissao) {
      query.id_permissao = filters.id_permissao;
    }

    if (filters.id_papel) {
      query.id_papel = Number(filters.id_papel);
    }

    // Busca os papel_permissao
    const papelPermissoes = await clientdb
      .collection("papel_permissao")
      .find(query)
      .sort({ id_papel: 1, id_permissao: 1 })
      .toArray();

    // Formata o array para garantir que os tipos estejam corretos
    const formattedPapelPermissoes = papelPermissoes.map((papelPermissao) => ({
      _id: papelPermissao._id.toString(),
      id: papelPermissao.id,
      id_permissao: papelPermissao.id_permissao,
      id_papel: papelPermissao.id_papel,
      id_tenant: papelPermissao.id_tenant,
      id_empresa: papelPermissao.id_empresa,
      createdAt: papelPermissao.createdAt,
      updatedAt: papelPermissao.updatedAt,
    }));

    client.close();

    return {
      success: true,
      data: serializeMongoData(formattedPapelPermissoes),
    };
  } catch (error) {
    console.error("Erro ao buscar papel_permissao:", error);
    return {
      success: false,
      error: "Não foi possível carregar os papel_permissao",
    };
  }
}

/**
 * Busca um papel_permissao específico pelo ID
 * @param id ID do papel_permissao
 * @returns Dados do papel_permissao ou mensagem de erro
 */
export async function getPapelPermissaoById(id: string) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const papelPermissao = await clientdb
      .collection("papel_permissao")
      .findOne({
        id: id,
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      });
    await TMongo.mongoDisconnect(client);

    if (!papelPermissao) {
      return { success: false, error: "Papel_permissao não encontrado." };
    }

    const serializedPapelPermissao = {
      ...papelPermissao,
      _id: papelPermissao._id.toString(),
      createdAt: papelPermissao.createdAt?.toISOString(),
      updatedAt: papelPermissao.updatedAt?.toISOString(),
    };

    return { success: true, data: serializedPapelPermissao };
  } catch (error: any) {
    console.error(`Erro ao buscar papel_permissao com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o papel_permissao.",
    };
  }
}

/**
 * Cria um novo papel_permissao
 * @param data Dados do papel_permissao a ser criado
 * @returns Resultado da operação
 */
export async function createPapelPermissao(data: PapelPermissaoCreateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Gera um ID único usando ObjectId
    const newId = new ObjectId().toString();

    // Verifica se já existe uma relação entre papel e permissão
    const existingRelation = await clientdb
      .collection("papel_permissao")
      .findOne({
        id_papel: Number(data.id_papel),
        id_permissao: data.id_permissao,
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      });

    if (existingRelation) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        error: "Relação entre papel e permissão já existe.",
      };
    }

    const papelPermissaoData = {
      ...data,
      id: newId,
      id_papel: Number(data.id_papel),
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await clientdb
      .collection("papel_permissao")
      .insertOne(papelPermissaoData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar papel_permissao." };
    }

    revalidatePath("/papel-permissao");
    return { success: true, message: "Papel_permissao criado com sucesso." };
  } catch (error: any) {
    console.error("Erro ao criar papel_permissao:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar o papel_permissao.",
    };
  }
}

/**
 * Atualiza um papel_permissao existente
 * @param data Dados do papel_permissao a ser atualizado
 * @returns Resultado da operação
 */
export async function updatePapelPermissao(data: PapelPermissaoUpdateInput) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Se está alterando papel ou permissão, verifica se não existe duplicação
    if (
      updateFields.id_papel !== undefined ||
      updateFields.id_permissao !== undefined
    ) {
      const currentRecord = await clientdb
        .collection("papel_permissao")
        .findOne({
          id: id,
          id_tenant: user.id_tenant,
          id_empresa: user.id_empresa,
        });

      if (!currentRecord) {
        await TMongo.mongoDisconnect(client);
        return { success: false, error: "Papel_permissao não encontrado." };
      }

      const checkId_papel =
        updateFields.id_papel !== undefined
          ? Number(updateFields.id_papel)
          : currentRecord.id_papel;
      const checkId_permissao =
        updateFields.id_permissao !== undefined
          ? updateFields.id_permissao
          : currentRecord.id_permissao;

      const existingRelation = await clientdb
        .collection("papel_permissao")
        .findOne({
          id_papel: checkId_papel,
          id_permissao: checkId_permissao,
          id_tenant: user.id_tenant,
          id_empresa: user.id_empresa,
          id: { $ne: id }, // Exclui o próprio registro
        });

      if (existingRelation) {
        await TMongo.mongoDisconnect(client);
        return {
          success: false,
          error: "Relação entre papel e permissão já existe.",
        };
      }
    }

    const result = await clientdb.collection("papel_permissao").updateOne(
      {
        id: id,
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      },
      {
        $set: {
          ...updateFields,
          id_papel: updateFields.id_papel
            ? Number(updateFields.id_papel)
            : undefined,
          updatedAt: new Date(),
        },
      },
    );
    await TMongo.mongoDisconnect(client);

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Papel_permissao não encontrado ou não pertence ao seu tenant.",
      };
    }
    if (result.modifiedCount === 0) {
      return { success: false, message: "Nenhuma alteração detectada." };
    }

    revalidatePath("/papel-permissao");
    revalidatePath(`/papel-permissao/view/${id}`);
    revalidatePath(`/papel-permissao/edit/${id}`);
    return {
      success: true,
      message: "Papel_permissao atualizado com sucesso.",
    };
  } catch (error: any) {
    console.error(
      `Erro ao atualizar papel_permissao com ID ${data.id}:`,
      error,
    );
    return {
      success: false,
      error: error.message || "Não foi possível atualizar o papel_permissao.",
    };
  }
}

/**
 * Busca as permissões de um usuário através dos seus papéis
 * @param id_usuario ID do usuário
 * @returns Array com os IDs das permissões ou mensagem de erro
 */
export async function getPermissoesByUsuario(id_usuario: string) {
  console.log(`Buscando permissões para o usuário ${id_usuario}...`);
  if (!id_usuario) {
    return { success: true, data: [] };
  }

  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // 1. Busca os papéis do usuário na collection papel_usuario
    const papeisUsuario = await clientdb
      .collection("papel_usuario")
      .find({
        id_usuario: id_usuario,
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      })
      .toArray();

    if (papeisUsuario.length === 0) {
      client.close();
      return { success: true, data: [] };
    }

    // 2. Extrai os IDs dos papéis
    const idsPapeis = papeisUsuario.map((pu) => pu.id_papel);

    // 3. Busca as permissões na collection papel_permissao filtrando pelos IDs dos papéis
    const papelPermissoes = await clientdb
      .collection("papel_permissao")
      .find({
        id_papel: { $in: idsPapeis },
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      })
      .toArray();

    if (papelPermissoes.length === 0) {
      client.close();
      return { success: true, data: [] };
    }

    // 4. Extrai os IDs únicos das permissões
    const idsPermissoes = [
      ...new Set(papelPermissoes.map((pp) => pp.id_permissao)),
    ];

    // 5. Busca os NOMES e TIPOS das permissões na collection permissao
    const permissoes = await clientdb
      .collection("permissao")
      .find({
        id: { $in: idsPermissoes },
        id_tenant: user.id_tenant,
        id_empresa: user.id_empresa,
      })
      .toArray();

    // 6. Formata os nomes das permissões como "tipo-nome" (ex: "menu-suprimentos")
    const nomesPermissoes = permissoes.map(
      (p) => `${p.tipo}-${p.nome.toLowerCase().replace(/\s+/g, "-")}`,
    );

    client.close();

    return { success: true, data: nomesPermissoes };
  } catch (error: any) {
    console.error(`Erro ao buscar permissões do usuário ${id_usuario}:`, error);
    return {
      success: false,
      error:
        error.message || "Não foi possível carregar as permissões do usuário.",
    };
  }
}

/**
 * Exclui um papel_permissao
 * @param id ID do papel_permissao a ser excluído
 * @returns Resultado da operação
 */
export async function deletePapelPermissao(id: string) {
  try {
    const user = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("papel_permissao").deleteOne({
      id: id,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa,
    });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Papel_permissao não encontrado ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/papel-permissao");
    return { success: true, message: "Papel_permissao excluído com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao excluir papel_permissao com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir o papel_permissao.",
    };
  }
}
