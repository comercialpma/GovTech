import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { generateProfile, generateFollowers, exportFollowersCSV, fetchInstagramProfile, fetchInstagramFollowersReal, importFollowersFromCSV } from '../services/inteligencia.js';

const trendingPoints = [
  { x: 0, value: 4.2 }, { x: 1, value: 3.8 }, { x: 2, value: 5.1 }, { x: 3, value: 4.4 },
  { x: 4, value: 6.8 }, { x: 5, value: 5.9 }, { x: 6, value: 8.2 }, { x: 7, value: 7.6 },
  { x: 8, value: 9.4 }, { x: 9, value: 11.1 }, { x: 10, value: 10.3 }, { x: 11, value: 14.2 },
];

const mediaHistorica = [5.2, 5.5, 5.8, 5.7, 6.1, 6.4, 6.8, 7.2, 7.8, 8.4, 9.1, 9.6];

const wordCloud = [
  { text: 'REFORMA', size: 'text-3xl', color: 'text-secondary', extra: 'Tributária' },
  { text: 'BRASIL', size: 'text-5xl', color: 'text-secondary font-extrabold' },
  { text: 'Congresso', size: 'text-xl', color: 'text-on-surface-variant' },
  { text: 'Votação', size: 'text-lg', color: 'text-on-surface-variant' },
  { text: 'Pauta', size: 'text-base', color: 'text-on-surface-variant' },
  { text: 'Nordeste', size: 'text-2xl', color: 'text-emerald-700 font-bold' },
  { text: 'Emendas', size: 'text-base', color: 'text-on-surface-variant' },
  { text: 'Liderança', size: 'text-lg', color: 'text-amber-700' },
  { text: 'Acordo', size: 'text-base', color: 'text-on-surface-variant' },
  { text: 'Relatório', size: 'text-sm', color: 'text-on-surface-variant' },
];

const liveFeedInicial = [
  {
    id: 1,
    hora: '14:20',
    fonte: 'PORTAL DE NOTÍCIAS',
    tag: 'POSITIVO',
    tagTone: 'bg-emerald-100 text-emerald-700',
    titulo: 'Deputado anuncia novos investimentos para infraestrutura hídrica em AL',
    descricao: 'Em coletiva de imprensa, o parlamentar detalhou o cronograma de obras que devem beneficiar mais de 200 mil pessoas no sertão.',
    metaIcon: 'visibility',
    meta: '10.4k views',
    meta2Icon: 'share',
    meta2: '450 shares',
  },
  {
    id: 2,
    hora: '12:05',
    fonte: 'X (TWITTER)',
    tag: 'NEUTRO',
    tagTone: 'bg-surface-container text-on-surface-variant',
    titulo: 'Menção viral: Discussão sobre a Reforma Administrativa ganha tração',
    descricao: 'Thread de jornalista político detalha o posicionamento da bancada liderada por Arthur Lira na última sessão plenária.',
    metaIcon: 'local_fire_department',
    meta: 'Hot Topic',
    meta2Icon: 'forum',
    meta2: '1.3k comments',
  },
  {
    id: 3,
    hora: '09:15',
    fonte: 'DIÁRIO OFICIAL',
    tag: 'INSTITUCIONAL',
    tagTone: 'bg-primary/10 text-primary',
    titulo: 'Publicação de Portaria nº 452 - Nomeações e Ajustes',
    descricao: 'Documento detalha as novas diretrizes de governança para projetos de transparência legislativa monitorados pela CivicPulse.',
    metaIcon: 'verified',
    meta: 'Fonte Oficial',
    meta2Icon: 'picture_as_pdf',
    meta2: 'PDF Disponível',
  },
];

