import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useClientes, useExtrato } from '../../hooks/queries';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/Spinner';
import { formatCurrency, formatDate } from '../../utils';
import GerarPdfModal from '../../components/modals/GerarPdfModal';

type StatusFiltro = 'TODAS' | 'PAGA' | 'PENDENTE';

export default function ExtratoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramClienteId = searchParams.get('clienteId');

  const { data: clientes, isLoading: loadingClientes } = useClientes();
  const [clienteId, setClienteId] = useState<number | null>(
    paramClienteId ? Number(paramClienteId) : null
  );

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [statusFiltro, setStatusFiltro] = useState<StatusFiltro>('TODAS');

  useEffect(() => {
    if (paramClienteId) setClienteId(Number(paramClienteId));
  }, [paramClienteId]);

  const handleClienteChange = (id: number | null) => {
    setClienteId(id);
    if (id) setSearchParams({ clienteId: String(id) });
    else setSearchParams({});
  };

  const { data: extrato, isLoading: loadingExtrato } = useExtrato(clienteId);

  // Filtrar itens do extrato com base no filtro de status
  const itensFiltrados = useMemo(() => {
    if (!extrato?.itens) return [];
    if (statusFiltro === 'TODAS') return extrato.itens;

    return extrato.itens.filter((item) => {
      // Quando filtrando por status, mostrar apenas notas fiscais
      if (item.tipo === 'SERVICO') return false;
      if (statusFiltro === 'PAGA') return item.statusPagamento === 'PAGA';
      if (statusFiltro === 'PENDENTE') return item.statusPagamento !== 'PAGA';
      return true;
    });
  }, [extrato?.itens, statusFiltro]);

  // Contar notas por status para os badges do filtro
  const contadores = useMemo(() => {
    if (!extrato?.itens) return { todas: 0, pagas: 0, pendentes: 0 };
    const notas = extrato.itens.filter((i) => i.tipo === 'NOTA_FISCAL');
    return {
      todas: notas.length,
      pagas: notas.filter((n) => n.statusPagamento === 'PAGA').length,
      pendentes: notas.filter((n) => n.statusPagamento !== 'PAGA').length,
    };
  }, [extrato?.itens]);

  if (loadingClientes) return <PageLoader />;

  const clienteSelecionado = clientes?.find((c) => c.id === clienteId);

  // Mapear filtro do extrato para o filtro do PDF
  const pdfStatusFiltro = statusFiltro === 'TODAS' ? null : statusFiltro;

  return (
    <PageContainer
      title="Extrato de Conciliação"
      subtitle="Linha do tempo cronológica de serviços prestados e notas fiscais com balanço corrente"
    >
      {/* Seleção de Cliente e Ações */}
      <Card className="mb-6">
        <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
            <label className="text-sm font-medium text-text-secondary whitespace-nowrap">
              Cliente:
            </label>
            <select
              className="w-full sm:max-w-md px-3 py-2 text-sm bg-surface border border-border rounded-lg text-text-primary focus:border-primary focus:outline-none"
              value={clienteId ?? ''}
              onChange={(e) =>
                handleClienteChange(e.target.value ? Number(e.target.value) : null)
              }
            >
              <option value="">Selecione um cliente</option>
              {clientes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          {clienteId && clienteSelecionado && (
            <Button
              variant="secondary"
              onClick={() => setIsPdfModalOpen(true)}
              className="w-full sm:w-auto shrink-0 flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Gerar PDF de Cobrança
            </Button>
          )}
        </CardContent>
      </Card>

      {!clienteId ? (
        <Card>
          <EmptyState
            title="Selecione um cliente"
            description="Escolha um cliente para visualizar o extrato e o balanço de conciliação"
          />
        </Card>
      ) : loadingExtrato ? (
        <PageLoader />
      ) : !extrato ? (
        <Card>
          <EmptyState title="Nenhum dado encontrado" />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  Total em Serviços Realizados
                </p>
                <p className="text-2xl font-heading font-bold text-text-primary">
                  {formatCurrency(extrato.totalServicos)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  Total em Notas Emitidas
                </p>
                <p className="text-2xl font-heading font-bold text-text-primary">
                  {formatCurrency(extrato.totalNotas)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
                  Balanço de Conciliação
                </p>
                <p
                  className={`text-2xl font-heading font-bold ${
                    extrato.saldoAtual < 0
                      ? 'text-danger'
                      : extrato.saldoAtual > 0
                      ? 'text-accent'
                      : 'text-text-primary'
                  }`}
                >
                  {formatCurrency(extrato.saldoAtual)}
                </p>
                <p className="text-xs text-text-muted mt-1">
                  {extrato.saldoAtual < 0
                    ? `Pendente: ${formatCurrency(Math.abs(extrato.saldoAtual))} em Nota a Emitir`
                    : extrato.saldoAtual > 0
                    ? `Excedente: ${formatCurrency(extrato.saldoAtual)} em Serviço a Prestar`
                    : 'Totalmente Conciliado (Notas = Serviços)'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Linha do Tempo */}
          <Card>
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="font-heading font-semibold text-sm text-text-primary">
                Linha do Tempo (Cronológica)
              </h2>

              {/* Filtro Segmentado */}
              <div className="flex items-center bg-surface border border-border rounded-lg p-0.5 gap-0.5">
                {([
                  { key: 'TODAS', label: 'Todas', count: contadores.todas },
                  { key: 'PAGA', label: 'Pagas', count: contadores.pagas },
                  { key: 'PENDENTE', label: 'Pendentes', count: contadores.pendentes },
                ] as const).map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setStatusFiltro(key)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 flex items-center gap-1.5 ${
                      statusFiltro === key
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    {label}
                    <span
                      className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full ${
                        statusFiltro === key
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-hover text-text-muted'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {!itensFiltrados.length ? (
                <EmptyState
                  title={
                    statusFiltro === 'TODAS'
                      ? 'Nenhum lançamento registrado'
                      : statusFiltro === 'PAGA'
                      ? 'Nenhuma nota paga encontrada'
                      : 'Nenhuma nota pendente encontrada'
                  }
                  description={
                    statusFiltro === 'TODAS'
                      ? 'Cadastre serviços ou notas fiscais para este cliente'
                      : 'Altere o filtro para visualizar outros lançamentos'
                  }
                />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border text-xs text-text-muted uppercase tracking-wider">
                      <th className="text-left px-5 py-3 font-medium">Data</th>
                      <th className="text-left px-5 py-3 font-medium">Tipo</th>
                      <th className="text-left px-5 py-3 font-medium">Identificador</th>
                      <th className="text-left px-5 py-3 font-medium">Descrição</th>
                      <th className="text-center px-5 py-3 font-medium">Status</th>
                      <th className="text-right px-5 py-3 font-medium">Valor Serviço</th>
                      <th className="text-right px-5 py-3 font-medium">Valor Nota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {itensFiltrados.map((item, idx) => (
                      <tr
                        key={`${item.tipo}-${item.id}-${idx}`}
                        className="hover:bg-surface-hover transition-colors"
                      >
                        <td className="px-5 py-3 text-sm text-text-secondary">
                          {formatDate(item.data)}
                        </td>
                        <td className="px-5 py-3 text-sm">
                          {item.tipo === 'SERVICO' ? (
                            <Badge variant="muted">SERVIÇO</Badge>
                          ) : (
                            <Badge variant="primary">NOTA FISCAL</Badge>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm font-semibold font-mono">
                          {item.tipo === 'SERVICO' ? (
                            <span className="text-primary">OS {item.numeroOs || item.id}</span>
                          ) : (
                            <span className="text-accent">NF {item.numeroNota || item.id}</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-text-primary">
                          {item.descricao}
                        </td>
                        <td className="px-5 py-3 text-sm text-center">
                          {item.tipo === 'NOTA_FISCAL' ? (
                            <>
                              {item.statusPagamento === 'PAGA' && (
                                <Badge variant="accent">PAGA</Badge>
                              )}
                              {item.statusPagamento === 'NAO_PAGA' && (
                                <Badge variant="muted">NÃO PAGA</Badge>
                              )}
                              {item.statusPagamento === 'VENCIDA' && (
                                <Badge variant="danger">ATRASADA</Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-text-muted">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3 text-sm text-right font-mono text-text-primary">
                          {item.valorServico != null ? formatCurrency(item.valorServico) : '—'}
                        </td>
                        <td className="px-5 py-3 text-sm text-right font-mono text-accent">
                          {item.valorNota != null ? formatCurrency(item.valorNota) : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de Download do PDF */}
      {clienteId && clienteSelecionado && (
        <GerarPdfModal
          isOpen={isPdfModalOpen}
          onClose={() => setIsPdfModalOpen(false)}
          clienteId={clienteId}
          clienteNome={clienteSelecionado.nome}
          statusFiltro={pdfStatusFiltro}
        />
      )}
    </PageContainer>
  );
}
