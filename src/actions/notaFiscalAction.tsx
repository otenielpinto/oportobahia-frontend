"use server";

import { ObjectId } from "mongodb";
import { getUser } from "@/actions/sessionAction";
import { TMongo } from "@/infra/mongoClient";
import { serializeMongoData } from "@/lib/serializeMongoData";
import {
  NotaFiscalFilter,
  NotaFiscalListResponse,
  NotaFiscalDetail,
  NotaFiscalListRow,
} from "@/types/notaFiscalTypes";

const COLLECTION = "nota_fiscal";

function getDefaultDateRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  return { start, end };
}

function buildMatchStage(
  idTenant: number,
  idEmpresa: number | undefined,
  filters: NotaFiscalFilter
) {
  const dateFrom = filters.dateFrom ?? getDefaultDateRange().start;
  const dateTo = filters.dateTo ?? getDefaultDateRange().end;

  const match: Record<string, unknown> = {
    id_tenant: idTenant,
    data_movto: {
      $gte: dateFrom,
      $lte: dateTo,
    },
  };

  // id_empresa is optional — not all documents have it
  if (idEmpresa) {
    match.id_empresa = idEmpresa;
  }

  if (filters.status) {
    match.descricao_situacao = filters.status;
  }

  if (filters.tipo) {
    match.tipo = filters.tipo;
  }

  if (filters.natOp) {
    match.natOp = { $regex: filters.natOp, $options: "i" };
  }

  if (filters.numero) {
    match.numero = { $regex: filters.numero, $options: "i" };
  }

  return match;
}

export async function getNotasFiscais(
  filters: NotaFiscalFilter
): Promise<NotaFiscalListResponse> {
  const session = await getUser();
  if (!session || !session.id_tenant) throw new Error("Não autorizado");
  const idTenant = Number(session.id_tenant);
  const idEmpresa = session.id_empresa ? Number(session.id_empresa) : undefined;

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const match = buildMatchStage(idTenant, idEmpresa, filters);
    const limit = filters.limit || 100;
    const page = filters.page || 1;
    const safeSkip = (page - 1) * limit;

    const pipeline = [
      { $match: match },
      {
        $facet: {
          metadata: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                valor_produtos: { $sum: { $toDouble: "$valor_produtos" } },
                valor_frete: { $sum: { $toDouble: "$valor_frete" } },
                valor: { $sum: { $toDouble: "$valor" } },
              },
            },
          ],
          data: [
            { $sort: { data_movto: -1 } },
            { $skip: safeSkip },
            { $limit: limit },
            {
              $project: {
                chave_acesso: 1,
                numero: 1,
                serie: 1,
                data_emissao: 1,
                nome: 1,
                natOp: 1,
                valor_produtos: 1,
                valor_frete: 1,
                valor: 1,
                descricao_situacao: 1,
                tipo: 1,
                situacao: 1,
              },
            },
          ],
        },
      },
    ];

    const result = await clientdb
      .collection(COLLECTION)
      .aggregate(pipeline)
      .toArray();

    const facetResult = serializeMongoData(result[0]) as {
      metadata: Array<{
        total: number;
        valor_produtos: number;
        valor_frete: number;
        valor: number;
      }>;
      data: NotaFiscalListRow[];
    };

    const metadata = facetResult.metadata?.[0] ?? {
      total: 0,
      valor_produtos: 0,
      valor_frete: 0,
      valor: 0,
    };

    return {
      data: facetResult.data ?? [],
      total: metadata.total,
      page,
      limit,
      totalPages: Math.ceil(metadata.total / limit),
      globalTotals: {
        valor_produtos: metadata.valor_produtos,
        valor_frete: metadata.valor_frete,
        valor: metadata.valor,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao buscar notas fiscais:", error);
    throw new Error(`Erro ao buscar notas fiscais: ${message}`);
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

export async function getNotaFiscalById(
  id: string
): Promise<NotaFiscalDetail | null> {
  const session = await getUser();
  if (!session || !session.id_tenant) throw new Error("Não autorizado");
  const idTenant = Number(session.id_tenant);
  const idEmpresa = session.id_empresa ? Number(session.id_empresa) : undefined;

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const query: Record<string, unknown> = {
      _id: new ObjectId(id),
      id_tenant: idTenant,
    };
    if (idEmpresa) {
      query.id_empresa = idEmpresa;
    }

    const data = await clientdb
      .collection(COLLECTION)
      .findOne(query);

    if (!data) return null;

    return serializeMongoData(data) as NotaFiscalDetail;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao buscar nota fiscal por ID:", error);
    throw new Error(`Erro ao buscar nota fiscal: ${message}`);
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

export async function getNatOpDistinct(): Promise<string[]> {
  const session = await getUser();
  if (!session || !session.id_tenant) throw new Error("Não autorizado");
  const idTenant = Number(session.id_tenant);
  const idEmpresa = session.id_empresa ? Number(session.id_empresa) : undefined;

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const query: Record<string, unknown> = { id_tenant: idTenant };
    if (idEmpresa) {
      query.id_empresa = idEmpresa;
    }
    const values = await clientdb.collection(COLLECTION).distinct("natOp", query);

    return values as string[];
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao buscar naturais de operação:", error);
    throw new Error(`Erro ao buscar naturais de operação: ${message}`);
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}

export async function getAllNotasFiscaisForExport(
  filters: Omit<NotaFiscalFilter, "page" | "limit">
): Promise<NotaFiscalListRow[]> {
  const session = await getUser();
  if (!session || !session.id_tenant) throw new Error("Não autorizado");
  const idTenant = Number(session.id_tenant);
  const idEmpresa = session.id_empresa ? Number(session.id_empresa) : undefined;

  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const match = buildMatchStage(idTenant, idEmpresa, {
      ...filters,
      page: 1,
      limit: 999999,
    });

    const data = await clientdb
      .collection(COLLECTION)
      .find(match)
      .project({
        chave_acesso: 1,
        numero: 1,
        serie: 1,
        data_emissao: 1,
        nome: 1,
        natOp: 1,
        valor_produtos: 1,
        valor_frete: 1,
        valor: 1,
        descricao_situacao: 1,
        tipo: 1,
        situacao: 1,
      })
      .sort({ data_movto: -1 })
      .toArray();

    return serializeMongoData(data) as NotaFiscalListRow[];
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Erro ao exportar notas fiscais:", error);
    throw new Error(`Erro ao exportar notas fiscais: ${message}`);
  } finally {
    await TMongo.mongoDisconnect(client);
  }
}
