/**
 * Permissao type definition
 */
export interface Permissao {
  _id?: string;
  id: string;
  tipo: string;
  nome: string;
  id_empresa: number;
  id_tenant: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Permissao form data type for create/update operations
 */
export interface PermissaoFormData {
  tipo: string;
  nome: string;
}

// Type for create operations (omits auto-generated fields)
export type PermissaoCreateInput = Omit<
  PermissaoFormData,
  "id_tenant" | "id_empresa" // These will be injected by server action
>;

// Type for update operations
export type PermissaoUpdateInput = Partial<PermissaoCreateInput> & {
  id: string; // id is required for update
};

/**
 * Permissao filters for search/listing operations
 */
export interface PermissaoFilters {
  tipo?: string;
  nome?: string;
}

/**
 * Permissao response type for database operations
 */
export interface PermissaoResponse {
  success: boolean;
  message: string;
  data?: Permissao | Permissao[] | null;
  error?: string;
}
