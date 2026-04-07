export interface Papel {
  _id?: string;
  id: number;
  nome: string;
  ativo: boolean;
  id_tenant: number;
  id_empresa: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PapelFormData {
  nome: string;
  ativo: boolean;
}

// Type for create operations (omits auto-generated fields)
export type PapelCreateInput = Omit<
  PapelFormData,
  "id_tenant" | "id_empresa" // These will be injected by server action
>;

// Type for update operations
export type PapelUpdateInput = Partial<PapelCreateInput> & {
  id: number; // id is required for update
};

export interface PapelFilters {
  nome?: string;
  ativo?: string;
}
