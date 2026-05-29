import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { generateProfile, generateFollowers, exportFollowersCSV, fetchInstagramProfile, fetchInstagramFollowersReal, importFollowersFromCSV } from '../services/inteligencia.js';
import { runPublicAnalysis } from '../services/analisePublica.js';
import { listJornais, addJornal, removeJornal, subscribe as subscribeImprensa, fetchFeed, SUGESTOES } from '../services/imprensaLocal.js';

export default function InteligenciaPolitica() {
  const [igHandle, setIgHandle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [scraping, setScraping] = useState(false);
  const [scrapedTarget, setScrapedTarget] = useState(null);
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
  const [publicAnalysis, setPublicAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
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

    // Análise de mídia/fontes públicas em paralelo
    setLoadingAnalysis(true);
    setPublicAnalysis(null);
    runPublicAnalysis(prof)
      .then((res) => setPublicAnalysis(res))
      .finally(() => setLoadingAnalysis(false));
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-headline-lg text-primary">Inteligência Política</h2>
          <p className="text-on-surface-variant">
            Onde está o problema, o que o povo está falando e o que você deve fazer hoje.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-primary text-on-primary px-4 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Icon name="download" className="text-base" /> Exportar Relatório
        </button>
      </div>

      <RadarMandato />

      <ImprensaLocal />

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

      {/* Análise Pública (Wikipedia, Mídia, Sentimento) */}
      {(loadingAnalysis || publicAnalysis) && (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm">
          <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-bold text-on-surface flex items-center gap-2">
                <Icon name="travel_explore" className="text-secondary text-base" /> Análise de Fontes Públicas
                {publicAnalysis?.name && <span className="text-[10px] font-normal text-on-surface-variant">— {publicAnalysis.name}</span>}
              </p>
              <p className="text-[10px] text-on-surface-variant">Wikipedia · Google News (30 dias) · DuckDuckGo · BrasilAPI</p>
            </div>
            {loadingAnalysis && <span className="text-xs text-on-surface-variant flex items-center gap-1"><Icon name="autorenew" className="text-base animate-spin" /> Consultando fontes...</span>}
          </div>

          {publicAnalysis && (
            <div className="p-5 grid grid-cols-12 gap-4">
              {/* Bio / Wikipedia */}
              <div className="col-span-12 lg:col-span-7">
                {publicAnalysis.wiki ? (
                  <div className="border border-outline-variant/40 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      {publicAnalysis.wiki.thumbnail && (
                        <img src={publicAnalysis.wiki.thumbnail} alt={publicAnalysis.wiki.title} className="w-16 h-16 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-on-surface">{publicAnalysis.wiki.title}</p>
                          <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-1.5 py-0.5 rounded">WIKIPEDIA</span>
                        </div>
                        {publicAnalysis.wiki.description && <p className="text-xs text-on-surface-variant">{publicAnalysis.wiki.description}</p>}
                        <p className="text-sm text-on-surface mt-2 leading-relaxed">{publicAnalysis.wiki.extract}</p>
                        <a href={publicAnalysis.wiki.url} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:underline mt-2 inline-flex items-center gap-1">
                          <Icon name="open_in_new" className="text-sm" /> Ler na Wikipedia
                        </a>
                      </div>
                    </div>
                  </div>
                ) : publicAnalysis.ddg?.abstract ? (
                  <div className="border border-outline-variant/40 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="font-bold text-on-surface">{publicAnalysis.name}</p>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">{publicAnalysis.ddg.source || 'DUCKDUCKGO'}</span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed">{publicAnalysis.ddg.abstract}</p>
                    {publicAnalysis.ddg.url && (
                      <a href={publicAnalysis.ddg.url} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:underline mt-2 inline-flex items-center gap-1">
                        <Icon name="open_in_new" className="text-sm" /> Fonte
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="border border-dashed border-outline-variant rounded-xl p-6 text-center text-sm text-on-surface-variant">
                    Nenhuma biografia pública encontrada para "{publicAnalysis.name}".
                  </div>
                )}
              </div>

              {/* Sentimento de mídia + palavras-chave */}
              <div className="col-span-12 lg:col-span-5 space-y-3">
                <div className="border border-outline-variant/40 rounded-xl p-4">
                  <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">SENTIMENTO DA MÍDIA ({publicAnalysis.sentiment?.total || 0} notícias)</p>
                  {publicAnalysis.sentiment?.total > 0 ? (
                    <>
                      <div className="flex h-2 rounded-full overflow-hidden mt-2">
                        <div className="bg-emerald-500" style={{ width: `${publicAnalysis.sentiment.positivo}%` }} />
                        <div className="bg-surface-container" style={{ width: `${publicAnalysis.sentiment.neutro}%` }} />
                        <div className="bg-error" style={{ width: `${publicAnalysis.sentiment.negativo}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] mt-2 text-on-surface-variant">
                        <span className="text-emerald-600 font-bold">+{publicAnalysis.sentiment.positivo}%</span>
                        <span>{publicAnalysis.sentiment.neutro}% neutro</span>
                        <span className="text-error font-bold">-{publicAnalysis.sentiment.negativo}%</span>
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-on-surface-variant mt-2">Sem notícias recentes nos últimos 30 dias.</p>
                  )}
                </div>

                {publicAnalysis.keywords?.length > 0 && (
                  <div className="border border-outline-variant/40 rounded-xl p-4">
                    <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">PALAVRAS MAIS CITADAS</p>
                    <div className="flex flex-wrap gap-1">
                      {publicAnalysis.keywords.map((k) => (
                        <span
                          key={k.word}
                          className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold"
                          style={{ fontSize: `${Math.min(16, 11 + k.count)}px` }}
                        >
                          {k.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Lista de notícias */}
              {publicAnalysis.news?.length > 0 && (
                <div className="col-span-12">
                  <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2 flex items-center gap-2">
                    <Icon name="newspaper" className="text-secondary text-base" /> ÚLTIMAS MENÇÕES NA MÍDIA ({publicAnalysis.news.length})
                  </p>
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
                    {publicAnalysis.news.map((n, i) => (
                      <a key={i} href={n.link} target="_blank" rel="noreferrer" className="block border border-outline-variant/40 rounded-lg p-3 hover:border-secondary hover:bg-surface-container-low/40 transition-colors">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-on-surface group-hover:text-secondary line-clamp-2">{n.title}</p>
                            {n.description && <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2">{n.description}</p>}
                          </div>
                          <Icon name="open_in_new" className="text-on-surface-variant text-base" />
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[10px] text-on-surface-variant">
                          <span className="font-bold text-secondary">{n.source}</span>
                          <span>·</span>
                          <span>{n.pubDate ? new Date(n.pubDate).toLocaleDateString('pt-BR') : '—'}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

// ===== Radar Sinergia: Visão do Mandato (mock data, foco em ação) =====
const RM_PROBLEMAS = [
  { label: 'Asfalto', qtd: 58, color: 'bg-error' },
  { label: 'Saúde', qtd: 49, color: 'bg-amber-500' },
  { label: 'Iluminação', qtd: 32, color: 'bg-secondary' },
  { label: 'Segurança', qtd: 21, color: 'bg-purple-500' },
  { label: 'Limpeza', qtd: 14, color: 'bg-emerald-500' },
];
const RM_BAIRROS = [
  { nome: 'Eldorado', qtd: 43 },
  { nome: 'Cidade Industrial', qtd: 38 },
  { nome: 'Petrolândia', qtd: 27 },
  { nome: 'Riacho das Pedras', qtd: 22 },
  { nome: 'Centro', qtd: 19 },
];
const RM_TRENDING = [
  { tag: 'Falta de médico na UPA Eldorado', mentions: '2.3k', tone: 'text-error' },
  { tag: 'Buraco na Av. João César de Oliveira', mentions: '1.7k', tone: 'text-amber-600' },
  { tag: 'Reforma da Praça Petrolândia', mentions: '892', tone: 'text-secondary' },
  { tag: 'Iluminação Rua dos Inconfidentes', mentions: '514', tone: 'text-on-surface-variant' },
];
const RM_SUGESTOES = [
  {
    titulo: 'Pico de reclamações sobre Saúde em Eldorado',
    desc: 'Volume 3,2x acima da média semanal. Sugestão: Emitir Requerimento de Informação à Secretaria Municipal de Saúde solicitando escala médica e prazo para normalização.',
    icon: 'medical_services',
    tone: 'border-error/40 bg-error/5',
    iconTone: 'bg-error/10 text-error',
  },
  {
    titulo: 'Concentração de buracos na Regional Industrial',
    desc: '12 protocolos em 5 dias na mesma extensão. Sugestão: Indicação ao Executivo solicitando programa de recapeamento emergencial e cronograma público.',
    icon: 'engineering',
    tone: 'border-amber-500/40 bg-amber-50',
    iconTone: 'bg-amber-100 text-amber-700',
  },
  {
    titulo: 'Sentimento negativo crescente sobre segurança',
    desc: 'Menções a "assalto" e "guarda municipal" cresceram 41% em 7 dias. Sugestão: Pauta para Audiência Pública conjunta com a Secretaria de Defesa Social.',
    icon: 'shield',
    tone: 'border-purple-500/40 bg-purple-50',
    iconTone: 'bg-purple-100 text-purple-700',
  },
];

function RadarMandato() {
  const [toast, setToast] = useState('');
  const maxProb = Math.max(...RM_PROBLEMAS.map((p) => p.qtd));
  const maxBairro = Math.max(...RM_BAIRROS.map((b) => b.qtd));

  function gerarMinuta(s) {
    const conteudo = `REQUERIMENTO Nº ___/${new Date().getFullYear()}\n\nExmo. Sr. Presidente da Câmara Municipal de Contagem,\n\nO Vereador signatário, nos termos do Regimento Interno, REQUER seja oficiada à autoridade competente solicitando providências quanto à seguinte matéria:\n\n${s.titulo}\n\nJUSTIFICATIVA:\n${s.desc}\n\nContagem, ${new Date().toLocaleDateString('pt-BR')}.\n\n_________________________________________\nVereador Responsável`;
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minuta-${s.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setToast('Minuta gerada e baixada.');
    setTimeout(() => setToast(''), 2500);
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          icon="report_problem"
          tone="bg-error/10 text-error"
          label="DEMANDAS ABERTAS"
          value="142"
          hint="↑ 12% vs. semana passada"
          hintTone="text-error"
        />
        <KpiCard
          icon="task_alt"
          tone="bg-emerald-100 text-emerald-700"
          label="RESOLVIDAS NA SEMANA"
          value="38"
          hint="Taxa de resolução: 73%"
          hintTone="text-emerald-600"
        />
        <KpiCard
          icon="trending_down"
          tone="bg-amber-100 text-amber-700"
          label="SENTIMENTO GERAL (REDES)"
          value="65% Negativo"
          hint="2.847 menções nas últimas 24h"
          hintTone="text-on-surface-variant"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-12 gap-4">
        {/* Bar chart */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <p className="font-bold text-on-surface flex items-center gap-2">
              <Icon name="bar_chart" className="text-secondary text-base" /> Principais Problemas da Cidade
            </p>
            <span className="text-[10px] text-on-surface-variant">últimos 30 dias</span>
          </div>
          <div className="grid grid-cols-5 gap-3 items-end h-44">
            {RM_PROBLEMAS.map((p) => (
              <div key={p.label} className="flex flex-col items-center justify-end gap-2 h-full">
                <span className="text-xs font-bold text-on-surface">{p.qtd}</span>
                <div
                  className={`w-full ${p.color} rounded-t-md transition-all`}
                  style={{ height: `${(p.qtd / maxProb) * 85}%` }}
                />
                <span className="text-[10px] text-on-surface-variant text-center">{p.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap bairros */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-on-surface flex items-center gap-2">
              <Icon name="location_on" className="text-error text-base" /> Mapa de Calor — Top Bairros
            </p>
            <span className="text-[10px] text-on-surface-variant">reclamações</span>
          </div>
          <div className="space-y-3">
            {RM_BAIRROS.map((b, i) => (
              <div key={b.nome}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center ${i === 0 ? 'bg-error text-white' : 'bg-secondary/10 text-secondary'}`}>
                      {i + 1}
                    </span>
                    <span className="font-semibold text-on-surface">{b.nome}</span>
                  </span>
                  <span className="font-bold text-on-surface">{b.qtd}</span>
                </div>
                <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${i === 0 ? 'bg-error' : i === 1 ? 'bg-amber-500' : 'bg-secondary'}`}
                    style={{ width: `${(b.qtd / maxBairro) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Topics */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-on-surface flex items-center gap-2">
              <Icon name="trending_up" className="text-secondary text-base" /> Trending nas Redes (24h)
            </p>
            <span className="text-[10px] text-error font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" /> AO VIVO
            </span>
          </div>
          <div className="space-y-2">
            {RM_TRENDING.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-2 border border-outline-variant/40 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[10px] font-bold text-on-surface-variant w-4">#{i + 1}</span>
                  <span className="text-sm truncate">{t.tag}</span>
                </div>
                <span className={`text-xs font-bold ${t.tone} ml-2 whitespace-nowrap`}>{t.mentions}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sugestões IA */}
        <div className="col-span-12 lg:col-span-7 bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/30 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-on-surface flex items-center gap-2">
              <Icon name="auto_awesome" className="text-secondary text-base" /> Sugestões da Inteligência Artificial
            </p>
            <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">RADAR IA</span>
          </div>
          <div className="space-y-3">
            {RM_SUGESTOES.map((s, i) => (
              <div key={i} className={`border ${s.tone} rounded-xl p-3 flex items-start gap-3`}>
                <div className={`w-10 h-10 rounded-lg ${s.iconTone} flex items-center justify-center flex-shrink-0`}>
                  <Icon name={s.icon} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-on-surface text-sm">{s.titulo}</p>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{s.desc}</p>
                </div>
                <button
                  onClick={() => gerarMinuta(s)}
                  className="bg-secondary text-on-secondary px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1 flex-shrink-0"
                >
                  <Icon name="description" className="text-sm" /> Gerar Minuta
                </button>
              </div>
            ))}
          </div>
        </div>
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

// ===== Imprensa Local — agregador de RSS de jornais =====
function ImprensaLocal() {
  const [jornais, setJornais] = useState(() => listJornais());
  const [feeds, setFeeds] = useState({});           // {jornalId: {items, error, loading}}
  const [adding, setAdding] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novoRss, setNovoRss] = useState('');
  const [toast, setToast] = useState('');

  // Carrega feeds quando a lista muda
  useEffect(() => {
    const unsub = subscribeImprensa(() => setJornais(listJornais()));
    return unsub;
  }, []);

  useEffect(() => {
    jornais.forEach((j) => {
      if (feeds[j.id]) return;
      setFeeds((prev) => ({ ...prev, [j.id]: { loading: true, items: [] } }));
      fetchFeed(j.rss).then((data) => {
        setFeeds((prev) => ({ ...prev, [j.id]: { ...data, loading: false } }));
      });
    });
  }, [jornais]); // eslint-disable-line

  function refresh(j) {
    setFeeds((prev) => ({ ...prev, [j.id]: { loading: true, items: [] } }));
    fetchFeed(j.rss).then((data) => {
      setFeeds((prev) => ({ ...prev, [j.id]: { ...data, loading: false } }));
    });
  }

  function adicionar(e) {
    e?.preventDefault();
    if (!novoNome.trim() || !novoRss.trim()) return;
    addJornal({ nome: novoNome.trim(), rss: novoRss.trim(), url: novoRss.trim() });
    setNovoNome('');
    setNovoRss('');
    setAdding(false);
    setToast('Jornal adicionado.');
    setTimeout(() => setToast(''), 2000);
  }

  function adicionarSugestao(s) {
    addJornal(s);
    setToast(`${s.nome} adicionado.`);
    setTimeout(() => setToast(''), 2000);
  }

  function remover(j) {
    removeJornal(j.id);
    setFeeds((prev) => { const c = { ...prev }; delete c[j.id]; return c; });
  }

  const naoAdicionados = SUGESTOES.filter((s) => !jornais.some((j) => j.rss === s.rss));
  const totalNoticias = Object.values(feeds).reduce((s, f) => s + (f.items?.length || 0), 0);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm">
      <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-bold text-on-surface flex items-center gap-2">
            <Icon name="newspaper" className="text-secondary text-base" /> Imprensa Local — Agregador
            {totalNoticias > 0 && <span className="text-[10px] font-normal text-on-surface-variant">({totalNoticias} notícias)</span>}
          </p>
          <p className="text-[10px] text-on-surface-variant">Adicione URLs de feeds RSS dos jornais que você acompanha. Atualizamos as últimas 10 manchetes de cada um.</p>
        </div>
        <button onClick={() => setAdding((v) => !v)} className="bg-secondary text-on-secondary px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1">
          <Icon name={adding ? 'close' : 'add'} className="text-base" /> {adding ? 'Cancelar' : 'Adicionar Jornal'}
        </button>
      </div>

      {/* Formulário */}
      {adding && (
        <div className="p-5 border-b border-outline-variant/40 bg-surface-container-low/30 space-y-3">
          <form onSubmit={adicionar} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-2 items-end">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">NOME DO JORNAL</label>
              <input
                value={novoNome}
                onChange={(e) => setNovoNome(e.target.value)}
                placeholder="Ex: Jornal de Contagem"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">URL DO FEED RSS</label>
              <input
                value={novoRss}
                onChange={(e) => setNovoRss(e.target.value)}
                placeholder="https://exemplo.com.br/rss"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary font-mono text-xs"
              />
            </div>
            <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-sm">Adicionar</button>
          </form>

          {naoAdicionados.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-1">SUGESTÕES PARA CONTAGEM/MG</p>
              <div className="flex flex-wrap gap-1">
                {naoAdicionados.map((s) => (
                  <button
                    key={s.rss}
                    onClick={() => adicionarSugestao(s)}
                    className="text-[11px] px-2 py-1 rounded-full bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary font-semibold flex items-center gap-1"
                  >
                    <Icon name="add" className="text-xs" /> {s.nome}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="p-5 space-y-4">
        {jornais.length === 0 ? (
          <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center">
            <Icon name="rss_feed" className="text-4xl text-on-surface-variant/40" />
            <p className="text-on-surface-variant mt-2 text-sm">Nenhum jornal adicionado.</p>
            <button onClick={() => setAdding(true)} className="mt-3 text-secondary text-sm font-bold hover:underline">
              + Adicionar primeiro jornal ou usar uma sugestão
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {jornais.map((j) => {
              const f = feeds[j.id] || { loading: true, items: [] };
              return (
                <div key={j.id} className="border border-outline-variant/40 rounded-xl overflow-hidden flex flex-col">
                  <div className="bg-surface-container-low/40 px-4 py-3 border-b border-outline-variant/40 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-on-surface truncate">{j.nome}</p>
                      <p className="text-[10px] text-on-surface-variant truncate">{j.rss}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button onClick={() => refresh(j)} title="Atualizar" className="p-1.5 hover:bg-surface-container rounded text-on-surface-variant hover:text-secondary">
                        <Icon name="refresh" className={`text-base ${f.loading ? 'animate-spin' : ''}`} />
                      </button>
                      <button onClick={() => remover(j)} title="Remover" className="p-1.5 hover:bg-error/10 rounded text-on-surface-variant hover:text-error">
                        <Icon name="delete" className="text-base" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 flex-1">
                    {f.loading ? (
                      <p className="text-xs text-on-surface-variant flex items-center gap-2 py-4 justify-center">
                        <Icon name="autorenew" className="animate-spin text-base" /> Buscando manchetes...
                      </p>
                    ) : f.error ? (
                      <p className="text-xs text-error py-4 text-center">⚠ {f.error} — verifique se o URL é um feed RSS válido.</p>
                    ) : f.items.length === 0 ? (
                      <p className="text-xs text-on-surface-variant py-4 text-center">Sem manchetes recentes.</p>
                    ) : (
                      <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                        {f.items.map((it, i) => (
                          <a key={i} href={it.link} target="_blank" rel="noreferrer" className="flex gap-3 p-2 rounded-lg hover:bg-surface-container-low/50 group">
                            {it.thumbnail && (
                              <img src={it.thumbnail} alt="" className="w-16 h-16 rounded-md object-cover flex-shrink-0" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-on-surface group-hover:text-secondary line-clamp-2 leading-snug">{it.title}</p>
                              {it.description && <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2">{it.description}</p>}
                              <p className="text-[10px] text-on-surface-variant mt-1">{it.pubDate ? new Date(it.pubDate).toLocaleString('pt-BR') : '—'}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

function KpiCard({ icon, tone, label, value, hint, hintTone }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant">{label}</span>
        <div className={`w-10 h-10 rounded-xl ${tone} flex items-center justify-center`}>
          <Icon name={icon} />
        </div>
      </div>
      <p className="text-3xl font-bold text-primary">{value}</p>
      <p className={`text-xs mt-1 ${hintTone}`}>{hint}</p>
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
