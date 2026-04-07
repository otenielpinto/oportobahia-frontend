export interface PapelUsuario {
  _id?: string;
  id: number;
  id_usuario: string;
  id_papel: number;
  id_empresa: number;
  id_tenant: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PapelUsuarioFormData {
  id_usuario: string;
  id_papel: number;
}

// Type for create operations (omits auto-generated fields)
export type PapelUsuarioCreateInput = PapelUsuarioFormData;

// Type for update operations
export type PapelUsuarioUpdateInput = Partial<PapelUsuarioCreateInput> & {
  id: number; // id is required for update
};

export interface PapelUsuarioFilters {
  id_usuario?: string;
  id_papel?: number;
}

// AIDEV-NOTE: multi-tenant-security; sempre incluir id_tenant e id_empresa em todas as operações
export interface PapelUsuarioResponse {
  success: boolean;
  message?: string;
  data?: PapelUsuario | PapelUsuario[] | null;
  error?: string;
}
