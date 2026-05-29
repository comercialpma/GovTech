import { useEffect, useRef, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useLogo, readImageAsDataUrl } from '../hooks/useLogo.jsx';

const tabs = [
  { id: 'gerais', label: 'Gerais', icon: 'tune' },
  { id: 'identidade', label: 'Identidade Visual', icon: 'palette' },
  { id: 'seguranca', label: 'Segurança', icon: 'shield' },
  { id: 'notificacoes', label: 'Notificações', icon: 'notifications' },
  { id: 'integracoes', label: 'Integrações', icon: 'link' },
  { id: 'auditoria', label: 'Trilha de Auditoria', icon: 'fact_check' },
];

const colors = [
  { name: 'Indigo Profundo', hex: '#031636' },
  { name: 'Azul Royal', hex: '#0051d5' },
  { name: 'Verde Floresta', hex: '#0f3d2e' },
  { name: 'Vermelho Estado', hex: '#b91c1c' },
];

const STORAGE = 'govtech.config';
const DEFAULTS = {
  nomeSistema: 'Prefeitura Municipal de Gestão Digital',
  cnpj: '18.715.508/0001-31',
  idioma: 'Português (Brasil)',
  fuso: '(UTC-03:00) Brasília',
  primary: '#031636',
  seguranca: {
    senhaMinChars: 8,
    senhaSpecial: true,
    senhaExpira: 90,
    twoFA: true,
    sessaoTimeout: 60,
    auditLog: true,
    ipWhitelist: '',
  },
  notificacoes: {
    emailNovosProtocolos: true,
    emailMencoes: true,
    pushUrgentes: true,
    smsCriticos: false,
    digestSemanal: true,
    horarioDigest: '08:00',
  },
  integracoes: {
    govbr: { ativo: true, clientId: '' },
    protheus: { ativo: false, endpoint: '' },
    sap: { ativo: false, endpoint: '' },
    onedoc: { ativo: false, webhook: '' },
    whatsapp: { ativo: false, phoneId: '' },
    sendgrid: { ativo: false, key: '' },
  },
};

function loadConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE));
    return { ...DEFAULTS, ...stored, seguranca: { ...DEFAULTS.seguranca, ...stored?.seguranca }, notificacoes: { ...DEFAULTS.notificacoes, ...stored?.notificacoes }, integracoes: { ...DEFAULTS.integracoes, ...stored?.integracoes } };
  } catch { return DEFAULTS; }
}