const liveFeedMore = [
  {
    id: 4, hora: '07:48', fonte: 'INSTAGRAM', tag: 'POSITIVO', tagTone: 'bg-emerald-100 text-emerald-700',
    titulo: 'Post sobre programa de geração de empregos atinge 32k curtidas',
    descricao: 'Conteúdo publicado às 06h destaca a parceria com o setor industrial e teve forte engajamento da base eleitoral.',
    metaIcon: 'favorite', meta: '32k curtidas', meta2Icon: 'comment', meta2: '1.8k comentários',
  },
  {
    id: 5, hora: '06:12', fonte: 'PODCAST POLÍTICO', tag: 'NEUTRO', tagTone: 'bg-surface-container text-on-surface-variant',
    titulo: 'Entrevista de 45 minutos discute reforma tributária e MP do setor produtivo',
    descricao: 'Episódio do PoderCast com mais de 80k downloads nas primeiras 4 horas.',
    metaIcon: 'headphones', meta: '80k downloads', meta2Icon: 'schedule', meta2: '45 min',
  },
];

export default function InteligenciaPolitica() {
  const [igHandle, setIgHandle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapedTarget, setScrapedTarget] = useState(null);
  const [feed, setFeed] = useState(liveFeedInicial);
  const [feedExpanded, setFeedExpanded] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const [profile, setProfile] = useState(null);
  const [followers, setFollowers] = useState([]);
  const [followerSource, setFollowerSource] = useState('simulated'); // 'instagram' | 'csv' | 'simulated'
  const [followerSearch, setFollowerSearch] = useState('');
  const [followerPage, setFollowerPage] = useState(1);
  const [sessionId, setSessionId] = useState('');
  const [showCookieHelp, setShowCookieHelp] = useState(false);
  const PAGE_SIZE = 10;

  async function iniciarRastreamento(e) {
    e.preventDefault();
    if (!igHandle.trim()) return;
    setScraping(true);

    let prof;
    let toastMsg;
    try {
      prof = await fetchInstagramProfile(igHandle);
      toastMsg = `@${prof.handle}: ${prof.followers.toLocaleString('pt-BR')} seguidores reais do Instagram.`;
    } catch (err) {
      console.warn('[inteligencia] fallback para dados simulados:', err?.message);
      prof = generateProfile(igHandle);
      toastMsg = `@${igHandle}: Instagram bloqueou requisição pública. Exibindo amostra simulada.`;
    }

    // Tenta raspar a lista REAL de seguidores. Sem sessão, o IG retorna 401/403.
    let list = [];
    let src = 'simulated';
    if (prof.userId) {
      try {
        const real = await fetchInstagramFollowersReal(prof.userId, { sessionId: sessionId.trim(), max: 200 });
        if (real.length) {
          list = real;
          src = 'instagram';
          toastMsg = `@${prof.handle}: ${real.length} seguidores REAIS coletados.`;
        }
      } catch (e) {
        console.warn('[inteligencia] friendships/followers bloqueado:', e?.message);
      }
    }
    if (!list.length) {
      const sampleSize = Math.min(500, Math.max(50, Math.floor(prof.followers / 50)));
      list = generateFollowers(igHandle, sampleSize);
      src = 'simulated';
    }

    setProfile(prof);
    setFollowers(list);
    setFollowerSource(src);
    setFollowerPage(1);
    setScrapedTarget({
      handle: prof.handle,
      keywords: keywords.split(',').map((k) => k.trim()).filter(Boolean),
      startedAt: new Date(),
      source: prof.source,
    });
    setScraping(false);
    showToast(toastMsg);
  }

  function exportarExcel() {
    if (!followers.length) return showToast('Inicie um rastreamento antes de exportar.');
    exportFollowersCSV(scrapedTarget?.handle || 'analise', followers);
    showToast(`${followers.length} seguidores exportados em CSV.`);
  }

  function handleCSVImport(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = importFollowersFromCSV(String(reader.result));
        if (!imported.length) return showToast('CSV vazio ou formato inválido.');
        setFollowers(imported);
        setFollowerSource('csv');
        setFollowerPage(1);
        showToast(`${imported.length} seguidores importados do CSV.`);
      } catch (err) {
        showToast(`Erro ao importar: ${err.message}`);
      }
    };
    reader.readAsText(file, 'utf-8');
  }

  const followersFiltered = useMemo(() => {
    const q = followerSearch.toLowerCase();
    return followers.filter((f) =>
      !q || `${f.nome} ${f.username} ${f.cidade} ${f.tipo} ${f.interesses}`.toLowerCase().includes(q)
    );
  }, [followers, followerSearch]);

  const totalPages = Math.max(1, Math.ceil(followersFiltered.length / PAGE_SIZE));
  const pageItems = followersFiltered.slice((followerPage - 1) * PAGE_SIZE, followerPage * PAGE_SIZE);

  function carregarMais() {
    setFeed((f) => [...f, ...liveFeedMore]);
    setFeedExpanded(true);
    showToast('Histórico completo carregado.');
  }

  // Construção do path do gráfico de linhas
  const w = 100;
  const h = 100;
  const maxVal = Math.max(...trendingPoints.map((p) => p.value), ...mediaHistorica);
  const toPath = (arr) => arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * w;
    const y = h - (v / maxVal) * (h - 10) - 5;
    return `${i === 0 ? 'M' : 'L'}${x},${y}`;
  }).join(' ');
  const pathMencoes = toPath(trendingPoints.map((p) => p.value));
  const pathHist = toPath(mediaHistorica);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-headline-lg text-primary">Inteligência Política</h2>
          <p className="text-on-surface-variant">
            Monitoramento de concorrência, análise de seguidores e tendências em tempo real.
          </p>
        </div>
      </div>

      {/* Rastreamento de Concorrência */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-on-surface flex items-center gap-2 mb-4">
          <Icon name="track_changes" className="text-secondary text-base" /> Rastreamento de Concorrência
        </h3>
        <form onSubmit={iniciarRastreamento} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">ID DO INSTAGRAM</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">@</span>
              <input
                value={igHandle}
                onChange={(e) => setIgHandle(e.target.value.replace(/^@/, ''))}
                placeholder="usuario_parlamentar"
                className="w-full pl-7 pr-3 py-2.5 border border-outline-variant rounded-lg outline-none focus:border-secondary"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">PALAVRAS-CHAVE</label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Orçamento, Educação, Saúde"
              className="w-full px-3 py-2.5 border border-outline-variant rounded-lg outline-none focus:border-secondary"
            />
          </div>
          <button
            type="submit"
            disabled={scraping || !igHandle.trim()}
            className="px-5 py-2.5 bg-secondary text-on-secondary rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Icon name={scraping ? 'sync' : 'play_arrow'} className={`text-base ${scraping ? 'animate-spin' : ''}`} />
            {scraping ? 'Rastreando...' : 'Iniciar Rastreamento'}
          </button>
        </form>
        {scrapedTarget && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Icon name="radar" className="text-base animate-pulse" />
            Monitorando <strong>@{scrapedTarget.handle}</strong>
            {scrapedTarget.keywords.length > 0 && ` • Palavras: ${scrapedTarget.keywords.join(', ')}`}
            • Iniciado às {scrapedTarget.startedAt.toLocaleTimeString('pt-BR').slice(0, 5)}
          </div>
        )}
      </div>

      {/* Perfil + Análise */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter-md">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center text-lg font-bold uppercase overflow-hidden relative">
                <span className="absolute">{(profile?.handle || 'GT').slice(0, 2)}</span>
                {profile?.profilePic && (
                  <img
                    src={profile.profilePic}
                    alt={profile.handle}
                    className="relative w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1 flex-wrap">
                <p className="font-bold text-on-surface">@{profile?.handle || 'aguardando_rastreamento'}</p>
                {profile?.verified && <Icon name="verified" className="text-secondary text-base" />}
                {profile?.source === 'instagram' && (
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-1">REAL</span>
                )}
                {profile?.source === 'demo' && (
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded ml-1">SIMULADO</span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant">
                {profile
                  ? `${profile.following.toLocaleString('pt-BR')} seguindo • ${profile.posts.toLocaleString('pt-BR')} posts${profile.tipoEstimado ? ' • ' + profile.tipoEstimado : ''}`
                  : 'Inicie o rastreamento para coletar dados'}
              </p>
              {profile?.fullName && <p className="text-xs text-on-surface mt-0.5">{profile.fullName}</p>}
              <span className={`inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${profile ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${profile ? 'bg-emerald-500 animate-pulse' : 'bg-on-surface-variant'}`} />
                {profile ? 'MONITORANDO' : 'AGUARDANDO'}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-outline-variant/40">
            <Stat
              label="SEGUIDORES"
              value={profile ? (profile.followers >= 1000 ? (profile.followers / 1000).toFixed(0) + 'k' : profile.followers) : '—'}
              delta={profile ? `${profile.growth30d > 0 ? '+' : ''}${profile.growth30d}%` : ''}
              tone={profile && profile.growth30d >= 0 ? 'text-emerald-600' : 'text-error'}
            />
            <Stat
              label="ENGAJAMENTO"
              value={profile ? `${profile.engagement}%` : '—'}
              delta={profile && profile.engagement > 3 ? 'acima da média' : profile ? 'abaixo da média' : ''}
              tone={profile && profile.engagement > 3 ? 'text-emerald-600' : 'text-amber-600'}
            />
            <Stat
              label="SENTIMENTO"
              value={profile ? (profile.sentiment.positivo >= 55 ? 'Positivo' : profile.sentiment.negativo >= 30 ? 'Negativo' : 'Misto') : '—'}
              delta={profile ? `+${profile.sentiment.positivo}% pos.` : ''}
              tone="text-emerald-600"
            />
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-on-surface">Análise de Seguidores</p>
              <p className="text-[10px] text-on-surface-variant">Demografia e comportamento da base</p>
            </div>
            <button onClick={exportarExcel} className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-surface-container">
              <Icon name="download" className="text-base" /> Exportar Excel
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 items-center">
            <div className="space-y-3">
              <Demographic label="Faixa Etária (25-34)" value={42} color="bg-secondary" />
              <Demographic label="Localização: Maceió" value={28} color="bg-amber-500" />
            </div>
            <div className="h-24 flex items-end justify-center gap-1">
              {[55, 70, 45, 80, 95, 65, 50].map((v, i) => (
                <div key={i} className="flex-1 bg-secondary/70 rounded-t" style={{ height: `${v}%` }} />
              ))}
            </div>
          </div>
          <p className="text-[10px] text-on-surface-variant text-center mt-2">Picos de Atividade Semanal</p>
        </div>
      </div>

      {/* Tendências + Nuvem */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-gutter-md">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3">
            <p className="font-bold text-on-surface">Tendências Públicas: Menções ao Longo do Tempo</p>
            <span className="text-[10px] text-on-surface-variant">Recorde: <strong className="text-secondary">14.2k (Hoje)</strong></span>
          </div>
          <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-56" preserveAspectRatio="none">
            <defs>
              <linearGradient id="gradMencoes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0051d5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#0051d5" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={`${pathMencoes} L${w},${h} L0,${h} Z`} fill="url(#gradMencoes)" />
            <path d={pathMencoes} fill="none" stroke="#0051d5" strokeWidth="0.8" />
            <path d={pathHist} fill="none" stroke="#cbd5e1" strokeWidth="0.6" strokeDasharray="2,2" />
          </svg>
          <div className="flex justify-center gap-4 text-[10px] text-on-surface-variant mt-2">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> Menções Diretas</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" /> Média Histórica</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <p className="font-bold text-on-surface mb-3">Nuvem de Palavras-Chave</p>
          <div className="flex flex-wrap items-center justify-center gap-3 min-h-[200px]">
            {wordCloud.map((w) => (
              <span key={w.text} className={`${w.size} ${w.color} font-bold leading-none`}>
                {w.text} {w.extra && <span className="text-xs font-normal text-on-surface-variant">{w.extra}</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Seguidores */}
      {followers.length > 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm">
          {followerSource !== 'instagram' && (
            <div className="px-5 pt-4 space-y-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 flex items-start gap-2">
                <Icon name="info" className="text-base mt-0.5" />
                <span>
                  <strong>Por que não trouxe dados reais?</strong> O endpoint <code>friendships/followers</code> do
                  Instagram exige um <strong>cookie de sessão autenticada</strong> (sessionid). Tentativas anônimas
                  recebem HTTP 401/403. Use uma das duas alternativas abaixo para obter dados reais.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="border border-outline-variant/40 rounded-lg p-3">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <Icon name="key" className="text-base text-secondary" /> Opção 1: cookie de sessão
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Cole seu <code>sessionid</code> do Instagram (DevTools → Application → Cookies → instagram.com).
                    Só use com sua própria conta — uso indevido pode violar os ToS do Meta.
                  </p>
                  <div className="flex gap-1 mt-2">
                    <input
                      type="password"
                      value={sessionId}
                      onChange={(e) => setSessionId(e.target.value)}
                      placeholder="sessionid..."
                      className="flex-1 px-2 py-1.5 border border-outline-variant rounded text-xs outline-none focus:border-secondary"
                    />
                    <button onClick={() => setShowCookieHelp((v) => !v)} className="text-secondary text-xs hover:underline">
                      Como obter?
                    </button>
                  </div>
                  {showCookieHelp && (
                    <ol className="text-[10px] text-on-surface-variant mt-2 list-decimal pl-4 space-y-0.5">
                      <li>Acesse instagram.com e faça login na sua conta.</li>
                      <li>F12 → aba Application → Cookies → instagram.com.</li>
                      <li>Copie o valor de <code>sessionid</code> e cole acima.</li>
                      <li>Clique novamente em "Iniciar Rastreamento".</li>
                    </ol>
                  )}
                </div>

                <div className="border border-outline-variant/40 rounded-lg p-3">
                  <p className="text-xs font-bold text-on-surface flex items-center gap-1">
                    <Icon name="upload_file" className="text-base text-secondary" /> Opção 2: importar CSV
                  </p>
                  <p className="text-[10px] text-on-surface-variant mt-1">
                    Exporte seus seguidores pelo Meta Business Suite ou ferramenta oficial e
                    importe aqui. Aceita colunas: nome, username, cidade, engajamento.
                  </p>
                  <label className="block mt-2">
                    <input type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVImport} />
                    <span className="inline-block px-3 py-1.5 bg-secondary text-on-secondary rounded text-xs font-bold cursor-pointer hover:opacity-90">
                      Escolher arquivo CSV
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
          {followerSource === 'instagram' && (
            <div className="px-5 pt-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs text-emerald-800 flex items-start gap-2">
                <Icon name="check_circle" className="text-base mt-0.5" />
                <span><strong>Dados reais do Instagram</strong> coletados via API autenticada.</span>
              </div>
            </div>
          )}
          <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-bold text-on-surface flex items-center gap-2">
                <Icon name="groups" className="text-secondary text-base" /> Lista de Seguidores ({followersFiltered.length.toLocaleString('pt-BR')})
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  followerSource === 'instagram' ? 'bg-emerald-100 text-emerald-700'
                  : followerSource === 'csv' ? 'bg-secondary/10 text-secondary'
                  : 'bg-amber-100 text-amber-700'
                }`}>
                  {followerSource === 'instagram' ? 'REAL' : followerSource === 'csv' ? 'CSV' : 'AMOSTRA'}
                </span>
              </p>
              <p className="text-[10px] text-on-surface-variant">Amostra estratificada por demografia, localização e tipo de conta.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
                <input
                  value={followerSearch}
                  onChange={(e) => { setFollowerSearch(e.target.value); setFollowerPage(1); }}
                  placeholder="Nome, cidade, interesse..."
                  className="pl-9 pr-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary w-64"
                />
              </div>
              <button onClick={exportarExcel} className="px-3 py-2 bg-secondary text-on-secondary rounded-lg text-xs font-bold flex items-center gap-1">
                <Icon name="download" className="text-base" /> Exportar {followers.length}
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-container-low text-[10px] font-bold tracking-[0.12em] text-on-surface-variant uppercase">
                <tr>
                  <th className="text-left px-4 py-3">Seguidor</th>
                  <th className="text-left px-4 py-3">Cidade / UF</th>
                  <th className="text-left px-4 py-3">Faixa</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-right px-4 py-3">Seguidores</th>
                  <th className="text-right px-4 py-3">Eng.</th>
                  <th className="text-left px-4 py-3">Interesses</th>
                  <th className="text-left px-4 py-3">Última int.</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((f) => (
                  <tr key={f.id} className="border-t border-outline-variant/30 hover:bg-surface-container-low/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold flex items-center justify-center">
                          {f.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold leading-tight flex items-center gap-1">
                            {f.nome}
                            {f.verificado && <Icon name="verified" className="text-secondary text-sm" />}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">@{f.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{f.cidade} <span className="text-[10px] text-on-surface-variant">/ {f.estado}</span></td>
                    <td className="px-4 py-3 text-sm">{f.faixaEtaria}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant">{f.tipo}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-mono">{f.seguidores.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-right text-sm font-mono">{f.engajamentoMedio}%</td>
                    <td className="px-4 py-3 text-[11px] text-on-surface-variant truncate max-w-[180px]">{f.interesses}</td>
                    <td className="px-4 py-3 text-[11px] text-on-surface-variant">{new Date(f.ultimaInteracao).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-outline-variant/30 flex items-center justify-between bg-surface-container-low/30 text-xs text-on-surface-variant">
            <span>Página {followerPage} de {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setFollowerPage((p) => Math.max(1, p - 1))} disabled={followerPage === 1} className="px-2 py-1 border border-outline-variant rounded disabled:opacity-40">
                <Icon name="chevron_left" className="text-base" />
              </button>
              <button onClick={() => setFollowerPage((p) => Math.min(totalPages, p + 1))} disabled={followerPage === totalPages} className="px-2 py-1 border border-outline-variant rounded disabled:opacity-40">
                <Icon name="chevron_right" className="text-base" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monitoramento em Tempo Real */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm">
        <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between">
          <p className="font-bold text-on-surface flex items-center gap-2">
            <Icon name="rss_feed" className="text-secondary text-base" /> Monitoramento em Tempo Real
          </p>
          <span className="flex items-center gap-1 text-xs text-error font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" /> Live Feed
          </span>
        </div>
        <div className="divide-y divide-outline-variant/30">
          {feed.map((item) => (
            <div key={item.id} className="p-5 hover:bg-surface-container-low/30 flex gap-4">
              <div className="text-center w-12 flex-shrink-0">
                <p className="font-bold text-sm text-on-surface">{item.hora}</p>
                <span className="block w-2 h-2 rounded-full bg-emerald-500 mx-auto mt-1" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-[10px] font-bold tracking-wider text-on-surface-variant">{item.fonte}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.tagTone}`}>{item.tag}</span>
                </div>
                <p className="font-semibold text-on-surface mt-1">{item.titulo}</p>
                <p className="text-sm text-on-surface-variant mt-1">{item.descricao}</p>
                <div className="flex gap-4 mt-2 text-[10px] text-on-surface-variant">
                  <span className="flex items-center gap-1"><Icon name={item.metaIcon} className="text-sm" /> {item.meta}</span>
                  <span className="flex items-center gap-1"><Icon name={item.meta2Icon} className="text-sm" /> {item.meta2}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 text-center border-t border-outline-variant/30 bg-surface-container-low/30">
          <button
            onClick={carregarMais}
            disabled={feedExpanded}
            className="text-secondary font-bold text-label-sm hover:underline flex items-center justify-center gap-1 mx-auto disabled:opacity-50 disabled:no-underline"
          >
            <Icon name="expand_more" className="text-base" />
            {feedExpanded ? 'Histórico completo carregado' : 'Carregar histórico completo'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl border border-secondary/40 flex items-center gap-2 z-50">
          <Icon name="check_circle" className="text-emerald-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, delta, tone }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label}</p>
      <p className="text-lg font-bold text-primary leading-tight">{value}</p>
      {delta && <p className={`text-[10px] font-bold ${tone}`}>{delta}</p>}
    </div>
  );
}

function Demographic({ label, value, color }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-bold text-primary">{value}%</span>
      </div>
      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div className={`h-1.5 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
