"use server";

import { TMongo } from "@/infra/mongoClient";
import {
  ProdutoRoyalty,
  ProdutoRoyaltyFormData,
  ProdutoRoyaltyFilterOptions,
  ProdutoRoyaltyExportFilters,
} from "@/types/produtoRoyaltyTypes";
import { v4 as uuidv4 } from "uuid";
import { getUser } from "@/actions/sessionAction";
import { serializeMongoData } from "@/lib/serializeMongoData";
import { revalidatePath } from "next/cache";

type ProdutoRoyaltyCreateInput = Omit<ProdutoRoyaltyFormData, "id_tenant">;

type ProdutoRoyaltyUpdateInput = Partial<ProdutoRoyaltyCreateInput> & {
  id: string;
};

const COLLECTION_NAME = "tmp_produto_royalty";

export async function getAllProdutoRoyalties(
  page: number = 1,
  limit: number = 25,
  search: string = "",
) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const skip = (page - 1) * limit;
    const { client, clientdb } = await TMongo.connectToDatabase();

    // Create search query if search parameter exists
    const query = search
      ? {
          id_tenant: user.id_tenant,
          $or: [
            { sku: { $regex: search, $options: "i" } },
            { descricaoTitulo: { $regex: search, $options: "i" } },
            { gtinEan: { $regex: search, $options: "i" } },
            { marca: { $regex: search, $options: "i" } },
            { gravadora: { $regex: search, $options: "i" } },
            { categoriaProduto: { $regex: search, $options: "i" } },
          ],
        }
      : { id_tenant: user.id_tenant };

    const [produtos, total] = await Promise.all([
      clientdb
        .collection(COLLECTION_NAME)
        .find(query)
        .skip(skip)
        .limit(limit)
        .toArray(),
      clientdb
        .collection(COLLECTION_NAME)
        .countDocuments(query),
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
    console.error("Erro ao buscar todos os produtos royalty:", error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar os produtos royalty.",
    };
  }
}

export async function getProdutoRoyaltyById(id: string) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const produto = await clientdb.collection(COLLECTION_NAME).findOne({
      id,
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    });
    await TMongo.mongoDisconnect(client);

    if (!produto) {
      return { success: false, error: "Produto royalty não encontrado." };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto royalty com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto royalty.",
    };
  }
}

export async function getProdutoRoyaltyBySku(sku: string) {
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
        error: "Produto royalty não encontrado pelo SKU.",
      };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto royalty com SKU ${sku}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto royalty.",
    };
  }
}

