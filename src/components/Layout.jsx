import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';
import { NovoProtocoloProvider } from '../hooks/useNovoProtocolo.jsx';

const pageTitle = {
  '/': 'Observatório',
  '/portal-cidadao': 'Portal do Cidadão',
  '/protocolos': 'Gestão de Protocolos',
  '/centro-comando': 'Centro de Comando',
  '/mandato': 'Painel do Mandato',
  '/usuarios': 'Gestão de Usuários',
  '/radar': 'Mapa de Distribuição',
  '/ajuda': 'Central de Ajuda',
  '/configuracoes': 'Configurações',
  '/termos': 'Termos de Uso',
  '/privacidade': 'Política de Privacidade',
  '/ouvidoria': 'Ouvidoria',
};

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = pageTitle[location.pathname] || 'GovTech';

  return (
    <NovoProtocoloProvider>
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
            <span className="text-primary font-extrabold text-base tracking-tight">
              Gov<span className="text-secondary">Tech</span>
            </span>
            <p className="text-on-surface-variant text-sm border-l border-outline-variant pl-4">
              © {new Date().getFullYear()} • Sistema Integrado de Gestão Municipal
            </p>
          </div>
          <div className="flex gap-8 text-on-surface-variant text-sm font-medium">
            <Link className="hover:text-secondary transition-colors" to="/termos">Termos de Uso</Link>
            <Link className="hover:text-secondary transition-colors" to="/privacidade">Privacidade</Link>
            <Link className="hover:text-secondary transition-colors" to="/ouvidoria">Ouvidoria</Link>
          </div>
        </div>
      </footer>
    </div>
    </NovoProtocoloProvider>
  );
}
