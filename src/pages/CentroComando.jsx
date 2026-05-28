import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { integrations, dispatchCampaign, getDispatchHistory } from '../services/comunicacao.js';

const kpis = [
  { label: 'BASE DE CIDADÃOS', value: '128.492', delta: '+2.4k este mês', icon: 'groups', tone: 'bg-secondary/10 text-secondary', deltaColor: 'text-emerald-600' },
  { label: 'ENGAJAMENTO MÉDIO', value: '74,8%', delta: '+5,1 pp vs trimestre', icon: 'trending_up', tone: 'bg-emerald-100 text-emerald-700', deltaColor: 'text-emerald-600' },
  { label: 'PARLAMENTARES ATIVOS', value: '21 / 23', delta: '2 com scraping inativo', icon: 'how_to_vote', tone: 'bg-primary/10 text-primary', deltaColor: 'text-amber-600' },
  { label: 'CRÉDITOS DISPONÍVEIS', value: '48.210', delta: 'Ciclo encerra em 12 dias', icon: 'savings', tone: 'bg-amber-100 text-amber-700', deltaColor: 'text-on-surface-variant' },
];

const initialVereadores = [
  { id: 1, name: 'Ricardo Mendes', party: 'PSD', district: 'Zona Norte', base: 8420, share: 78, status: 'Ativo', last: 'há 2 min', engagement: 92, email: 'ricardo.mendes@camara.gov.br', phone: '(31) 99999-0001' },
  { id: 2, name: 'Ana Paula Vaz', party: 'PT', district: 'Zona Sul', base: 6310, share: 58, status: 'Ativo', last: 'há 8 min', engagement: 78, email: 'ana.vaz@camara.gov.br', phone: '(31) 99999-0002' },
  { id: 3, name: 'Sérgio Freitas', party: 'MDB', district: 'Centro', base: 3120, share: 28, status: 'Lento', last: 'há 47 min', engagement: 41, email: 'sergio.freitas@camara.gov.br', phone: '(31) 99999-0003' },
  { id: 4, name: 'Carla Nogueira', party: 'PSDB', district: 'Zona Leste', base: 5240, share: 49, status: 'Ativo', last: 'há 4 min', engagement: 65, email: 'carla.nogueira@camara.gov.br', phone: '(31) 99999-0004' },
  { id: 5, name: 'João Batista', party: 'PL', district: 'Zona Oeste', base: 2870, share: 26, status: 'Inativo', last: 'há 6h', engagement: 22, email: 'joao.batista@camara.gov.br', phone: '(31) 99999-0005' },
];

const PARTIES = ['PSD', 'PT', 'MDB', 'PSDB', 'PL', 'PP', 'UNIÃO', 'PDT', 'REPUBLICANOS', 'PSB', 'PV', 'NOVO'];
const DISTRICTS = ['Centro', 'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste'];
const STATUSES = ['Ativo', 'Lento', 'Inativo'];

const statusTone = {
  'Ativo': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Lento': 'bg-amber-50 text-amber-700 border-amber-200',
  'Inativo': 'bg-error/10 text-error border-error/30',
};
const statusDot = {
  'Ativo': 'bg-emerald-500 animate-pulse',
  'Lento': 'bg-amber-500',
  'Inativo': 'bg-error',
};

