// Tipos para importação de produtos royalties via Excel

export const EXCEL_REQUIRED_COLUMNS = [
  "SKU",
  "GTIN/EAN",
  "Descricao/Titulo",
  "Lista de Preco",
  "Preco Oporto",
  "Preco Distribuidora",
  "NCM",
  "Origem",
  "Preco de Custo",
  "Fornecedor",
  "Categoria Produto",
  "Marca",
  "Nivel Royalty",
  "Percentual",
  "Tipo",
  "Numero Discos",
  "Numero Faixas",
  "Gravadora",
  "Peso",
  "Custo Operativo",
  "Royalty Minimo Garantido (Dolar)",
  "Royalty Minimo Garantido (Real)",
] as const;

// Colunas opcionais que serão lidas se presentes na planilha
export const EXCEL_OPTIONAL_COLUMNS = [
  "Parceiro",
] as const;

export type ExcelColumnName = (typeof EXCEL_REQUIRED_COLUMNS)[number];

// Mapeamento de colunas do Excel para campos do banco
export const COLUMN_TO_FIELD: Record<ExcelColumnName, string> = {
  SKU: "sku",
  "GTIN/EAN": "gtinEan",
  "Descricao/Titulo": "descricaoTitulo",
  "Lista de Preco": "listaPreco",
  "Preco Oporto": "precoOporto",
  "Preco Distribuidora": "precoDistribuidora",
  NCM: "ncm",
  Origem: "origem",
  "Preco de Custo": "precoCusto",
  Fornecedor: "fornecedor",
  "Categoria Produto": "categoriaProduto",
  Marca: "marca",
  "Nivel Royalty": "nivelRoyalty",
  Percentual: "percentual",
  Tipo: "tipo",
  "Numero Discos": "numeroDiscos",
  "Numero Faixas": "numeroFaixas",
  Gravadora: "gravadora",
  Peso: "peso",
  "Custo Operativo": "custo_operativo",
  "Royalty Minimo Garantido (Dolar)": "royalty_min_garantido_dolar",
  "Royalty Minimo Garantido (Real)": "royalty_min_garantido_reais",
};

export interface ProdutoRoyaltyExcel {
  sku: string;
  gtinEan: string;
  descricaoTitulo: string;
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
  // Campos opcionais da planilha (presentes somente em novos produtos)
  parceiro?: string;
  custo_operativo?: number;
  royalty_min_garantido_dolar?: number;
  royalty_min_garantido_reais?: number;
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
