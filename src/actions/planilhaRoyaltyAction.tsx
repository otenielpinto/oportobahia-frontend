"use server";

import { TMongo } from "@/infra/mongoClient";
import { serializeMongoData } from "@/lib/serializeMongoData";
import { getUser } from "@/actions/sessionAction";
import {
  EXCEL_REQUIRED_COLUMNS,
  COLLECTION_NAME,
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  type ProdutoRoyaltyExcel,
  type ImportResult,
  type ValidationResult,
} from "@/types/planilhaRoyaltyTypes";
import { v4 as uuidv4 } from "uuid";

type ExcelCell = string | number | boolean | Date | null | undefined;

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

function parseDateFromText(value: string): Date | null {
  const normalized = value.trim();
  if (!normalized) return null;

  // dd/mm/yyyy ou dd-mm-yyyy
  const brMatch = normalized.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]);
    const year = Number(brMatch[3]);
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (
      candidate.getUTCFullYear() === year &&
      candidate.getUTCMonth() === month - 1 &&
      candidate.getUTCDate() === day
    ) {
      return candidate;
    }
  }

  // yyyy-mm-dd e variantes ISO
  const isoCandidate = new Date(normalized);
  return isValidDate(isoCandidate) ? isoCandidate : null;
}

function parseExcelDate(value: ExcelCell): Date | null {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    return isValidDate(value) ? value : null;
  }

  // Serial de data do Excel (base 1899-12-30)
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 0) return null;
    const excelEpochUtc = Date.UTC(1899, 11, 30);
    const utcMillis = excelEpochUtc + Math.round(value * 86400000);
    const candidate = new Date(utcMillis);
    return isValidDate(candidate) ? candidate : null;
  }

  if (typeof value === "string") {
    return parseDateFromText(value);
  }

  return null;
}

/**
 * Valida se as colunas do Excel contêm todas as colunas obrigatórias
 */
export async function validateExcelColumns(
  headers: string[],
): Promise<ValidationResult> {
  const normalizedHeaders = headers.map((h) => h.trim());
  const missingColumns = EXCEL_REQUIRED_COLUMNS.filter(
    (col) => !normalizedHeaders.includes(col),
  );

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    extraInfo:
      missingColumns.length > 0
        ? `Colunas ausentes: ${missingColumns.join(", ")}`
        : `Todas as ${EXCEL_REQUIRED_COLUMNS.length} colunas foram encontradas.`,
  };
}

/**
 * Valida o tamanho do arquivo
 */
export async function validateFileSize(
  fileSize: number,
): Promise<{ valid: boolean; message: string }> {
  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      message: `O arquivo excede o limite de ${MAX_FILE_SIZE_MB}MB. Tamanho atual: ${(fileSize / 1024 / 1024).toFixed(2)}MB.`,
    };
  }
  return { valid: true, message: "" };
}

/**
 * Converte uma linha do Excel (array de valores) para objeto tipado
 * Usa índice numérico para máxima performance (evita lookup por string)
 */
function mapRowToProduto(
  row: ExcelCell[],
  headerIndexMap: Map<string, number>,
  loteImportacao: string,
  idTenant: number,
  idEmpresa: number,
): { produto: ProdutoRoyaltyExcel | null; releaseError?: string } {
  const getStr = (col: string): string => {
    const idx = headerIndexMap.get(col);
    if (idx === undefined || idx >= row.length) return "";
    const val = row[idx];
    return val != null ? String(val).trim() : "";
  };

  const getNum = (col: string): number => {
    const idx = headerIndexMap.get(col);
    if (idx === undefined || idx >= row.length) return 0;
    const val = row[idx];
    if (typeof val === "number") return val;
    const parsed = Number(String(val ?? "0").replace(",", "."));
    return isNaN(parsed) ? 0 : parsed;
  };

  /**
   * Converte percentual: se o valor estiver entre 0 e 1 (formato decimal),
   * multiplica por 100. Caso contrário, retorna como está.
   * Ex: 0.36 → 36.00, 36 → 36
   */
  const getPercentual = (col: string): number => {
    const num = getNum(col);
    // Se o valor está entre 0 e 1, é um percentual decimal do Excel
    if (num > 0 && num < 1) {
      return num * 100;
    }
    // Caso contrário, retorna o valor como está
    return num;
  };

  const sku = getStr("SKU");
  if (!sku) return { produto: null }; // Linha sem SKU é ignorada

  const descricaoTitulo = getStr("Descrição/título");
  if (descricaoTitulo.length < 3) {
    return { produto: null }; // Ignora registros sem título válido
  }

  const releaseIndex = headerIndexMap.get("Release");
  const releaseRaw =
    releaseIndex !== undefined && releaseIndex < row.length
      ? row[releaseIndex]
      : null;
  const releaseDate = parseExcelDate(releaseRaw);

  const releaseError =
    releaseRaw != null && releaseRaw !== "" && !releaseDate
      ? `Release inválido: ${String(releaseRaw)}`
      : undefined;

  return {
    produto: {
      sku,
      gtinEan: getStr("GTIN/EAN"),
      descricaoTitulo,
      release: releaseDate,
      listaPreco: getStr("Lista de preço"),
      precoOporto: getNum("Preço Oporto"),
      precoDistribuidora: getNum("Preço Distribuidora"),
      ncm: getStr("NCM"),
      origem: getStr("Oigem"),
      precoCusto: getNum("Preço de Custo"),
      fornecedor: getStr("Fornecedor"),
      categoriaProduto: getStr("Categoria do produto"),
      marca: getStr("Marca"),
      nivelRoyalty: getStr("Nível de Royalty"),
      percentual: getPercentual("Percentual"),
      tipo: getStr("Tipo"),
      numeroDiscos: getNum("Número de Discos"),
      numeroFaixas: getNum("Número de Faixas"),
      gravadora: getStr("Gravadora"),
      peso: getNum("Peso"),
      importadoEm: new Date(),
      loteImportacao,
      id_tenant: idTenant,
      id_empresa: idEmpresa,
    },
    releaseError,
  };
}

