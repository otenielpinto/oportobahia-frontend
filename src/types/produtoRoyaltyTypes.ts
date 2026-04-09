// Tipos para produto royalty

export const COLLECTION_NAME = "tmp_produto_royalty";

export interface ProdutoRoyalty {
  // Campos da tabela tmp_planilha_royalty (exceto gtinEanNumero)
  sku: string;
  gtinEan: string;
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

  // Campos adicionais obrigatórios
  id: string;
  id_empresa: number;
  id_tenant: number;
  parceiro: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProdutoRoyaltyFormData {
  // Campos editáveis do formulário (sem id, timestamps e tenant)
  sku?: string;
  gtinEan?: string;
  descricaoTitulo?: string;
  release?: Date | null;
  listaPreco?: string;
  precoOporto?: number;
  precoDistribuidora?: number;
  ncm?: string;
  origem?: string;
  precoCusto?: number;
  fornecedor?: string;
  categoriaProduto?: string;
  marca?: string;
  nivelRoyalty?: string;
  percentual?: number;
  tipo?: string;
  numeroDiscos?: number;
  numeroFaixas?: number;
  gravadora?: string;
  peso?: number;
  importadoEm?: Date;
  loteImportacao?: string;
  parceiro?: string;
}
