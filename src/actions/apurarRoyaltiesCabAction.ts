"use server";

import { randomUUID } from "crypto";
import { TMongo } from "@/infra/mongoClient";
import { getUser } from "@/actions/sessionAction";
import { serializeMongoData } from "@/lib/serializeMongoData";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ApuracaoRoyaltiesCab {
  _id: string;
  id: string; // UUID único
  id_tenant: number;
  id_empresa: number;
  dataInicial: string; // ISO
  dataFinal: string; // ISO
  cotacaoDollar: number;
  observacao?: string;
  gravadora?: string | null;
  status: "pendente" | "processando" | "completada" | "erro";
  totalMovimentos?: number;
  erroMessage?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface ApuracaoRoyaltiesCabListResponse {
  data: ApuracaoRoyaltiesCab[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CriarApuracaoRoyaltiesCabInput {
  dataInicial: Date;
  dataFinal: Date;
  cotacaoDollar: number;
  observacao?: string;
  gravadora?: string | null;
}

export interface CriarApuracaoRoyaltiesCabResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export interface ApuracaoRoyaltiesMovto {
  _id: string;
  id_royalty_cab: string;
  id_tenant: number;
  data_movto: string;
  clienteCpfCnpj?: string;
  clienteNome?: string;
  clienteMunicipio?: string;
  clienteUf?: string;
  natureza?: string;
  numeroNota?: string;
  serie?: string;
  dataEmissao?: string;
  itemCfop?: string;
  catalogo?: string;
  barraCode?: string;
  itemDescricao?: string;
  serieAlbum?: string;
  quantFaturada?: number;
  valorUnitLista?: number;
  totalLista?: number;
  valorUnitMercadoria?: number;
  valorMercadoria?: number;
  desconto?: number;
  percentualDesconto?: number;
  icms?: number;
  cofins?: number;
  pis?: number;
  ipi?: number;
  valorSemImpostos?: number;
  custoOperativo?: number;
  percentualCustoOperativo?: number;
  baseCalculoRoyalties?: number;
  nivelRoyalties?: string;
  percentualRoyalties?: number;
  valorRoyalties?: number;
  tipo?: string;
  numDiscos?: number;
  numFaixas?: number;
  limiteFaixas?: number;
  baseCalculoLista?: number;
  copyrightNormal?: number;
  percentual?: number;
  gravadora?: string;
}

export interface ExportarRoyaltiesMovtoResponse {
  success: boolean;
  data?: ApuracaoRoyaltiesMovto[];
  error?: string;
}

const COLLECTION = "tmp_apuracao_royalties_cab";
const COLLECTION_MOVTO = "tmp_apuracao_royalties_movto";

// ─── Actions ─────────────────────────────────────────────────────────────────

/**
 * Cria uma nova apuração de royalties
 */
export async function criarApuracaoRoyaltiesCab(
  input: CriarApuracaoRoyaltiesCabInput,
): Promise<CriarApuracaoRoyaltiesCabResponse> {
  try {
    const session = await getUser();
    if (!session) {
      return { success: false, error: "Não autenticado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    const now = new Date();

    // Ajusta para timezone BR (UTC-3) para que o MongoDB grave com +3h
    // new Date(2026, 2, 1) em servidor UTC → 2026-03-01T00:00:00Z
    // +3h → 2026-03-01T03:00:00Z (reflete meia-noite BR)
    const toBRTimezone = (d: Date) => new Date(d.getTime() + 3 * 60 * 60 * 1000);

    await clientdb.collection(COLLECTION).insertOne({
      id: randomUUID(),
      id_tenant: session.id_tenant,
      id_empresa: session.id_empresa,
      dataInicial: toBRTimezone(new Date(
        input.dataInicial.getFullYear(),
        input.dataInicial.getMonth(),
        input.dataInicial.getDate(),
      )),
      dataFinal: toBRTimezone(new Date(
        input.dataFinal.getFullYear(),
        input.dataFinal.getMonth(),
        input.dataFinal.getDate(),
      )),
      cotacaoDollar: input.cotacaoDollar,
      observacao: input.observacao || null,
      gravadora: input.gravadora ?? null,
      status: "pendente",
      totalMovimentos: 0,
      erroMessage: null,
      createdAt: now,
      updatedAt: now,
    });

    await TMongo.mongoDisconnect(client);

    revalidatePath("/relatorio/apuracao-royalties");

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar apuração de royalties:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro desconhecido ao criar apuração",
    };
  }
}

/**
 * Lista apurações de royalties com paginação
 */
export async function listarApuracoesRoyaltiesCab({
  page,
  limit,
}: {
  page: number;
  limit: number;
}): Promise<ApuracaoRoyaltiesCabListResponse> {
  try {
    const session = await getUser();
    if (!session) {
      return { data: [], total: 0, page, totalPages: 0 };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    const filter = {
      id_tenant: session.id_tenant,
      id_empresa: session.id_empresa,
    };

    const total = await clientdb
      .collection(COLLECTION)
      .countDocuments(filter);

    const records = await clientdb
      .collection(COLLECTION)
      .find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    await TMongo.mongoDisconnect(client);

    const serialized = serializeMongoData(records);

    const totalPages = Math.ceil(total / limit);

    return {
      data: serialized as ApuracaoRoyaltiesCab[],
      total,
      page,
      totalPages,
    };
  } catch (error) {
    console.error("Erro ao listar apurações de royalties:", error);
    return { data: [], total: 0, page, totalPages: 0 };
  }
}

/**
 * Exclui uma apuração de royalties e seus registros filhos
 */
export async function excluirApuracaoRoyaltiesCab(id: string): Promise<CriarApuracaoRoyaltiesCabResponse> {
  try {
    const session = await getUser();
    if (!session) {
      return { success: false, error: "Não autenticado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Busca pelo campo id (UUID string), não pelo _id do MongoDB
    const record = await clientdb
      .collection(COLLECTION)
      .findOne({ id, id_tenant: session.id_tenant, id_empresa: session.id_empresa });

    if (!record) {
      await TMongo.mongoDisconnect(client);
      return { success: false, error: "Apuração não encontrada" };
    }

    if (record.status === "processando") {
      await TMongo.mongoDisconnect(client);
      return { success: false, error: "Não é possível excluir apuração em processamento" };
    }

    // Exclui registros filhos da collection de movimentos
    await clientdb
      .collection("tmp_apuracao_royalties_movto")
      .deleteMany({ id_royalty_cab: id, id_tenant: session.id_tenant });

    // Exclui o registro principal pelo campo id (string)
    await clientdb
      .collection(COLLECTION)
      .deleteOne({ id });

    await TMongo.mongoDisconnect(client);

    revalidatePath("/relatorio/apuracao-royalties");

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir apuração de royalties:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Erro desconhecido ao excluir apuração",
    };
  }
}

/**
 * Exporta os movimentos de uma apuração de royalties para Excel
 */
export async function exportarRoyaltiesMovto(
  cabId: string,
): Promise<ExportarRoyaltiesMovtoResponse> {
  try {
    const session = await getUser();
    if (!session) {
      return { success: false, error: "Não autenticado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    // Busca o cabeçalho para obter o período
    const cab = await clientdb
      .collection(COLLECTION)
      .findOne({
        id: cabId,
        id_tenant: session.id_tenant,
        id_empresa: session.id_empresa,
      });

    if (!cab) {
      await TMongo.mongoDisconnect(client);
      return { success: false, error: "Apuração não encontrada" };
    }

    // Busca os movimentos (id_royalty_cab já garante dados exatos)
    const movtos = await clientdb
      .collection(COLLECTION_MOVTO)
      .find({
        id_royalty_cab: cabId,
      })
      .toArray();

    await TMongo.mongoDisconnect(client);

    const serialized = serializeMongoData(movtos) as ApuracaoRoyaltiesMovto[];

    return { success: true, data: serialized };
  } catch (error) {
    console.error("Erro ao exportar movimentos de royalties:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao exportar movimentos",
    };
  }
}

// ─── Gravadora ──────────────────────────────────────────────────────────────

export interface GravadoraListResponse {
  success: boolean;
  data?: string[];
  error?: string;
}

/**
 * Lista gravadoras disponíveis para o tenant do usuário autenticado
 */
export async function listarGravadoras(): Promise<GravadoraListResponse> {
  try {
    const session = await getUser();
    if (!session) {
      return { success: false, error: "Não autenticado" };
    }

    const { client, clientdb } = await TMongo.connectToDatabase();

    const records = await clientdb
      .collection("tmp_royalty_gravadora")
      .find({
        id_tenant: session.id_tenant,
        id_empresa: session.id_empresa,
      })
      .project({ nome: 1, _id: 0 })
      .sort({ nome: 1 })
      .toArray();

    await TMongo.mongoDisconnect(client);

    const serialized = serializeMongoData(records) as { nome: string }[];
    const gravadoras = serialized.map((r) => r.nome).filter(Boolean);

    return { success: true, data: gravadoras };
  } catch (error) {
    console.error("Erro ao carregar gravadoras:", error);
    return {
      success: false,
      error: "Erro ao carregar gravadoras",
    };
  }
}
