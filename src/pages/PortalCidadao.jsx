import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useNovoProtocolo } from '../hooks/useNovoProtocolo.jsx';

const VEREADORES = [
  { id: 'mv', name: 'Dr. Marcos Valente', party: 'PR', regional: 'Centro-Sul', email: 'marcos.valente@camara.gov.br' },
  { id: 'mc', name: 'Mariana Costa', party: 'PVG', regional: 'Oeste', email: 'mariana.costa@camara.gov.br' },
  { id: 'rs', name: 'Ricardo Souza', party: 'PR', regional: 'Norte', email: 'ricardo.souza@camara.gov.br' },
  { id: 'ap', name: 'Ana Paula Vaz', party: 'PT', regional: 'Sul', email: 'ana.vaz@camara.gov.br' },
  { id: 'cn', name: 'Carla Nogueira', party: 'PSDB', regional: 'Centro-Sul', email: 'carla.nogueira@camara.gov.br' },
  { id: 'sf', name: 'Sérgio Freitas', party: 'MDB', regional: 'Oeste', email: 'sergio.freitas@camara.gov.br' },
];

const PROTOCOLOS_INICIAIS = [
  { id: 'PRT-8892', status: 'Concluído', titulo: 'Reparo de Iluminação Pública', desc: 'Rua das Flores, 123 - Centro. Poste #4552 identificado e reparado pela equipe noturna.', data: '12/10/2025', atualizacoes: 2 },
  { id: 'PRT-9041', status: 'Em Análise', titulo: 'Solicitação de Poda de Árvore', desc: 'Equipe técnica agendada para vistoria no local para avaliar riscos à rede elétrica.', data: '14/10/2025', atualizacoes: 1 },
  { id: 'PRT-9078', status: 'Encaminhado', titulo: 'Buraco na Av. João César de Oliveira', desc: 'Encaminhado para a Secretaria de Obras. Previsão de início dos trabalhos em 5 dias úteis.', data: '20/10/2025', atualizacoes: 3 },
  { id: 'PRT-9120', status: 'Crítico', titulo: 'Vazamento de Água — Rua Bahia', desc: 'COPASA acionada em regime de urgência. Equipe enviada em 2h.', data: '22/10/2025', atualizacoes: 5 },
  { id: 'PRT-9145', status: 'Em Análise', titulo: 'Solicitação de Recapeamento', desc: 'Av. das Indústrias com desgaste severo. Inspeção agendada.', data: '24/10/2025', atualizacoes: 1 },
];

const IDEAS_INICIAIS = [
  { id: 'i1', icon: 'park', title: 'Revitalização da Praça Central', text: 'Novos bancos ergonômicos, Wi-Fi gratuito e playground inclusivo.', supporters: 142, mine: false },
  { id: 'i2', icon: 'directions_bike', title: 'Ciclovia na Av. Brasil', text: 'Integração do bairro industrial ao centro comercial via ciclovias iluminadas.', supporters: 86, mine: false },
];

const STATUS_TONE = {
  'Concluído': { tag: 'text-emerald-700 bg-emerald-100', icon: 'check', iconBg: 'bg-emerald-500 text-white' },
  'Em Análise': { tag: 'text-secondary bg-secondary/10', icon: 'pending', iconBg: 'bg-secondary text-on-secondary animate-pulse' },
  'Encaminhado': { tag: 'text-amber-700 bg-amber-100', icon: 'forward', iconBg: 'bg-amber-500 text-white' },
  'Crítico': { tag: 'text-error bg-error/10', icon: 'priority_high', iconBg: 'bg-error text-white animate-pulse' },
};

const STORAGE_IDEAS = 'govtech.cidadao.ideias';
const STORAGE_MSGS = 'govtech.cidadao.mensagens';

