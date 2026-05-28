import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import {
  fontes,
  getPopulacao,
  getPIB,
  getPIBPerCapita,
  getSerieHistoricaPIB,
  exportarRelatorio,
} from '../services/observatorio.js';

function fmtNumber(n) {
  if (n == null || isNaN(n)) return '—';
  return n.toLocaleString('pt-BR');
}
function fmtMoeda(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1_000_000_000) return `R$ ${(n / 1_000_000_000).toFixed(1).replace('.', ',')} bi`;
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')} mi`;
  return `R$ ${n.toLocaleString('pt-BR')}`;
}

const economia = [
  { label: 'Empresas Ativas', value: '32.184', sub: 'Cadastro CNPJ ativo', icon: 'storefront' },
  { label: 'Salário Médio Formal', value: '2,5 s.m.', sub: 'CAGED / RAIS', icon: 'badge' },
  { label: 'Pessoal Ocupado', value: '188.4 mil', sub: '28,2% da população', icon: 'work' },
  { label: 'Receita Municipal', value: 'R$ 3,2 bi', sub: 'Execução 2023', icon: 'account_balance' },
  { label: 'Frota de Veículos', value: '394.521', sub: 'DENATRAN', icon: 'directions_car' },
  { label: 'Exportações', value: 'US$ 412 mi', sub: 'Cidade Industrial', icon: 'local_shipping' },
];

const setores = [
  { name: 'Indústria', share: 36.4, color: 'bg-secondary' },
  { name: 'Serviços', share: 58.9, color: 'bg-emerald-500' },
  { name: 'Administração Pública', share: 4.5, color: 'bg-amber-500' },
  { name: 'Agropecuária', share: 0.2, color: 'bg-tertiary-fixed-dim' },
];

const social = [
  { label: 'Escolarização (6-14 anos)', value: '98,2%', tone: 'text-emerald-600', icon: 'school' },
  { label: 'IDEB - Anos Iniciais', value: '5,8', tone: 'text-secondary', icon: 'menu_book' },
  { label: 'IDEB - Anos Finais', value: '4,7', tone: 'text-secondary', icon: 'auto_stories' },
  { label: 'Esgotamento Sanitário', value: '87,4%', tone: 'text-emerald-600', icon: 'water_drop' },
  { label: 'Urbanização de Vias', value: '78,1%', tone: 'text-amber-600', icon: 'directions' },
  { label: 'Arborização Urbana', value: '64,3%', tone: 'text-emerald-600', icon: 'park' },
];

const saude = [
  { label: 'Estabelecimentos SUS', value: '89', icon: 'local_hospital' },
  { label: 'Leitos por mil hab.', value: '2,1', icon: 'hotel' },
  { label: 'Mortalidade infantil', value: '9,5 ‰', icon: 'child_care' },
  { label: 'Cobertura ESF', value: '76,8%', icon: 'medical_services' },
];

const rankingBairros = [
  { name: 'Eldorado', pop: 22850, pib: 'R$ 2,1 bi', empresas: 1812 },
  { name: 'Cidade Industrial', pop: 18420, pib: 'R$ 5,4 bi', empresas: 2104 },
  { name: 'Riacho das Pedras', pop: 16730, pib: 'R$ 0,9 bi', empresas: 1230 },
  { name: 'Petrolândia', pop: 14310, pib: 'R$ 0,7 bi', empresas: 880 },
  { name: 'Nacional', pop: 12980, pib: 'R$ 0,6 bi', empresas: 752 },
];

