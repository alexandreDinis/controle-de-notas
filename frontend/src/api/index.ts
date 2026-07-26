import api from './client';
import type {
  ClienteRequest, ClienteResponse,
  ServicoRequest, ServicoResponse,
  NotaFiscalRequest, NotaFiscalResponse, StatusPagamentoRequest,
  ExtratoClienteResponse, SaldoClienteResponse, RelatorioNotasResponse,
  EmpresaRequest, EmpresaResponse,
} from '../types';

// === Empresa ===
export const empresaApi = {
  obter: () => api.get<EmpresaResponse>('/empresa').then(r => r.data),
  salvarOuAtualizar: (data: EmpresaRequest) => api.put<EmpresaResponse>('/empresa', data).then(r => r.data),
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post('/empresa/logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getLogoUrl: () => '/api/empresa/logo',
};

// === Clientes ===
export const clienteApi = {
  listar: () => api.get<ClienteResponse[]>('/clientes').then(r => r.data),
  buscar: (id: number) => api.get<ClienteResponse>(`/clientes/${id}`).then(r => r.data),
  criar: (data: ClienteRequest) => api.post<ClienteResponse>('/clientes', data).then(r => r.data),
  atualizar: (id: number, data: ClienteRequest) => api.put<ClienteResponse>(`/clientes/${id}`, data).then(r => r.data),
  excluir: (id: number) => api.delete(`/clientes/${id}`),
};

// === Serviços ===
export const servicoApi = {
  listarPorCliente: (clienteId: number) =>
    api.get<ServicoResponse[]>(`/clientes/${clienteId}/servicos`).then(r => r.data),
  buscar: (id: number) => api.get<ServicoResponse>(`/servicos/${id}`).then(r => r.data),
  criar: (clienteId: number, data: ServicoRequest) =>
    api.post<ServicoResponse>(`/clientes/${clienteId}/servicos`, data).then(r => r.data),
  atualizar: (id: number, data: ServicoRequest) =>
    api.put<ServicoResponse>(`/servicos/${id}`, data).then(r => r.data),
  excluir: (id: number) => api.delete(`/servicos/${id}`),
};

// === Notas Fiscais ===
export const notaFiscalApi = {
  listarPorCliente: (clienteId: number) =>
    api.get<NotaFiscalResponse[]>(`/clientes/${clienteId}/notas-fiscais`).then(r => r.data),
  buscar: (id: number) => api.get<NotaFiscalResponse>(`/notas-fiscais/${id}`).then(r => r.data),
  criar: (clienteId: number, data: NotaFiscalRequest) =>
    api.post<NotaFiscalResponse>(`/clientes/${clienteId}/notas-fiscais`, data).then(r => r.data),
  atualizar: (id: number, data: NotaFiscalRequest) =>
    api.put<NotaFiscalResponse>(`/notas-fiscais/${id}`, data).then(r => r.data),
  excluir: (id: number) => api.delete(`/notas-fiscais/${id}`),
  alterarStatus: (id: number, data: StatusPagamentoRequest) =>
    api.patch<NotaFiscalResponse>(`/notas-fiscais/${id}/status-pagamento`, data).then(r => r.data),
  uploadAnexo: (id: number, arquivo: File) => {
    const form = new FormData();
    form.append('arquivo', arquivo);
    return api.post(`/notas-fiscais/${id}/anexo`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  downloadAnexo: (id: number) =>
    api.get(`/notas-fiscais/${id}/anexo`, { responseType: 'blob' }).then(r => ({
      data: r.data as Blob,
      filename: r.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || 'anexo',
    })),
  excluirAnexo: (id: number) => api.delete(`/notas-fiscais/${id}/anexo`),
};

// === Relatórios ===
export const relatorioApi = {
  extrato: (clienteId: number) =>
    api.get<ExtratoClienteResponse>(`/clientes/${clienteId}/extrato`).then(r => r.data),
  notasPorPeriodo: (clienteId: number, inicio: string, fim: string) =>
    api.get<RelatorioNotasResponse>(`/clientes/${clienteId}/notas-fiscais/relatorio`, {
      params: { inicio, fim },
    }).then(r => r.data),
  clientesComDebito: () =>
    api.get<SaldoClienteResponse[]>('/relatorios/clientes-com-debito').then(r => r.data),
  clientesComCredito: () =>
    api.get<SaldoClienteResponse[]>('/relatorios/clientes-com-credito').then(r => r.data),
  downloadPdfCobranca: (clienteId: number, inicio: string, fim: string) =>
    api.get(`/clientes/${clienteId}/relatorio-cobranca/pdf`, {
      params: { inicio, fim },
      responseType: 'blob',
    }).then(r => ({
      data: r.data as Blob,
      filename: r.headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') || `cobranca-${clienteId}.pdf`,
    })),
};
