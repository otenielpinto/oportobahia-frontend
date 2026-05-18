export interface NotaFiscalCliente {
  nome: string;
  tipo_pessoa: string;
  cpf_cnpj: string;
  ie: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  fone: string;
  email: string;
}

export interface NotaFiscalItemProd {
  cProd: string;
  cEAN: string;
  xProd: string;
  NCM: string;
  CFOP: string;
  uCom: string;
  qCom: string;
  vUnCom: string;
  vProd: string;
}

export interface NotaFiscalItem {
  prod: NotaFiscalItemProd;
  imposto: Record<string, unknown>;
}

export interface NotaFiscalICMSTot {
  vBC: string;
  vICMS: string;
  vICMSDeson: string;
  vFCPUFDest: string;
  vICMSUFDest: string;
  vICMSUFRemet: string;
  vFCP: string;
  vBCST: string;
  vST: string;
  vFCPST: string;
  vFCPSTRet: string;
  vProd: string;
  vFrete: string;
  vSeg: string;
  vDesc: string;
  vII: string;
  vIPI: string;
  vIPIDevol: string;
  vPIS: string;
  vCOFINS: string;
  vOutro: string;
  vNF: string;
  vTotTrib: string;
}

export interface NotaFiscalListRow {
  _id: string;
  chave_acesso: string;
  numero: string;
  serie: string;
  data_emissao: string;
  nome: string;
  natOp: string;
  valor_produtos: string;
  valor_frete: string;
  valor: string;
  descricao_situacao: string;
  tipo: string;
  situacao: string;
}

export interface NotaFiscalDetail extends NotaFiscalListRow {
  cliente: NotaFiscalCliente;
  itens: NotaFiscalItem[];
  ICMSTot: NotaFiscalICMSTot;
  transportador: { nome: string };
  endereco_entrega: Record<string, string>;
  data_movto: string;
  tipoVenda: string;
}

export interface NotaFiscalGlobalTotals {
  valor_produtos: number;
  valor_frete: number;
  valor: number;
}

export interface NotaFiscalMetadata {
  _id: null;
  total: number;
  valor_produtos: number;
  valor_frete: number;
  valor: number;
}

export interface NotaFiscalFacetResponse {
  metadata: NotaFiscalMetadata[];
  data: NotaFiscalListRow[];
}

export interface NotaFiscalPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface NotaFiscalFilter {
  dateFrom?: Date;
  dateTo?: Date;
  status?: string;
  tipo?: "E" | "S";
  natOp?: string;
  numero?: string;
  page: number;
  limit: number;
}

export interface NotaFiscalListResponse {
  data: NotaFiscalListRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  globalTotals: NotaFiscalGlobalTotals;
}
