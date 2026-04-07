/**
 * PapelPermissao type definition
 */
export interface PapelPermissao {
  _id?: string;
  id: string;
  id_permissao: string;
  id_papel: number;
  id_empresa: number;
  id_tenant: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * PapelPermissao form data type for create/update operations
 */
export interface PapelPermissaoFormData {
  id_permissao: string;
  id_papel: number;
}

// Type for create operations (omits auto-generated fields)
export type PapelPermissaoCreateInput = Omit<
  PapelPermissaoFormData,
  "id_tenant" | "id_empresa" // These will be injected by server action
>;

// Type for update operations
export type PapelPermissaoUpdateInput = Partial<PapelPermissaoCreateInput> & {
  id: string; // id is required for update
};

/**
 * PapelPermissao filters for search/listing operations
 */
export interface PapelPermissaoFilters {
  id_permissao?: string;
  id_papel?: number;
}

/**
 * PapelPermissao response type for database operations
 */
export interface PapelPermissaoResponse {
  success: boolean;
  message: string;
  data?: PapelPermissao | PapelPermissao[] | null;
  error?: string;
}
