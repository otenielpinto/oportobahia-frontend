/**
 * User type definition
 */
export interface Usuario {
  id?: string;
  email: string;
  password: string;
  name?: string;
  isAdmin?: number | 0 | 1;
  active?: number | 0 | 1;
  emp_acesso?: Number[];
  id_empresa?: Number;
  id_tenant?: Number;
  codigo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User response type for database operations
 */
export interface UsuarioResponse {
  success: boolean;
  message: string;
  data?: Usuario | Usuario[] | null;
  error?: string;
}

/**
 * User form data type for create/update operations
 */
export interface UsuarioFormData {
  id?: string;
  name?: string;
  email: string;
  password?: string;
  active?: number | 0 | 1;
  isAdmin?: number | 0 | 1;
  emp_acesso?: Number[];
  id_tenant?: Number;
  id_empresa?: Number;
  codigo?: string;
}