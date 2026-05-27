import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';

const menu = [
  { to: '/', label: 'Painel Geral', icon: 'dashboard' },
  { to: '/centro-comando', label: 'Centro de Comando', icon: 'hub' },
  { to: '/mandato', label: 'Painel do Mandato', icon: 'assignment_ind' },
  { to: '/portal-cidadao', label: 'Portal do Cidadão', icon: 'person_pin_circle' },
  { to: '/protocolos', label: 'Gestão de Protocolos', icon: 'assignment' },
  { to: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-primary flex flex-col py-container-padding z-50 transition-all duration-300 ${
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar-width'
      }`}
    >
      <div className={`mb-10 flex items-center justify-between ${collapsed ? 'px-4' : 'px-6'}`}>
        {!collapsed && (
          <div>
            <img src="/logo.png" alt="GovTech" className="h-10 w-auto" />
            <p className="text-label-sm text-on-primary-container opacity-80 mt-2">Portal do Cidadão</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-on-primary-container hover:text-on-primary transition-colors"
          aria-label="Recolher menu"
        >
          <Icon name={collapsed ? 'menu' : 'menu_open'} />
        </button>
      </div>

      <nav className="flex-1 space-y-2 px-2">
        {menu.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors duration-200 ${
                isActive
                  ? 'border-l-4 border-secondary text-on-primary bg-secondary-container/10 font-bold'
                  : 'text-on-primary-container/80 hover:bg-primary-container hover:text-on-primary'
              }`
            }
          >
            <Icon name={icon} />
            {!collapsed && <span className="text-body-md">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={collapsed ? 'px-2 py-4' : 'px-6 py-4'}>
        <button
          className={`bg-secondary-container text-on-secondary-container font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${
            collapsed ? 'w-12 h-12 mx-auto' : 'w-full py-3'
          }`}
        >
          <Icon name="add" />
          {!collapsed && <span>Novo Protocolo</span>}
        </button>
      </div>

      <div className="mt-auto px-2 space-y-1">
        <a className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-primary-container transition-colors text-on-primary-container/80 hover:text-on-primary" href="#">
          <Icon name="help" />
          {!collapsed && <span className="text-label-sm">Central de Ajuda</span>}
        </a>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-primary-container transition-colors text-on-primary-container/80 hover:text-on-primary"
        >
          <Icon name="logout" />
          {!collapsed && <span className="text-label-sm">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
