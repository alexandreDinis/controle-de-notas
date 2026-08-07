// Types mirroring backend DTOs exactly (com.oroboros.notafiscal.web.dto)

// === Empresa ===
export interface EmpresaRequest {
  nome?: string | null;
  documento?: string | null;
  chavePix?: string | null;
  banco?: string | null;
  agencia?: string | null;
  conta?: string | null;
}

export interface EmpresaResponse {
  id: number;
  nome: string | null;
  documento: string | null;
  chavePix: string | null;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  possuiLogo: boolean;
  criadoEm: string | null;
  atualizadoEm: string | null;
}

// === Cliente ===
export interface ClienteRequest {
  nome: string;
  telefone?: string | null;
  email?: string | null;
  documento?: string | null;
}

export interface ClienteResponse {
  id: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  documento: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

// === Serviço ===
export interface ServicoRequest {
  numeroOs: string;
  data: string;       // ISO date "YYYY-MM-DD"
  descricao: string;
  valor: number;
}

export interface ServicoResponse {
  id: number;
  clienteId: number;
  numeroOs: string;
  data: string;
  descricao: string;
  valor: number;
  criadoEm: string;
  atualizadoEm: string;
}

// === Nota Fiscal ===
export interface NotaFiscalRequest {
  numeroNota: string;
  dataEmissao: string;
  prazoPagamento: string;
  valor: number;
}

export interface NotaFiscalResponse {
  id: number;
  clienteId: number;
  numeroNota: string;
  dataEmissao: string;
  prazoPagamento: string;
  valor: number;
  statusPagamento: 'PAGA' | 'NAO_PAGA' | 'VENCIDA';
  possuiAnexo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

export interface StatusPagamentoRequest {
  statusPagamento: 'PAGA' | 'NAO_PAGA';
}

// === Vínculo ===
export interface VinculoResponse {
  id: number;
  servicoId: number;
  numeroOs: string;
  notaFiscalId: number;
  numeroNota: string;
  clienteId: number;
  valorVinculado: number;
}

// === Extrato ===
export interface ExtratoClienteResponse {
  clienteId: number;
  itens: ItemExtrato[];
  totalServicos: number;
  totalNotas: number;
  saldoAtual: number;
}

export interface ItemExtrato {
  tipo: 'SERVICO' | 'NOTA_FISCAL';
  id: number;
  numeroOs?: string | null;
  numeroNota?: string | null;
  data: string;
  descricao: string;
  valorServico: number | null;
  valorNota: number | null;
  statusPagamento?: 'PAGA' | 'NAO_PAGA' | 'VENCIDA' | null;
  prazoPagamento?: string | null;
}

// === Saldo ===
export interface SaldoClienteResponse {
  clienteId: number;
  nomeCliente: string;
  totalServicos: number;
  totalNotas: number;
  saldo: number;
}

// === Relatório Notas ===
export interface RelatorioNotasResponse {
  clienteId: number;
  inicio: string;
  fim: string;
  notas: NotaResumo[];
  totalNotas: number;
}

export interface NotaResumo {
  id: number;
  numeroNota: string;
  dataEmissao: string;
  prazoPagamento: string;
  valor: number;
  statusPagamento: string;
}

// === API Error ===
export interface ApiError {
  timestamp: string;
  status: number;
  erro: string;
  mensagem: string;
}
