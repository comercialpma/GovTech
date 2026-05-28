import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { listAtividades, subscribe } from '../services/atividades.js';

const vereadorRegional = {
  id: 'mv',
  name: 'Dr. Marcos Valente',
  party: 'PR',
  partyName: 'Partido Renovação',
  regional: 'Centro-Sul',
  presence: 98.5,
  approved: 12,
  photo: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400',
  email: 'marcos.valente@camara.gov.br',
  phone: '(31) 3399-0001',
  mandato: '2021-2024',
  comissoes: ['Saúde', 'Orçamento'],
};

const vereadoresLista = [
  { id: 'mc', name: 'Mariana Costa', party: 'PVG', regional: 'Oeste', produtividade: 88, trend: 'up', approval: 'Bom', presence: 94.2, approved: 9, photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200', email: 'mariana.costa@camara.gov.br', phone: '(31) 3399-0002' },
  { id: 'rs', name: 'Ricardo Souza', party: 'PR', regional: 'Norte', produtividade: 62, trend: 'down', approval: 'Regular', presence: 81.5, approved: 5, photo: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=200&h=200', email: 'ricardo.souza@camara.gov.br', phone: '(31) 3399-0003' },
  { id: 'ap', name: 'Ana Paula Vaz', party: 'PT', regional: 'Sul', produtividade: 78, trend: 'up', approval: 'Bom', presence: 90.1, approved: 8, photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200', email: 'ana.vaz@camara.gov.br', phone: '(31) 3399-0004' },
  { id: 'jb', name: 'João Batista', party: 'PL', regional: 'Leste', produtividade: 45, trend: 'down', approval: 'Baixo', presence: 72.0, approved: 3, photo: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=200&h=200', email: 'joao.batista@camara.gov.br', phone: '(31) 3399-0005' },
  { id: 'cn', name: 'Carla Nogueira', party: 'PSDB', regional: 'Centro-Sul', produtividade: 81, trend: 'up', approval: 'Bom', presence: 93.4, approved: 10, photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200', email: 'carla.nogueira@camara.gov.br', phone: '(31) 3399-0006' },
  { id: 'sf', name: 'Sérgio Freitas', party: 'MDB', regional: 'Oeste', produtividade: 55, trend: 'down', approval: 'Regular', presence: 78.6, approved: 4, photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200', email: 'sergio.freitas@camara.gov.br', phone: '(31) 3399-0007' },
];

const atividadesPorVereador = {
  default: [
    { date: '15/05/2026', tipo: 'Projeto', desc: 'Apresentou PL 145/2026 — Programa de Acessibilidade em Vias Públicas.' },
    { date: '08/05/2026', tipo: 'Votação', desc: 'Votou a favor do reajuste do programa Bolsa Escola Municipal.' },
    { date: '02/05/2026', tipo: 'Audiência', desc: 'Audiência pública sobre saneamento básico no bairro Eldorado.' },
    { date: '24/04/2026', tipo: 'Indicação', desc: 'Indicou recapeamento asfáltico da Av. João César de Oliveira.' },
    { date: '12/04/2026', tipo: 'Discurso', desc: 'Tribuna em defesa da ampliação da UBS do Industrial.' },
  ],
};

const tipoTone = {
  'Projeto': 'bg-blue-100 text-blue-700',
  'Votação': 'bg-emerald-100 text-emerald-700',
  'Audiência': 'bg-amber-100 text-amber-700',
  'Indicação': 'bg-purple-100 text-purple-700',
  'Discurso': 'bg-rose-100 text-rose-700',
};

const approvalTone = {
  'Bom': 'text-emerald-600',
  'Regular': 'text-amber-600',
  'Baixo': 'text-error',
};

function AtividadesPublicas({ vereadorId, fallback }) {
  const [custom, setCustom] = useState(() => listAtividades(vereadorId));
  useEffect(() => setCustom(listAtividades(vereadorId)), [vereadorId]);
  useEffect(() => subscribe(() => setCustom(listAtividades(vereadorId))), [vereadorId]);

  const publicadas = custom.filter((a) => a.status === 'Publicado');
  const itens = publicadas.length
    ? publicadas.map((a) => ({ tipo: a.tipo, desc: `${a.titulo} — ${a.desc}`, date: new Date(a.data).toLocaleDateString('pt-BR') }))
    : fallback;

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold flex items-center gap-2"><Icon name="receipt_long" className="text-secondary" /> Últimas Atividades</h4>
        {publicadas.length > 0 && (
          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
            {publicadas.length} REGISTRADAS PELO VEREADOR
          </span>
        )}
      </div>
      <div className="space-y-2">
        {itens.map((a, i) => (
          <div key={i} className="flex items-start gap-3 p-3 border border-outline-variant/40 rounded-xl">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoTone[a.tipo]}`}>{a.tipo}</span>
            <div className="flex-1">
              <p className="text-sm">{a.desc}</p>
              <p className="text-[10px] text-on-surface-variant mt-1">{a.date}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Vereadores() {
  const navigate = useNavigate();
  const [filterRegional, setFilterRegional] = useState('Todas');
  const [filterParty, setFilterParty] = useState('Todos');
  const [advFilterOpen, setAdvFilterOpen] = useState(false);
  const [minProductivity, setMinProductivity] = useState(0);
  const [onlyPresent, setOnlyPresent] = useState(false);
  const [activeVereador, setActiveVereador] = useState(null);
  const [contactVereador, setContactVereador] = useState(null);
  const [dadosAbertosOpen, setDadosAbertosOpen] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const regionais = ['Todas', ...new Set(vereadoresLista.map((v) => v.regional))];
  const partidos = ['Todos', ...new Set(vereadoresLista.map((v) => v.party))];

  const filtrados = useMemo(() => vereadoresLista.filter((v) => {
    if (filterRegional !== 'Todas' && v.regional !== filterRegional) return false;
    if (filterParty !== 'Todos' && v.party !== filterParty) return false;
    if (v.produtividade < minProductivity) return false;
    if (onlyPresent && v.presence < 85) return false;
    return true;
  }), [filterRegional, filterParty, minProductivity, onlyPresent]);

  function exportarCSV() {
    const rows = [['Nome', 'Partido', 'Regional', 'Presença (%)', 'Projetos', 'Produtividade (%)', 'Aprovação']];
    [vereadorRegional, ...filtrados].forEach((v) => {
      rows.push([v.name, v.party, v.regional, v.presence, v.approved, v.produtividade ?? '-', v.approval ?? '-']);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `desempenho-legislativo-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Relatório CSV exportado com sucesso.');
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Desempenho Legislativo</h1>
          <p className="text-body-lg text-on-surface-variant mt-1">
            Acompanhe, avalie e participe das decisões do seu bairro.
          </p>
        </div>
        <div className="flex items-center gap-3 relative">
          <button
            onClick={() => setAdvFilterOpen((v) => !v)}
            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors ${
              advFilterOpen || minProductivity > 0 || onlyPresent
                ? 'bg-secondary/10 text-secondary border border-secondary'
                : 'bg-surface border border-outline-variant text-on-surface hover:bg-surface-variant'
            }`}
          >
            <Icon name="filter_list" className="text-sm" />
            Filtros Avançados
          </button>
          <button
            onClick={exportarCSV}
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <Icon name="download" className="text-sm" />
            Exportar Relatório
          </button>
          {advFilterOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl p-4 z-30">
              <h4 className="font-bold text-on-surface mb-3">Filtros Avançados</h4>
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-on-surface-variant">Produtividade mínima</span>
                  <span className="font-bold text-secondary">{minProductivity}%</span>
                </div>
                <input type="range" min="0" max="100" step="5" value={minProductivity} onChange={(e) => setMinProductivity(Number(e.target.value))} className="w-full accent-secondary" />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer mb-4">
                <input type="checkbox" checked={onlyPresent} onChange={(e) => setOnlyPresent(e.target.checked)} className="accent-secondary w-4 h-4" />
                Somente com presença ≥ 85%
              </label>
              <div className="flex gap-2">
                <button onClick={() => { setMinProductivity(0); setOnlyPresent(false); }} className="flex-1 py-2 border border-outline-variant rounded-lg text-xs font-bold">Limpar</button>
                <button onClick={() => setAdvFilterOpen(false)} className="flex-1 py-2 bg-secondary text-on-secondary rounded-lg text-xs font-bold">Aplicar</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Vereador Regional Destaque */}
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 p-6 relative overflow-hidden shadow-sm">
            <div className="absolute top-4 right-4 text-[10px] font-bold bg-secondary/10 text-secondary px-3 py-1 rounded-full tracking-wider">
              SEU VEREADOR REGIONAL
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mt-2">
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl bg-surface-variant overflow-hidden">
                  <img src={vereadorRegional.photo} alt={vereadorRegional.name} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white w-8 h-8 rounded-full border-2 border-white flex items-center justify-center">
                  <Icon name="verified" className="text-sm" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-headline-md font-bold text-on-surface">{vereadorRegional.name}</h2>
                <p className="text-body-md text-secondary font-medium mt-1">
                  Regional {vereadorRegional.regional} | {vereadorRegional.partyName} ({vereadorRegional.party})
                </p>
                <div className="flex gap-8 mt-4">
                  <div>
                    <div className="text-label-sm text-on-surface-variant">Presença</div>
                    <div className="text-title-lg font-bold text-emerald-600">{vereadorRegional.presence}%</div>
                  </div>
                  <div>
                    <div className="text-label-sm text-on-surface-variant">Projetos Aprovados</div>
                    <div className="text-title-lg font-bold text-on-surface">{vereadorRegional.approved}</div>
                  </div>
                  <div>
                    <div className="text-label-sm text-on-surface-variant">Comissões</div>
                    <div className="text-sm font-bold text-on-surface">{vereadorRegional.comissoes.join(', ')}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-col gap-2">
                <button onClick={() => navigate('/vereadores/pesquisa-opiniao')} className="bg-secondary text-on-secondary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                  Avaliar Agora <Icon name="arrow_forward" className="text-sm" />
                </button>
                <button onClick={() => setActiveVereador(vereadorRegional)} className="text-secondary text-xs font-bold hover:underline">
                  Ver perfil completo →
                </button>
              </div>
            </div>
          </div>

          {/* Filtros básicos */}
          <div className="flex gap-4">
            <select value={filterRegional} onChange={(e) => setFilterRegional(e.target.value)} className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-secondary">
              {regionais.map((r) => <option key={r} value={r}>{r === 'Todas' ? 'Filtrar por Regional (Todas)' : r}</option>)}
            </select>
            <select value={filterParty} onChange={(e) => setFilterParty(e.target.value)} className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 text-body-md focus:outline-none focus:ring-2 focus:ring-secondary">
              {partidos.map((p) => <option key={p} value={p}>{p === 'Todos' ? 'Filtrar por Partido (Todos)' : p}</option>)}
            </select>
          </div>

          {/* Lista de vereadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtrados.length === 0 && (
              <p className="md:col-span-2 text-center py-8 text-on-surface-variant text-sm">
                Nenhum vereador encontrado para os filtros aplicados.
              </p>
            )}
            {filtrados.map((v) => (
              <div key={v.id} className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant">
                      <img src={v.photo} alt={v.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold text-on-surface">{v.name}</h3>
                      <p className="text-label-sm text-on-surface-variant">{v.party} - Regional {v.regional}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm flex items-center justify-end gap-1 ${v.trend === 'up' ? 'text-emerald-600' : 'text-error'}`}>
                      <Icon name={v.trend === 'up' ? 'trending_up' : 'trending_down'} className="text-[16px]" /> {v.produtividade}%
                    </div>
                    <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">Produtividade</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-on-surface-variant font-medium">ÍNDICE DE APROVAÇÃO</span>
                    <span className={`font-bold ${approvalTone[v.approval]}`}>{v.approval}</span>
                  </div>
                  <div className="h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-2 ${v.produtividade > 75 ? 'bg-emerald-500' : v.produtividade > 50 ? 'bg-amber-500' : 'bg-error'}`}
                      style={{ width: `${v.produtividade}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-outline-variant/40">
                  <button onClick={() => setActiveVereador(v)} className="text-secondary text-sm font-bold hover:underline">
                    Ver Atividades
                  </button>
                  <button onClick={() => setContactVereador(v)} className="text-on-surface-variant text-sm flex items-center gap-1 hover:text-secondary">
                    <Icon name="mail" className="text-[16px]" /> Contato
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
            <h3 className="text-label-md font-bold text-on-surface-variant tracking-wider mb-6">
              DESEMPENHO GERAL DA CÂMARA
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-sm text-on-surface-variant">Projetos Aprovados (Ano)</div>
                <div className="flex items-end justify-between mt-1">
                  <div className="text-headline-md font-bold text-on-surface">142</div>
                  <div className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="arrow_upward" className="text-[14px]" /> 12%
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-on-surface-variant">Média de Presença</div>
                <div className="flex items-end justify-between mt-1">
                  <div className="text-headline-md font-bold text-on-surface">91.4%</div>
                  <div className="bg-surface-container text-on-surface-variant text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="remove" className="text-[14px]" /> Estável
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-on-surface-variant">Verba Utilizada / Orçamento</div>
                <div className="flex items-end justify-between mt-1">
                  <div className="text-headline-md font-bold text-on-surface">R$ 2.4M</div>
                  <div className="bg-error/10 text-error text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                    <Icon name="arrow_upward" className="text-[14px]" /> 4.5%
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant/40">
                <div className="text-xs text-on-surface-variant mb-3">Investimentos por Setor</div>
                <div className="space-y-3">
                  {[
                    { name: 'Saúde', value: 45, color: 'bg-secondary' },
                    { name: 'Educação', value: 32, color: 'bg-emerald-500' },
                    { name: 'Infraestrutura', value: 18, color: 'bg-amber-500' },
                  ].map((s) => (
                    <div key={s.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{s.name}</span>
                        <span className="font-bold">{s.value}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${s.color}`} style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-primary text-on-primary rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Icon name="shield" className="text-9xl" />
            </div>
            <h3 className="text-title-lg font-bold mb-2 relative z-10">Transparência Total</h3>
            <p className="text-sm text-on-primary-container mb-6 relative z-10 leading-relaxed">
              Todo cidadão tem direito a saber como os recursos públicos estão sendo aplicados.
            </p>
            <button onClick={() => setDadosAbertosOpen(true)} className="bg-white text-primary font-bold px-4 py-2 rounded-lg text-sm w-full hover:bg-white/90 transition-colors relative z-10">
              Acessar Dados Abertos
            </button>
          </div>
        </div>
      </div>

      {/* Modal: Atividades do vereador */}
      {activeVereador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setActiveVereador(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-outline-variant/40 flex items-center gap-4 bg-primary text-on-primary">
              <img src={activeVereador.photo} alt={activeVereador.name} className="w-14 h-14 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="text-headline-md">{activeVereador.name}</h3>
                <p className="text-xs text-on-primary-container">{activeVereador.party} • Regional {activeVereador.regional} • Mandato {activeVereador.mandato || '2021-2024'}</p>
              </div>
              <button onClick={() => setActiveVereador(null)} className="text-on-primary-container hover:text-on-primary"><Icon name="close" /></button>
            </div>
            <div className="p-5 overflow-y-auto">
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-surface-container-low/40 rounded-xl p-3 text-center">
                  <p className="text-[10px] tracking-wider text-on-surface-variant">PRESENÇA</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeVereador.presence}%</p>
                </div>
                <div className="bg-surface-container-low/40 rounded-xl p-3 text-center">
                  <p className="text-[10px] tracking-wider text-on-surface-variant">PROJETOS APROVADOS</p>
                  <p className="text-2xl font-bold text-primary">{activeVereador.approved}</p>
                </div>
                <div className="bg-surface-container-low/40 rounded-xl p-3 text-center">
                  <p className="text-[10px] tracking-wider text-on-surface-variant">PRODUTIVIDADE</p>
                  <p className="text-2xl font-bold text-secondary">{activeVereador.produtividade ?? '—'}%</p>
                </div>
              </div>
              <AtividadesPublicas vereadorId={activeVereador.id} fallback={atividadesPorVereador.default} />
            </div>
            <div className="p-4 border-t border-outline-variant/40 flex justify-end gap-2 bg-surface-container-low/30">
              <button onClick={() => setActiveVereador(null)} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Fechar</button>
              <button onClick={() => { setContactVereador(activeVereador); setActiveVereador(null); }} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
                <Icon name="mail" className="text-base" /> Contatar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Contato */}
      {contactVereador && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setContactVereador(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <img src={contactVereador.photo} alt={contactVereador.name} className="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h3 className="font-bold">{contactVereador.name}</h3>
                <p className="text-xs text-on-surface-variant">{contactVereador.party} • Regional {contactVereador.regional}</p>
              </div>
            </div>
            <div className="space-y-2">
              <a href={`mailto:${contactVereador.email}`} className="flex items-center gap-3 p-3 border border-outline-variant rounded-xl hover:border-secondary">
                <Icon name="mail" className="text-secondary" />
                <div className="flex-1"><p className="text-sm font-bold">E-mail</p><p className="text-xs text-on-surface-variant">{contactVereador.email}</p></div>
              </a>
              <a href={`tel:${contactVereador.phone.replace(/\D/g, '')}`} className="flex items-center gap-3 p-3 border border-outline-variant rounded-xl hover:border-secondary">
                <Icon name="call" className="text-secondary" />
                <div className="flex-1"><p className="text-sm font-bold">Telefone</p><p className="text-xs text-on-surface-variant">{contactVereador.phone}</p></div>
              </a>
              <button onClick={() => { navigate('/vereadores/pesquisa-opiniao'); setContactVereador(null); }} className="w-full flex items-center gap-3 p-3 border border-outline-variant rounded-xl hover:border-secondary text-left">
                <Icon name="poll" className="text-secondary" />
                <div className="flex-1"><p className="text-sm font-bold">Avaliar mandato</p><p className="text-xs text-on-surface-variant">Pesquisa de opinião</p></div>
              </button>
            </div>
            <button onClick={() => setContactVereador(null)} className="mt-4 w-full py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Fechar</button>
          </div>
        </div>
      )}

      {/* Modal: Dados Abertos */}
      {dadosAbertosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setDadosAbertosOpen(false)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md flex items-center gap-2"><Icon name="shield" className="text-secondary" /> Portal de Dados Abertos</h3>
              <button onClick={() => setDadosAbertosOpen(false)} className="text-on-surface-variant"><Icon name="close" /></button>
            </div>
            <p className="text-sm text-on-surface-variant mb-4">
              Acesse diretamente as bases públicas do município de Contagem-MG e órgãos federais.
            </p>
            <div className="space-y-2">
              {[
                { name: 'Portal da Transparência — Contagem', url: 'https://transparencia.contagem.mg.gov.br', icon: 'account_balance' },
                { name: 'Câmara Municipal de Contagem', url: 'https://www.cmc.mg.gov.br', icon: 'how_to_vote' },
                { name: 'IBGE — Cidades', url: 'https://cidades.ibge.gov.br/brasil/mg/contagem', icon: 'public' },
                { name: 'Portal LAI Federal', url: 'https://www.gov.br/acessoainformacao', icon: 'lock_open' },
                { name: 'Tesouro Nacional — SICONFI', url: 'https://siconfi.tesouro.gov.br', icon: 'savings' },
              ].map((d) => (
                <a key={d.url} href={d.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 border border-outline-variant rounded-xl hover:border-secondary group">
                  <Icon name={d.icon} className="text-secondary" />
                  <span className="flex-1 text-sm font-semibold group-hover:text-secondary">{d.name}</span>
                  <Icon name="open_in_new" className="text-on-surface-variant text-base" />
                </a>
              ))}
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
