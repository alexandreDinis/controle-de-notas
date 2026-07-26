import { useEffect, useState } from 'react';
import { useEmpresa, useSalvarEmpresa, useUploadLogo } from '../../hooks/queries';
import { empresaApi } from '../../api';
import PageContainer from '../../components/layout/PageContainer';
import Card, { CardContent, CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function EmpresaPage() {
  const { data: empresa, isLoading } = useEmpresa();
  const salvarEmpresa = useSalvarEmpresa();
  const uploadLogo = useUploadLogo();

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (empresa) {
      setNome(empresa.nome || '');
      setDocumento(empresa.documento || '');
      setChavePix(empresa.chavePix || '');
      setBanco(empresa.banco || '');
      setAgencia(empresa.agencia || '');
      setConta(empresa.conta || '');
      if (empresa.possuiLogo) {
        setLogoPreview(`${empresaApi.getLogoUrl()}?t=${Date.now()}`);
      }
    }
  }, [empresa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    salvarEmpresa.mutate({
      nome: nome.trim() || null,
      documento: documento.trim() || null,
      chavePix: chavePix.trim() || null,
      banco: banco.trim() || null,
      agencia: agencia.trim() || null,
      conta: conta.trim() || null,
    });
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('O logo deve ter no máximo 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem válida (PNG, JPEG, WEBP ou SVG)');
      return;
    }

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUploadLogo = () => {
    if (!logoFile) return;
    uploadLogo.mutate(logoFile, {
      onSuccess: () => {
        setLogoFile(null);
      },
    });
  };

  if (isLoading) return <PageLoader />;

  return (
    <PageContainer
      title="Minha Empresa"
      subtitle="Configuração singleton dos dados cadastrais, dados para recebimento (PIX/Banco) e logotipo para o relatório de cobrança em PDF"
    >
      <div className="max-w-4xl space-y-6">
        {/* Card do Logotipo */}
        <Card>
          <CardHeader>
            <h2 className="font-heading font-semibold text-sm text-text-primary">
              Logotipo da Empresa
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-border bg-surface-hover flex items-center justify-center overflow-hidden shrink-0">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo da empresa"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <span className="text-xs text-text-muted text-center px-2">
                  Sem logo cadastrado
                </span>
              )}
            </div>

            <div className="space-y-3 flex-1">
              <p className="text-xs text-text-muted">
                Selecione uma imagem (PNG, JPEG, WEBP ou SVG de até 2MB) para exibir no cabeçalho do relatório de cobrança em PDF.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <label className="cursor-pointer bg-surface border border-border hover:bg-surface-hover text-text-primary px-3 py-1.5 rounded-lg text-xs font-medium transition-colors inline-block">
                  Escolher Imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                  />
                </label>

                {logoFile && (
                  <Button
                    size="sm"
                    onClick={handleUploadLogo}
                    disabled={uploadLogo.isPending}
                  >
                    {uploadLogo.isPending ? 'Enviando...' : 'Salvar Logo'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card do Formulário de Dados */}
        <Card>
          <CardHeader>
            <h2 className="font-heading font-semibold text-sm text-text-primary">
              Dados Cadastrais e de Pagamento
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nome da Empresa / Razão Social"
                  placeholder="Ex: Oroboros Serviços LTDA"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <Input
                  label="CNPJ / CPF"
                  placeholder="Ex: 00.000.000/0001-00"
                  value={documento}
                  onChange={(e) => setDocumento(e.target.value)}
                />
              </div>

              <div className="pt-2 border-t border-border">
                <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                  Informações de Recebimento (Rodapé do PDF)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Chave PIX"
                    placeholder="Ex: financeiro@empresa.com ou CNPJ"
                    value={chavePix}
                    onChange={(e) => setChavePix(e.target.value)}
                  />
                  <Input
                    label="Banco"
                    placeholder="Ex: Banco Itaú / Banco do Brasil"
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                  />
                  <Input
                    label="Agência"
                    placeholder="Ex: 0123"
                    value={agencia}
                    onChange={(e) => setAgencia(e.target.value)}
                  />
                  <Input
                    label="Conta Corrente"
                    placeholder="Ex: 45678-9"
                    value={conta}
                    onChange={(e) => setConta(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border">
                <Button type="submit" disabled={salvarEmpresa.isPending}>
                  {salvarEmpresa.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