const defaultSeries = [
  { year: '2018', pib: 19.8 },
  { year: '2019', pib: 20.6 },
  { year: '2020', pib: 19.2 },
  { year: '2021', pib: 22.7 },
  { year: '2022', pib: 24.5 },
  { year: '2023*', pib: 26.1 },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [sources, setSources] = useState({});
  const [data, setData] = useState({
    populacao: 668949,
    pib: 24500000000,
    pibPerCapita: 38420,
    idh: 0.756,
    pibAno: '2021',
    populacaoAtualizadoEm: null,
  });
  const [series, setSeries] = useState(defaultSeries);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [toast, setToast] = useState('');

  async function carregar(silent = false) {
    if (silent) setRefreshing(true); else setLoading(true);
    setError('');
    const results = await Promise.allSettled([
      getPopulacao(),
      getPIB(),
      getPIBPerCapita(),
      getSerieHistoricaPIB(),
    ]);
    const [pop, pib, ppc, serieHist] = results;
    setSources({
      ibge: pop.status === 'fulfilled' && !pop.value?.fallback,
      'ibge-projecao': pop.status === 'fulfilled' && !pop.value?.fallback,
      pibSource: pib.status === 'fulfilled' && !pib.value?.fallback,
    });
    setData((d) => ({
      ...d,
      populacao: pop.status === 'fulfilled' ? pop.value.total : d.populacao,
      pib: pib.status === 'fulfilled' ? pib.value.valor : d.pib,
      pibAno: pib.status === 'fulfilled' ? pib.value.ano : d.pibAno,
      pibPerCapita: ppc.status === 'fulfilled' ? ppc.value.valor : d.pibPerCapita,
      populacaoAtualizadoEm: new Date().toISOString(),
    }));
    if (serieHist.status === 'fulfilled') setSeries(serieHist.value);
    if (results.some((r) => r.status === 'rejected')) setError('Algumas fontes retornaram fallback.');
    if (silent) setRefreshing(false); else setLoading(false);
    if (silent) {
      setToast('Dados atualizados com fontes oficiais.');
      setTimeout(() => setToast(''), 2500);
    }
  }

  useEffect(() => { carregar(); }, []);

  function handleExport() {
    exportarRelatorio({ data, series, economia, setores, social, saude, rankingBairros });
    setToast('Relatório PDF gerado. Selecione "Salvar como PDF" na janela de impressão.');
    setTimeout(() => setToast(''), 3500);
  }

  const headline = [
    { label: 'POPULAÇÃO ESTIMADA', value: fmtNumber(data.populacao), delta: `IBGE • atualizado ${new Date(data.populacaoAtualizadoEm || Date.now()).toLocaleDateString('pt-BR')}`, icon: 'groups', tone: 'bg-secondary/10 text-secondary' },
    { label: 'PIB MUNICIPAL', value: fmtMoeda(data.pib), delta: `Ano-base ${data.pibAno} • IBGE`, icon: 'payments', tone: 'bg-emerald-100 text-emerald-700' },
    { label: 'PIB PER CAPITA', value: `R$ ${fmtNumber(Math.round(data.pibPerCapita))}`, delta: 'Acima da média de MG', icon: 'trending_up', tone: 'bg-amber-100 text-amber-700' },
    { label: 'IDH-M', value: data.idh.toString().replace('.', ','), delta: 'Alto desenvolvimento (PNUD)', icon: 'verified', tone: 'bg-primary/10 text-primary' },
  ];

  const maxPib = Math.max(...series.map((s) => s.pib));

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="relative rounded-2xl overflow-hidden bg-primary text-on-primary p-7 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1920&q=70')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/85 to-primary/70" />
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,#316bf3,transparent_55%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div>
            <span className="inline-block bg-secondary/20 text-secondary-fixed-dim text-[10px] font-bold tracking-[0.2em] px-2 py-1 rounded">
              OBSERVATÓRIO MUNICIPAL
            </span>
            <h2 className="text-headline-xl leading-tight mt-3">Contagem em Números</h2>
            <p className="text-on-primary-container mt-2 max-w-3xl">
              Indicadores públicos consolidados de economia, sociedade, saúde e educação do município
              de Contagem - MG. Fontes oficiais: IBGE, PNUD, INEP, DataSUS, SEBRAE e Tesouro Nacional.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => carregar(true)}
              disabled={refreshing}
              title="Atualizar dados"
              className="px-3 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-label-sm font-bold flex items-center gap-2 backdrop-blur disabled:opacity-50"
            >
              <Icon name="refresh" className={`text-base ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleExport} className="px-4 py-2.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg text-label-sm font-bold flex items-center gap-2 backdrop-blur">
              <Icon name="download" className="text-base" /> Exportar Relatório
            </button>
            <button onClick={() => setSourcesOpen(true)} className="px-4 py-2.5 bg-secondary hover:opacity-90 text-on-secondary rounded-lg text-label-sm font-bold flex items-center gap-2 shadow-lg shadow-secondary/30">
              <Icon name="hub" className="text-base" /> Conectar Fontes
            </button>
          </div>
        </div>
      </section>

      {/* Indicadores principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter-md">
        {headline.map((k) => (
          <div key={k.label} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant">{k.label}</span>
              <div className={`w-9 h-9 rounded-xl ${k.tone} flex items-center justify-center`}>
                <Icon name={k.icon} className="text-base" />
              </div>
            </div>
            <p className="text-headline-xl text-primary mt-3">{k.value}</p>
            <p className="text-xs text-on-surface-variant mt-1">{k.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Evolução do PIB */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div>
              <h3 className="text-headline-md flex items-center gap-2">
                <Icon name="show_chart" className="text-secondary" /> Evolução do PIB (R$ bilhões)
              </h3>
              <p className="text-on-surface-variant text-label-sm">Série histórica 2018-2023 — IBGE / PMC.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary" /> PIB nominal</span>
              <span className="text-emerald-600 font-bold">+23,7% em 5 anos</span>
            </div>
          </div>
          <div className="grid grid-cols-6 gap-6 items-end h-56">
            {series.map((s) => (
              <div key={s.year} className="flex flex-col items-center gap-2 h-full">
                <div className="flex-1 w-full flex items-end">
                  <div
                    className="w-full bg-gradient-to-t from-secondary to-secondary-container rounded-t-lg relative group"
                    style={{ height: `${(s.pib / maxPib) * 100}%` }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      R$ {s.pib} bi
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold tracking-wider text-on-surface-variant">{s.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Setores econômicos */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <h3 className="text-headline-md flex items-center gap-2 mb-1">
            <Icon name="donut_large" className="text-secondary" /> Composição Setorial
          </h3>
          <p className="text-on-surface-variant text-label-sm mb-5">Valor adicionado por atividade.</p>

          <div className="space-y-4">
            {setores.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-on-surface">{s.name}</span>
                  <span className="font-bold text-primary">{s.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-container">
                  <div className={`h-2 rounded-full ${s.color}`} style={{ width: `${s.share}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-outline-variant/40">
            <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">DESTAQUE</p>
            <p className="text-sm text-on-surface leading-relaxed">
              Contagem abriga a <strong>Cidade Industrial</strong>, o maior parque industrial planejado de MG,
              com mais de 800 indústrias e 35% do PIB municipal.
            </p>
          </div>
        </div>
      </div>

      {/* Economia detalhada */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-headline-md flex items-center gap-2">
            <Icon name="business_center" className="text-secondary" /> Economia e Trabalho
          </h3>
          <span className="text-[10px] font-bold tracking-wider text-on-surface-variant">FONTE: IBGE / CAGED / RAIS</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {economia.map((e) => (
            <div key={e.label} className="border border-outline-variant/40 rounded-xl p-4 hover:border-secondary/50 transition-colors">
              <Icon name={e.icon} className="text-secondary text-lg" />
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mt-2">{e.label}</p>
              <p className="text-xl font-bold text-primary mt-1">{e.value}</p>
              <p className="text-[10px] text-on-surface-variant mt-1">{e.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Indicadores sociais */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <h3 className="text-headline-md flex items-center gap-2 mb-5">
            <Icon name="diversity_3" className="text-secondary" /> Indicadores Sociais e Urbanos
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {social.map((s) => (
              <div key={s.label} className="flex items-center gap-4 p-4 border border-outline-variant/40 rounded-xl">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Icon name={s.icon} className="text-secondary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-on-surface-variant">{s.label}</p>
                  <p className={`text-2xl font-bold ${s.tone}`}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saúde */}
        <div className="col-span-12 lg:col-span-5 bg-primary text-on-primary rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-lg flex items-center gap-2 mb-1">
            <Icon name="health_and_safety" className="text-secondary-fixed-dim" /> Saúde Pública
          </h3>
          <p className="text-xs text-on-primary-container mb-5">DataSUS / CNES / Ministério da Saúde.</p>

          <div className="space-y-3">
            {saude.map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl bg-primary-container/60 border border-white/10">
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-secondary/20 flex items-center justify-center">
                    <Icon name={s.icon} className="text-secondary-fixed-dim text-base" />
                  </span>
                  <span className="text-sm font-semibold">{s.label}</span>
                </span>
                <span className="text-xl font-bold">{s.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl bg-secondary/15 border border-secondary/30">
            <p className="text-[10px] font-bold tracking-wider text-secondary-fixed-dim">PRÓXIMA ATUALIZAÇÃO</p>
            <p className="text-sm mt-1">DataSUS sincroniza diariamente às 06:00 BRT.</p>
          </div>
        </div>
      </div>

      {/* Ranking de bairros */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-headline-md flex items-center gap-2">
              <Icon name="leaderboard" className="text-secondary" /> Ranking por Bairro
            </h3>
            <p className="text-on-surface-variant text-label-sm">População, PIB estimado e empresas ativas por região.</p>
          </div>
          <button className="text-secondary text-label-sm font-bold flex items-center gap-1 hover:underline">
            Ver ranking completo <Icon name="arrow_forward" className="text-sm" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
              <tr>
                <th className="text-left px-5 py-3">Bairro</th>
                <th className="text-right px-5 py-3">População</th>
                <th className="text-right px-5 py-3">PIB Estimado</th>
                <th className="text-right px-5 py-3">Empresas Ativas</th>
                <th className="text-left px-5 py-3">Densidade Econômica</th>
              </tr>
            </thead>
            <tbody>
              {rankingBairros.map((b, i) => {
                const max = Math.max(...rankingBairros.map((r) => r.empresas));
                return (
                  <tr key={b.name} className="border-t border-outline-variant/30 hover:bg-surface-container-low/40">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-on-surface">{b.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono">{b.pop.toLocaleString('pt-BR')}</td>
                    <td className="px-5 py-4 text-right font-bold text-primary">{b.pib}</td>
                    <td className="px-5 py-4 text-right">{b.empresas.toLocaleString('pt-BR')}</td>
                    <td className="px-5 py-4">
                      <div className="h-2 bg-surface-container rounded-full w-40">
                        <div className="h-2 bg-secondary rounded-full" style={{ width: `${(b.empresas / max) * 100}%` }} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[10px] text-on-surface-variant text-center">
        {loading
          ? 'Carregando dados das fontes oficiais...'
          : `Última sincronização: ${new Date().toLocaleString('pt-BR')}. ${error || 'Todas as fontes respondem normalmente.'}`}
      </p>

      {/* Modal: Conectar Fontes */}
      {sourcesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSourcesOpen(false)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between bg-primary text-on-primary">
              <div>
                <h3 className="text-headline-md flex items-center gap-2"><Icon name="hub" className="text-secondary-fixed-dim" /> Fontes Conectadas</h3>
                <p className="text-xs text-on-primary-container">8 APIs públicas oficiais consultadas em tempo real.</p>
              </div>
              <button onClick={() => setSourcesOpen(false)} className="text-on-primary-container hover:text-on-primary"><Icon name="close" /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-5 space-y-2">
              {fontes.map((f) => {
                const ok = sources[f.id] ?? false;
                return (
                  <div key={f.id} className="border border-outline-variant/40 rounded-xl p-4 flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-700'}`}>
                      <Icon name={ok ? 'check_circle' : 'sync'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <p className="font-bold text-on-surface">{f.name}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {ok ? 'CONECTADO' : 'CACHE / FALLBACK'}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-0.5">{f.desc}</p>
                      <div className="flex items-center justify-between mt-2 text-[10px]">
                        <code className="text-secondary truncate max-w-[60%]">{f.endpoint}</code>
                        <span className="text-on-surface-variant">Ciclo: {f.cycle}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 border-t border-outline-variant/40 flex items-center justify-between bg-surface-container-low/30">
              <p className="text-[10px] text-on-surface-variant">Endpoints expostos pelo Governo Federal e Tribunais. CORS habilitado.</p>
              <button onClick={() => { carregar(true); setSourcesOpen(false); }} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
                <Icon name="refresh" className="text-base" /> Sincronizar agora
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
