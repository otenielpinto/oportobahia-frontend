"use server";

import { TMongo } from "@/infra/mongoClient";
import {
  ProdutoRoyalty,
  ProdutoRoyaltyFormData,
  ProdutoRoyaltyFilterOptions,
  ProdutoRoyaltyExportFilters,
  ProdutoRoyaltyOpcoes,
  OpcaoRoyaltyFonte,
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

    // Validação de unicidade para SKU e GTIN/EAN
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

    // Validação de unicidade para SKU e GTIN/EAN (exclui registro atual)
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

// Whitelist: o cliente nunca informa o nome da collection
const OPCOES_ROYALTY_COLLECTIONS = {
  origem: "tmp_royalty_origem",
  tipo: "tmp_royalty_tipo",
  categoriaProduto: "tmp_royalty_categoriaProduto",
  nivelRoyalty: "tmp_royalty_nivelRoyalty",
} as const;

export async function listarOpcoesProdutoRoyalty(): Promise<{
  success: boolean;
  data?: ProdutoRoyaltyOpcoes;
  error?: string;
}> {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const filtro = {
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    };

    const buscarNomes = (collection: string) =>
      clientdb
        .collection(collection)
        .find(filtro)
        .project({ nome: 1, _id: 0 })
        .sort({ nome: 1 })
        .toArray();

    const [origemDocs, tipoDocs, categoriaDocs, nivelDocs] = await Promise.all([
      buscarNomes(OPCOES_ROYALTY_COLLECTIONS.origem),
      buscarNomes(OPCOES_ROYALTY_COLLECTIONS.tipo),
      buscarNomes(OPCOES_ROYALTY_COLLECTIONS.categoriaProduto),
      buscarNomes(OPCOES_ROYALTY_COLLECTIONS.nivelRoyalty),
    ]);

    await TMongo.mongoDisconnect(client);

    const extrairNomes = (docs: unknown[]): string[] => {
      const nomes: unknown[] = serializeMongoData(docs).map(
        (doc: any) => doc.nome,
      );
      const validos = nomes.filter(
        (nome): nome is string => typeof nome === "string" && nome.trim() !== "",
      );
      return Array.from(new Set<string>(validos));
    };

    return {
      success: true,
      data: {
        origem: extrairNomes(origemDocs),
        tipo: extrairNomes(tipoDocs),
        categoriaProduto: extrairNomes(categoriaDocs),
        nivelRoyalty: extrairNomes(nivelDocs),
      },
    };
  } catch (error: any) {
    console.error("Erro ao carregar opções de produto royalty:", error);
    return {
      success: false,
      error:
        error.message || "Não foi possível carregar as opções de produto royalty.",
    };
  }
}

// Whitelist de fontes de busca: o cliente informa só a chave, nunca a collection
const FONTES_BUSCA_ROYALTY: Record<OpcaoRoyaltyFonte, string> = {
  listaPreco: "tmp_royalty_listaPreco",
  fornecedor: "tmp_royalty_fornecedor",
  marca: "tmp_royalty_marca",
  gravadora: "tmp_royalty_gravadora",
  parceiro: "tmp_royalty_parceiro",
};
const BUSCA_LIMITE_MAX = 100;
const BUSCA_TERMO_MAX = 100;

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Busca valores do campo `nome` da fonte informada, por trecho, sem duplicados.
 * Termo vazio retorna as primeiras opções em ordem alfabética.
 */
export async function buscarOpcoesProdutoRoyalty(
  fonte: OpcaoRoyaltyFonte,
  termo: string,
  limite: number = 5,
): Promise<{ success: boolean; data?: string[]; error?: string }> {
  try {
    const user: any = await getUser();
    if (!user || !user?.id_tenant) {
      return { success: false, error: "Não autorizado" };
    }

    const collection = FONTES_BUSCA_ROYALTY[fonte];
    if (!collection) {
      return { success: false, error: "Fonte de busca inválida." };
    }

    const limiteSeguro = Math.min(
      Math.max(Math.trunc(limite) || 5, 1),
      BUSCA_LIMITE_MAX,
    );
    const texto = termo.trim().slice(0, BUSCA_TERMO_MAX);

    const filtro: Record<string, unknown> = {
      id_tenant: user.id_tenant,
      ...(user.id_empresa && { id_empresa: user.id_empresa }),
    };
    if (texto) {
      filtro.nome = { $regex: escapeRegex(texto), $options: "i" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();
    const docs = await clientdb
      .collection(collection)
      .aggregate([
        { $match: filtro },
        { $group: { _id: "$nome" } },
        { $sort: { _id: 1 } },
        { $limit: limiteSeguro },
      ])
      .toArray();
    await TMongo.mongoDisconnect(client);

    const nomes = docs
      .map((doc) => doc._id)
      .filter(
        (nome): nome is string => typeof nome === "string" && nome.trim() !== "",
      );

    return { success: true, data: nomes };
  } catch (error: any) {
    console.error("Erro ao buscar opções de produto royalty:", error);
    return {
      success: false,
      error: error.message || "Não foi possível realizar a busca.",
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
