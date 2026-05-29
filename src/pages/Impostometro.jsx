import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';

// Estimativa: arrecadação anual da Prefeitura de Contagem-MG ≈ R$ 3,3 bi
// Valor por segundo = 3.300.000.000 / (365 * 24 * 3600) ≈ R$ 104,67/s
const VALOR_BASE = 1_452_891_865.45;
const VALOR_POR_SEGUNDO = 104.50;
const INICIO_REFERENCIA = Date.now();

const setores = [
  { nome: 'Saúde', pct: 25, valor: 363_000_000, color: '#0051d5', stroke: 'stroke-secondary' },
  { nome: 'Educação', pct: 23, valor: 334_000_000, color: '#10b981', stroke: 'stroke-emerald-500' },
  { nome: 'Infraestrutura', pct: 15, valor: 218_000_000, color: '#f59e0b', stroke: 'stroke-amber-500' },
  { nome: 'Segurança', pct: 12, valor: 174_000_000, color: '#a855f7', stroke: 'stroke-purple-500' },
  { nome: 'Outros', pct: 25, valor: 363_000_000, color: '#cbd5e1', stroke: 'stroke-slate-300' },
];

const serieArrecadacao = [
  { ano: '2022', valor: 2.87 },
  { ano: '2023', valor: 3.05 },
  { ano: '2024*', valor: 3.30 },
];

const scoreCards = [
  {
    nome: 'Saúde Pública', score: 9.8, scoreTone: 'bg-emerald-100 text-emerald-700',
    icon: 'local_hospital', valor: 'R$ 363.222.530',
    items: [
      { label: 'UPAs e UBS', valor: 'R$ 142M', progress: 78 },
      { label: 'Medicamentos', valor: 'R$ 98M', progress: 65 },
      { label: 'Vacinação', valor: 'R$ 52M', progress: 92 },
    ],
  },
  {
    nome: 'Educação', score: 9.5, scoreTone: 'bg-emerald-100 text-emerald-700',
    icon: 'school', valor: 'R$ 334.164.728',
    items: [
      { label: 'Reformas Escolares', valor: 'R$ 95M', progress: 70 },
      { label: 'Merenda Escolar', valor: 'R$ 56M', progress: 88 },
      { label: 'Material Didático', valor: 'R$ 31M', progress: 60 },
    ],
  },
  {
    nome: 'Infraestrutura', score: 8.2, scoreTone: 'bg-amber-100 text-amber-700',
    icon: 'engineering', valor: 'R$ 217.933.518',
    items: [
      { label: 'Pavimentação', valor: 'R$ 120M', progress: 55 },
      { label: 'Iluminação LED', valor: 'R$ 45M', progress: 100 },
      { label: 'Saneamento', valor: 'R$ 38M', progress: 72 },
    ],
  },
];

const PROJETOS_POR_AREA = {
  'Saúde Pública': [
    { nome: 'Construção UPA 24h Vargem das Flores', valor: 'R$ 48M', status: 'Em execução', prazo: 'Mar/2026', progresso: 62 },
    { nome: 'Modernização do Pronto Atendimento Eldorado', valor: 'R$ 22M', status: 'Concluído', prazo: 'Out/2025', progresso: 100 },
    { nome: 'Aquisição de 38 ambulâncias', valor: 'R$ 18M', status: 'Em execução', prazo: 'Dez/2025', progresso: 78 },
    { nome: 'Programa Vacinação em Massa 2025', valor: 'R$ 14M', status: 'Em execução', prazo: 'Contínuo', progresso: 85 },
    { nome: 'Telemedicina nas UBS rurais', valor: 'R$ 9M', status: 'Planejamento', prazo: 'Jun/2026', progresso: 12 },
  ],
  'Educação': [
    { nome: 'Reforma de 35 escolas municipais', valor: 'R$ 56M', status: 'Em execução', prazo: 'Fev/2026', progresso: 58 },
    { nome: 'Construção do CMEI Petrolândia', valor: 'R$ 12M', status: 'Em execução', prazo: 'Mai/2026', progresso: 40 },
    { nome: 'Distribuição de tablets educacionais', valor: 'R$ 28M', status: 'Concluído', prazo: 'Set/2025', progresso: 100 },
    { nome: 'Programa Merenda Saudável', valor: 'R$ 31M', status: 'Em execução', prazo: 'Contínuo', progresso: 90 },
    { nome: 'Bolsa Universitária Municipal', valor: 'R$ 18M', status: 'Em execução', prazo: 'Contínuo', progresso: 100 },
  ],
  'Infraestrutura': [
    { nome: 'Recapeamento Av. João César de Oliveira', valor: 'R$ 42M', status: 'Em execução', prazo: 'Jan/2026', progresso: 35 },
    { nome: 'Substituição total para iluminação LED', valor: 'R$ 45M', status: 'Concluído', prazo: 'Ago/2025', progresso: 100 },
    { nome: 'Coletor de esgoto Riacho das Pedras', valor: 'R$ 38M', status: 'Em execução', prazo: 'Abr/2026', progresso: 52 },
    { nome: 'Duplicação Anel Viário Industrial', valor: 'R$ 65M', status: 'Licitação', prazo: 'Out/2026', progresso: 8 },
    { nome: '38km de novas ciclovias', valor: 'R$ 15M', status: 'Em execução', prazo: 'Mar/2026', progresso: 70 },
  ],
};

