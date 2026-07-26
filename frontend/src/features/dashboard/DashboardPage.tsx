import { useClientes, useClientesComDebito, useClientesComCredito } from '../../hooks/queries';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardContent } from '../../components/ui/Card';
import { PageLoader } from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { formatCurrency } from '../../utils';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const clientes = useClientes();
  const debito = useClientesComDebito();
  const credito = useClientesComCredito();

  if (clientes.isLoading) return <PageLoader />;

  const totalClientes = clientes.data?.length ?? 0;
  const totalNotasAEmitir = debito.data?.reduce((s, c) => s + Math.abs(c.saldo), 0) ?? 0;
  const totalServicosAPrestar = credito.data?.reduce((s, c) => s + c.saldo, 0) ?? 0;

  return (
    <PageContainer title="Dashboard" subtitle="Visão geral do controle de conciliação entre serviços e notas fiscais">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total de Clientes</p>
            <p className="text-3xl font-heading font-bold text-text-primary">{totalClientes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total em Notas a Emitir</p>
            <p className="text-3xl font-heading font-bold text-danger">{formatCurrency(totalNotasAEmitir)}</p>
            <p className="text-xs text-text-muted mt-1">Serviços realizados aguardando nota fiscal</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Total em Serviços a Prestar</p>
            <p className="text-3xl font-heading font-bold text-accent">{formatCurrency(totalServicosAPrestar)}</p>
            <p className="text-xs text-text-muted mt-1">Notas já emitidas aguardando serviço correspondente</p>
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-text-primary">Clientes com Notas a Emitir (Serviços sem Nota)</h2>
            <Badge variant="danger">{debito.data?.length ?? 0}</Badge>
          </div>
          <CardContent className="p-0">
            {!debito.data?.length ? (
              <p className="px-5 py-8 text-center text-sm text-text-muted">Nenhum cliente com nota pendente a emitir</p>
            ) : (
              <div className="divide-y divide-border">
                {debito.data.map(c => (
                  <Link to={`/extrato?clienteId=${c.clienteId}`} key={c.clienteId}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{c.nomeCliente}</p>
                      <p className="text-xs text-text-muted">Serviços: {formatCurrency(c.totalServicos)} · Notas: {formatCurrency(c.totalNotas)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-danger block">{formatCurrency(Math.abs(c.saldo))}</span>
                      <span className="text-[10px] text-text-muted">Nota a emitir</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="font-heading font-semibold text-sm text-text-primary">Clientes com Serviços a Prestar (Notas sem Serviço)</h2>
            <Badge variant="accent">{credito.data?.length ?? 0}</Badge>
          </div>
          <CardContent className="p-0">
            {!credito.data?.length ? (
              <p className="px-5 py-8 text-center text-sm text-text-muted">Nenhum cliente com serviço pendente a realizar</p>
            ) : (
              <div className="divide-y divide-border">
                {credito.data.map(c => (
                  <Link to={`/extrato?clienteId=${c.clienteId}`} key={c.clienteId}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-hover transition-colors">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{c.nomeCliente}</p>
                      <p className="text-xs text-text-muted">Serviços: {formatCurrency(c.totalServicos)} · Notas: {formatCurrency(c.totalNotas)}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-accent block">{formatCurrency(c.saldo)}</span>
                      <span className="text-[10px] text-text-muted">Serviço a prestar</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
