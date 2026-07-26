import { useState } from 'react';
import {
  useClientes,
  useNotasPorPeriodo,
  useClientesComDebito,
  useClientesComCredito,
} from '../../hooks/queries';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils';
import { Link } from 'react-router-dom';
import GerarPdfModal from '../../components/modals/GerarPdfModal';

export default function RelatoriosPage() {
  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const [clienteId, setClienteId] = useState<number | null>(null);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [buscarPeriodo, setBuscarPeriodo] = useState({ id: 0, inicio: '', fim: '' });
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const { data: relatorioNotas, isLoading: loadingNotas } = useNotasPorPeriodo(
    buscarPeriodo.id || null,
    buscarPeriodo.inicio,
    buscarPeriodo.fim
  );

  const { data: clientesDebito, isLoading: loadingDebito } = useClientesComDebito();
  const { data: clientesCredito, isLoading: loadingCredito } = useClientesComCredito();

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    if (clienteId && inicio && fim) {
      setBuscarPeriodo({ id: clienteId, inicio, fim });
    }
  };

  if (loadingClientes || loadingDebito || loadingCredito) return <PageLoader />;

  const clienteSelecionado = clientes?.find((c) => c.id === buscarPeriodo.id);

  return (
    <PageContainer
      title="Balanço de Conciliação & Emissão"
      subtitle="Filtro de notas por período e balanço de notas a emitir (serviços sem nota) vs. serviços a prestar (notas excedentes)"
    >
      <div className="space-y-6">
        {/* Seção 1: Filtro de Notas por Período */}
        <Card>
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="font-heading font-semibold text-sm text-text-primary">
              Notas Fiscais Emitidas por Período
            </h2>
            {buscarPeriodo.id > 0 && clienteSelecionado && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsPdfModalOpen(true)}
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Gerar PDF de Cobrança
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFiltrar} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-6">
              <div>
                <label className="text-sm font-medium text-text-secondary block mb-1.5">
                  Cliente *
                </label>
                <select
                  className="w-full px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
                  value={clienteId ?? ''}
                  onChange={(e) => setClienteId(e.target.value ? Number(e.target.value) : null)}
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clientes?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Data Inicial *"
                type="date"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
                required
              />

              <Input
                label="Data Final *"
                type="date"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
                required
              />

              <Button type="submit" disabled={!clienteId || !inicio || !fim}>
                Filtrar Notas
              </Button>
            </form>

            {loadingNotas ? (
              <PageLoader />
            ) : buscarPeriodo.id ? (
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs text-text-muted uppercase tracking-wider">
                    Período: {formatDate(buscarPeriodo.inicio)} até {formatDate(buscarPeriodo.fim)}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    Total Emitido: {formatCurrency(relatorioNotas?.totalNotas ?? 0)}
                  </span>
                </div>

                {!relatorioNotas?.notas.length ? (
                  <EmptyState title="Nenhuma nota fiscal emitida neste período" />
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                        <th className="text-left px-4 py-2.5 font-medium">Nº Nota</th>
                        <th className="text-left px-4 py-2.5 font-medium">Emissão</th>
                        <th className="text-left px-4 py-2.5 font-medium">Prazo Pagamento</th>
                        <th className="text-center px-4 py-2.5 font-medium">Status</th>
                        <th className="text-right px-4 py-2.5 font-medium">Valor Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {relatorioNotas.notas.map((n) => (
                        <tr key={n.id} className="hover:bg-surface-hover transition-colors">
                          <td className="px-4 py-2.5 text-sm font-semibold font-mono text-accent">
                            NF {n.numeroNota}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-text-secondary">
                            {formatDate(n.dataEmissao)}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-text-secondary">
                            {formatDate(n.prazoPagamento)}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            {n.statusPagamento === 'PAGA' && <Badge variant="primary">PAGA</Badge>}
                            {n.statusPagamento === 'NAO_PAGA' && <Badge variant="muted">NÃO PAGA</Badge>}
                            {n.statusPagamento === 'VENCIDA' && <Badge variant="danger">VENCIDA</Badge>}
                          </td>
                          <td className="px-4 py-2.5 text-sm text-right font-mono text-accent">
                            {formatCurrency(n.valor)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-6">
                Selecione o cliente e o período para listar as notas fiscais emitidas.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Seção 2: Balanço de Conciliação em Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Notas a Emitir */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-semibold text-sm text-text-primary">
                  Clientes com Notas a Emitir
                </h2>
                <p className="text-[11px] text-text-muted">Serviços realizados pendentes de emissão de nota fiscal</p>
              </div>
              <Badge variant="danger">{clientesDebito?.length ?? 0}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {!clientesDebito?.length ? (
                <EmptyState title="Nenhum serviço pendente de nota fiscal" />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                      <th className="text-left px-4 py-2.5 font-medium">Cliente</th>
                      <th className="text-right px-4 py-2.5 font-medium">Serviços</th>
                      <th className="text-right px-4 py-2.5 font-medium">Notas</th>
                      <th className="text-right px-4 py-2.5 font-medium">Nota a Emitir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {clientesDebito.map((c) => (
                      <tr key={c.clienteId} className="hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-2.5 text-sm font-medium text-text-primary">
                          <Link
                            to={`/extrato?clienteId=${c.clienteId}`}
                            className="hover:underline text-text-primary"
                          >
                            {c.nomeCliente}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-right font-mono text-text-secondary">
                          {formatCurrency(c.totalServicos)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-right font-mono text-text-secondary">
                          {formatCurrency(c.totalNotas)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-right font-mono font-semibold text-danger">
                          {formatCurrency(Math.abs(c.saldo))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Serviços a Prestar */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <h2 className="font-heading font-semibold text-sm text-text-primary">
                  Clientes com Serviços a Prestar
                </h2>
                <p className="text-[11px] text-text-muted">Notas fiscais já emitidas com saldo de serviço pendente</p>
              </div>
              <Badge variant="accent">{clientesCredito?.length ?? 0}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {!clientesCredito?.length ? (
                <EmptyState title="Nenhuma nota com saldo de serviço a prestar" />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                      <th className="text-left px-4 py-2.5 font-medium">Cliente</th>
                      <th className="text-right px-4 py-2.5 font-medium">Serviços</th>
                      <th className="text-right px-4 py-2.5 font-medium">Notas</th>
                      <th className="text-right px-4 py-2.5 font-medium">Serviço a Prestar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {clientesCredito.map((c) => (
                      <tr key={c.clienteId} className="hover:bg-surface-hover transition-colors">
                        <td className="px-4 py-2.5 text-sm font-medium text-text-primary">
                          <Link
                            to={`/extrato?clienteId=${c.clienteId}`}
                            className="hover:underline text-text-primary"
                          >
                            {c.nomeCliente}
                          </Link>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-right font-mono text-text-secondary">
                          {formatCurrency(c.totalServicos)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-right font-mono text-text-secondary">
                          {formatCurrency(c.totalNotas)}
                        </td>
                        <td className="px-4 py-2.5 text-sm text-right font-mono font-semibold text-accent">
                          {formatCurrency(c.saldo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal de Download do PDF */}
      {buscarPeriodo.id > 0 && clienteSelecionado && (
        <GerarPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          clienteId={buscarPeriodo.id}
          clienteNome={clienteSelecionado.nome}
        />
      )}
    </PageContainer>
  );
}
