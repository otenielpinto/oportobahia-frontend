// Tipos para importação de produtos royalties via Excel

export const EXCEL_REQUIRED_COLUMNS = [
  "SKU",
  "GTIN/EAN",
  "GTIN/EAN - Número",
  "Descrição/título",
  "Release",
  "Lista de preço",
  "Preço Oporto",
  "Preço Distribuidora",
  "NCM",
  "Oigem",
  "Preço de Custo",
  "Fornecedor",
  "Categoria do produto",
  "Marca",
  "Nível de Royalty",
  "Percentual",
  "Tipo",
  "Número de Discos",
  "Número de Faixas",
  "Gravadora",
  "Peso",
] as const;

export type ExcelColumnName = (typeof EXCEL_REQUIRED_COLUMNS)[number];

// Mapeamento de colunas do Excel para campos do banco
export const COLUMN_TO_FIELD: Record<ExcelColumnName, string> = {
  SKU: "sku",
  "GTIN/EAN": "gtinEan",
  "GTIN/EAN - Número": "gtinEanNumero",
  "Descrição/título": "descricaoTitulo",
  Release: "release",
  "Lista de preço": "listaPreco",
  "Preço Oporto": "precoOporto",
  "Preço Distribuidora": "precoDistribuidora",
  NCM: "ncm",
  Oigem: "origem",
  "Preço de Custo": "precoCusto",
  Fornecedor: "fornecedor",
  "Categoria do produto": "categoriaProduto",
  Marca: "marca",
  "Nível de Royalty": "nivelRoyalty",
  Percentual: "percentual",
  Tipo: "tipo",
  "Número de Discos": "numeroDiscos",
  "Número de Faixas": "numeroFaixas",
  Gravadora: "gravadora",
  Peso: "peso",
};

export interface ProdutoRoyaltyExcel {
  sku: string;
  gtinEan: string;
  gtinEanNumero: string;
  descricaoTitulo: string;
  release: Date | null;
  listaPreco: string;
  precoOporto: number;
  precoDistribuidora: number;
  ncm: string;
  origem: string;
  precoCusto: number;
  fornecedor: string;
  categoriaProduto: string;
  marca: string;
  nivelRoyalty: string;
  percentual: number;
  tipo: string;
  numeroDiscos: number;
  numeroFaixas: number;
  gravadora: string;
  peso: number;
  importadoEm: Date;
  loteImportacao: string;
  id_tenant: number;
  id_empresa: number;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  insertedRows: number;
  errors: string[];
  loteImportacao: string;
}

export interface ValidationResult {
  isValid: boolean;
  missingColumns: string[];
  extraInfo?: string;
}

export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const COLLECTION_NAME = "tmp_planilha_royalty";