const canais = [
  { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', credit: 0.04, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
  { id: 'sms', label: 'SMS', icon: 'sms', credit: 0.08, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  { id: 'push', label: 'Push', icon: 'notifications_active', credit: 0.01, color: 'text-secondary-fixed-dim', bg: 'bg-secondary/20' },
  { id: 'email', label: 'E-mail', icon: 'mail', credit: 0.005, color: 'text-sky-300', bg: 'bg-sky-500/15' },
];

export default function CentroComando() {
  const [tab, setTab] = useState('whatsapp');
  const [selected, setSelected] = useState({ whatsapp: true, sms: false, push: true, email: false });
  const [audience, setAudience] = useState(12400);
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mediaType, setMediaType] = useState('none');
  const [mediaPreview, setMediaPreview] = useState(null);
  const [segmentMandato, setSegmentMandato] = useState('Todos os parlamentares');
  const [segmentDistrito, setSegmentDistrito] = useState('Todos os bairros');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState(() => getDispatchHistory());
  const [impactOpen, setImpactOpen] = useState(false);

  // CRUD parlamentares
  const [vereadores, setVereadores] = useState(initialVereadores);
  const [search, setSearch] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterDistrict, setFilterDistrict] = useState('Todos');
  const [editing, setEditing] = useState(null); // { mode: 'new'|'edit'|'view', data }
  const [menuOpen, setMenuOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [toast, setToast] = useState(null);

  function showToast(msg, tone = 'success') {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2800);
  }

  const filteredVereadores = vereadores.filter((v) => {
    if (filterStatus !== 'Todos' && v.status !== filterStatus) return false;
    if (filterDistrict !== 'Todos' && v.district !== filterDistrict) return false;
    if (search && !`${v.name} ${v.party} ${v.district}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function saveVereador(data) {
    if (data.id) {
      setVereadores((arr) => arr.map((v) => v.id === data.id ? { ...v, ...data } : v));
      showToast(`${data.name} atualizado com sucesso.`);
    } else {
      const newV = { ...data, id: Date.now(), base: 0, share: 0, engagement: 0, last: 'agora', status: 'Ativo' };
      setVereadores((arr) => [newV, ...arr]);
      showToast(`${data.name} cadastrado com sucesso.`);
    }
    setEditing(null);
  }

  function deleteVereador(id) {
    const v = vereadores.find((x) => x.id === id);
    setVereadores((arr) => arr.filter((x) => x.id !== id));
    setConfirmDelete(null);
    setMenuOpen(null);
    showToast(`${v?.name} removido do sistema.`, 'error');
  }

  function toggleStatus(id) {
    setVereadores((arr) => arr.map((v) => {
      if (v.id !== id) return v;
      const next = v.status === 'Ativo' ? 'Inativo' : 'Ativo';
      return { ...v, status: next, last: 'agora' };
    }));
    setMenuOpen(null);
    showToast('Status atualizado.');
  }

  const activeChannels = canais.filter((c) => selected[c.id]);
  const estimatedCost = activeChannels.reduce((acc, c) => acc + c.credit * audience, 0);
  const credits = 48210;
  const canDispatch = activeChannels.length > 0 && message.trim().length >= 10 && estimatedCost <= credits && !sending;

  async function handleDispatch() {
    setError('');
    setSending(true);
    setProgress({});
    setResult(null);
    try {
      const entry = await dispatchCampaign({
        channels: activeChannels.map((c) => c.id),
        message,
        audience,
        segmentation: { mandato: segmentMandato, distrito: segmentDistrito },
        media: mediaPreview || videoUrl,
        link,
        onProgress: ({ channel, pct }) => setProgress((p) => ({ ...p, [channel]: pct })),
      });
      setResult(entry);
      setHistory(getDispatchHistory());
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  function resetDispatch() {
    setConfirmOpen(false);
    setResult(null);
    setError('');
    setProgress({});
    setMessage('');
    setMediaPreview(null);
    setLink('');
    setVideoUrl('');
  }

  function handleMediaUpload(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert('Imagem deve ter no máximo 5MB.');
    const reader = new FileReader();
    reader.onload = () => setMediaPreview(reader.result);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative rounded-2xl overflow-hidden bg-primary text-on-primary p-7 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1920&q=70')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,#316bf3,transparent_55%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="inline-block bg-secondary/20 text-secondary-fixed-dim text-[10px] font-bold tracking-[0.2em] px-2 py-1 rounded">
              ADMINISTRAÇÃO MASTER
            </span>
            <h2 className="text-headline-xl leading-tight mt-3">Painel de Coordenação Legislativa</h2>
            <p className="text-on-primary-container mt-2 max-w-2xl">
              Governança centralizada de mandatos, base de usuários vinculada e monitoramento social.
              Orquestre comunicação multicanal em larga escala com auditoria em tempo real.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setImpactOpen(true)}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-label-sm font-bold flex items-center gap-2 backdrop-blur"
            >
              <Icon name="insights" className="text-base" /> Análise de Impacto
            </button>
            <button
              onClick={() => setEditing({ mode: 'new', data: { name: '', party: PARTIES[0], district: DISTRICTS[0], email: '', phone: '' } })}
              className="px-4 py-2.5 bg-secondary hover:opacity-90 text-on-secondary rounded-lg text-label-sm font-bold flex items-center gap-2 shadow-lg shadow-secondary/30"
            >
              <Icon name="person_add" className="text-base" /> Cadastrar Parlamentar
            </button>
          </div>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter-md">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant">{k.label}</span>
              <div className={`w-9 h-9 rounded-xl ${k.tone} flex items-center justify-center`}>
                <Icon name={k.icon} className="text-base" />
              </div>
            </div>
            <p className="text-headline-lg text-primary mt-4">{k.value}</p>
            <p className={`text-xs mt-1 ${k.deltaColor}`}>{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Tabela de Vereadores */}
        <div className="col-span-12 xl:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm">
          <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-headline-md flex items-center gap-2">
                <Icon name="how_to_vote" className="text-secondary" /> Coordenação de Parlamentares
              </h3>
              <p className="text-on-surface-variant text-label-sm">
                Base vinculada, engajamento e status do monitoramento social por mandato.
              </p>
            </div>
            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar parlamentar, partido ou distrito..."
                  className="pl-9 pr-3 py-2 border border-outline-variant rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 outline-none w-72"
                />
              </div>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`p-2 border rounded-lg ${filterOpen || filterStatus !== 'Todos' || filterDistrict !== 'Todos' ? 'border-secondary text-secondary bg-secondary/10' : 'border-outline-variant text-on-surface-variant'} hover:bg-surface-container`}
                title="Filtros"
              >
                <Icon name="filter_list" className="text-base" />
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-4 z-20">
                  <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">STATUS</p>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full mb-3 px-3 py-2 border border-outline-variant rounded-lg text-sm outline-none focus:border-secondary">
                    <option>Todos</option>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">DISTRITO</p>
                  <select value={filterDistrict} onChange={(e) => setFilterDistrict(e.target.value)} className="w-full mb-3 px-3 py-2 border border-outline-variant rounded-lg text-sm outline-none focus:border-secondary">
                    <option>Todos</option>
                    {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                  <div className="flex gap-2">
                    <button onClick={() => { setFilterStatus('Todos'); setFilterDistrict('Todos'); }} className="flex-1 py-1.5 border border-outline-variant rounded-lg text-xs font-bold">Limpar</button>
                    <button onClick={() => setFilterOpen(false)} className="flex-1 py-1.5 bg-secondary text-on-secondary rounded-lg text-xs font-bold">Aplicar</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
                <tr>
                  <th className="text-left px-5 py-3">Parlamentar</th>
                  <th className="text-left px-5 py-3">Distrito</th>
                  <th className="text-left px-5 py-3">Base Vinculada</th>
                  <th className="text-left px-5 py-3">Engajamento</th>
                  <th className="text-left px-5 py-3">Scraping Social</th>
                  <th className="text-right px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredVereadores.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-on-surface-variant text-sm">
                    Nenhum parlamentar encontrado para os filtros aplicados.
                  </td></tr>
                )}
                {filteredVereadores.map((v) => (
                  <tr key={v.id} className="border-t border-outline-variant/30 hover:bg-surface-container-low/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                          {v.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface text-sm">{v.name}</p>
                          <p className="text-[10px] text-on-surface-variant">{v.party} • Mandato 2021-2024</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-body-md text-on-surface-variant">{v.district}</td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-on-surface">{v.base.toLocaleString('pt-BR')}</p>
                      <p className="text-[10px] text-on-surface-variant">{v.share}% do território</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 w-32">
                        <div className="flex-1 h-1.5 rounded-full bg-surface-container">
                          <div
                            className={`h-1.5 rounded-full ${v.engagement > 60 ? 'bg-emerald-500' : v.engagement > 35 ? 'bg-amber-500' : 'bg-error'}`}
                            style={{ width: `${v.engagement}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-on-surface">{v.engagement}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold ${statusTone[v.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusDot[v.status]}`} />
                        {v.status.toUpperCase()}
                      </span>
                      <p className="text-[10px] text-on-surface-variant mt-1">Sync {v.last}</p>
                    </td>
                    <td className="px-5 py-4 text-right relative">
                      <div className="flex justify-end gap-1 text-on-surface-variant">
                        <button onClick={() => setEditing({ mode: 'view', data: v })} title="Ver mandato" className="p-1.5 hover:text-secondary hover:bg-surface-container rounded-lg">
                          <Icon name="visibility" className="text-base" />
                        </button>
                        <button onClick={() => setEditing({ mode: 'edit', data: { ...v } })} title="Editar" className="p-1.5 hover:text-secondary hover:bg-surface-container rounded-lg">
                          <Icon name="edit" className="text-base" />
                        </button>
                        <button onClick={() => setMenuOpen(menuOpen === v.id ? null : v.id)} title="Mais" className="p-1.5 hover:text-secondary hover:bg-surface-container rounded-lg">
                          <Icon name="more_vert" className="text-base" />
                        </button>
                      </div>
                      {menuOpen === v.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-5 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-lg shadow-xl py-1 w-48 z-20 text-left">
                            <button onClick={() => { toggleStatus(v.id); }} className="w-full px-3 py-2 text-sm hover:bg-surface-container flex items-center gap-2">
                              <Icon name="power_settings_new" className="text-base text-secondary" />
                              {v.status === 'Ativo' ? 'Inativar' : 'Ativar'}
                            </button>
                            <a href={`mailto:${v.email}`} className="w-full px-3 py-2 text-sm hover:bg-surface-container flex items-center gap-2">
                              <Icon name="mail" className="text-base text-secondary" /> Enviar e-mail
                            </a>
                            <a href={`tel:${v.phone}`} className="w-full px-3 py-2 text-sm hover:bg-surface-container flex items-center gap-2">
                              <Icon name="call" className="text-base text-secondary" /> Ligar
                            </a>
                            <div className="border-t border-outline-variant/40 my-1" />
                            <button onClick={() => { setConfirmDelete(v); setMenuOpen(null); }} className="w-full px-3 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2">
                              <Icon name="delete" className="text-base" /> Excluir
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest text-label-sm text-on-surface-variant">
            <span>Exibindo {filteredVereadores.length} de {vereadores.length} parlamentares</span>
            <div className="flex items-center gap-2">
              <button className="p-1.5 border border-outline-variant rounded-lg"><Icon name="chevron_left" className="text-base" /></button>
              <span className="px-3 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold">1</span>
              <button className="px-3 py-1.5 border border-outline-variant rounded-lg">2</button>
              <button className="px-3 py-1.5 border border-outline-variant rounded-lg">3</button>
              <button className="p-1.5 border border-outline-variant rounded-lg"><Icon name="chevron_right" className="text-base" /></button>
            </div>
          </div>
        </div>

        {/* Motor de Comunicação Multicanal */}
        <div className="col-span-12 xl:col-span-4">
          <div className="bg-primary text-on-primary rounded-2xl p-5 shadow-xl sticky top-24">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Icon name="campaign" className="text-secondary-fixed-dim" /> Motor de Comunicação
                </h3>
                <p className="text-xs text-on-primary-container">Disparo multicanal segmentado e auditado.</p>
              </div>
              <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-bold tracking-wider px-2 py-1 rounded">
                ONLINE
              </span>
            </div>

            {/* Canais */}
            <div className="grid grid-cols-4 gap-1 mt-4 bg-primary-container/60 p-1 rounded-xl border border-white/10">
              {canais.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setTab(c.id)}
                  className={`flex flex-col items-center gap-1 py-2 rounded-lg text-[10px] font-bold transition-colors ${
                    tab === c.id ? 'bg-white/10 text-on-primary' : 'text-on-primary-container hover:text-on-primary'
                  }`}
                >
                  <Icon name={c.icon} className={`text-base ${c.color}`} />
                  {c.label}
                </button>
              ))}
            </div>

            {/* Seleção de canais */}
            <p className="text-[10px] font-bold tracking-wider text-on-primary-container mt-5 mb-2">CANAIS DE DISPARO</p>
            <div className="space-y-2">
              {canais.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-primary-container/60 border border-white/10 cursor-pointer hover:border-secondary/40"
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg ${c.bg} flex items-center justify-center`}>
                      <Icon name={c.icon} className={`text-sm ${c.color}`} />
                    </span>
                    <span className="text-sm font-semibold">{c.label}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="text-[10px] text-on-primary-container">
                      R$ {c.credit.toFixed(3)}/env
                    </span>
                    <input
                      type="checkbox"
                      checked={selected[c.id]}
                      onChange={() => setSelected((s) => ({ ...s, [c.id]: !s[c.id] }))}
                      className="accent-secondary w-4 h-4"
                    />
                  </span>
                </label>
              ))}
            </div>

            {/* Mensagem */}
            <div className="flex items-center justify-between mt-5 mb-2">
              <p className="text-[10px] font-bold tracking-wider text-on-primary-container">MENSAGEM</p>
              <span className={`text-[10px] ${message.length > 480 ? 'text-amber-300' : 'text-on-primary-container'}`}>
                {message.length}/500
              </span>
            </div>
            <textarea
              rows="4"
              maxLength={500}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escreva uma mensagem personalizada. Use {nome} para inserir o nome do cidadão."
              className="w-full bg-primary-container/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-primary placeholder:text-on-primary-container/60 outline-none focus:border-secondary resize-none"
            />
            <div className="flex gap-1 mt-2 text-[10px]">
              {['{nome}', '{bairro}', '{protocolo}'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setMessage((m) => m + ' ' + tag)}
                  className="px-2 py-1 rounded bg-secondary/15 text-secondary-fixed-dim font-mono hover:bg-secondary/25"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Mídia */}
            <p className="text-[10px] font-bold tracking-wider text-on-primary-container mt-4 mb-2">MÍDIA ANEXA</p>
            <div className="grid grid-cols-3 gap-1 bg-primary-container/60 p-1 rounded-lg border border-white/10 mb-2">
              {[
                { id: 'none', label: 'Nenhuma', icon: 'block' },
                { id: 'image', label: 'Imagem', icon: 'image' },
                { id: 'video', label: 'Vídeo', icon: 'play_circle' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMediaType(m.id)}
                  className={`flex items-center justify-center gap-1 py-1.5 rounded text-[10px] font-bold transition-colors ${
                    mediaType === m.id ? 'bg-white/10 text-on-primary' : 'text-on-primary-container hover:text-on-primary'
                  }`}
                >
                  <Icon name={m.icon} className="text-sm" /> {m.label}
                </button>
              ))}
            </div>

            {mediaType === 'image' && (
              <div className="space-y-2">
                {mediaPreview ? (
                  <div className="relative">
                    <img src={mediaPreview} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-white/10" />
                    <button
                      onClick={() => setMediaPreview(null)}
                      className="absolute top-1 right-1 w-7 h-7 rounded-full bg-black/60 hover:bg-error flex items-center justify-center"
                    >
                      <Icon name="close" className="text-sm" />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-white/20 rounded-lg p-4 text-center cursor-pointer hover:border-secondary transition-colors">
                    <Icon name="cloud_upload" className="text-2xl text-on-primary-container" />
                    <p className="text-xs text-on-primary-container mt-1">Clique para anexar imagem (até 5MB)</p>
                    <input type="file" accept="image/*" className="hidden" onChange={handleMediaUpload} />
                  </label>
                )}
              </div>
            )}

            {mediaType === 'video' && (
              <div className="relative">
                <Icon name="link" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-primary-container" />
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="URL do vídeo (YouTube, Vimeo, MP4)"
                  className="w-full bg-primary-container/60 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-primary placeholder:text-on-primary-container/60 outline-none focus:border-secondary"
                />
              </div>
            )}

            {/* Link CTA */}
            <p className="text-[10px] font-bold tracking-wider text-on-primary-container mt-4 mb-2">LINK DE AÇÃO (OPCIONAL)</p>
            <div className="relative">
              <Icon name="open_in_new" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-primary-container" />
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://prefeitura.gov.br/..."
                className="w-full bg-primary-container/60 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-primary placeholder:text-on-primary-container/60 outline-none focus:border-secondary"
              />
            </div>

            {/* Segmentação */}
            <p className="text-[10px] font-bold tracking-wider text-on-primary-container mt-5 mb-2">SEGMENTAÇÃO</p>
            <select
              value={segmentMandato}
              onChange={(e) => setSegmentMandato(e.target.value)}
              className="w-full bg-primary-container/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-primary mb-2 outline-none focus:border-secondary"
            >
              <option>Todos os parlamentares</option>
              {vereadores.map((v) => <option key={v.name}>{v.name} ({v.party})</option>)}
            </select>
            <select
              value={segmentDistrito}
              onChange={(e) => setSegmentDistrito(e.target.value)}
              className="w-full bg-primary-container/60 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-on-primary outline-none focus:border-secondary"
            >
              <option>Todos os bairros</option>
              <option>Centro</option>
              <option>Eldorado</option>
              <option>Cidade Industrial</option>
              <option>Riacho das Pedras</option>
              <option>Petrolândia</option>
              <option>Sapucaias</option>
            </select>

            <input
              type="range"
              min="1000"
              max="50000"
              step="500"
              value={audience}
              onChange={(e) => setAudience(Number(e.target.value))}
              className="w-full mt-4 accent-secondary"
            />
            <div className="flex justify-between text-[10px] text-on-primary-container">
              <span>1k</span>
              <span className="font-bold text-on-primary">{audience.toLocaleString('pt-BR')} cidadãos</span>
              <span>50k</span>
            </div>

            {/* Custo */}
            <div className="mt-4 p-4 rounded-xl bg-secondary/15 border border-secondary/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider text-on-primary-container">CUSTO ESTIMADO</span>
                <span className="text-[10px] text-on-primary-container">
                  {activeChannels.length} canal{activeChannels.length !== 1 ? 'is' : ''}
                </span>
              </div>
              <p className="text-3xl font-bold mt-1">
                R$ {estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <div className="flex items-center justify-between mt-2 text-[10px] text-on-primary-container">
                <span className="flex items-center gap-1">
                  <Icon name="savings" className="text-sm" /> {credits.toLocaleString('pt-BR')} créditos disponíveis
                </span>
                <span className={`font-bold ${estimatedCost > credits ? 'text-error' : 'text-emerald-300'}`}>
                  {estimatedCost > credits ? 'Saldo insuficiente' : 'Saldo OK'}
                </span>
              </div>
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-error/15 border border-error/30 text-xs text-error">
                {error}
              </div>
            )}

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canDispatch}
              className="w-full mt-4 bg-secondary text-on-secondary font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Icon name="send" className="text-base" /> DISPARAR CAMPANHA
            </button>
            <button onClick={() => setHistoryOpen(true)} className="w-full mt-2 text-on-primary-container text-xs font-semibold hover:text-on-primary py-2 flex items-center justify-center gap-1">
              <Icon name="history" className="text-sm" /> Ver histórico de disparos ({history.length})
            </button>

            {/* Status das integrações */}
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] font-bold tracking-wider text-on-primary-container mb-2">INTEGRAÇÕES</p>
              <div className="space-y-1.5">
                {Object.entries(integrations).map(([id, i]) => (
                  <div key={id} className="flex items-center justify-between text-[10px]">
                    <span className="text-on-primary-container truncate">{i.name}</span>
                    <span className={`px-1.5 py-0.5 rounded font-bold ${i.configured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                      {i.configured ? 'CONFIG.' : 'DEMO'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: confirmação / progresso / resultado */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => !sending && (result ? resetDispatch() : setConfirmOpen(false))}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            {result ? (
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Icon name="check_circle" className="text-5xl" />
                </div>
                <h3 className="text-headline-md mt-4 text-primary">Campanha disparada!</h3>
                <p className="text-on-surface-variant mt-1">Protocolo <span className="font-mono font-bold text-secondary">#{result.id}</span></p>
                <div className="grid grid-cols-3 gap-2 mt-5">
                  <div className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] tracking-wider text-on-surface-variant">ENTREGUES</p>
                    <p className="text-xl font-bold text-emerald-600">{result.delivered.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] tracking-wider text-on-surface-variant">FALHAS</p>
                    <p className="text-xl font-bold text-error">{result.failed.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="bg-surface-container rounded-lg p-3">
                    <p className="text-[10px] tracking-wider text-on-surface-variant">CUSTO</p>
                    <p className="text-xl font-bold text-primary">R$ {result.cost.toFixed(2)}</p>
                  </div>
                </div>
                <button onClick={resetDispatch} className="mt-5 px-5 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm">
                  Fechar
                </button>
              </div>
            ) : sending ? (
              <div className="text-center">
                <h3 className="text-headline-md text-primary">Disparando campanha...</h3>
                <p className="text-on-surface-variant text-sm mt-1">Não feche esta janela.</p>
                <div className="space-y-3 mt-5">
                  {activeChannels.map((c) => (
                    <div key={c.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold flex items-center gap-1.5"><Icon name={c.icon} className="text-sm" /> {c.label}</span>
                        <span className="font-bold">{Math.round(progress[c.id] || 0)}%</span>
                      </div>
                      <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-2 bg-secondary transition-all" style={{ width: `${progress[c.id] || 0}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-headline-md text-primary flex items-center gap-2">
                  <Icon name="campaign" className="text-secondary" /> Confirmar disparo
                </h3>
                <p className="text-on-surface-variant text-sm mt-1">Revise os detalhes abaixo antes de confirmar.</p>
                <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-outline-variant/40 space-y-2 text-sm">
                  <Row label="Canais" value={activeChannels.map((c) => c.label).join(' + ')} />
                  <Row label="Audiência" value={`${audience.toLocaleString('pt-BR')} cidadãos`} />
                  <Row label="Segmentação" value={`${segmentMandato} • ${segmentDistrito}`} />
                  <Row label="Custo total" value={`R$ ${estimatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                  <Row label="Saldo após" value={`${(credits - Math.round(estimatedCost)).toLocaleString('pt-BR')} créditos`} />
                </div>
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <Icon name="info" className="text-base mt-0.5" />
                  <span>Esta ação é irreversível. Disparos auditados e registrados na trilha de conformidade LGPD.</span>
                </div>
                {error && <p className="text-xs text-error mt-2">{error}</p>}
                <div className="flex gap-2 justify-end mt-4">
                  <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
                  <button onClick={handleDispatch} className="px-5 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm hover:opacity-90 flex items-center gap-2">
                    <Icon name="send" className="text-base" /> Confirmar e Disparar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal: Análise de Impacto */}
      {impactOpen && (
        <ImpactAnalysisModal
          vereadores={vereadores}
          history={history}
          onClose={() => setImpactOpen(false)}
        />
      )}

      {/* Modal: editar/criar/ver parlamentar */}
      {editing && (
        <VereadorModal
          mode={editing.mode}
          data={editing.data}
          onClose={() => setEditing(null)}
          onSave={saveVereador}
          onEdit={() => setEditing({ mode: 'edit', data: editing.data })}
        />
      )}

      {/* Modal: confirmar exclusão */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <Icon name="delete" className="text-4xl" />
            </div>
            <h3 className="text-headline-md mt-3">Excluir parlamentar</h3>
            <p className="text-on-surface-variant text-sm mt-1">
              Tem certeza que deseja remover <strong>{confirmDelete.name}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-2 justify-center mt-5">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
              <button onClick={() => deleteVereador(confirmDelete.id)} className="px-4 py-2 bg-error text-white rounded-lg font-bold text-label-sm">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2 z-50 ${
          toast.tone === 'error' ? 'bg-error text-white border-error' : 'bg-primary text-on-primary border-secondary/40'
        }`}>
          <Icon name={toast.tone === 'error' ? 'delete' : 'check_circle'} className={toast.tone === 'error' ? '' : 'text-emerald-400'} />
          <span className="text-sm font-semibold">{toast.msg}</span>
        </div>
      )}

      {/* Modal: histórico */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setHistoryOpen(false)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between">
              <h3 className="text-headline-md flex items-center gap-2"><Icon name="history" className="text-secondary" /> Histórico de Disparos</h3>
              <button onClick={() => setHistoryOpen(false)} className="text-on-surface-variant hover:text-on-surface"><Icon name="close" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5">
              {history.length === 0 ? (
                <p className="text-center text-on-surface-variant py-12">Nenhum disparo registrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {history.map((h) => (
                    <div key={h.id} className="p-4 border border-outline-variant/40 rounded-xl">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="font-mono font-bold text-secondary">#{h.id}</span>
                        <span className="text-[10px] text-on-surface-variant">{new Date(h.startedAt).toLocaleString('pt-BR')}</span>
                      </div>
                      <p className="text-sm mt-1 line-clamp-1">"{h.message}"</p>
                      <div className="flex flex-wrap gap-3 mt-2 text-[10px]">
                        <span className="flex items-center gap-1"><Icon name="groups" className="text-xs" /> {h.audience.toLocaleString('pt-BR')}</span>
                        <span className="flex items-center gap-1 text-emerald-600"><Icon name="check_circle" className="text-xs" /> {h.delivered.toLocaleString('pt-BR')}</span>
                        <span className="flex items-center gap-1 text-error"><Icon name="error" className="text-xs" /> {h.failed.toLocaleString('pt-BR')}</span>
                        <span className="flex items-center gap-1 font-bold">R$ {h.cost.toFixed(2)}</span>
                        <span className="flex gap-1">
                          {h.channels.map((c) => <span key={c} className="px-1.5 rounded bg-secondary/10 text-secondary font-mono">{c}</span>)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-on-surface-variant">{label}:</span>
      <span className="font-semibold text-on-surface text-right">{value}</span>
    </div>
  );
}

function VereadorModal({ mode, data, onSave, onClose, onEdit }) {
  const [form, setForm] = useState(data);
  const isView = mode === 'view';
  const title = mode === 'new' ? 'Cadastrar Parlamentar' : mode === 'edit' ? 'Editar Parlamentar' : 'Mandato';
  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit(e) {
    e.preventDefault();
    if (!form.name?.trim()) return;
    onSave(form);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline-md flex items-center gap-2">
            <Icon name={mode === 'new' ? 'person_add' : mode === 'edit' ? 'edit' : 'badge'} className="text-secondary" />
            {title}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><Icon name="close" /></button>
        </div>
        {isView ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-lg font-bold">
                {form.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div>
                <p className="font-bold text-on-surface text-lg">{form.name}</p>
                <p className="text-xs text-on-surface-variant">{form.party} • {form.district}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="E-mail" value={form.email || '—'} />
              <Row label="Telefone" value={form.phone || '—'} />
              <Row label="Base vinculada" value={`${form.base.toLocaleString('pt-BR')} cidadãos`} />
              <Row label="Cobertura" value={`${form.share}% do território`} />
              <Row label="Engajamento" value={`${form.engagement}%`} />
              <Row label="Status" value={form.status} />
              <Row label="Última sync" value={form.last} />
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Fechar</button>
              <button onClick={onEdit} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
                <Icon name="edit" className="text-base" /> Editar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <Field label="NOME COMPLETO">
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="PARTIDO">
                <select value={form.party} onChange={(e) => update('party', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                  {PARTIES.map((p) => <option key={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="DISTRITO">
                <select value={form.district} onChange={(e) => update('district', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </Field>
            </div>
            <Field label="E-MAIL">
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
            <Field label="TELEFONE">
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(31) 99999-0000" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
            {mode === 'edit' && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="STATUS">
                  <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="ENGAJAMENTO (%)">
                  <input type="number" min="0" max="100" value={form.engagement} onChange={(e) => update('engagement', Number(e.target.value))} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
                </Field>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
                <Icon name="save" className="text-base" /> Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">{label}</label>
      {children}
    </div>
  );
}

function ImpactAnalysisModal({ vereadores, history, onClose }) {
  const [tab, setTab] = useState('overview');
  const [scenario, setScenario] = useState(50000);

  const totalBase = vereadores.reduce((s, v) => s + v.base, 0);
  const avgEngagement = vereadores.length ? Math.round(vereadores.reduce((s, v) => s + v.engagement, 0) / vereadores.length) : 0;
  const ativos = vereadores.filter((v) => v.status === 'Ativo').length;
  const totalDispatches = history.length;
  const totalDelivered = history.reduce((s, h) => s + h.delivered, 0);
  const totalCost = history.reduce((s, h) => s + h.cost, 0);
  const deliveryRate = totalDelivered ? ((totalDelivered / history.reduce((s, h) => s + h.audience * h.channels.length, 0)) * 100).toFixed(1) : '0';

  // Projeção
  const reachWa = Math.floor(scenario * 0.96);
  const reachSms = Math.floor(scenario * 0.94);
  const reachPush = Math.floor(scenario * 0.62);
  const reachEmail = Math.floor(scenario * 0.31);
  const projectedCost = scenario * 0.04 + scenario * 0.01;
  const expectedEngagement = Math.floor(scenario * 0.42);
  const expectedProtocols = Math.floor(scenario * 0.018);

  const rankBairros = [...vereadores].sort((a, b) => b.engagement - a.engagement).slice(0, 5);

  const recommendations = [
    { icon: 'priority_high', tone: 'bg-error/10 text-error', title: 'Reativar parlamentares inativos', desc: `${vereadores.length - ativos} parlamentar(es) com scraping pausado representa(m) ${Math.round(((vereadores.length - ativos) / vereadores.length) * 100)}% da base potencial subutilizada.` },
    { icon: 'campaign', tone: 'bg-secondary/10 text-secondary', title: 'Investir em WhatsApp', desc: 'Canal com 96% de taxa de entrega e melhor custo-benefício para mensagens longas com mídia.' },
    { icon: 'schedule', tone: 'bg-emerald-100 text-emerald-700', title: 'Janela ideal de disparo', desc: 'Terças e quintas, 10h-12h e 18h-20h apresentam +37% de engajamento histórico.' },
    { icon: 'group_add', tone: 'bg-amber-100 text-amber-700', title: 'Expandir base em Zona Oeste', desc: 'Distrito com menor cobertura (26%) e potencial de captação estimado em 12k cidadãos.' },
  ];

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: 'dashboard' },
    { id: 'projecao', label: 'Projeção de Campanha', icon: 'trending_up' },
    { id: 'ranking', label: 'Ranking de Mandatos', icon: 'leaderboard' },
    { id: 'recomendacoes', label: 'Recomendações', icon: 'tips_and_updates' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between bg-primary text-on-primary">
          <div>
            <h3 className="text-headline-md flex items-center gap-2"><Icon name="insights" className="text-secondary-fixed-dim" /> Análise de Impacto Legislativo</h3>
            <p className="text-xs text-on-primary-container">Métricas consolidadas, projeções e recomendações de IA para sua coordenação.</p>
          </div>
          <button onClick={onClose} className="text-on-primary-container hover:text-on-primary"><Icon name="close" /></button>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-outline-variant/40 flex gap-1 bg-surface-container-low/30">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-label-sm font-bold transition-colors border-b-2 ${
                tab === t.id ? 'border-secondary text-secondary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon name={t.icon} className="text-base" /> {t.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6">
          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Metric label="BASE TOTAL" value={totalBase.toLocaleString('pt-BR')} icon="groups" tone="bg-secondary/10 text-secondary" />
                <Metric label="ENGAJAMENTO MÉDIO" value={`${avgEngagement}%`} icon="trending_up" tone="bg-emerald-100 text-emerald-700" />
                <Metric label="MANDATOS ATIVOS" value={`${ativos} / ${vereadores.length}`} icon="how_to_vote" tone="bg-primary/10 text-primary" />
                <Metric label="DISPAROS REALIZADOS" value={totalDispatches} icon="campaign" tone="bg-amber-100 text-amber-700" />
              </div>

              <div className="bg-surface-container-low/40 border border-outline-variant/40 rounded-2xl p-5">
                <h4 className="font-bold text-on-surface mb-3 flex items-center gap-2"><Icon name="receipt_long" className="text-secondary" /> Performance Histórica de Disparos</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-[10px] tracking-wider text-on-surface-variant">ENTREGUES</p><p className="text-2xl font-bold text-emerald-600">{totalDelivered.toLocaleString('pt-BR')}</p></div>
                  <div><p className="text-[10px] tracking-wider text-on-surface-variant">TAXA DE ENTREGA</p><p className="text-2xl font-bold text-primary">{deliveryRate}%</p></div>
                  <div><p className="text-[10px] tracking-wider text-on-surface-variant">CUSTO TOTAL</p><p className="text-2xl font-bold text-primary">R$ {totalCost.toFixed(2)}</p></div>
                  <div><p className="text-[10px] tracking-wider text-on-surface-variant">CAMPANHAS</p><p className="text-2xl font-bold text-primary">{totalDispatches}</p></div>
                </div>
                {history.length === 0 && (
                  <p className="text-xs text-on-surface-variant mt-3">Nenhum disparo realizado ainda. As métricas serão preenchidas conforme as campanhas forem executadas.</p>
                )}
              </div>

              <div className="bg-primary text-on-primary rounded-2xl p-5">
                <div className="flex items-center gap-2">
                  <Icon name="auto_awesome" className="text-secondary-fixed-dim" />
                  <h4 className="font-bold">Resumo Executivo (IA)</h4>
                </div>
                <p className="text-sm text-on-primary-container mt-2 leading-relaxed">
                  Sua coordenação alcança <strong className="text-on-primary">{totalBase.toLocaleString('pt-BR')}</strong> cidadãos
                  através de <strong className="text-on-primary">{ativos} mandatos ativos</strong>, com engajamento médio
                  de <strong className="text-on-primary">{avgEngagement}%</strong>. A capacidade ociosa é estimada
                  em <strong className="text-on-primary">{((vereadores.length - ativos) / vereadores.length * 100).toFixed(0)}%</strong> —
                  reativar os parlamentares com scraping pausado pode aumentar o alcance em até <strong className="text-on-primary">+38k</strong> cidadãos.
                </p>
              </div>
            </div>
          )}

          {tab === 'projecao' && (
            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">AUDIÊNCIA PROJETADA</p>
                  <span className="font-mono font-bold text-secondary">{scenario.toLocaleString('pt-BR')} cidadãos</span>
                </div>
                <input type="range" min="1000" max="100000" step="1000" value={scenario} onChange={(e) => setScenario(Number(e.target.value))} className="w-full accent-secondary" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ChannelProjection label="WhatsApp" value={reachWa} rate="96%" color="bg-emerald-500" />
                <ChannelProjection label="SMS" value={reachSms} rate="94%" color="bg-amber-500" />
                <ChannelProjection label="Push" value={reachPush} rate="62%" color="bg-secondary" />
                <ChannelProjection label="E-mail" value={reachEmail} rate="31%" color="bg-sky-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-surface-container-low/40 border border-outline-variant/40 rounded-xl p-4">
                  <p className="text-[10px] tracking-wider text-on-surface-variant">CUSTO ESTIMADO</p>
                  <p className="text-2xl font-bold text-primary mt-1">R$ {projectedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">WhatsApp + Push</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-[10px] tracking-wider text-emerald-700">ENGAJAMENTO ESPERADO</p>
                  <p className="text-2xl font-bold text-emerald-700 mt-1">{expectedEngagement.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-emerald-700 mt-1">~42% de interação</p>
                </div>
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4">
                  <p className="text-[10px] tracking-wider text-secondary">PROTOCOLOS PROJETADOS</p>
                  <p className="text-2xl font-bold text-secondary mt-1">{expectedProtocols.toLocaleString('pt-BR')}</p>
                  <p className="text-[10px] text-secondary mt-1">~1,8% conversão</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-2">
                <Icon name="info" className="text-base mt-0.5" />
                <span>Projeções calculadas com base em médias históricas dos últimos 90 dias e dados agregados de campanhas similares.</span>
              </div>
            </div>
          )}

          {tab === 'ranking' && (
            <div className="space-y-3">
              <p className="text-on-surface-variant text-sm">Top 5 mandatos por engajamento.</p>
              {rankBairros.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 p-3 border border-outline-variant/40 rounded-xl">
                  <span className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-secondary/10 text-secondary'}`}>
                    {i + 1}º
                  </span>
                  <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                    {v.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-on-surface text-sm">{v.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{v.party} • {v.district}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-primary">{v.engagement}%</p>
                    <p className="text-[10px] text-on-surface-variant">{v.base.toLocaleString('pt-BR')} base</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'recomendacoes' && (
            <div className="space-y-3">
              <p className="text-on-surface-variant text-sm">Sugestões geradas com base no estado atual da coordenação.</p>
              {recommendations.map((r) => (
                <div key={r.title} className="flex gap-3 p-4 border border-outline-variant/40 rounded-xl">
                  <div className={`w-11 h-11 rounded-xl ${r.tone} flex items-center justify-center flex-shrink-0`}>
                    <Icon name={r.icon} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-on-surface">{r.title}</p>
                    <p className="text-sm text-on-surface-variant mt-1">{r.desc}</p>
                  </div>
                  <button className="text-secondary text-label-sm font-bold flex items-center gap-1 hover:underline self-start">
                    Aplicar <Icon name="arrow_forward" className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-outline-variant/40 flex justify-between items-center bg-surface-container-low/30">
          <p className="text-[10px] text-on-surface-variant">Última atualização: {new Date().toLocaleString('pt-BR')}</p>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm flex items-center gap-2">
              <Icon name="download" className="text-base" /> Exportar PDF
            </button>
            <button onClick={onClose} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm">Fechar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, icon, tone }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${tone} flex items-center justify-center`}>
          <Icon name={icon} className="text-base" />
        </div>
      </div>
      <p className="text-2xl font-bold text-primary mt-2">{value}</p>
    </div>
  );
}

function ChannelProjection({ label, value, rate, color }) {
  return (
    <div className="border border-outline-variant/40 rounded-xl p-4">
      <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label}</p>
      <p className="text-xl font-bold text-primary mt-1">{value.toLocaleString('pt-BR')}</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-1.5 bg-surface-container rounded-full">
          <div className={`h-1.5 rounded-full ${color}`} style={{ width: rate }} />
        </div>
        <span className="text-[10px] font-bold text-on-surface-variant">{rate}</span>
      </div>
    </div>
  );
}
