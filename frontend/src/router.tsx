import { createBrowserRouter } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './features/dashboard/DashboardPage';
import ClientesPage from './features/clientes/ClientesPage';
import ServicosPage from './features/servicos/ServicosPage';
import NotasFiscaisPage from './features/notas-fiscais/NotasFiscaisPage';
import ExtratoPage from './features/extrato/ExtratoPage';
import RelatoriosPage from './features/relatorios/RelatoriosPage';
import EmpresaPage from './features/empresa/EmpresaPage';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-base text-text-primary">
      <Sidebar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <DashboardPage />
      </Layout>
    ),
  },
  {
    path: '/clientes',
    element: (
      <Layout>
        <ClientesPage />
      </Layout>
    ),
  },
  {
    path: '/servicos',
    element: (
      <Layout>
        <ServicosPage />
      </Layout>
    ),
  },
  {
    path: '/notas-fiscais',
    element: (
      <Layout>
        <NotasFiscaisPage />
      </Layout>
    ),
  },
  {
    path: '/extrato',
    element: (
      <Layout>
        <ExtratoPage />
      </Layout>
    ),
  },
  {
    path: '/relatorios',
    element: (
      <Layout>
        <RelatoriosPage />
      </Layout>
    ),
  },
  {
    path: '/empresa',
    element: (
      <Layout>
        <EmpresaPage />
      </Layout>
    ),
  },
]);