export default function Configuracoes() {
  const [activeTab, setActiveTab] = useState('gerais');
  const [config, setConfig] = useState(loadConfig);
  const [original, setOriginal] = useState(loadConfig);
  const [logo, setLogo] = useLogo();
  const [logoError, setLogoError] = useState('');
  const [toast, setToast] = useState('');
  const fileInputRef = useRef(null);

  const isDirty = JSON.stringify(config) !== JSON.stringify(original);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', config.primary);
  }, [config.primary]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function update(path, value) {
    setConfig((c) => {
      const next = JSON.parse(JSON.stringify(c));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }

  function salvar() {
    localStorage.setItem(STORAGE, JSON.stringify(config));
    setOriginal(config);
    showToast('Configurações salvas com sucesso.');
  }

  function cancelar() {
    setConfig(original);
    showToast('Alterações descartadas.');
  }

  function restaurarPadrao() {
    if (!confirm('Restaurar todas as configurações para os valores padrão?')) return;
    setConfig(DEFAULTS);
    localStorage.removeItem(STORAGE);
    setOriginal(DEFAULTS);
    showToast('Configurações restauradas.');
  }

  async function handleLogoChange(e) {
    setLogoError('');
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return setLogoError('Selecione um arquivo de imagem (PNG, JPG ou SVG).');
    if (file.size > 2 * 1024 * 1024) return setLogoError('A imagem deve ter no máximo 2MB.');
    const dataUrl = await readImageAsDataUrl(file);
    setLogo(dataUrl);
    showToast('Logo atualizada.');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-headline-lg text-primary">Configurações</h2>
          <p className="text-on-surface-variant max-w-2xl">
            Gerencie as preferências globais e diretrizes de segurança da sua instância GovTech.
          </p>
        </div>
        <div className="flex gap-3">
          {isDirty && <span className="self-center text-xs text-amber-600 font-bold flex items-center gap-1"><Icon name="warning" className="text-base" /> Alterações não salvas</span>}
          <button onClick={cancelar} disabled={!isDirty} className="px-5 py-2.5 border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed">
            Cancelar
          </button>
          <button onClick={salvar} disabled={!isDirty} className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:opacity-90 active:scale-95 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed">
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        <aside className="col-span-12 lg:col-span-3 space-y-3">
          <nav className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-2 shadow-sm">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-label-sm font-semibold transition-colors ${
                  activeTab === t.id
                    ? 'bg-secondary/10 text-secondary border-l-4 border-secondary'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                <Icon name={t.icon} className="text-base" />
                {t.label}
              </button>
            ))}
          </nav>
          <button onClick={restaurarPadrao} className="w-full px-3 py-2 text-xs text-on-surface-variant hover:text-error border border-outline-variant rounded-lg flex items-center justify-center gap-1">
            <Icon name="restart_alt" className="text-base" /> Restaurar padrão
          </button>
        </aside>

        <section className="col-span-12 lg:col-span-9 space-y-gutter-md">
          {activeTab === 'gerais' && <PanelGerais config={config} update={update} />}
          {activeTab === 'identidade' && (
            <PanelIdentidade
              config={config} update={update} logo={logo} setLogo={setLogo}
              fileInputRef={fileInputRef} handleLogoChange={handleLogoChange}
              logoError={logoError} showToast={showToast}
            />
          )}
          {activeTab === 'seguranca' && <PanelSeguranca config={config} update={update} />}
          {activeTab === 'notificacoes' && <PanelNotificacoes config={config} update={update} />}
          {activeTab === 'integracoes' && <PanelIntegracoes config={config} update={update} showToast={showToast} />}
          {activeTab === 'auditoria' && <PanelAuditoria showToast={showToast} />}

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={cancelar} disabled={!isDirty} className="px-5 py-2.5 border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-surface-container disabled:opacity-40">
              Cancelar Alterações
            </button>
            <button onClick={salvar} disabled={!isDirty} className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:opacity-90 active:scale-95 shadow-sm disabled:opacity-40">
              Salvar Configurações
            </button>
          </div>
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl border border-secondary/40 flex items-center gap-2 z-50">
          <Icon name="check_circle" className="text-emerald-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}

function PanelGerais({ config, update }) {
  return (
    <Card title="Configurações Gerais" icon="tune">
      <div className="space-y-5">
        <Field label="NOME DO SISTEMA">
          <input type="text" value={config.nomeSistema} onChange={(e) => update('nomeSistema', e.target.value)} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none" />
        </Field>
        <Field label="CNPJ DO MUNICÍPIO">
          <input type="text" value={config.cnpj} onChange={(e) => update('cnpj', e.target.value)} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg text-body-md font-mono focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none" />
        </Field>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="IDIOMA PRINCIPAL">
            <Select value={config.idioma} onChange={(v) => update('idioma', v)} options={['Português (Brasil)', 'English (US)', 'Español']} />
          </Field>
          <Field label="FUSO HORÁRIO">
            <Select value={config.fuso} onChange={(v) => update('fuso', v)} options={['(UTC-03:00) Brasília', '(UTC-04:00) Manaus', '(UTC-05:00) Acre']} />
          </Field>
        </div>
      </div>
    </Card>
  );
}