export async function getProdutoRoyaltyByGtin(gtin: string) {
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
        error: "Produto royalty não encontrado pelo GTIN.",
      };
    }

    const serializedProduto = serializeMongoData(produto);
    return { success: true, data: serializedProduto };
  } catch (error: any) {
    console.error(`Erro ao buscar produto royalty com GTIN ${gtin}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar o produto royalty.",
    };
  }
}

export async function createProdutoRoyalty(data: ProdutoRoyaltyCreateInput) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Validação de unicidade para sku, gtinEan e descricaoTitulo
    const duplicates: string[] = [];
    
    if (data.sku && data.sku.trim()) {
      const existingSku = await clientdb.collection(COLLECTION_NAME).findOne({
        sku: data.sku,
        id_tenant: user.id_tenant,
      });
      if (existingSku) duplicates.push(`SKU "${data.sku}"`);
    }

    if (data.gtinEan && data.gtinEan.trim()) {
      const existingGtin = await clientdb.collection(COLLECTION_NAME).findOne({
        gtinEan: data.gtinEan,
        id_tenant: user.id_tenant,
      });
      if (existingGtin) duplicates.push(`GTIN/EAN "${data.gtinEan}"`);
    }

    if (data.descricaoTitulo && data.descricaoTitulo.trim()) {
      const existingTitulo = await clientdb.collection(COLLECTION_NAME).findOne({
        descricaoTitulo: data.descricaoTitulo,
        id_tenant: user.id_tenant,
      });
      if (existingTitulo) duplicates.push(`Título "${data.descricaoTitulo}"`);
    }

    if (duplicates.length > 0) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        error: `Já existe produto(s) com: ${duplicates.join(", ")}. Verifique os dados e tente novamente.`,
      };
    }

    const newId = uuidv4();
    const now = new Date();

    const produtoData: ProdutoRoyalty = {
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
      // Campos exclusivos de novos produtos
      parceiro: data.parceiro ?? "",
      custo_operativo: data.custo_operativo ?? 0,
      royalty_min_garantido_dolar: data.royalty_min_garantido_dolar ?? 0,
      royalty_min_garantido_reais: data.royalty_min_garantido_reais ?? 0,
    };

    const result = await clientdb
      .collection(COLLECTION_NAME)
      .insertOne(produtoData);
    await TMongo.mongoDisconnect(client);

    if (!result.acknowledged) {
      return { success: false, error: "Falha ao criar produto royalty." };
    }

    revalidatePath("/produto-royalty");
    return {
      success: true,
      message: "Produto royalty criado com sucesso.",
      id: newId,
    };
  } catch (error: any) {
    console.error("Erro ao criar produto royalty:", error);
    return {
      success: false,
      error: error.message || "Não foi possível criar o produto royalty.",
    };
  }
}

export async function updateProdutoRoyalty(data: ProdutoRoyaltyUpdateInput) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { id, ...updateFields } = data;

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Validação de unicidade para sku, gtinEan e descricaoTitulo (exclui registro atual)
    const duplicates: string[] = [];

    if (updateFields.sku && updateFields.sku.trim()) {
      const existingSku = await clientdb.collection(COLLECTION_NAME).findOne({
        sku: updateFields.sku,
        id_tenant: user.id_tenant,
        id: { $ne: id },
      });
      if (existingSku) duplicates.push(`SKU "${updateFields.sku}"`);
    }

    if (updateFields.gtinEan && updateFields.gtinEan.trim()) {
      const existingGtin = await clientdb.collection(COLLECTION_NAME).findOne({
        gtinEan: updateFields.gtinEan,
        id_tenant: user.id_tenant,
        id: { $ne: id },
      });
      if (existingGtin) duplicates.push(`GTIN/EAN "${updateFields.gtinEan}"`);
    }

    if (updateFields.descricaoTitulo && updateFields.descricaoTitulo.trim()) {
      const existingTitulo = await clientdb.collection(COLLECTION_NAME).findOne({
        descricaoTitulo: updateFields.descricaoTitulo,
        id_tenant: user.id_tenant,
        id: { $ne: id },
      });
      if (existingTitulo) duplicates.push(`Título "${updateFields.descricaoTitulo}"`);
    }

    if (duplicates.length > 0) {
      await TMongo.mongoDisconnect(client);
      return {
        success: false,
        error: `Já existe produto(s) com: ${duplicates.join(", ")}. Verifique os dados e tente novamente.`,
      };
    }

    const result = await clientdb.collection(COLLECTION_NAME).updateOne(
      { id, id_tenant: user.id_tenant },
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
        error: "Produto royalty não encontrado ou não pertence ao seu tenant.",
      };
    }
    if (result.modifiedCount === 0) {
      return { success: false, message: "Nenhuma alteração detectada." };
    }

    revalidatePath("/produto-royalty");
    revalidatePath(`/produto-royalty/view/${id}`);
    revalidatePath(`/produto-royalty/edit/${id}`);
    return {
      success: true,
      message: "Produto royalty atualizado com sucesso.",
    };
  } catch (error: any) {
    console.error(
      `Erro ao atualizar produto royalty com ID ${data.id}:`,
      error,
    );
    return {
      success: false,
      error: error.message || "Não foi possível atualizar o produto royalty.",
    };
  }
}

export async function deleteProdutoRoyalty(id: string) {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb
      .collection(COLLECTION_NAME)
      .deleteOne({ id, id_tenant: user.id_tenant });
    await TMongo.mongoDisconnect(client);

    if (result.deletedCount === 0) {
      return {
        success: false,
        error: "Produto royalty não encontrado ou não pertence ao seu tenant.",
      };
    }

    revalidatePath("/produto-royalty");
    return {
      success: true,
      message: "Produto royalty excluído com sucesso.",
    };
  } catch (error: any) {
    console.error(`Erro ao excluir produto royalty com ID ${id}:`, error);
    return {
      success: false,
      error: error.message || "Não foi possível excluir o produto royalty.",
    };
  }
}

export async function getAllProdutoRoyaltiesSemPaginacao() {
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
    console.error("Erro ao buscar todos os produtos royalty:", error);
    return {
      success: false,
      error: error.message || "Não foi possível carregar os produtos royalty.",
    };
  }
}

export async function getProdutoRoyaltyFilterOptions(): Promise<{
  success: boolean;
  data?: ProdutoRoyaltyFilterOptions;
  error?: string;
}> {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Usar $facet para obter todos os valores distintos em uma única query
    const filterOptions = await clientdb
      .collection(COLLECTION_NAME)
      .aggregate([
        { $match: { id_tenant: user.id_tenant } },
        {
          $facet: {
            listaPreco: [
              { $group: { _id: "$listaPreco" } },
              { $sort: { _id: 1 } },
            ],
            origem: [
              { $group: { _id: "$origem" } },
              { $sort: { _id: 1 } },
            ],
            categoriaProduto: [
              { $group: { _id: "$categoriaProduto" } },
              { $sort: { _id: 1 } },
            ],
            marca: [
              { $group: { _id: "$marca" } },
              { $sort: { _id: 1 } },
            ],
            nivelRoyalty: [
              { $group: { _id: "$nivelRoyalty" } },
              { $sort: { _id: 1 } },
            ],
            tipo: [
              { $group: { _id: "$tipo" } },
              { $sort: { _id: 1 } },
            ],
            gravadora: [
              { $group: { _id: "$gravadora" } },
              { $sort: { _id: 1 } },
            ],
            fornecedor: [
              { $group: { _id: "$fornecedor" } },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ])
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Extrair valores do resultado do $facet
    const result = filterOptions[0] || {};
    const extractedOptions: ProdutoRoyaltyFilterOptions = {
      listaPreco: result.listaPreco?.map((item: any) => item._id || "") || [],
      origem: result.origem?.map((item: any) => item._id || "") || [],
      categoriaProduto:
        result.categoriaProduto?.map((item: any) => item._id || "") || [],
      marca: result.marca?.map((item: any) => item._id || "") || [],
      nivelRoyalty: result.nivelRoyalty?.map((item: any) => item._id || "") || [],
      tipo: result.tipo?.map((item: any) => item._id || "") || [],
      gravadora: result.gravadora?.map((item: any) => item._id || "") || [],
      fornecedor: result.fornecedor?.map((item: any) => item._id || "") || [],
    };

    return { success: true, data: extractedOptions };
  } catch (error: any) {
    console.error("Erro ao buscar opções de filtro:", error);
    return {
      success: false,
      error:
        error.message || "Não foi possível carregar as opções de filtro.",
    };
  }
}

export async function exportProdutoRoyalty(
  filters: ProdutoRoyaltyExportFilters,
): Promise<{
  success: boolean;
  data?: ProdutoRoyalty[];
  error?: string;
  count?: number;
}> {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Construir query com filtros opcionais (AND combinados)
    const query: any = { id_tenant: user.id_tenant };

    if (filters.listaPreco) query.listaPreco = filters.listaPreco;
    if (filters.origem) query.origem = filters.origem;
    if (filters.categoriaProduto)
      query.categoriaProduto = filters.categoriaProduto;
    if (filters.marca) query.marca = filters.marca;
    if (filters.nivelRoyalty) query.nivelRoyalty = filters.nivelRoyalty;
    if (filters.tipo) query.tipo = filters.tipo;
    if (filters.gravadora) query.gravadora = filters.gravadora;
    if (filters.fornecedor) query.fornecedor = filters.fornecedor;

    const produtos = await clientdb
      .collection(COLLECTION_NAME)
      .find(query)
      .toArray();

    await TMongo.mongoDisconnect(client);

    // Serializar e excluir campos internos
    const serializedProdutos = serializeMongoData(produtos);
    const filteredData = serializedProdutos.map((produto: any) => {
      const { _id, id_empresa, id_tenant, loteImportacao, ...rest } = produto;
      return rest;
    });

    return {
      success: true,
      data: filteredData,
      count: filteredData.length,
    };
  } catch (error: any) {
    console.error("Erro ao exportar produtos royalty:", error);
    return {
      success: false,
      error:
        error.message || "Não foi possível exportar os produtos royalty.",
    };
  }
}
