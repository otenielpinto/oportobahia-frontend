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
}

export interface CriarApuracaoRoyaltiesCabResponse {
  success: boolean;
  id?: string;
  error?: string;
}

const COLLECTION = "tmp_apuracao_royalties_cab";

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