/**
 * Importa dados de produtos royalties para o MongoDB
 * Processa em batches para máxima performance
 */
export async function importProdutoRoyalties(
  rows: ExcelCell[][],
  headers: string[],
): Promise<ImportResult> {
  const user = await getUser();
  const idTenant = Number(user?.id_tenant || 0);
  const idEmpresa = Number(user?.id_empresa || 0);

  if (!idTenant || !idEmpresa) {
    return {
      success: false,
      totalRows: rows.length,
      insertedRows: 0,
      errors: ["Usuário não autorizado para importação."],
      loteImportacao: "",
    };
  }

  const loteImportacao = uuidv4();
  const errors: string[] = [];
  let insertedRows = 0;

  // Construir mapa de índice das colunas (lookup O(1))
  const headerIndexMap = new Map<string, number>();
  headers.forEach((h, i) => headerIndexMap.set(h.trim(), i));

  // Mapear linhas para objetos, filtrando nulos
  const produtos: ProdutoRoyaltyExcel[] = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      const { produto, releaseError } = mapRowToProduto(
        rows[i],
        headerIndexMap,
        loteImportacao,
        idTenant,
        idEmpresa,
      );
      if (produto) {
        produtos.push(produto);
      }
      if (releaseError) {
        errors.push(`Linha ${i + 2}: ${releaseError}`);
      }
    } catch {
      errors.push(`Linha ${i + 2}: erro ao processar dados`);
    }
  }

  if (produtos.length === 0) {
    return {
      success: false,
      totalRows: rows.length,
      insertedRows: 0,
      errors: ["Nenhum registro válido encontrado no arquivo."],
      loteImportacao,
    };
  }

  // Inserir em batches de 5000 para performance
  const BATCH_SIZE = 5000;
  const { client, clientdb } = await TMongo.connectToDatabase();

  try {
    const collection = clientdb.collection(COLLECTION_NAME);

    for (let i = 0; i < produtos.length; i += BATCH_SIZE) {
      const batch = produtos.slice(i, i + BATCH_SIZE);
      try {
        const result = await collection.insertMany(batch, {
          ordered: false, // Continua inserindo mesmo com erros
        });
        insertedRows += result.insertedCount;
      } catch (batchError: any) {
        // ordered:false pode ter erros parciais
        if (batchError?.result?.insertedCount) {
          insertedRows += batchError.result.insertedCount;
        }
        errors.push(
          `Batch ${Math.floor(i / BATCH_SIZE) + 1}: ${batchError?.message || "Erro parcial na inserção"}`,
        );
      }
    }
  } catch (error: any) {
    errors.push(`Erro geral: ${error?.message || "Erro desconhecido"}`);
  } finally {
    await TMongo.mongoDisconnect(client);
  }

  return {
    success: insertedRows > 0,
    totalRows: rows.length,
    insertedRows,
    errors,
    loteImportacao,
  };
}

/**
 * Busca produtos royalties importados com paginação
 */
export async function getProdutoRoyalties(
  page = 1,
  limit = 50,
  search = "",
  loteImportacao?: string,
): Promise<{ data: any[]; total: number }> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const skip = (page - 1) * limit;

    const query: any = {};
    if (loteImportacao) {
      query.loteImportacao = loteImportacao;
    }
    if (search) {
      query.$or = [
        { sku: { $regex: search, $options: "i" } },
        { descricaoTitulo: { $regex: search, $options: "i" } },
        { gtinEan: { $regex: search, $options: "i" } },
        { fornecedor: { $regex: search, $options: "i" } },
        { marca: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      clientdb
        .collection(COLLECTION_NAME)
        .find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      clientdb.collection(COLLECTION_NAME).countDocuments(query),
    ]);

    await TMongo.mongoDisconnect(client);
    return { data: serializeMongoData(data), total };
  } catch (error) {
    console.error("Erro ao buscar produtos royalties:", error);
    throw error;
  }
}

/**
 * Remove todos os dados de um lote de importação
 */
export async function deleteProdutoRoyaltiesByLote(
  loteImportacao: string,
): Promise<{ deletedCount: number }> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const result = await clientdb
      .collection(COLLECTION_NAME)
      .deleteMany({ loteImportacao });
    await TMongo.mongoDisconnect(client);
    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Erro ao remover produtos royalties:", error);
    throw error;
  }
}

/**
 * Lista lotes de importação disponíveis
 */
export async function getLotesImportacao(): Promise<any[]> {
  try {
    const { client, clientdb } = await TMongo.connectToDatabase();
    const lotes = await clientdb
      .collection(COLLECTION_NAME)
      .aggregate([
        {
          $group: {
            _id: "$loteImportacao",
            totalRegistros: { $sum: 1 },
            dataImportacao: { $first: "$importadoEm" },
          },
        },
        { $sort: { dataImportacao: -1 } },
      ])
      .toArray();

    await TMongo.mongoDisconnect(client);
    return serializeMongoData(lotes);
  } catch (error) {
    console.error("Erro ao buscar lotes de importação:", error);
    throw error;
  }
}