const LEIS_TRIBUTARIAS = [
  { num: 'Lei Complementar nº 247/2023', titulo: 'Código Tributário Municipal', publicacao: '15/12/2023', vigencia: 'Vigente' },
  { num: 'Decreto nº 1.892/2024', titulo: 'Regulamento do IPTU 2024', publicacao: '02/01/2024', vigencia: 'Vigente' },
  { num: 'Lei nº 5.124/2024', titulo: 'Isenção de ISS para microempreendedores', publicacao: '18/03/2024', vigencia: 'Vigente' },
  { num: 'Decreto nº 1.945/2024', titulo: 'Reforma do ITBI — alíquotas progressivas', publicacao: '22/06/2024', vigencia: 'Vigente' },
  { num: 'Lei nº 5.187/2024', titulo: 'Programa REFIS 2024', publicacao: '10/09/2024', vigencia: 'Encerrada' },
  { num: 'Lei Complementar nº 251/2024', titulo: 'Taxa de Coleta de Lixo Seletiva', publicacao: '05/11/2024', vigencia: 'Vigente' },
];

const RELATORIOS_FISCAIS = [
  { nome: 'RREO - 6º Bimestre 2024', tipo: 'PDF', tamanho: '4.2 MB', data: '30/01/2025', orgao: 'Sec. Fazenda' },
  { nome: 'RGF - 3º Quadrimestre 2024', tipo: 'PDF', tamanho: '3.8 MB', data: '28/01/2025', orgao: 'Controladoria' },
  { nome: 'Balanço Geral 2024', tipo: 'PDF', tamanho: '12.5 MB', data: '15/01/2025', orgao: 'Sec. Fazenda' },
  { nome: 'Demonstrativos Contábeis Anuais', tipo: 'XLSX', tamanho: '2.1 MB', data: '15/01/2025', orgao: 'Controladoria' },
  { nome: 'Prestação de Contas TCEMG', tipo: 'PDF', tamanho: '8.9 MB', data: '10/01/2025', orgao: 'Controladoria' },
  { nome: 'LDO 2026', tipo: 'PDF', tamanho: '5.4 MB', data: '20/11/2024', orgao: 'Planejamento' },
  { nome: 'LOA 2025', tipo: 'PDF', tamanho: '6.7 MB', data: '15/12/2024', orgao: 'Planejamento' },
];

const conquistas = [
  { icon: 'construction', label: '250+ Obras Ativas' },
  { icon: 'school', label: '120 Escolas Reformadas' },
  { icon: 'lightbulb', label: 'Iluminação 100% LED' },
  { icon: 'local_hospital', label: '12 UBS Modernizadas' },
  { icon: 'directions_bus', label: '38km de Ciclovias' },
];

