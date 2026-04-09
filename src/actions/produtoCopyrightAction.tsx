"use server";

import { TMongo } from "@/infra/mongoClient";
import {
  ProdutoAutoral as ProdutoCopyright,
  ProdutoAutoralFormData as ProdutoCopyrightFormData,
} from "@/types/produtoAutoralTypes";
import { gen_id } from "@/actions/generatorAction";
import { getUser } from "@/actions/sessionAction";
import { serializeMongoData } from "@/lib/serializeMongoData";
import { revalidatePath } from "next/cache";

type ProdutoCopyrightCreateInput = Omit<ProdutoCopyrightFormData, "id_tenant">;

type ProdutoCopyrightUpdateInput = Partial<ProdutoCopyrightCreateInput> & {
  id: number;
};

const COLLECTION_NAME = "tmp_produto_copyright";

export async function getAllProdutoCopyrights(
  page: number = 1,
  limit: number = 25,
) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const skip = (page - 1) * limit;
    const { client, clientdb } = await TMongo.connectToDatabase();

    const [produtos, total] = await Promise.all([
      clientdb
        .collection(COLLECTION_NAME)
        .find({ id_tenant: user.id_tenant })
        .skip(skip)
        .limit(limit)
        .toArray(),
      clientdb
        .collection(COLLECTION_NAME)
        .countDocuments({ id_tenant: user.id_tenant }),
    ]);

    await TMongo.mongoDisconnect(client);

    const serializedProdutos = serializeMongoData(produtos);
    return {
      success: true,
      data: serializedProdutos,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error: any) {
    console.error("Erro ao buscar todos os produtos copyright:", error);
    return {
      success: false,
      error:
        error.message || "Não foi possível carregar os produtos copyright.",
    };
  }
}

export async function getProdutoCopyrightById(id: number) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produto = await clientdb.collection(COLLECTION_NAME).findOne({
      id: Number(id),
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    });
    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return { success: false, error: "Produto copyright não encontrado." };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto copyright com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto copyright.",
    };
  }
}

export async function getProdutoCopyrightBySku(sku: string) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produto = await clientdb.collection(COLLECTION_NAME).findOne({
      sku,
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    });
    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return {
        success: false,
        error: "Produto copyright não encontrado pelo SKU.",
      };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto copyright com SKU ${sku}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto copyright.",
    };
  }
}

export async function getProdutoCopyrightByGtin(gtin: string) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produto = await clientdb.collection(COLLECTION_NAME).findOne({
      gtinEan: gtin,
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    });
    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return {
        success: false,
        error: "Produto copyright não encontrado pelo GTIN.",
      };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto copyright com GTIN ${gtin}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto copyright.",
    };
  }
}

export async function createProdutoCopyright(
  data: ProdutoCopyrightCreateInput,
) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    const row = await gen_id("produto_copyright");
    if (!row.success || !row.data) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        error: "Falha ao gerar ID para o produto copyright.",
      };
    }

    const newId = parseInt(String(row.data), 10);
    const now = new Date();

    const produtoData: ProdutoCopyright = {
      ...data,
      id: newId,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa || 0,
      created_at: now,
      updated_at: now,
      release: data.release ?? null,
      sku: data.sku || "",
      gtinEan: data.gtinEan || "",
      descricaoTitulo: data.descricaoTitulo || "",
      listaPreco: data.listaPreco || "",
      precoOporto: data.precoOporto || 0,
      precoDistribuidora: data.precoDistribuidora || 0,
      ncm: data.ncm || "",
      origem: data.origem || "",
      precoCusto: data.precoCusto || 0,
      fornecedor: data.fornecedor || "",
      categoriaProduto: data.categoriaProduto || "",
      marca: data.marca || "",
      nivelRoyalty: data.nivelRoyalty || "",
      percentual: data.percentual || 0,
      tipo: data.tipo || "",
      numeroDiscos: data.numeroDiscos || 0,
      numeroFaixas: data.numeroFaixas || 0,
      gravadora: data.gravadora || "",
      peso: data.peso || 0,
      importadoEm: data.importadoEm || now,
      loteImportacao: data.loteImportacao || "",
      parceiro: data.parceiro || "",
    };

    const result = await clientdb
      .collection(COLLECTION_NAME)
      .insertOne(produtoData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar produto copyright." };
    }

    revalidatePath("/produto-copyright");
    return {
      success: true,
      message: "Produto copyright criado com sucesso.",
      id: newId,
    };
  } catch (error: any) {
    console.error("Erro ao criar produto copyright:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar o produto copyright.",
    };
  }
}

export async function updateProdutoCopyright(
  data: ProdutoCopyrightUpdateInput,
) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection(COLLECTION_NAME).updateOne(
      { id: Number(id), id_tenant: user.id_tenant },
      {
        $set: {
          ...updateFields,
          updated_at: new Date(),
        },
      },
    );
    await TMongo.mongoDisconnect(client);

    if (result.matchedCount === 0) {
      return {
        success: false,
        error:
          "Produto copyright não encontrado ou não pertence ao seu tenant.",
      };
    }
    if (result.modifiedCount === 0) {
      return { success: false, message: "Nenhuma alteração detectada." };
    }

    revalidatePath("/produto-copyright");
    revalidatePath(`/produto-copyright/view/${id}`);
    revalidatePath(`/produto-copyright/edit/${id}`);
    return {
      success: true,
      message: "Produto copyright atualizado com sucesso.",
    };
  } catch (error: any) {
    console.error(
      `Erro ao atualizar produto copyright com ID ${data.id}:`,
      error,
    );
    return {
      success: false,
      error: error.message || "Não foi possível atualizar o produto copyright.",
    };
  }
}

export async function deleteProdutoCopyright(id: number) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb
      .collection(COLLECTION_NAME)
      .deleteOne({ id: Number(id), id_tenant: user.id_tenant });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error:
          "Produto copyright não encontrado ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/produto-copyright");
    return {
      success: true,
      message: "Produto copyright excluído com sucesso.",
    };
  } catch (error: any) {
    console.error(`Erro ao excluir produto copyright com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir o produto copyright.",
    };
  }
}

export async function getAllProdutoCopyrightsSemPaginacao() {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produtos = await clientdb
      .collection(COLLECTION_NAME)
      .find({ id_tenant: user.id_tenant })
      .toArray();
    await TMongo.mongoDisconnect(client);

    const serializedProdutos = serializeMongoData(produtos);
    return { success: true, data: serializedProdutos };
  } catch (error: any) {
    console.error("Erro ao buscar todos os produtos copyright:", error);
    return {
      success: false,
      error:
        error.message || "Não foi possível carregar os produtos copyright.",
    };
  }
}
