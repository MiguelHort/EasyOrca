export interface Item {
  descricao: string;
  quantidade: number;
  valor: number;
}

export interface Orcamento {
  id: string | number;
  cliente: string;
  valor: number;
  data: string;
  status: string;
  cnpj?: string;
  endereco?: string;
  cidade?: string;
  telefone?: string;
  email?: string;
  itens?: Item[];
}

export interface User {
  companyName: string;
  companyImage: string;
}