function loadJSON(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
function saveJSON(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

export default function PortalCidadao() {
  const { open: openNovoProtocolo } = useNovoProtocolo();
  const [ideias, setIdeias] = useState(() => loadJSON(STORAGE_IDEAS, IDEAS_INICIAIS));
  const [mensagens, setMensagens] = useState(() => loadJSON(STORAGE_MSGS, []));
  const [protocolos] = useState(PROTOCOLOS_INICIAIS);
  const [filtroStatus, setFiltroStatus] = useState('Todos');
  const [busca, setBusca] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [verTodos, setVerTodos] = useState(false);
  const [ideaModal, setIdeaModal] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => saveJSON(STORAGE_IDEAS, ideias), [ideias]);
  useEffect(() => saveJSON(STORAGE_MSGS, mensagens), [mensagens]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function adicionarIdeia(nova) {
    setIdeias((arr) => [{ ...nova, id: 'i' + Date.now(), supporters: 1, mine: true }, ...arr]);
    setIdeaModal(false);
    showToast('Ideia publicada! Outros cidadãos já podem apoiá-la.');
  }

  function toggleApoio(id) {
    setIdeias((arr) => arr.map((i) => i.id === id ? { ...i, supporters: i.mine ? i.supporters : i.supporters + 1, apoiada: !i.apoiada, mine: i.mine } : i));
    showToast('Apoio registrado!');
  }

  function enviarMensagem(msg) {
    const novo = { ...msg, id: Date.now(), enviadaEm: new Date().toISOString(), status: 'enviada' };
    setMensagens((arr) => [novo, ...arr]);
    setMsgModal(false);
    showToast(`Mensagem enviada ao gabinete de ${msg.vereadorNome}.`);
  }

  const protocolosFiltrados = useMemo(() => protocolos.filter((p) => {
    if (filtroStatus !== 'Todos' && p.status !== filtroStatus) return false;
    if (busca && !`${p.titulo} ${p.desc} ${p.id}`.toLowerCase().includes(busca.toLowerCase())) return false;
    return true;
  }), [protocolos, filtroStatus, busca]);

  const protocolosExibidos = verTodos ? protocolosFiltrados : protocolosFiltrados.slice(0, 2);

  // Transparência em Números — derivado dos dados
  const stats = useMemo(() => {
    const total = protocolos.length;
    const atendidas = protocolos.filter((p) => p.status === 'Concluído').length;
    const taxa = Math.round((atendidas / total) * 100);
    const cats = { 'Iluminação': 0, 'Poda/Verde': 0, 'Buraco/Asfalto': 0, 'Saneamento': 0 };
    protocolos.forEach((p) => {
      if (/ilumin/i.test(p.titulo)) cats['Iluminação']++;
      else if (/poda|árvore/i.test(p.titulo)) cats['Poda/Verde']++;
      else if (/buraco|asfalto|recap/i.test(p.titulo)) cats['Buraco/Asfalto']++;
      else if (/água|esgoto|vazamento/i.test(p.titulo)) cats['Saneamento']++;
    });
    const topDemanda = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];
    return { taxa, tempoMedio: '4,2d', total, topDemanda: topDemanda[0], topDemandaQtd: topDemanda[1] };
  }, [protocolos]);

  return (
    <>
      {/* Hero */}
      <section className="mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-primary-container p-12 flex flex-col items-start justify-center min-h-[360px] shadow-xl">
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1920&q=70')" }} />
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/95 via-primary-container/85 to-primary/95" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-secondary text-on-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              GovTech Master
            </span>
            <h2 className="text-headline-xl text-on-primary mb-4 leading-tight">Sua cidade, sua voz.</h2>
            <p className="text-body-lg text-on-primary-container/90 mb-8 max-w-lg leading-relaxed">
              Participe da gestão do seu município. Abra protocolos, acompanhe suas solicitações em
              tempo real ou compartilhe ideias inovadoras para o seu bairro.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={openNovoProtocolo} className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95">
                <Icon name="add_circle" /> Abrir Novo Protocolo
              </button>
              <button onClick={() => setIdeaModal(true)} className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-surface-container-high transition-all active:scale-95">
                <Icon name="lightbulb" /> Sugerir Ideia
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Coluna esquerda */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter-md">
          {/* Meus Protocolos */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h3 className="text-headline-md text-on-surface">Meus Protocolos ({protocolosFiltrados.length})</h3>
                <p className="text-on-surface-variant text-body-md">Gestão ativa das suas solicitações</p>
              </div>
              <div className="flex gap-2 relative">
                <button onClick={() => setShowFilter((v) => !v)} className={`p-2 rounded-lg border transition-colors ${filtroStatus !== 'Todos' || showFilter ? 'border-secondary text-secondary bg-secondary/10' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                  <Icon name="filter_list" />
                </button>
                <button onClick={() => setShowSearch((v) => !v)} className={`p-2 rounded-lg border transition-colors ${busca || showSearch ? 'border-secondary text-secondary bg-secondary/10' : 'border-outline-variant/30 hover:bg-surface-container-low'}`}>
                  <Icon name="search" />
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-3 w-48 z-20">
                    <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">FILTRAR STATUS</p>
                    {['Todos', 'Em Análise', 'Encaminhado', 'Concluído', 'Crítico'].map((s) => (
                      <button key={s} onClick={() => { setFiltroStatus(s); setShowFilter(false); }} className={`w-full text-left px-2 py-1.5 rounded text-sm ${filtroStatus === s ? 'bg-secondary/10 text-secondary font-bold' : 'hover:bg-surface-container'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {showSearch && (
              <input
                autoFocus
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar por título, número ou descrição..."
                className="w-full mb-4 px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary"
              />
            )}

            {protocolosExibidos.length === 0 ? (
              <p className="text-center text-on-surface-variant py-8 text-sm">Nenhum protocolo encontrado.</p>
            ) : (
              protocolosExibidos.map((p, i) => (
                <ProtocolTimelineItem key={p.id} protocolo={p} last={i === protocolosExibidos.length - 1} />
              ))
            )}

            {protocolosFiltrados.length > 2 && (
              <button onClick={() => setVerTodos((v) => !v)} className="w-full text-secondary font-bold text-body-md py-4 mt-4 border-t border-outline-variant/30 hover:bg-surface-container-low transition-colors rounded-b-xl flex items-center justify-center gap-2">
                {verTodos ? 'Ver menos' : `Ver histórico completo (${protocolosFiltrados.length} protocolos)`}
                <Icon name={verTodos ? 'expand_less' : 'arrow_forward'} className="text-sm" />
              </button>
            )}
          </div>

          {/* Ideias */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md flex items-center gap-2"><Icon name="lightbulb" className="text-amber-500" /> Ideias da Comunidade ({ideias.length})</h3>
              <button onClick={() => setIdeaModal(true)} className="text-secondary text-label-sm font-bold flex items-center gap-1 hover:underline">
                <Icon name="add" className="text-base" /> Nova ideia
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
              {ideias.map((i) => <IdeaCard key={i.id} idea={i} onApoiar={() => toggleApoio(i.id)} />)}
            </div>
          </div>
        </div>

        {/* Coluna direita */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter-md">
          {/* Agenda Vereador */}
          <div className="bg-primary text-on-primary rounded-xl p-6 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10"><Icon name="account_balance" className="text-7xl" /></div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full border-2 border-secondary bg-secondary-container flex items-center justify-center shadow-lg">
                <Icon name="person" className="text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight">Vereador Ricardo Souza</h4>
                <p className="text-on-primary-container text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Agenda Legislativa</p>
              </div>
            </div>
            <div className="space-y-3">
              <AgendaItem when="Hoje • 14:00" title="Audiência: Saneamento Básico" loc="Plenário da Câmara" highlight />
              <AgendaItem when="Amanhã • 09:00" title="Votação: Plano Diretor 2026" loc="Sala de Comissões" />
              <AgendaItem when="18 Out • 15:30" title="Visita: Bairro Nova Esperança" loc="Lideranças comunitárias" />
            </div>
            <button onClick={() => setMsgModal(true)} className="w-full mt-6 py-3 bg-secondary text-on-secondary rounded-xl font-bold text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Icon name="mail" className="text-base" /> Enviar mensagem ao gabinete
            </button>
            {mensagens.length > 0 && (
              <p className="text-[10px] text-on-primary-container mt-2 text-center">
                Você já enviou {mensagens.length} mensagem(ns) — última {new Date(mensagens[0].enviadaEm).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>

          {/* Transparência em Números */}
          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-6 shadow-sm">
            <h4 className="font-bold text-on-surface mb-5 flex items-center gap-2">
              <Icon name="analytics" className="text-secondary" />
              Transparência em Números
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <StatBox value={`${stats.taxa}%`} label="Solicitações Atendidas" tone="text-emerald-600" />
              <StatBox value={stats.tempoMedio} label="Tempo Médio" tone="text-secondary" />
              <StatBox value={stats.total} label="Protocolos Abertos" tone="text-primary" />
              <StatBox value={mensagens.length} label="Msgs ao Gabinete" tone="text-amber-600" />
            </div>
            <div className="mt-5 p-3 rounded-lg bg-primary/5 border border-primary/15">
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">DEMANDA MAIS EXIGIDA</p>
              <p className="font-bold text-on-surface mt-1">{stats.topDemanda}</p>
              <p className="text-[10px] text-on-surface-variant">{stats.topDemandaQtd} ocorrência(s) registrada(s)</p>
            </div>
            <a href="https://transparencia.contagem.mg.gov.br" target="_blank" rel="noreferrer" className="block mt-4 text-center text-secondary text-label-sm font-bold hover:underline">
              Portal da Transparência →
            </a>
          </div>
        </div>
      </div>

      {/* Modal: Sugerir Ideia */}
      {ideaModal && <IdeaModal onClose={() => setIdeaModal(false)} onSave={adicionarIdeia} />}

      {/* Modal: Enviar Mensagem */}
      {msgModal && <MessageModal onClose={() => setMsgModal(false)} onSend={enviarMensagem} />}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl border border-secondary/40 flex items-center gap-2 z-50">
          <Icon name="check_circle" className="text-emerald-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </>
  );
}

function ProtocolTimelineItem({ protocolo, last }) {
  const tone = STATUS_TONE[protocolo.status] || STATUS_TONE['Em Análise'];
  return (
    <div className={`relative ${last ? 'pb-2' : 'pb-8'}`}>
      {!last && <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-outline-variant/30" />}
      <div className="flex gap-4 relative">
        <div className={`w-8 h-8 rounded-full ${tone.iconBg} flex items-center justify-center z-10 shadow-sm flex-shrink-0`}>
          <Icon name={tone.icon} className="text-sm" />
        </div>
        <div className="flex-1 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant/30 hover:border-secondary/40 transition-colors">
          <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
            <h4 className="font-bold text-on-surface">{protocolo.titulo}</h4>
            <span className={`${tone.tag} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>{protocolo.status}</span>
          </div>
          <p className="text-on-surface-variant text-sm mb-3 leading-relaxed">{protocolo.desc}</p>
          <div className="flex items-center gap-4 text-on-surface-variant text-[11px] font-medium flex-wrap">
            <span className="flex items-center gap-1"><Icon name="calendar_today" className="text-sm opacity-60" /> {protocolo.data}</span>
            <span className="flex items-center gap-1 font-mono"><Icon name="tag" className="text-sm opacity-60" /> #{protocolo.id}</span>
            <span className="flex items-center gap-1"><Icon name="chat_bubble" className="text-sm opacity-60" /> {protocolo.atualizacoes} atualizações</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IdeaCard({ idea, onApoiar }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 relative group hover:border-secondary hover:-translate-y-0.5 transition-all shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl bg-secondary-container/30 flex items-center justify-center">
          <Icon name={idea.icon} className="text-2xl text-secondary" />
        </div>
        {idea.mine && <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">SUA</span>}
      </div>
      <h4 className="font-bold text-on-surface">{idea.title}</h4>
      <p className="text-on-surface-variant text-sm mt-1 mb-4 leading-relaxed line-clamp-2">{idea.text}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1 text-on-surface-variant text-xs">
          <Icon name="group" className="text-sm" /> {idea.supporters} apoios
        </div>
        <button
          onClick={onApoiar}
          disabled={idea.mine}
          className={`flex items-center gap-1.5 text-label-sm font-bold px-3 py-1.5 rounded-lg transition-all ${
            idea.apoiada
              ? 'bg-secondary text-on-secondary'
              : idea.mine
              ? 'text-on-surface-variant cursor-not-allowed'
              : 'text-secondary hover:bg-secondary/10'
          }`}
        >
          <Icon name="thumb_up" filled={idea.apoiada} className="text-sm" />
          {idea.mine ? 'Sua ideia' : idea.apoiada ? 'Apoiada' : 'Apoiar'}
        </button>
      </div>
    </div>
  );
}

function AgendaItem({ when, title, loc, highlight }) {
  return (
    <div className={`bg-white/5 p-3 rounded-xl border border-white/10 ${highlight ? 'hover:bg-white/10' : 'opacity-70 hover:opacity-100'} transition-all`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] font-bold text-secondary-fixed-dim uppercase tracking-wider">{when}</span>
        {highlight && <Icon name="open_in_new" className="text-xs opacity-60" />}
      </div>
      <p className="font-bold text-sm leading-snug">{title}</p>
      <p className="text-[10px] text-on-primary-container mt-1">{loc}</p>
    </div>
  );
}

function StatBox({ value, label, tone = 'text-primary' }) {
  return (
    <div className="bg-surface-container-lowest p-3 rounded-xl text-center border border-outline-variant/30 shadow-inner">
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
      <div className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider mt-1 leading-tight">{label}</div>
    </div>
  );
}

function IdeaModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', text: '', icon: 'lightbulb', categoria: 'Geral' });
  const icons = ['lightbulb', 'park', 'directions_bike', 'school', 'local_hospital', 'recycling', 'volunteer_activism', 'public'];
  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || form.text.trim().length < 20) return;
    onSave(form);
  }
  return (
    <Modal title="Sugerir Nova Ideia" icon="lightbulb" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="ÍCONE">
          <div className="flex flex-wrap gap-2">
            {icons.map((i) => (
              <button type="button" key={i} onClick={() => setForm((f) => ({ ...f, icon: i }))} className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center ${form.icon === i ? 'border-secondary bg-secondary/10 text-secondary' : 'border-outline-variant text-on-surface-variant'}`}>
                <Icon name={i} />
              </button>
            ))}
          </div>
        </Field>
        <Field label="CATEGORIA">
          <select value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
            {['Geral', 'Infraestrutura', 'Saúde', 'Educação', 'Meio Ambiente', 'Cultura', 'Esporte', 'Mobilidade'].map((c) => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="TÍTULO DA IDEIA">
          <input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Ex: Praça de leitura na Vila Industrial" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" maxLength={80} />
        </Field>
        <Field label={`DESCRIÇÃO (${form.text.length}/400)`}>
          <textarea required rows="4" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value.slice(0, 400) }))} placeholder="Explique a proposta e o impacto esperado para a comunidade." className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary resize-none" />
        </Field>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 text-[11px] text-amber-800 flex items-start gap-2">
          <Icon name="info" className="text-base mt-0.5" />
          <span>Sua ideia será publicada para apoio comunitário. Ideias com 100+ apoios são encaminhadas à Câmara.</span>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
            <Icon name="send" className="text-base" /> Publicar Ideia
          </button>
        </div>
      </form>
    </Modal>
  );
}

function MessageModal({ onClose, onSend }) {
  const [form, setForm] = useState({ vereadorId: VEREADORES[0].id, assunto: '', mensagem: '', urgencia: 'normal', anexarProtocolo: '' });
  const vereador = VEREADORES.find((v) => v.id === form.vereadorId);
  function submit(e) {
    e.preventDefault();
    if (!form.assunto.trim() || form.mensagem.trim().length < 10) return;
    onSend({ ...form, vereadorNome: vereador.name, vereadorEmail: vereador.email });
  }
  return (
    <Modal title="Enviar Mensagem ao Gabinete" icon="mail" onClose={onClose}>
      <form onSubmit={submit} className="space-y-3">
        <Field label="DESTINATÁRIO (VEREADOR)">
          <select value={form.vereadorId} onChange={(e) => setForm((f) => ({ ...f, vereadorId: e.target.value }))} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
            {VEREADORES.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.party}) — Regional {v.regional}</option>)}
          </select>
        </Field>
        {vereador && (
          <div className="bg-surface-container-low/40 border border-outline-variant rounded-lg p-2 text-xs flex items-center gap-2">
            <Icon name="mail" className="text-secondary text-base" />
            <span className="text-on-surface-variant">{vereador.email}</span>
          </div>
        )}
        <Field label="URGÊNCIA">
          <div className="flex gap-2">
            {[
              { id: 'normal', label: 'Normal', tone: 'border-secondary text-secondary' },
              { id: 'alta', label: 'Alta', tone: 'border-amber-500 text-amber-700' },
              { id: 'urgente', label: 'Urgente', tone: 'border-error text-error' },
            ].map((u) => (
              <button key={u.id} type="button" onClick={() => setForm((f) => ({ ...f, urgencia: u.id }))} className={`flex-1 py-1.5 rounded-lg border-2 text-xs font-bold ${form.urgencia === u.id ? `${u.tone} bg-current/10` : 'border-outline-variant text-on-surface-variant'}`}>
                {u.label}
              </button>
            ))}
          </div>
        </Field>
        <Field label="ASSUNTO">
          <input required value={form.assunto} onChange={(e) => setForm((f) => ({ ...f, assunto: e.target.value }))} placeholder="Ex: Solicitação de visita ao bairro Eldorado" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
        </Field>
        <Field label={`MENSAGEM (${form.mensagem.length}/1000)`}>
          <textarea required rows="5" value={form.mensagem} onChange={(e) => setForm((f) => ({ ...f, mensagem: e.target.value.slice(0, 1000) }))} placeholder="Descreva o assunto, contexto e o que você espera como retorno do gabinete." className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary resize-none" />
        </Field>
        <Field label="VINCULAR A PROTOCOLO (OPCIONAL)">
          <select value={form.anexarProtocolo} onChange={(e) => setForm((f) => ({ ...f, anexarProtocolo: e.target.value }))} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
            <option value="">Nenhum</option>
            {PROTOCOLOS_INICIAIS.map((p) => <option key={p.id} value={p.id}>#{p.id} — {p.titulo}</option>)}
          </select>
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
            <Icon name="send" className="text-base" /> Enviar
          </button>
        </div>
      </form>
    </Modal>
  );
}

function Modal({ title, icon, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline-md flex items-center gap-2"><Icon name={icon} className="text-secondary" /> {title}</h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><Icon name="close" /></button>
        </div>
        {children}
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
