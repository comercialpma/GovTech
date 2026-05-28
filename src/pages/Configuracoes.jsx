import { useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useLogo, readImageAsDataUrl } from '../hooks/useLogo.jsx';

const tabs = [
  { id: 'gerais', label: 'Gerais', icon: 'tune' },
  { id: 'identidade', label: 'Identidade Visual', icon: 'palette' },
  { id: 'seguranca', label: 'Segurança', icon: 'shield' },
  { id: 'notificacoes', label: 'Notificações', icon: 'notifications' },
  { id: 'integracoes', label: 'Integrações', icon: 'link' },
];

const colors = [
  { name: 'Indigo Profundo', hex: '#031636', active: true },
  { name: 'Azul Royal', hex: '#0051d5' },
  { name: 'Verde Floresta', hex: '#0f3d2e' },
  { name: 'Vermelho Estado', hex: '#b91c1c' },
];

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('gerais');
  const [primary, setPrimary] = useState('#031636');
  const [logo, setLogo] = useLogo();
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  async function handleLogoChange(e) {
    setLogoError('');
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setLogoError('Selecione um arquivo de imagem (PNG, JPG ou SVG).');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('A imagem deve ter no máximo 2MB.');
      return;
    }
    const dataUrl = await readImageAsDataUrl(file);
    setLogo(dataUrl);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-headline-lg text-primary">Configurações</h2>
          <p className="text-on-surface-variant max-w-2xl">
            Gerencie as preferências globais e diretrizes de segurança da sua instância GovTech.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-surface-container">
            Cancelar
          </button>
          <button className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:opacity-90 active:scale-95 shadow-sm">
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Tabs */}
        <aside className="col-span-12 lg:col-span-3">
          <nav className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-2 shadow-sm">
            {tabs.map((t) => {
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-label-sm font-semibold transition-colors ${
                    active
                      ? 'bg-secondary/10 text-secondary border-l-4 border-secondary'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <Icon name={t.icon} className="text-base" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Panels */}
        <section className="col-span-12 lg:col-span-9 space-y-gutter-md">
          {/* Configurações Gerais */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
            <h3 className="text-headline-md flex items-center gap-2 mb-6">
              <Icon name="tune" className="text-secondary" /> Configurações Gerais
            </h3>

            <div className="space-y-5">
              <Field label="NOME DO SISTEMA">
                <input
                  type="text"
                  defaultValue="Prefeitura Municipal de Gestão Digital"
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="IDIOMA PRINCIPAL">
                  <Select options={['Português (Brasil)', 'English (US)', 'Español']} />
                </Field>
                <Field label="FUSO HORÁRIO">
                  <Select options={['(UTC-03:00) Brasília', '(UTC-04:00) Manaus', '(UTC-05:00) Acre']} />
                </Field>
              </div>
            </div>
          </div>

          {/* Identidade Visual */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
            <h3 className="text-headline-md flex items-center gap-2 mb-6">
              <Icon name="palette" className="text-secondary" /> Identidade Visual
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant mb-2">LOGO ATUAL</p>
                <div className="border border-outline-variant rounded-xl bg-surface-container-low/40 h-32 flex items-center justify-center overflow-hidden">
                  {logo ? (
                    <img src={logo} alt="Logo atual" className="max-h-24 max-w-full object-contain" />
                  ) : (
                    <span className="text-primary font-extrabold text-3xl tracking-tight">
                      Gov<span className="text-secondary">Tech</span>
                    </span>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg text-label-sm font-bold flex items-center justify-center gap-2 hover:opacity-90"
                  >
                    <Icon name="upload" className="text-base" /> Alterar Logo
                  </button>
                  {logo && (
                    <button
                      onClick={() => setLogo(null)}
                      title="Remover logo"
                      className="px-3 py-2.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container"
                    >
                      <Icon name="delete" className="text-base" />
                    </button>
                  )}
                </div>
                {logoError && (
                  <p className="text-xs text-error mt-2">{logoError}</p>
                )}
              </div>

              {/* Cores */}
              <div>
                <p className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant mb-2">COR PRIMÁRIA</p>
                <div className="flex gap-3">
                  {colors.map((c) => {
                    const active = primary === c.hex;
                    return (
                      <button
                        key={c.hex}
                        title={c.name}
                        onClick={() => setPrimary(c.hex)}
                        className="flex flex-col items-center gap-1"
                      >
                        <span
                          className={`w-14 h-14 rounded-xl border-2 transition-all ${
                            active ? 'border-secondary scale-105 shadow-md' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                        {active && (
                          <span className="text-[10px] font-bold tracking-wider text-secondary">ATIVO</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant mt-5 mb-2">
                  HEXADECIMAL PERSONALIZADO
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={primary}
                    onChange={(e) => setPrimary(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-outline-variant rounded-lg text-body-md font-mono focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none"
                  />
                  <button className="px-4 py-2.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:opacity-90">
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button className="px-5 py-2.5 border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-surface-container">
              Cancelar Alterações
            </button>
            <button className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:opacity-90 active:scale-95 shadow-sm">
              Salvar Configurações
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-[0.15em] text-on-surface-variant mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({ options }) {
  return (
    <div className="relative">
      <select className="w-full appearance-none bg-white px-4 py-2.5 pr-10 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none cursor-pointer">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
    </div>
  );
}
