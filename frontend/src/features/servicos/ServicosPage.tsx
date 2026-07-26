import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClientes, useServicos, useCriarServico, useAtualizarServico, useExcluirServico, useExtrato } from '../../hooks/queries';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils';
import type { ServicoResponse } from '../../types';

const schema = z.object({
  numeroOs: z.string().min(1, 'Número da OS é obrigatório').max(50, 'Máximo 50 caracteres'),
  data: z.string().min(1, 'Data é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  valor: z.coerce.number().positive('Valor deve ser maior que zero'),
});
type FormData = z.infer<typeof schema>;

export default function ServicosPage() {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const [clienteId, setClienteId] = useState<number | null>(null);
  const { data: servicos, isLoading: loadingServicos } = useServicos(clienteId);
  const { data: extrato } = useExtrato(clienteId);
  const criar = useCriarServico();
  const atualizar = useAtualizarServico();
  const excluir = useExcluirServico();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServicoResponse | null>(null);
  const [deleting, setDeleting] = useState<ServicoResponse | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const openCreate = () => { reset({ numeroOs: '', data: '', descricao: '', valor: 0 }); setEditing(null); setModalOpen(true); };
  const openEdit = (s: ServicoResponse) => {
    reset({ numeroOs: s.numeroOs, data: s.data, descricao: s.descricao, valor: s.valor });
    setEditing(s); setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = { numeroOs: data.numeroOs, data: data.data, descricao: data.descricao, valor: data.valor };
    if (editing) {
      atualizar.mutate({ id: editing.id, data: payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      criar.mutate({ clienteId: clienteId!, data: payload }, { onSuccess: () => setModalOpen(false) });
    }
  };

  const saldo = extrato?.saldoAtual ?? 0;

  if (loadingClientes) return <PageLoader />;

  return (
    <PageContainer title="Serviços" subtitle="Serviços prestados por cliente">
      {/* Client Selector */}
      <Card className="mb-4">
        <CardContent className="flex items-center gap-4">
          <label className="text-sm font-medium text-text-secondary whitespace-nowrap">Cliente:</label>
          <select
            className="flex-1 px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
            value={clienteId ?? ''}
            onChange={e => setClienteId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Selecione um cliente</option>
            {clientes?.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>

          {clienteId && (
            <div className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
              saldo < 0
                ? 'border-danger/30 bg-danger-light text-danger'
                : saldo > 0
                  ? 'border-accent/30 bg-accent-light text-accent'
                  : 'border-border bg-surface text-text-secondary'
            }`}>
              Saldo: {formatCurrency(saldo)}
              <span className="ml-1 text-xs font-normal opacity-70">
                {saldo < 0 ? '(débito)' : saldo > 0 ? '(crédito)' : '(conciliado)'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {!clienteId ? (
        <Card><EmptyState title="Selecione um cliente" description="Escolha um cliente acima para ver seus serviços" /></Card>
      ) : loadingServicos ? <PageLoader /> : (
        <Card>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm text-text-secondary">{servicos?.length ?? 0} serviço(s)</span>
            <Button size="sm" onClick={openCreate}>+ Novo Serviço</Button>
          </div>
          <CardContent className="p-0">
            {!servicos?.length ? (
              <EmptyState title="Nenhum serviço cadastrado" description="Cadastre o primeiro serviço deste cliente" />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                    <th className="text-left px-5 py-3 font-medium">Nº OS</th>
                    <th className="text-left px-5 py-3 font-medium">Data</th>
                    <th className="text-left px-5 py-3 font-medium">Descrição</th>
                    <th className="text-right px-5 py-3 font-medium">Valor</th>
                    <th className="text-right px-5 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {servicos.map(s => (
                    <tr key={s.id} className="hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3 text-sm font-semibold font-mono text-primary">OS {s.numeroOs}</td>
                      <td className="px-5 py-3 text-sm text-text-secondary">{formatDate(s.data)}</td>
                      <td className="px-5 py-3 text-sm text-text-primary">{s.descricao}</td>
                      <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">{formatCurrency(s.valor)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>Editar</Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleting(s)} className="text-danger hover:text-danger">Excluir</Button>
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Serviço' : 'Novo Serviço'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="numeroOs" label="Número da OS *" placeholder="Ex: OS-2025-01" {...register('numeroOs')} error={errors.numeroOs?.message} />
          <Input id="data" label="Data *" type="date" {...register('data')} error={errors.data?.message} />
          <TextArea id="descricao" label="Descrição *" {...register('descricao')} error={errors.descricao?.message} />
          <Input id="valor" label="Valor (R$) *" type="number" step="0.01" min="0.01" {...register('valor')} error={errors.valor?.message} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={criar.isPending || atualizar.isPending}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting} onClose={() => setDeleting(null)}
        onConfirm={() => deleting && excluir.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="Excluir serviço" message="A conciliação do cliente será recalculada automaticamente."
        loading={excluir.isPending}
      />
    </PageContainer>
  );
}
