import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

const pageTitle = {
  '/': 'Painel Geral',
  '/portal-cidadao': 'Portal do Cidadão',
  '/protocolos': 'Gestão de Protocolos',
  '/centro-comando': 'Centro de Comando',
  '/mandato': 'Painel do Mandato',
  '/configuracoes': 'Configurações',
};

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = pageTitle[location.pathname] || 'GovTech';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      <TopBar title={title} collapsed={collapsed} />

      <main
        className="pt-24 pb-12 px-container-padding min-h-screen transition-all duration-300"
        style={{ marginLeft: collapsed ? '80px' : '280px' }}
      >
        {children}
      </main>

      <footer
        className="px-container-padding py-10 border-t border-outline-variant transition-all duration-300"
        style={{ marginLeft: collapsed ? '80px' : '280px' }}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="GovTech Master" className="h-6 w-auto" />
            <p className="text-on-surface-variant text-sm border-l border-outline-variant pl-4">
              © {new Date().getFullYear()} • Sistema Integrado de Gestão Municipal
            </p>
          </div>
          <div className="flex gap-8 text-on-surface-variant text-sm font-medium">
            <a className="hover:text-secondary transition-colors" href="#">Termos de Uso</a>
            <a className="hover:text-secondary transition-colors" href="#">Privacidade</a>
            <a className="hover:text-secondary transition-colors" href="#">Ouvidoria</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
