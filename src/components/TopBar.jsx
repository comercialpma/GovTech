import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useLogo } from '../hooks/useLogo.jsx';

export default function TopBar({ title = 'Portal do Cidadão', collapsed }) {
  const { user } = useAuth();
  const [logo] = useLogo();

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-container-padding z-40 shadow-sm transition-all duration-300 ${
        collapsed ? 'left-sidebar-collapsed' : 'left-sidebar-width'
      }`}
      style={{ left: collapsed ? '80px' : '280px' }}
    >
      <div className="flex items-center gap-6">
        {logo ? (
          <img src={logo} alt="Logo" className="h-9 w-auto max-w-[150px] object-contain" />
        ) : (
          <span className="text-primary font-extrabold text-lg tracking-tight">
            Gov<span className="text-secondary">Tech</span>
          </span>
        )}
        <span className="h-6 w-px bg-outline-variant" />
        <span className="text-headline-md font-extrabold text-on-surface">{title}</span>
        <div className="hidden md:flex items-center gap-4 ml-8">
          <a className="text-on-surface-variant hover:text-primary transition-all text-body-md" href="#">Diretrizes</a>
          <a className="text-on-surface-variant hover:text-primary transition-all text-body-md" href="#">Tendências</a>
          <a className="text-on-surface-variant hover:text-primary transition-all text-body-md" href="#">Relatórios</a>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-label-sm flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Icon name="smart_toy" className="text-sm" /> Insights
        </button>
        <div className="flex items-center gap-2 text-on-surface-variant">
          <button className="p-2 hover:bg-surface-container-low rounded-full cursor-pointer">
            <Icon name="notifications" />
          </button>
          <div className="w-8 h-8 rounded-full border border-outline-variant bg-surface-container flex items-center justify-center text-xs font-bold text-primary">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
