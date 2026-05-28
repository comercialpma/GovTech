import { NavLink } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useLogo } from '../hooks/useLogo.jsx';
import { useNovoProtocolo } from '../hooks/useNovoProtocolo.jsx';

const menu = [
  { to: '/', label: 'Observatório', icon: 'monitoring' },
  { to: '/radar', label: 'Mapa de Distribuição', icon: 'map' },
  { to: '/centro-comando', label: 'Centro de Comando', icon: 'hub' },
  { to: '/mandato', label: 'Painel do Mandato', icon: 'assignment_ind' },
  { to: '/portal-cidadao', label: 'Portal do Cidadão', icon: 'person_pin_circle' },
  { to: '/protocolos', label: 'Gestão de Protocolos', icon: 'assignment' },
  { to: '/usuarios', label: 'Gestão de Usuários', icon: 'group' },
  { to: '/pesquisa-opiniao', label: 'Pesquisa de Opinião', icon: 'poll' },
  { to: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { logout } = useAuth();
  const [logo] = useLogo();
  const { open: openNovoProtocolo } = useNovoProtocolo();

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-primary flex flex-col py-container-padding z-50 transition-all duration-300 ${
        collapsed ? 'w-sidebar-collapsed' : 'w-sidebar-width'
      }`}
    >
      <div className={`mb-10 flex items-center justify-between ${collapsed ? 'px-4' : 'px-6'}`}>
        {!collapsed && (
          <div>
            {logo ? (
              <img
                src={logo}
                alt="Logo"
                className="h-10 w-auto max-w-[180px] object-contain"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon name="account_balance" className="text-on-secondary text-base" />
                </span>
                <span className="text-on-primary font-extrabold text-xl tracking-tight">
                  Gov<span className="text-secondary-fixed-dim">Tech</span>
                </span>
              </div>
            )}
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
          onClick={openNovoProtocolo}
          className={`bg-secondary-container text-on-secondary-container font-bold rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all ${
            collapsed ? 'w-12 h-12 mx-auto' : 'w-full py-3'
          }`}
        >
          <Icon name="add" />
          {!collapsed && <span>Novo Protocolo</span>}
        </button>
      </div>

      <div className="mt-auto px-2 space-y-1">
        <NavLink
          to="/ajuda"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${
              isActive
                ? 'bg-primary-container text-on-primary'
                : 'hover:bg-primary-container text-on-primary-container/80 hover:text-on-primary'
            }`
          }
        >
          <Icon name="help" />
          {!collapsed && <span className="text-label-sm">Central de Ajuda</span>}
        </NavLink>
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
