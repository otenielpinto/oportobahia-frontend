// Tipos para produto autoral

export const COLLECTION_NAME = "tmp_produto_autoral";

export interface ProdutoAutoral {
  // Campos da tabela tmp_planilha_copyright (exceto gtinEanNumero)
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
  id: number;
  id_empresa: number;
  id_tenant: number;
  parceiro: string;
  created_at: Date;
  updated_at: Date;
}

export interface ProdutoAutoralFormData {
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
