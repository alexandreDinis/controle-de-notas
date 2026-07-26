import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useClientes, useCriarCliente, useAtualizarCliente, useExcluirCliente } from '../../hooks/queries';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { PageLoader } from '../../components/ui/Spinner';
import type { ClienteResponse } from '../../types';

const schema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(200),
  telefone: z.string().max(20).optional().or(z.literal('')),
  email: z.string().max(200).optional().or(z.literal('')),
  documento: z.string().max(20).optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

export default function ClientesPage() {
  const { data: clientes, isLoading } = useClientes();
  const criar = useCriarCliente();
  const atualizar = useAtualizarCliente();
  const excluir = useExcluirCliente();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClienteResponse | null>(null);
  const [deleting, setDeleting] = useState<ClienteResponse | null>(null);
  const [search, setSearch] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const openCreate = () => { reset({ nome: '', telefone: '', email: '', documento: '' }); setEditing(null); setModalOpen(true); };
  const openEdit = (c: ClienteResponse) => {
    reset({ nome: c.nome, telefone: c.telefone ?? '', email: c.email ?? '', documento: c.documento ?? '' });
    setEditing(c); setModalOpen(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = { nome: data.nome, telefone: data.telefone || null, email: data.email || null, documento: data.documento || null };
    if (editing) {
      atualizar.mutate({ id: editing.id, data: payload }, { onSuccess: () => setModalOpen(false) });
    } else {
      criar.mutate(payload, { onSuccess: () => setModalOpen(false) });
    }
  };

  const filtered = clientes?.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.documento?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  if (isLoading) return <PageLoader />;

  return (
    <PageContainer
      title="Clientes"
      subtitle={`${clientes?.length ?? 0} cadastrados`}
      action={<Button onClick={openCreate}>+ Novo Cliente</Button>}
    >
      <Card>
        <div className="px-5 py-3 border-b border-border">
          <Input placeholder="Buscar por nome, documento ou e-mail..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <CardContent className="p-0">
          {!filtered.length ? (
            <EmptyState title="Nenhum cliente encontrado" description={search ? 'Tente outro termo de busca' : 'Cadastre o primeiro cliente'} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                  <th className="text-left px-5 py-3 font-medium">Nome</th>
                  <th className="text-left px-5 py-3 font-medium">Documento</th>
                  <th className="text-left px-5 py-3 font-medium">Telefone</th>
                  <th className="text-left px-5 py-3 font-medium">E-mail</th>
                  <th className="text-right px-5 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-surface-hover transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-text-primary">{c.nome}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{c.documento || '—'}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{c.telefone || '—'}</td>
                    <td className="px-5 py-3 text-sm text-text-secondary">{c.email || '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Editar</Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleting(c)} className="text-danger hover:text-danger">Excluir</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal Create/Edit */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar Cliente' : 'Novo Cliente'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input id="nome" label="Nome *" {...register('nome')} error={errors.nome?.message} />
          <Input id="documento" label="Documento (CPF/CNPJ)" {...register('documento')} error={errors.documento?.message} />
          <div className="grid grid-cols-2 gap-4">
            <Input id="telefone" label="Telefone" {...register('telefone')} error={errors.telefone?.message} />
            <Input id="email" label="E-mail" {...register('email')} error={errors.email?.message} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={criar.isPending || atualizar.isPending}>
              {editing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={() => deleting && excluir.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
        title="Excluir cliente"
        message={`Deseja realmente excluir "${deleting?.nome}"? Serviços e notas fiscais vinculados também serão afetados.`}
        loading={excluir.isPending}
      />
    </PageContainer>
  );
}