function PanelIdentidade({ config, update, logo, setLogo, fileInputRef, handleLogoChange, logoError, showToast }) {
  return (
    <Card title="Identidade Visual" icon="palette">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoChange} />
          <div className="flex gap-2 mt-3">
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 bg-primary text-on-primary py-2.5 rounded-lg text-label-sm font-bold flex items-center justify-center gap-2 hover:opacity-90">
              <Icon name="upload" className="text-base" /> Alterar Logo
            </button>
            {logo && (
              <button onClick={() => { setLogo(null); showToast('Logo removida.'); }} title="Remover logo" className="px-3 py-2.5 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container">
                <Icon name="delete" className="text-base" />
              </button>
            )}
          </div>
          {logoError && <p className="text-xs text-error mt-2">{logoError}</p>}
        </div>

        <div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant mb-2">COR PRIMÁRIA</p>
          <div className="flex gap-3">
            {colors.map((c) => {
              const active = config.primary === c.hex;
              return (
                <button key={c.hex} title={c.name} onClick={() => update('primary', c.hex)} className="flex flex-col items-center gap-1">
                  <span className={`w-14 h-14 rounded-xl border-2 transition-all ${active ? 'border-secondary scale-105 shadow-md' : 'border-transparent'}`} style={{ backgroundColor: c.hex }} />
                  {active && <span className="text-[10px] font-bold tracking-wider text-secondary">ATIVO</span>}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant mt-5 mb-2">HEXADECIMAL PERSONALIZADO</p>
          <div className="flex gap-2">
            <input type="text" value={config.primary} onChange={(e) => update('primary', e.target.value)} className="flex-1 px-4 py-2.5 border border-outline-variant rounded-lg text-body-md font-mono focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none" />
            <input type="color" value={config.primary} onChange={(e) => update('primary', e.target.value)} className="w-12 h-12 rounded-lg cursor-pointer border border-outline-variant" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function PanelSeguranca({ config, update }) {
  const s = config.seguranca;
  return (
    <Card title="Segurança e Acesso" icon="shield">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="TAMANHO MÍN. DA SENHA">
            <input type="number" min="6" max="32" value={s.senhaMinChars} onChange={(e) => update('seguranca.senhaMinChars', Number(e.target.value))} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </Field>
          <Field label="EXPIRAÇÃO (DIAS)">
            <input type="number" min="0" max="365" value={s.senhaExpira} onChange={(e) => update('seguranca.senhaExpira', Number(e.target.value))} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </Field>
          <Field label="TIMEOUT DE SESSÃO (MIN)">
            <input type="number" min="5" max="480" value={s.sessaoTimeout} onChange={(e) => update('seguranca.sessaoTimeout', Number(e.target.value))} className="w-full px-4 py-2.5 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </Field>
        </div>

        <Toggle label="Exigir caractere especial na senha" desc="Pelo menos um símbolo (!@#$%) é obrigatório" value={s.senhaSpecial} onChange={(v) => update('seguranca.senhaSpecial', v)} />
        <Toggle label="Autenticação em duas etapas (2FA)" desc="Obrigatória para todos os perfis administrativos" value={s.twoFA} onChange={(v) => update('seguranca.twoFA', v)} />
        <Toggle label="Log de auditoria detalhado" desc="Registra todas as ações sensíveis com timestamp imutável (5 anos)" value={s.auditLog} onChange={(v) => update('seguranca.auditLog', v)} />

        <Field label="WHITELIST DE IPs (UM POR LINHA, OPCIONAL)">
          <textarea rows="3" value={s.ipWhitelist} onChange={(e) => update('seguranca.ipWhitelist', e.target.value)} placeholder="Ex: 192.168.1.0/24&#10;200.100.50.5" className="w-full px-4 py-2.5 border border-outline-variant rounded-lg outline-none focus:border-secondary font-mono text-xs resize-none" />
        </Field>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2">
          <Icon name="info" className="text-base mt-0.5" />
          <span>Alterações de segurança forçarão re-login de todos os usuários ativos.</span>
        </div>
      </div>
    </Card>
  );
}

function PanelNotificacoes({ config, update }) {
  const n = config.notificacoes;
  return (
    <Card title="Notificações" icon="notifications">
      <div className="space-y-4">
        <Toggle label="E-mail: novos protocolos" desc="Receber e-mail a cada protocolo aberto na minha base" value={n.emailNovosProtocolos} onChange={(v) => update('notificacoes.emailNovosProtocolos', v)} />
        <Toggle label="E-mail: menções em redes sociais" desc="Alertas quando o vereador é mencionado em mídia monitorada" value={n.emailMencoes} onChange={(v) => update('notificacoes.emailMencoes', v)} />
        <Toggle label="Push: protocolos urgentes" desc="Notificações push no celular para casos críticos" value={n.pushUrgentes} onChange={(v) => update('notificacoes.pushUrgentes', v)} />
        <Toggle label="SMS: apenas críticos" desc="SMS reservado para emergências (saúde, saneamento, segurança)" value={n.smsCriticos} onChange={(v) => update('notificacoes.smsCriticos', v)} />
        <Toggle label="Digest semanal" desc="Resumo executivo enviado toda segunda-feira por e-mail" value={n.digestSemanal} onChange={(v) => update('notificacoes.digestSemanal', v)} />

        {n.digestSemanal && (
          <Field label="HORÁRIO DO DIGEST">
            <input type="time" value={n.horarioDigest} onChange={(e) => update('notificacoes.horarioDigest', e.target.value)} className="px-4 py-2.5 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </Field>
        )}
      </div>
    </Card>
  );
}

function PanelIntegracoes({ config, update, showToast }) {
  const i = config.integracoes;
  function testar(nome) { showToast(`Testando conexão com ${nome}...`); }
  return (
    <Card title="Integrações" icon="link">
      <div className="space-y-3">
        <IntegrationRow
          name="Gov.br" desc="SSO via OAuth 2.0 do Governo Federal" icon="public" tone="bg-emerald-100 text-emerald-700"
          ativo={i.govbr.ativo} onToggle={(v) => update('integracoes.govbr.ativo', v)}
          campo={{ label: 'Client ID', value: i.govbr.clientId, onChange: (v) => update('integracoes.govbr.clientId', v), placeholder: 'cnpj.client.id' }}
          onTestar={() => testar('Gov.br')}
        />
        <IntegrationRow
          name="Protheus (TOTVS)" desc="ERP integrado para folha e RH" icon="business" tone="bg-secondary/10 text-secondary"
          ativo={i.protheus.ativo} onToggle={(v) => update('integracoes.protheus.ativo', v)}
          campo={{ label: 'Endpoint REST', value: i.protheus.endpoint, onChange: (v) => update('integracoes.protheus.endpoint', v), placeholder: 'https://protheus.gov.br/rest' }}
          onTestar={() => testar('Protheus')}
        />
        <IntegrationRow
          name="SAP" desc="Integração financeira e tributária" icon="account_balance" tone="bg-purple-100 text-purple-700"
          ativo={i.sap.ativo} onToggle={(v) => update('integracoes.sap.ativo', v)}
          campo={{ label: 'Endpoint S/4HANA', value: i.sap.endpoint, onChange: (v) => update('integracoes.sap.endpoint', v), placeholder: 'https://sap.gov.br/api' }}
          onTestar={() => testar('SAP')}
        />
        <IntegrationRow
          name="1Doc" desc="Gestão eletrônica de documentos (GED)" icon="description" tone="bg-amber-100 text-amber-700"
          ativo={i.onedoc.ativo} onToggle={(v) => update('integracoes.onedoc.ativo', v)}
          campo={{ label: 'Webhook URL', value: i.onedoc.webhook, onChange: (v) => update('integracoes.onedoc.webhook', v), placeholder: 'https://app.1doc.com.br/webhook' }}
          onTestar={() => testar('1Doc')}
        />
        <IntegrationRow
          name="WhatsApp Business" desc="Meta Cloud API para disparos oficiais" icon="chat" tone="bg-emerald-100 text-emerald-700"
          ativo={i.whatsapp.ativo} onToggle={(v) => update('integracoes.whatsapp.ativo', v)}
          campo={{ label: 'Phone Number ID', value: i.whatsapp.phoneId, onChange: (v) => update('integracoes.whatsapp.phoneId', v), placeholder: '1234567890' }}
          onTestar={() => testar('WhatsApp')}
        />
        <IntegrationRow
          name="SendGrid" desc="Servidor de e-mail transacional" icon="mail" tone="bg-sky-100 text-sky-700"
          ativo={i.sendgrid.ativo} onToggle={(v) => update('integracoes.sendgrid.ativo', v)}
          campo={{ label: 'API Key', value: i.sendgrid.key, onChange: (v) => update('integracoes.sendgrid.key', v), placeholder: 'SG.xxxxxxxxxxxx' }}
          onTestar={() => testar('SendGrid')}
        />
      </div>
    </Card>
  );
}

function IntegrationRow({ name, desc, icon, tone, ativo, onToggle, campo, onTestar }) {
  return (
    <div className={`border rounded-xl p-4 transition-all ${ativo ? 'border-secondary/40 bg-secondary/5' : 'border-outline-variant/40 bg-surface-container-low/30'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${tone} flex items-center justify-center flex-shrink-0`}>
          <Icon name={icon} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div>
              <p className="font-bold text-on-surface flex items-center gap-2">
                {name}
                {ativo && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">ATIVO</span>}
              </p>
              <p className="text-xs text-on-surface-variant">{desc}</p>
            </div>
            <Toggle small value={ativo} onChange={onToggle} />
          </div>
          {ativo && (
            <div className="mt-3 flex gap-2">
              <input
                value={campo.value}
                onChange={(e) => campo.onChange(e.target.value)}
                placeholder={campo.placeholder}
                className="flex-1 px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary text-xs font-mono"
              />
              <button onClick={onTestar} className="px-3 py-2 border border-secondary text-secondary rounded-lg text-xs font-bold hover:bg-secondary hover:text-on-secondary">
                Testar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ label, desc, value, onChange, small }) {
  if (small) {
    return (
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-secondary' : 'bg-surface-container'}`}
      >
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    );
  }
  return (
    <label className="flex items-center justify-between gap-4 p-3 border border-outline-variant/40 rounded-xl cursor-pointer hover:bg-surface-container-low/40">
      <div>
        <p className="font-semibold text-on-surface text-sm">{label}</p>
        <p className="text-xs text-on-surface-variant">{desc}</p>
      </div>
      <Toggle small value={value} onChange={onChange} />
    </label>
  );
}

// ===== Trilha de Auditoria =====
const AUDIT_USUARIOS = ['Ricardo Costa', 'Ana Martins', 'Júlio Silva', 'Beatriz Rocha', 'Carlos Dias', 'Patrícia Lima', 'Marcelo Rocha'];
const AUDIT_ACOES = [
  { tipo: 'EXPORT', tone: 'bg-blue-100 text-blue-700', acao: 'Exportou Relatório de Competidores', modulo: 'Inteligência' },
  { tipo: 'UPDATE', tone: 'bg-amber-100 text-amber-700', acao: 'Atualizou Dados Tributários Q3', modulo: 'Transparência' },
  { tipo: 'CREATE', tone: 'bg-emerald-100 text-emerald-700', acao: 'Criou Novo Usuário: Auditor_2', modulo: 'Atividades' },
  { tipo: 'DELETE', tone: 'bg-error/10 text-error', acao: 'Removeu Anexo: licitacao_04.pdf', modulo: 'Transparência' },
  { tipo: 'LOGIN', tone: 'bg-purple-100 text-purple-700', acao: 'Acesso ao painel administrativo', modulo: 'Auth' },
  { tipo: 'UPDATE', tone: 'bg-amber-100 text-amber-700', acao: 'Alterou cor primária do tema', modulo: 'Configurações' },
  { tipo: 'EXPORT', tone: 'bg-blue-100 text-blue-700', acao: 'Baixou Base de Cidadãos (CSV)', modulo: 'Usuários' },
  { tipo: 'CREATE', tone: 'bg-emerald-100 text-emerald-700', acao: 'Disparou campanha #CAM-A3X91', modulo: 'Comunicação' },
  { tipo: 'UPDATE', tone: 'bg-amber-100 text-amber-700', acao: 'Mudou status do protocolo PRT-9041', modulo: 'Protocolos' },
  { tipo: 'DELETE', tone: 'bg-error/10 text-error', acao: 'Arquivou protocolo PRT-8870', modulo: 'Protocolos' },
];
const AUDIT_DEVICES = [
  { ip: '189.122.45.10', dev: 'macOS / Chrome' },
  { ip: '177.34.12.89', dev: 'Windows 11 / Edge' },
  { ip: '192.168.1.1', dev: 'Internal Server' },
  { ip: '200.155.78.4', dev: 'Android / Mobile' },
  { ip: '170.83.22.99', dev: 'iPhone / Safari' },
];
const MODULES = ['Todos', 'Inteligência', 'Transparência', 'Atividades', 'Auth', 'Configurações', 'Usuários', 'Comunicação', 'Protocolos'];
const TIPOS = ['Todos', 'EXPORT', 'UPDATE', 'CREATE', 'DELETE', 'LOGIN'];

function generateAuditLogs() {
  const logs = [];
  const now = Date.now();
  for (let i = 0; i < 50; i++) {
    const a = AUDIT_ACOES[i % AUDIT_ACOES.length];
    const u = AUDIT_USUARIOS[i % AUDIT_USUARIOS.length];
    const d = AUDIT_DEVICES[i % AUDIT_DEVICES.length];
    const ts = new Date(now - i * 1000 * 60 * (3 + (i % 17)));
    logs.push({
      id: i + 1,
      timestamp: ts,
      usuario: u,
      cargo: i % 3 === 0 ? 'Analista Fiscal' : i % 3 === 1 ? 'Coord. Transparência' : 'TI Admin',
      ...a,
      ip: d.ip,
      dispositivo: d.dev,
    });
  }
  return logs;
}

function PanelAuditoria({ showToast }) {
  const [logs] = useState(generateAuditLogs);
  const [search, setSearch] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [filterModulo, setFilterModulo] = useState('Todos');
  const [dataDe, setDataDe] = useState('');
  const [dataAte, setDataAte] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const PER_PAGE = 10;

  const filtered = logs.filter((l) => {
    if (search && !`${l.acao} ${l.usuario} ${l.ip} ${l.modulo}`.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterUser && !l.usuario.toLowerCase().includes(filterUser.toLowerCase())) return false;
    if (filterTipo !== 'Todos' && l.tipo !== filterTipo) return false;
    if (filterModulo !== 'Todos' && l.modulo !== filterModulo) return false;
    if (dataDe && l.timestamp < new Date(dataDe)) return false;
    if (dataAte && l.timestamp > new Date(dataAte + 'T23:59:59')) return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const stats = {
    hoje: logs.filter((l) => l.timestamp.toDateString() === new Date().toDateString()).length,
    criticos: logs.filter((l) => l.tipo === 'DELETE').length,
    sessoes: new Set(logs.slice(0, 20).map((l) => l.usuario)).size,
  };

  function exportarCSV() {
    const rows = [['Timestamp', 'Usuário', 'Cargo', 'Tipo', 'Ação', 'Módulo', 'IP', 'Dispositivo']];
    filtered.forEach((l) => rows.push([l.timestamp.toISOString(), l.usuario, l.cargo, l.tipo, l.acao, l.modulo, l.ip, l.dispositivo]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${filtered.length} eventos exportados.`);
  }

  function limpar() {
    setSearch(''); setFilterUser(''); setFilterTipo('Todos'); setFilterModulo('Todos'); setDataDe(''); setDataAte(''); setPage(1);
    showToast('Filtros limpos.');
  }

  return (
    <div className="space-y-4">
      <Card title="Trilha de Auditoria" icon="fact_check">
        <div className="relative mb-5">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Pesquisar logs (ação, usuário, IP, módulo)..."
            className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          <AuditStat label="Total de Ações Hoje" value={stats.hoje.toLocaleString('pt-BR')} delta="+12% em relação a ontem" icon="task" tone="bg-secondary/10 text-secondary" deltaTone="text-emerald-600" />
          <AuditStat label="Eventos Críticos" value={stats.criticos} delta="Requerem atenção imediata" icon="priority_high" tone="bg-error/10 text-error" deltaTone="text-error" />
          <AuditStat label="Sessões Ativas" value={stats.sessoes} delta="Usuários logados agora" icon="shield" tone="bg-emerald-100 text-emerald-700" deltaTone="text-on-surface-variant" />
        </div>

        <div className="border border-outline-variant/40 rounded-xl p-4 mb-5 bg-surface-container-low/30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3">
            <Field label="USUÁRIO / MEMBRO">
              <input value={filterUser} onChange={(e) => { setFilterUser(e.target.value); setPage(1); }} placeholder="Filtrar por nome..." className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
            <Field label="TIPO DE AÇÃO">
              <select value={filterTipo} onChange={(e) => { setFilterTipo(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="MÓDULO">
              <select value={filterModulo} onChange={(e) => { setFilterModulo(e.target.value); setPage(1); }} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                {MODULES.map((m) => <option key={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="INTERVALO DE DATAS">
              <div className="flex gap-1 items-center">
                <input type="date" value={dataDe} onChange={(e) => { setDataDe(e.target.value); setPage(1); }} className="flex-1 px-2 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary text-xs" />
                <span className="text-xs text-on-surface-variant">até</span>
                <input type="date" value={dataAte} onChange={(e) => { setDataAte(e.target.value); setPage(1); }} className="flex-1 px-2 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary text-xs" />
              </div>
            </Field>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={limpar} className="px-4 py-2 border border-outline-variant rounded-lg text-label-sm font-bold">Limpar</button>
            <button onClick={() => showToast(`${filtered.length} eventos exibidos.`)} className="bg-secondary text-on-secondary px-4 py-2 rounded-lg text-label-sm font-bold flex items-center gap-1">
              <Icon name="filter_alt" className="text-base" /> Aplicar Filtros
            </button>
            <button onClick={exportarCSV} title="Exportar CSV" className="px-3 py-2 border border-outline-variant rounded-lg hover:bg-surface-container">
              <Icon name="table_view" className="text-base text-on-surface-variant" />
            </button>
            <button onClick={exportarCSV} title="Exportar Excel" className="px-3 py-2 border border-outline-variant rounded-lg hover:bg-surface-container">
              <Icon name="download" className="text-base text-on-surface-variant" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-outline-variant/40 rounded-xl">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-[10px] font-bold tracking-[0.12em] text-on-surface-variant uppercase">
              <tr>
                <th className="text-left px-3 py-3">Timestamp</th>
                <th className="text-left px-3 py-3">Usuário/Conta</th>
                <th className="text-left px-3 py-3">Ação</th>
                <th className="text-left px-3 py-3">Módulo</th>
                <th className="text-left px-3 py-3">IP / Dispositivo</th>
                <th className="text-right px-3 py-3">Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-12 text-center text-on-surface-variant text-sm">
                  Nenhum log encontrado para os filtros aplicados.
                </td></tr>
              )}
              {pageItems.map((l) => (
                <tr key={l.id} className="border-t border-outline-variant/30 hover:bg-surface-container-low/40">
                  <td className="px-3 py-3 text-xs">
                    <p className="font-semibold">{l.timestamp.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} {l.timestamp.getFullYear()}</p>
                    <p className="text-[10px] text-on-surface-variant">{l.timestamp.toLocaleTimeString('pt-BR')}</p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-[10px] font-bold">
                        {l.usuario.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">{l.usuario}</p>
                        <p className="text-[10px] text-on-surface-variant">{l.cargo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${l.tone}`}>{l.tipo}</span>
                      <p className="text-on-surface mt-1">{l.acao}</p>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-on-surface-variant text-xs">{l.modulo}</td>
                  <td className="px-3 py-3 text-xs">
                    <p className="font-mono text-on-surface">{l.ip}</p>
                    <p className="text-[10px] text-on-surface-variant">{l.dispositivo}</p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <button onClick={() => setDetail(l)} className="text-secondary text-xs font-bold hover:underline">Ver Detalhes</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-between items-center mt-4 text-xs text-on-surface-variant">
          <span>Exibindo {pageItems.length ? (page - 1) * PER_PAGE + 1 : 0}-{Math.min(page * PER_PAGE, filtered.length)} de {filtered.length} resultados</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-outline-variant rounded disabled:opacity-40"><Icon name="chevron_left" className="text-base" /></button>
            <span className="font-semibold">Página {page} de {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-outline-variant rounded disabled:opacity-40"><Icon name="chevron_right" className="text-base" /></button>
          </div>
        </div>
      </Card>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${detail.tone}`}>{detail.tipo}</span>
                Detalhes do Evento
              </h3>
              <button onClick={() => setDetail(null)} className="text-on-surface-variant"><Icon name="close" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <DetailLine label="Ação" value={detail.acao} />
              <DetailLine label="Timestamp" value={detail.timestamp.toLocaleString('pt-BR')} />
              <DetailLine label="Usuário" value={`${detail.usuario} — ${detail.cargo}`} />
              <DetailLine label="Módulo" value={detail.modulo} />
              <DetailLine label="IP de origem" value={detail.ip} mono />
              <DetailLine label="Dispositivo" value={detail.dispositivo} />
              <DetailLine label="ID do evento" value={`AUD-${String(detail.id).padStart(8, '0')}`} mono />
              <DetailLine label="Hash de integridade" value={`sha256:${(detail.id * 31337).toString(16).padStart(64, 'a')}`} mono small />
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 text-[11px] text-emerald-800 flex items-start gap-2 mt-4">
              <Icon name="verified" className="text-base mt-0.5" />
              <span>Evento auditado e imutável. Conforme LGPD art. 37, este log é retido por 5 anos.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AuditStat({ label, value, delta, icon, tone, deltaTone }) {
  return (
    <div className="border border-outline-variant/40 rounded-xl p-4 bg-surface-container-low/30">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label.toUpperCase()}</p>
        <div className={`w-9 h-9 rounded-lg ${tone} flex items-center justify-center`}><Icon name={icon} /></div>
      </div>
      <p className="text-3xl font-bold text-primary mt-2">{value}</p>
      <p className={`text-[10px] mt-1 flex items-center gap-1 ${deltaTone}`}>
        {label.includes('Críticos') && <Icon name="warning" className="text-sm" />}
        {label.includes('Ações Hoje') && <Icon name="trending_up" className="text-sm" />}
        {label.includes('Sessões') && <Icon name="group" className="text-sm" />}
        {delta}
      </p>
    </div>
  );
}

function DetailLine({ label, value, mono, small }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label.toUpperCase()}</p>
      <p className={`mt-0.5 ${mono ? 'font-mono' : ''} ${small ? 'text-[10px] break-all' : ''}`}>{value}</p>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
      <h3 className="text-headline-md flex items-center gap-2 mb-6">
        <Icon name={icon} className="text-secondary" /> {title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-[10px] font-bold tracking-[0.15em] text-on-surface-variant mb-2">{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none bg-white px-4 py-2.5 pr-10 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none cursor-pointer">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <Icon name="expand_more" className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-base" />
    </div>
  );
}
