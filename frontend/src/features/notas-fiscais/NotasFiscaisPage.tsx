import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useClientes,
  useNotasFiscais,
  useCriarNotaFiscal,
  useAtualizarNotaFiscal,
  useExcluirNotaFiscal,
  useAlterarStatusPagamento,
  useUploadAnexo,
  useExcluirAnexo,
  useExtrato,
} from '../../hooks/queries';
import { notaFiscalApi } from '../../api';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils';
import type { NotaFiscalResponse } from '../../types';
import toast from 'react-hot-toast';

const schema = z.object({
  numeroNota: z.string().min(1, 'Número é obrigatório').max(50),
  dataEmissao: z.string().min(1, 'Data de emissão é obrigatória'),
  prazoPagamento: z.string().min(1, 'Prazo de pagamento é obrigatório'),
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
});
type FormData = z.infer<typeof schema>;

export default function NotasFiscaisPage() {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const [clienteId, setClienteId] = useState<number | null>(null);
  const { data: notas, isLoading: loadingNotas } = useNotasFiscais(clienteId);
  const { data: extrato } = useExtrato(clienteId);

  const criar = useCriarNotaFiscal();
  const atualizar = useAtualizarNotaFiscal();
  const excluir = useExcluirNotaFiscal();
  const alterarStatus = useAlterarStatusPagamento();
  const uploadAnexo = useUploadAnexo();
  const excluirAnexo = useExcluirAnexo();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NotaFiscalResponse | null>(null);
  const [deleting, setDeleting] = useState<NotaFiscalResponse | null>(null);
  const [anexoModal, setAnexoModal] = useState<NotaFiscalResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openCreate = () => {
    reset({ numeroNota: '', dataEmissao: '', prazoPagamento: '', valor: 0 });
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (n: NotaFiscalResponse) => {
    reset({
      numeroNota: n.numeroNota,
      dataEmissao: n.dataEmissao,
      prazoPagamento: n.prazoPagamento,
      valor: n.valor,
    });
    setEditing(n);
    setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      numeroNota: data.numeroNota,
      dataEmissao: data.dataEmissao,
      prazoPagamento: data.prazoPagamento,
      valor: data.valor,
    };

    if (editing) {
      atualizar.mutate(
        { id: editing.id, data: payload },
        { onSuccess: () => setModalOpen(false) }
      );
    } else {
      criar.mutate(
        { clienteId: clienteId!, data: payload },
        { onSuccess: () => setModalOpen(false) }
      );
    }
  };

  const handleDownload = async (n: NotaFiscalResponse) => {
    try {
      const { data, filename } = await notaFiscalApi.downloadAnexo(n.id);
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error('Erro ao baixar anexo');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anexoModal || !selectedFile) return;

    uploadAnexo.mutate(
      { id: anexoModal.id, arquivo: selectedFile },
      {
        onSuccess: () => {
          setAnexoModal(null);
          setSelectedFile(null);
        },
      }
    );
  };

  const saldo = extrato?.saldoAtual ?? 0;

  if (loadingClientes) return <PageLoader />;

  return (
    <PageContainer title="Notas Fiscais" subtitle="Gestão de notas fiscais emitidas">
      {/* Seleção de Cliente */}
      <Card className="mb-4">
        <CardContent className="flex items-center gap-4">
          <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
            Cliente:
          </label>
          <select
            className="flex-1 px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
            value={clienteId ?? ''}
            onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Selecione um cliente</option>
            {clientes?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>

          {clienteId && (
            <div
              className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                saldo < 0
                  ? 'border-danger/30 bg-danger-light text-danger'
                  : saldo > 0
                  ? 'border-accent/30 bg-accent-light text-accent'
                  : 'border-border bg-surface text-text-secondary'
              }`}
            >
              Saldo: {formatCurrency(saldo)}
              <span className="ml-1 text-xs font-normal opacity-70">
                {saldo < 0 ? '(débito)' : saldo > 0 ? '(crédito)' : '(conciliado)'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {!clienteId ? (
        <Card>
          <EmptyState
            title="Selecione um cliente"
            description="Escolha um cliente acima para visualizar ou emitir notas fiscais"
          />
        </Card>
      ) : loadingNotas ? (
        <PageLoader />
      ) : (
        <Card>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm text-text-secondary">{notas?.length ?? 0} nota(s) fiscal(is)</span>
            <Button size="sm" onClick={openCreate}>
              + Nova Nota Fiscal
            </Button>
          </div>
          <CardContent className="p-0">
            {!notas?.length ? (
              <EmptyState
                title="Nenhuma nota fiscal cadastrada"
                description="Cadastre a primeira nota fiscal deste cliente"
              />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-medium">Nº Nota</th>
                    <th className="text-left px-5 py-3 font-medium">Emissão</th>
                    <th className="text-left px-5 py-3 font-medium">Prazo Pagamento</th>
                    <th className="text-right px-5 py-3 font-medium">Valor</th>
                    <th className="text-center px-5 py-3 font-medium">Status Pagamento</th>
                    <th className="text-center px-5 py-3 font-medium">Anexo</th>
                    <th className="text-right px-5 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {notas.map((n) => (
                    <tr key={n.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3 text-sm font-medium text-text-primary">
                        {n.numeroNota}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        {formatDate(n.dataEmissao)}
                      </td>
                      <td className="px-5 py-3 text-sm text-text-secondary">
                        {formatDate(n.prazoPagamento)}
                      </td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">
                        {formatCurrency(n.valor)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <button
                          className="cursor-pointer"
                          title="Clique para alternar PAGA / NÃO PAGA"
                          onClick={() =>
                            alterarStatus.mutate({
                              id: n.id,
                              data: {
                                statusPagamento:
                                  n.statusPagamento === 'PAGA' ? 'NAO_PAGA' : 'PAGA',
                              },
                            })
                          }
                        >
                          {n.statusPagamento === 'PAGA' && (
                            <Badge variant="primary">PAGA</Badge>
                          )}
                          {n.statusPagamento === 'NAO_PAGA' && (
                            <Badge variant="muted">NÃO PAGA</Badge>
                          )}
                          {n.statusPagamento === 'VENCIDA' && (
                            <Badge variant="danger">VENCIDA</Badge>
                          )}
                        </button>
                      </td>
                      <td className="px-5 py-3 text-center">
                        {n.possuiAnexo ? (
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Baixar anexo"
                              onClick={() => handleDownload(n)}
                            >
                              📎 Download
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Remover anexo"
                              className="text-danger hover:text-danger px-1.5"
                              onClick={() => excluirAnexo.mutate(n.id)}
                            >
                              ✕
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setAnexoModal(n)}
                          >
                            + Anexo
                          </Button>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(n)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleting(n)}
                            className="text-danger hover:text-danger"
                          >
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal Cadastro/Edição */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Nota Fiscal' : 'Nova Nota Fiscal'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            id="numeroNota"
            label="Número da Nota *"
            {...register('numeroNota')}
            error={errors.numeroNota?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="dataEmissao"
              label="Data de Emissão *"
              type="date"
              {...register('dataEmissao')}
              error={errors.dataEmissao?.message}
            />
            <Input
              id="prazoPagamento"
              label="Prazo de Pagamento *"
              type="date"
              {...register('prazoPagamento')}
              error={errors.prazoPagamento?.message}
            />
          </div>
          <Input
            id="valor"
            label="Valor (R$) *"
            type="number"
            step="0.01"
            min="0.01"
            {...register('valor')}
            error={errors.valor?.message}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={criar.isPending || atualizar.isPending}>
              {editing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Upload Anexo */}
      <Modal
        open={!!anexoModal}
        onClose={() => {
          setAnexoModal(null);
          setSelectedFile(null);
        }}
        title={`Anexo da Nota NF ${anexoModal?.numeroNota ?? ''}`}
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div
            className="border-2 border-dashed border-border hover:border-primary/50 transition-colors rounded-xl p-6 text-center cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
            }}
          >
            <input
              type="file"
              id="anexoFile"
              className="hidden"
              accept=".pdf,.xml,image/*"
              onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
            />
            <label htmlFor="anexoFile" className="cursor-pointer">
              <p className="text-sm font-medium text-text-primary mb-1">
                {selectedFile ? selectedFile.name : 'Arraste o arquivo ou clique para selecionar'}
              </p>
              <p className="text-xs text-text-muted">PDF, XML ou imagens (máx. 10MB)</p>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setAnexoModal(null);
                setSelectedFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={!selectedFile} loading={uploadAnexo.isPending}>
              Enviar Anexo
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmação de exclusão */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() =>
          deleting &&
          excluir.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
        }
        title="Excluir nota fiscal"
        message="A conciliação do cliente será recalculada automaticamente."
        loading={excluir.isPending}
      />
    </PageContainer>
  );
}
