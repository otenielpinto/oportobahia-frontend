export interface BankAccount {
  bankName: string;
  bankCode: string; // código do banco (3 dígitos)
  agency: string; // agência
  accountNumber: string; // número da conta
  accountDigit?: string; // dígito verificador
  accountType: string; // tipo da conta (corrente ou poupança)
  accountHolderName: string; // nome do titular da conta
  accountHolderDocument: string; // CPF ou CNPJ do titular da conta
  pixKey?: string; // chave PIX opcional
}

export interface Publisher {
  id: number;
  name: string;
  status: "active" | "inactive";
  cnpj?: string;
  account?: BankAccount;
}

export interface PublisherFilterInterface {
  search?: string;
  status?: "active" | "inactive";
  page: number;
  limit: number;
}

export interface PublisherResponse {
  data: Publisher[];
  total: number;
  page: number;
  limit: number;
}