function formatBRL(n) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Impostometro() {
  const [valor, setValor] = useState(VALOR_BASE);
  const [setorSelecionado, setSetorSelecionado] = useState(null);
  const [modal, setModal] = useState(null); // { tipo: 'projetos'|'leis'|'relatorios', area? }
  const [toast, setToast] = useState('');

  useEffect(() => {
    const t = setInterval(() => {
      const elapsed = (Date.now() - INICIO_REFERENCIA) / 1000;
      setValor(VALOR_BASE + elapsed * VALOR_POR_SEGUNDO);
    }, 100);
    return () => clearInterval(t);
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function baixarArquivo(nome, conteudo) {
    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${nome} baixado.`);
  }

  // Donut geometry
  const radius = 50;
  const stroke = 18;
  const c = 2 * Math.PI * radius;
  let acc = 0;
  const arcs = setores.map((s) => {
    const len = (s.pct / 100) * c;
    const seg = { ...s, dasharray: `${len} ${c}`, offset: -acc };
    acc += len;
    return seg;
  });

  const serieMax = Math.max(...serieArrecadacao.map((x) => x.valor));

  return (
    <div className="space-y-6">
      {/* Hero — Impostômetro */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-secondary via-secondary to-primary text-on-secondary p-8 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1920&q=70')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/95 via-secondary/90 to-primary/95" />
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_70%_30%,#ffffff,transparent_50%)]" />
        <div className="relative text-center">
          <span className="inline-block bg-white/15 text-white text-[10px] font-bold tracking-[0.3em] px-3 py-1 rounded-full backdrop-blur">
            IMPOSTÔMETRO CONTAGEM {new Date().getFullYear()}
          </span>
          <p className="text-5xl md:text-6xl font-extrabold mt-4 font-mono tabular-nums leading-tight">
            R$ {formatBRL(valor)}
          </p>
          <p className="text-sm text-white/80 mt-3 max-w-xl mx-auto">
            Total de tributos arrecadados pelo município destinados à saúde, educação e infraestrutura urbana.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-2 rounded-full mt-4 backdrop-blur">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            <span className="text-xs font-bold">+ R$ {VALOR_POR_SEGUNDO.toFixed(2)} por segundo</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Alocação de Recursos */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-headline-md flex items-center gap-2">
                <Icon name="donut_large" className="text-secondary" /> Alocação de Recursos
              </h3>
              <p className="text-xs text-on-surface-variant">Distribuição percentual por setor prioritário</p>
            </div>
            <Icon name="info" className="text-on-surface-variant text-base" title="Dados de execução orçamentária" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="relative">
              <svg viewBox="0 0 120 120" className="w-full max-w-[260px] mx-auto -rotate-90">
                <circle cx="60" cy="60" r={radius} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
                {arcs.map((s) => (
                  <circle
                    key={s.nome}
                    cx="60" cy="60" r={radius} fill="none"
                    stroke={s.color} strokeWidth={stroke}
                    strokeDasharray={s.dasharray} strokeDashoffset={s.offset}
                    className={`cursor-pointer transition-all ${setorSelecionado === s.nome ? 'opacity-100' : setorSelecionado ? 'opacity-40' : 'opacity-100 hover:opacity-80'}`}
                    onClick={() => setSetorSelecionado(setorSelecionado === s.nome ? null : s.nome)}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                {setorSelecionado ? (
                  <>
                    <p className="text-3xl font-bold text-primary">{setores.find((s) => s.nome === setorSelecionado).pct}%</p>
                    <p className="text-xs text-on-surface-variant">{setorSelecionado}</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-primary">100%</p>
                    <p className="text-xs text-on-surface-variant">Investido</p>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {setores.map((s) => (
                <button
                  key={s.nome}
                  onClick={() => setSetorSelecionado(setorSelecionado === s.nome ? null : s.nome)}
                  className={`text-left p-2 rounded-lg border transition-all ${setorSelecionado === s.nome ? 'border-secondary bg-secondary/5' : 'border-transparent hover:bg-surface-container-low/50'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm font-bold">{s.nome}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant ml-5">
                    {s.pct}% (R$ {(s.valor / 1_000_000).toFixed(0)}M)
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Fiscal */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-headline-md">Performance Fiscal</h3>
              <p className="text-xs text-on-surface-variant">Comparativo de arrecadação anual</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Icon name="trending_up" className="text-sm" /> +8.4%
            </span>
          </div>
          <div className="flex items-end justify-around h-32 mt-4">
            {serieArrecadacao.map((s) => {
              const altura = (s.valor / serieMax) * 100;
              const futuro = s.ano.includes('*');
              return (
                <div key={s.ano} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-[10px] font-bold text-on-surface">R$ {s.valor.toFixed(1)}bi</span>
                  <div className={`w-8 rounded-t-md ${futuro ? 'bg-secondary/40 border-2 border-dashed border-secondary' : 'bg-secondary'}`} style={{ height: `${altura}%` }} />
                  <span className="text-[10px] text-on-surface-variant">{s.ano}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-on-surface-variant italic text-center mt-3 leading-tight">
            * Projeção baseada na arrecadação do primeiro semestre e sazonalidade histórica.
          </p>
        </div>
      </div>

      {/* Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
        {scoreCards.map((c) => (
          <div key={c.nome} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                <Icon name={c.icon} />
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.scoreTone}`}>
                Score {c.score}
              </span>
            </div>
            <p className="font-bold text-on-surface">{c.nome}</p>
            <p className="text-xl font-bold text-primary mt-1">{c.valor}</p>
            <div className="space-y-2 mt-4">
              {c.items.map((it) => (
                <div key={it.label}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-on-surface-variant">{it.label}</span>
                    <span className="font-bold text-on-surface">{it.valor}</span>
                  </div>
                  <div className="h-1 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-1 bg-secondary rounded-full" style={{ width: `${it.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModal({ tipo: 'projetos', area: c.nome })}
              className="w-full mt-4 py-2 border border-outline-variant rounded-lg text-label-sm font-bold text-on-surface hover:bg-secondary hover:text-on-secondary hover:border-secondary transition-colors flex items-center justify-center gap-1"
            >
              Ver Projetos <Icon name="arrow_forward" className="text-sm" />
            </button>
          </div>
        ))}
      </div>

      {/* Onde seu imposto vai + Central de Transparência */}
      <div className="grid grid-cols-12 gap-gutter-md">
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-on-surface text-lg">Onde seu imposto vai?</h3>
          <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
            Entenda como cada real arrecadado retorna para você em forma de serviços, segurança e qualidade
            de vida em Contagem. Do asfalto da sua rua à vacina no postinho, a transparência é o nosso compromisso.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5">
            {conquistas.map((c) => (
              <div key={c.label} className="flex items-center gap-2 p-2 bg-secondary/5 border border-secondary/20 rounded-lg">
                <Icon name={c.icon} className="text-secondary text-base" />
                <span className="text-sm font-semibold">{c.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-primary text-on-primary rounded-2xl p-6 shadow-xl">
          <h3 className="font-bold text-lg">Central de Transparência</h3>
          <p className="text-xs text-on-primary-container mt-1 mb-5">
            Acesse documentos oficiais e dados abertos em tempo real.
          </p>
          <div className="space-y-2">
            <button onClick={() => setModal({ tipo: 'relatorios' })} className="w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg p-3 flex items-center justify-between gap-2 backdrop-blur">
              <span className="flex items-center gap-2 text-sm font-bold"><Icon name="picture_as_pdf" className="text-base" /> Relatórios Fiscais (PDF)</span>
              <Icon name="chevron_right" className="text-base" />
            </button>
            <button onClick={() => setModal({ tipo: 'leis' })} className="w-full bg-white/10 hover:bg-white/15 border border-white/15 rounded-lg p-3 flex items-center justify-between gap-2 backdrop-blur">
              <span className="flex items-center gap-2 text-sm font-bold"><Icon name="gavel" className="text-base" /> Leis Tributárias</span>
              <Icon name="chevron_right" className="text-base" />
            </button>
            <a href="https://transparencia.contagem.mg.gov.br" target="_blank" rel="noreferrer" className="w-full bg-secondary hover:opacity-90 rounded-lg p-3 flex items-center justify-between gap-2 transition-opacity">
              <span className="flex items-center gap-2 text-sm font-bold"><Icon name="dataset" className="text-base" /> Portal de Dados Abertos</span>
              <Icon name="open_in_new" className="text-base" />
            </a>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] text-on-surface-variant">
        <span className="flex items-center gap-1">
          <Icon name="verified" className="text-emerald-600 text-sm" />
          Dados auditados pela Controladoria-Geral do Município
        </span>
        <span>Atualizado em {new Date().toLocaleString('pt-BR')}</span>
      </div>

      {/* Modal: Projetos */}
      {modal?.tipo === 'projetos' && (
        <ModalShell title={`Projetos — ${modal.area}`} icon="folder_open" onClose={() => setModal(null)}>
          <p className="text-xs text-on-surface-variant mb-4">
            {PROJETOS_POR_AREA[modal.area]?.length || 0} projetos em execução, planejamento ou concluídos.
          </p>
          <div className="space-y-3">
            {PROJETOS_POR_AREA[modal.area]?.map((p) => (
              <div key={p.nome} className="border border-outline-variant/40 rounded-xl p-3">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-on-surface text-sm">{p.nome}</p>
                    <div className="flex gap-3 mt-1 text-[11px] text-on-surface-variant">
                      <span className="flex items-center gap-1"><Icon name="payments" className="text-sm" /> {p.valor}</span>
                      <span className="flex items-center gap-1"><Icon name="schedule" className="text-sm" /> {p.prazo}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    p.status === 'Concluído' ? 'bg-emerald-100 text-emerald-700'
                    : p.status === 'Em execução' ? 'bg-secondary/10 text-secondary'
                    : p.status === 'Licitação' ? 'bg-amber-100 text-amber-700'
                    : 'bg-surface-container text-on-surface-variant'
                  }`}>{p.status}</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-on-surface-variant">Execução</span>
                    <span className="font-bold">{p.progresso}%</span>
                  </div>
                  <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-1.5 rounded-full ${p.progresso === 100 ? 'bg-emerald-500' : p.progresso > 50 ? 'bg-secondary' : p.progresso > 20 ? 'bg-amber-500' : 'bg-error'}`} style={{ width: `${p.progresso}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ModalShell>
      )}

      {/* Modal: Relatórios Fiscais */}
      {modal?.tipo === 'relatorios' && (
        <ModalShell title="Relatórios Fiscais" icon="picture_as_pdf" onClose={() => setModal(null)}>
          <p className="text-xs text-on-surface-variant mb-4">
            Documentos oficiais publicados conforme Lei de Responsabilidade Fiscal (LRF 101/2000).
          </p>
          <div className="space-y-2">
            {RELATORIOS_FISCAIS.map((r) => (
              <button
                key={r.nome}
                onClick={() => baixarArquivo(`${r.nome.replace(/\s+/g, '_')}.${r.tipo.toLowerCase()}`, `Relatório oficial do Município de Contagem - MG\n\n${r.nome}\nÓrgão: ${r.orgao}\nPublicado em: ${r.data}\nTamanho: ${r.tamanho}\n\n(Demonstração — em produção: PDF assinado digitalmente)`)}
                className="w-full text-left flex items-center justify-between p-3 border border-outline-variant/40 rounded-lg hover:border-secondary hover:bg-secondary/5"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${r.tipo === 'PDF' ? 'bg-error/10 text-error' : 'bg-emerald-100 text-emerald-700'}`}>
                    <Icon name={r.tipo === 'PDF' ? 'picture_as_pdf' : 'table_view'} />
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{r.nome}</p>
                    <p className="text-[10px] text-on-surface-variant">{r.orgao} • {r.data} • {r.tamanho}</p>
                  </div>
                </div>
                <Icon name="download" className="text-secondary" />
              </button>
            ))}
          </div>
        </ModalShell>
      )}

      {/* Modal: Leis Tributárias */}
      {modal?.tipo === 'leis' && (
        <ModalShell title="Legislação Tributária" icon="gavel" onClose={() => setModal(null)}>
          <p className="text-xs text-on-surface-variant mb-4">
            Marco normativo vigente da Prefeitura de Contagem - MG.
          </p>
          <div className="space-y-2">
            {LEIS_TRIBUTARIAS.map((l) => (
              <div key={l.num} className="p-3 border border-outline-variant/40 rounded-lg">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <div>
                    <p className="font-mono text-[11px] text-secondary font-bold">{l.num}</p>
                    <p className="font-semibold text-on-surface text-sm mt-0.5">{l.titulo}</p>
                    <p className="text-[10px] text-on-surface-variant mt-1">Publicado em {l.publicacao}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${l.vigencia === 'Vigente' ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-container text-on-surface-variant'}`}>
                    {l.vigencia}
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => baixarArquivo(`${l.num.replace(/[^a-z0-9]+/gi, '_')}.txt`, `${l.num}\n${l.titulo}\nPublicado em ${l.publicacao}\nStatus: ${l.vigencia}\n\n(Texto integral disponível no Diário Oficial do Município)`)}
                    className="text-xs text-secondary font-bold hover:underline flex items-center gap-1"
                  >
                    <Icon name="download" className="text-sm" /> Baixar texto
                  </button>
                  <a
                    href="https://www.contagem.mg.gov.br/legislacao"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-secondary font-bold hover:underline flex items-center gap-1"
                  >
                    <Icon name="open_in_new" className="text-sm" /> Ver íntegra
                  </a>
                </div>
              </div>
            ))}
          </div>
        </ModalShell>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl border border-secondary/40 flex items-center gap-2 z-50">
          <Icon name="check_circle" className="text-emerald-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}

function ModalShell({ title, icon, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between bg-primary text-on-primary">
          <h3 className="text-headline-md flex items-center gap-2"><Icon name={icon} className="text-secondary-fixed-dim" /> {title}</h3>
          <button onClick={onClose} className="text-on-primary-container hover:text-on-primary"><Icon name="close" /></button>
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
