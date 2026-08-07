import { useState } from 'react';
import { useEmpresa } from '../../hooks/queries';
import { relatorioApi } from '../../api';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Badge from '../ui/Badge';
import toast from 'react-hot-toast';

interface GerarPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  clienteId: number;
  clienteNome: string;
  statusFiltro?: string | null;
}

export default function GerarPdfModal({ isOpen, onClose, clienteId, clienteNome, statusFiltro }: GerarPdfModalProps) {
  const { data: empresa } = useEmpresa();
  const now = new Date();
  const yearStart = `${now.getFullYear()}-01-01`;
  const todayStr = now.toISOString().split('T')[0];

  const [inicio, setInicio] = useState(yearStart);
  const [fim, setFim] = useState(todayStr);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const temDadosPagamento = Boolean(
    (empresa?.chavePix && empresa.chavePix.trim() !== '') ||
    (empresa?.banco && empresa.banco.trim() !== '')
  );

  const filtroLabel = statusFiltro === 'PAGA'
    ? 'Apenas Notas Pagas'
    : statusFiltro === 'PENDENTE'
    ? 'Apenas Notas Pendentes'
    : null;

  const handleGerarPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inicio || !fim) {
      toast.error('Informe o período inicial e final');
      return;
    }

    if (!temDadosPagamento) {
      toast('Aviso: Os dados bancários/PIX da empresa não estão cadastrados. O PDF será gerado sem dados de pagamento.', {
        icon: '⚠️',
      });
    }

    setLoading(true);
    try {
      const { data } = await relatorioApi.downloadPdfCobranca(clienteId, inicio, fim, statusFiltro);
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      const cleanClienteNome = clienteNome.toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.setAttribute('download', `cobranca-${cleanClienteNome}-${inicio}-a-${fim}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF de cobrança baixado com sucesso!');
      onClose();
    } catch {
      toast.error('Falha ao gerar o PDF do relatório de cobrança');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-surface border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-heading font-bold text-base text-text-primary">
            Gerar PDF de Cobrança
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-lg font-bold px-2 py-0.5 rounded-md hover:bg-surface-hover transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-text-secondary">
            Cliente: <strong className="text-text-primary">{clienteNome}</strong>
          </p>
          {filtroLabel && (
            <p className="text-xs text-text-secondary flex items-center gap-2">
              Filtro ativo:{' '}
              <Badge variant={statusFiltro === 'PAGA' ? 'accent' : 'danger'}>
                {filtroLabel}
              </Badge>
            </p>
          )}
        </div>

        {!temDadosPagamento && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-xs text-warning flex items-start gap-2">
            <span className="shrink-0 text-base">⚠️</span>
            <div>
              <strong>Atenção:</strong> Os dados para pagamento (PIX / Banco) ainda não foram configurados em{' '}
              <a href="/empresa" className="underline font-semibold hover:text-warning/80">Minha Empresa</a>.
              O relatório será gerado sem instruções de pagamento no rodapé.
            </div>
          </div>
        )}

        <form onSubmit={handleGerarPdf} className="space-y-4">
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Gerando PDF...' : 'Baixar PDF'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
