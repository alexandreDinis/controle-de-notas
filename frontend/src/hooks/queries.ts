import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteApi, servicoApi, notaFiscalApi, relatorioApi, empresaApi } from '../api';
import type {
  ClienteRequest, ServicoRequest, NotaFiscalRequest, StatusPagamentoRequest, EmpresaRequest,
} from '../types';
import toast from 'react-hot-toast';

// ============ EMPRESA ============
export function useEmpresa() {
  return useQuery({ queryKey: ['empresa'], queryFn: empresaApi.obter });
}

export function useSalvarEmpresa() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: EmpresaRequest) => empresaApi.salvarOuAtualizar(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresa'] });
      toast.success('Dados da empresa salvos com sucesso');
    },
  });
}

export function useUploadLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => empresaApi.uploadLogo(file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['empresa'] });
      toast.success('Logo da empresa atualizado');
    },
  });
}

// ============ CLIENTES ============
export function useClientes() {
  return useQuery({ queryKey: ['clientes'], queryFn: clienteApi.listar });
}

export function useCliente(id: number) {
  return useQuery({ queryKey: ['clientes', id], queryFn: () => clienteApi.buscar(id), enabled: !!id });
}

export function useCriarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ClienteRequest) => clienteApi.criar(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); toast.success('Cliente criado'); },
  });
}

export function useAtualizarCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClienteRequest }) => clienteApi.atualizar(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); toast.success('Cliente atualizado'); },
  });
}

export function useExcluirCliente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => clienteApi.excluir(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clientes'] }); toast.success('Cliente excluído'); },
  });
}

// ============ SERVIÇOS ============
export function useServicos(clienteId: number | null) {
  return useQuery({
    queryKey: ['servicos', clienteId],
    queryFn: () => servicoApi.listarPorCliente(clienteId!),
    enabled: !!clienteId,
  });
}

export function useCriarServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clienteId, data }: { clienteId: number; data: ServicoRequest }) =>
      servicoApi.criar(clienteId, data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['servicos', v.clienteId] });
      qc.invalidateQueries({ queryKey: ['extrato', v.clienteId] });
      qc.invalidateQueries({ queryKey: ['relatorios'] });
      toast.success('Serviço cadastrado');
    },
  });
}

export function useAtualizarServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ServicoRequest }) => servicoApi.atualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servicos'] });
      qc.invalidateQueries({ queryKey: ['extrato'] });
      qc.invalidateQueries({ queryKey: ['relatorios'] });
      toast.success('Serviço atualizado');
    },
  });
}

export function useExcluirServico() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => servicoApi.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['servicos'] });
      qc.invalidateQueries({ queryKey: ['extrato'] });
      qc.invalidateQueries({ queryKey: ['relatorios'] });
      toast.success('Serviço excluído');
    },
  });
}

// ============ NOTAS FISCAIS ============
export function useNotasFiscais(clienteId: number | null) {
  return useQuery({
    queryKey: ['notas-fiscais', clienteId],
    queryFn: () => notaFiscalApi.listarPorCliente(clienteId!),
    enabled: !!clienteId,
  });
}

export function useCriarNotaFiscal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clienteId, data }: { clienteId: number; data: NotaFiscalRequest }) =>
      notaFiscalApi.criar(clienteId, data),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais', v.clienteId] });
      qc.invalidateQueries({ queryKey: ['extrato', v.clienteId] });
      qc.invalidateQueries({ queryKey: ['relatorios'] });
      toast.success('Nota fiscal cadastrada');
    },
  });
}

export function useAtualizarNotaFiscal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NotaFiscalRequest }) => notaFiscalApi.atualizar(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais'] });
      qc.invalidateQueries({ queryKey: ['extrato'] });
      qc.invalidateQueries({ queryKey: ['relatorios'] });
      toast.success('Nota fiscal atualizada');
    },
  });
}

export function useExcluirNotaFiscal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notaFiscalApi.excluir(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais'] });
      qc.invalidateQueries({ queryKey: ['extrato'] });
      qc.invalidateQueries({ queryKey: ['relatorios'] });
      toast.success('Nota fiscal excluída');
    },
  });
}

export function useAlterarStatusPagamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: StatusPagamentoRequest }) =>
      notaFiscalApi.alterarStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Status de pagamento atualizado');
    },
  });
}

export function useUploadAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, arquivo }: { id: number; arquivo: File }) => notaFiscalApi.uploadAnexo(id, arquivo),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Anexo enviado');
    },
  });
}

export function useExcluirAnexo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notaFiscalApi.excluirAnexo(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notas-fiscais'] });
      toast.success('Anexo excluído');
    },
  });
}

// ============ RELATÓRIOS ============
export function useExtrato(clienteId: number | null) {
  return useQuery({
    queryKey: ['extrato', clienteId],
    queryFn: () => relatorioApi.extrato(clienteId!),
    enabled: !!clienteId,
  });
}

export function useNotasPorPeriodo(clienteId: number | null, inicio: string, fim: string, statusFiltro?: string | null) {
  return useQuery({
    queryKey: ['relatorios', 'notas-periodo', clienteId, inicio, fim, statusFiltro],
    queryFn: () => relatorioApi.notasPorPeriodo(clienteId!, inicio, fim, statusFiltro),
    enabled: !!clienteId && !!inicio && !!fim,
  });
}

export function useClientesComDebito() {
  return useQuery({ queryKey: ['relatorios', 'debito'], queryFn: relatorioApi.clientesComDebito });
}

export function useClientesComCredito() {
  return useQuery({ queryKey: ['relatorios', 'credito'], queryFn: relatorioApi.clientesComCredito });
}
