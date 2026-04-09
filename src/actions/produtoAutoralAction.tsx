"use server";

import { TMongo } from "@/infra/mongoClient";
import { ProdutoAutoral, ProdutoAutoralFormData } from "@/types/produtoAutoralTypes";
import { gen_id } from "@/actions/generatorAction";
import { getUser } from "@/actions/sessionAction";
import { serializeMongoData } from "@/lib/serializeMongoData";
import { revalidatePath } from "next/cache";

// Define types for create and update operations
type ProdutoAutoralCreateInput = Omit<
  ProdutoAutoralFormData,
  "id_tenant" // id_tenant will be injected by the server action
>;

type ProdutoAutoralUpdateInput = Partial<ProdutoAutoralCreateInput> & {
  id: number; // id is required for update
};

/**
 * getAllProdutoAutorais - Lista todos os produtos autorais com paginação
 */
export async function getAllProdutoAutorais(page: number = 1, limit: number = 25) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const skip = (page - 1) * limit;

    const { client, clientdb } = await TMongo.connectToDatabase();
    
    const [produtos, total] = await Promise.all([
      clientdb
        .collection("tmp_produto_autoral")
        .find({ id_tenant: user.id_tenant })
        .skip(skip)
        .limit(limit)
        .toArray(),
      clientdb
        .collection("tmp_produto_autoral")
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
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error("Erro ao buscar todos os produtos autorais:", error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar os produtos autorais.",
    };
  }
}

/**
 * getProdutoAutoralById - Busca produto autoral por ID
 */
export async function getProdutoAutoralById(id: number) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produto = await clientdb.collection("tmp_produto_autoral").findOne({
      id: Number(id),
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    });
    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return { success: false, error: "Produto autoral não encontrado." };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto autoral com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto autoral.",
    };
  }
}

/**
 * getProdutoAutoralBySku - Busca produto autoral por SKU
 */
export async function getProdutoAutoralBySku(sku: string) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produto = await clientdb.collection("tmp_produto_autoral").findOne({
      sku: sku,
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    });
    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return { success: false, error: "Produto autoral não encontrado pelo SKU." };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto autoral com SKU ${sku}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto autoral.",
    };
  }
}

/**
 * getProdutoAutoralByGtin - Busca produto autoral por GTIN
 */
export async function getProdutoAutoralByGtin(gtin: string) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produto = await clientdb.collection("tmp_produto_autoral").findOne({
      gtinEan: gtin,
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    });
    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return { success: false, error: "Produto autoral não encontrado pelo GTIN." };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto autoral com GTIN ${gtin}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto autoral.",
    };
  }
}

/**
 * createProdutoAutoral - Cria um novo produto autoral
 */
export async function createProdutoAutoral(data: ProdutoAutoralCreateInput) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    const row = await gen_id("produto_autoral");
    if (!row.success || !row.data) {
      await TMongo.mongoDisconnect(client);
      return { success: false, error: "Falha ao gerar ID para o produto autoral." };
    }
    const newId = parseInt(String(row.data));

    const now = new Date();
    const produtoData: ProdutoAutoral = {
      ...data,
      id: newId,
      id_tenant: user.id_tenant,
      id_empresa: user.id_empresa || 0,
      created_at: now,
      updated_at: now,
      // Fix TypeScript: ensure release is Date | null, not undefined
      release: data.release ?? null,
      // Ensure required fields
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

    const result = await clientdb.collection("tmp_produto_autoral").insertOne(produtoData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar produto autoral." };
    }

    revalidatePath("/produto-autoral");
    return { success: true, message: "Produto autoral criado com sucesso.", id: newId };
  } catch (error: any) {
    console.error("Erro ao criar produto autoral:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar o produto autoral.",
    };
  }
}

/**
 * updateProdutoAutoral - Atualiza um produto autoral existente
 */
export async function updateProdutoAutoral(data: ProdutoAutoralUpdateInput) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb.collection("tmp_produto_autoral").updateOne(
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
        error: "Produto autoral não encontrado ou não pertence ao seu tenant.",
      };
    }
    if (result.modifiedCount === 0) {
      return { success: false, message: "Nenhuma alteração detectada." };
    }

    revalidatePath("/produto-autoral");
    revalidatePath(`/produto-autoral/view/${id}`);
    revalidatePath(`/produto-autoral/edit/${id}`);
    return { success: true, message: "Produto autoral atualizado com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao atualizar produto autoral com ID ${data.id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível atualizar o produto autoral.",
    };
  }
}

/**
 * deleteProdutoAutoral - Remove um produto autoral
 */
export async function deleteProdutoAutoral(id: number) {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb
      .collection("tmp_produto_autoral")
      .deleteOne({ id: Number(id), id_tenant: user.id_tenant });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Produto autoral não encontrado ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/produto-autoral");
    return { success: true, message: "Produto autoral excluído com sucesso." };
  } catch (error: any) {
    console.error(`Erro ao excluir produto autoral com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir o produto autoral.",
    };
  }
}

/**
 * getAllProdutoAutoraisSemPaginacao - Lista todos os produtos autorais sem paginação
 */
export async function getAllProdutoAutoraisSemPaginacao() {
  try {
    let user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produtos = await clientdb
      .collection("tmp_produto_autoral")
      .find({ id_tenant: user.id_tenant })
      .toArray();
    await TMongo.mongoDisconnect(client);

    const serializedProdutos = serializeMongoData(produtos);
    return { success: true, data: serializedProdutos };
  } catch (error: any) {
    console.error("Erro ao buscar todos os produtos autorais:", error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar os produtos autorais.",
    };
  }
}