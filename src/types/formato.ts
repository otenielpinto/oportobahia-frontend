export interface Formato {
  id: number;
  name: string;
  limite_faixas: number;
  percentual_faixa: number;
  status: "active" | "inactive";
}

export interface FormatoFilterInterface {
  search?: string;
  status?: "active" | "inactive";
  page: number;
  limit: number;
}

export interface FormatoResponse {
  data: Formato[];
  total: number;
  page: number;
  limit: number;
}
