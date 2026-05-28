import { useState } from 'react';
import Icon from '../components/Icon.jsx';

const initialCards = [
  { id: 2191, status: 'pendente', tag: 'Emergência', tagClass: 'bg-error/15 text-error', title: 'Saúde Pública: Falta de Insumos', text: 'Cidadão relatou falta crítica de insulina no...', progress: 80, comments: 3 },
  { id: 2394, status: 'pendente', tag: 'Urbanismo', tagClass: 'bg-secondary/15 text-secondary', title: 'Iluminação Praça da Sé', text: 'Solicitação de troca de lâmpadas LED e...', progress: 55 },
  { id: 2380, status: 'andamento', tag: 'Educação', tagClass: 'bg-amber-500/15 text-amber-700', title: 'Reforma Escola Municipal', text: 'Status: Aprovação de Orçamento', progress: 65 },
  { id: 2350, status: 'resolvido', tag: 'Meio Ambiente', tagClass: 'bg-emerald-500/15 text-emerald-700', title: 'Poda de Árvores - Av. Brasil', text: 'CONCLUÍDO', progress: 100 },
];

const columns = [
  { id: 'pendente', label: 'PENDENTES', tint: 'border-t-error' },
  { id: 'andamento', label: 'EM ANDAMENTO', tint: 'border-t-secondary' },
  { id: 'resolvido', label: 'RESOLVIDOS', tint: 'border-t-emerald-500' },
];

const agenda = [
  { date: 'SET 14', when: '14:00 • Plenário A', title: 'Câmara Municipal: Sessão Plenária' },
  { date: 'SET 15', when: '09:30 • Zona Sul', title: 'Visita Técnica: Jardim Botânico' },
];

const crm = [
  { name: 'Mariana Silva', role: 'Líder Comunitária • Itaquera', icon: 'phone' },
  { name: 'Roberto Dias', role: 'Sindicato dos Professores', icon: 'mail', initials: 'RD' },
];

const footerStats = [
  { icon: 'forum', label: 'Novas Interações', value: '+128', tone: 'bg-secondary/10 text-secondary' },
  { icon: 'thumb_up', label: 'Índice de Sentimento', value: '84.2%', tone: 'bg-emerald-100 text-emerald-700' },
  { icon: 'priority_high', label: 'Demandas Urgentes', value: '03', tone: 'bg-error/10 text-error' },
  { icon: 'group', label: 'Cidadãos Vinculados', value: '1.402', tone: 'bg-amber-100 text-amber-700' },
];

export default function PainelMandato() {
  const [cards, setCards] = useState(initialCards);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [toast, setToast] = useState(null);

  function onDragStart(id) {
    setDraggingId(id);
  }
  function onDragEnd() {
    setDraggingId(null);
    setDragOverCol(null);
  }
  function onDropCol(colId) {
    if (!draggingId) return;
    const card = cards.find((c) => c.id === draggingId);
    if (!card || card.status === colId) {
      onDragEnd();
      return;
    }
    setCards((prev) =>
      prev.map((c) =>
        c.id === draggingId
          ? { ...c, status: colId, progress: colId === 'resolvido' ? 100 : colId === 'andamento' ? Math.max(c.progress, 50) : c.progress }
          : c
      )
    );
    setToast(`Demanda #${draggingId} movida para "${columns.find((k) => k.id === colId).label}"`);
    setTimeout(() => setToast(null), 2500);
    onDragEnd();
  }

  const counts = {
    pendente: cards.filter((c) => c.status === 'pendente').length,
    andamento: cards.filter((c) => c.status === 'andamento').length,
    resolvido: cards.filter((c) => c.status === 'resolvido').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-headline-lg text-primary">Painel do Mandato</h2>
          <p className="text-on-surface-variant">
            Arraste os cards entre as colunas para atualizar o status — disponível para Vereador responsável e Administrador.
          </p>
        </div>
        <span className="bg-secondary/10 text-secondary border border-secondary/30 px-3 py-1.5 rounded-lg text-label-sm font-semibold">
          Sessão: Ativa (3º Trim - 2024)
        </span>
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Kanban */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h3 className="text-headline-md flex items-center gap-2">
              <Icon name="dashboard_customize" className="text-secondary" /> Gestão de Demandas
            </h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-outline-variant text-label-sm text-on-surface-variant hover:bg-surface-container">Filtrar por Distrito</button>
              <button className="px-3 py-1.5 rounded-lg border border-outline-variant text-label-sm text-on-surface-variant hover:bg-surface-container">Prioridade: Alta</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map((col) => (
              <div
                key={col.id}
                onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }}
                onDragLeave={() => setDragOverCol((c) => (c === col.id ? null : c))}
                onDrop={() => onDropCol(col.id)}
                className={`bg-surface-container-low/50 border-t-2 ${col.tint} border rounded-xl p-3 min-h-[300px] transition-all ${
                  dragOverCol === col.id ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/20' : 'border-outline-variant/30'
                }`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h5 className="text-[10px] font-bold tracking-[0.15em] text-on-surface-variant">
                    {col.label} <span className="opacity-70">({String(counts[col.id]).padStart(2, '0')})</span>
                  </h5>
                  <Icon name="more_horiz" className="text-on-surface-variant text-base" />
                </div>
                <div className="space-y-3">
                  {cards.filter((c) => c.status === col.id).map((c) => (
                    <DemandCard
                      key={c.id}
                      card={c}
                      dragging={draggingId === c.id}
                      onDragStart={() => onDragStart(c.id)}
                      onDragEnd={onDragEnd}
                    />
                  ))}
                  {cards.filter((c) => c.status === col.id).length === 0 && (
                    <div className="text-center text-[10px] text-on-surface-variant/60 py-8 border-2 border-dashed border-outline-variant/30 rounded-lg">
                      Solte uma demanda aqui
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar right */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter-md">
          {/* Agenda */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-on-surface">Agenda do Dia</h4>
              <button className="text-secondary text-label-sm font-bold hover:underline">Ver Tudo</button>
            </div>
            <div className="space-y-3">
              {agenda.map((a) => (
                <div key={a.date} className="flex gap-3 items-start">
                  <div className="w-14 text-center bg-surface-container rounded-lg py-2">
                    <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">{a.date.split(' ')[0]}</p>
                    <p className="text-lg font-bold text-primary leading-none">{a.date.split(' ')[1]}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-on-surface-variant">{a.when}</p>
                    <p className="font-semibold text-sm text-on-surface leading-snug">{a.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights Radar */}
          <div className="bg-primary text-on-primary rounded-2xl p-5 shadow-xl">
            <span className="inline-block bg-secondary text-on-secondary text-[10px] font-bold tracking-wider px-2 py-1 rounded-md">INSIGHTS DO RADAR</span>
            <h4 className="font-bold text-lg mt-3">Estratégia de Comunicação</h4>
            <p className="italic text-sm text-on-primary-container mt-2 leading-relaxed">
              "Foco em mobilidade urbana sustentável como narrativa central para o próximo trimestre.
              Enfatize a governança digital."
            </p>
            <ul className="mt-4 space-y-2 text-xs">
              <li className="flex items-center gap-2"><Icon name="check_circle" className="text-tertiary-fixed-dim text-sm" /> Alta ressonância no público jovem (18-24)</li>
              <li className="flex items-center gap-2"><Icon name="check_circle" className="text-tertiary-fixed-dim text-sm" /> Ponto de Fala: Corredores Inteligentes</li>
            </ul>
          </div>

          {/* CRM */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-on-surface">CRM do Cidadão</h4>
              <button className="text-secondary"><Icon name="person_add" className="text-base" /></button>
            </div>
            <div className="space-y-3">
              {crm.map((c) => (
                <div key={c.name} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                    {c.initials || c.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{c.name}</p>
                    <p className="text-[10px] text-on-surface-variant">{c.role}</p>
                  </div>
                  <Icon name={c.icon} className="text-on-surface-variant text-base" />
                </div>
              ))}
            </div>
            <button className="mt-4 w-full text-secondary border border-secondary/40 rounded-lg py-2 text-label-sm font-bold hover:bg-secondary hover:text-on-secondary transition-colors">
              Ver Registro Completo
            </button>
          </div>
        </div>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-md">
        {footerStats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.tone} flex items-center justify-center`}>
              <Icon name={s.icon} className="text-base" />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">{s.label}</p>
              <p className="font-bold text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-2xl border border-secondary/40 flex items-center gap-2 z-50 animate-[fadeIn_0.2s]">
          <Icon name="check_circle" className="text-emerald-400" />
          <span className="text-sm font-semibold">{toast}</span>
        </div>
      )}
    </div>
  );
}

function DemandCard({ card, dragging, onDragStart, onDragEnd }) {
  const isResolved = card.status === 'resolvido';
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 shadow-sm hover:border-secondary/60 cursor-grab active:cursor-grabbing transition-all ${
        dragging ? 'opacity-40 scale-95 rotate-2' : ''
      } ${isResolved ? 'bg-emerald-50/60 border-emerald-200' : ''}`}
    >
      <div className="flex justify-between items-center">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${card.tagClass}`}>{card.tag}</span>
        <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
          <Icon name="drag_indicator" className="text-sm opacity-50" />
          #{card.id}
        </span>
      </div>
      <p className="font-bold text-sm mt-2">{card.title}</p>
      <p className={`text-xs mt-1 line-clamp-2 ${isResolved ? 'text-emerald-700 font-bold flex items-center gap-1' : 'text-on-surface-variant'}`}>
        {isResolved && <Icon name="check_circle" className="text-sm" />}
        {card.text}
      </p>
      {!isResolved && (
        <div className="h-1.5 bg-surface-container rounded-full mt-3">
          <div className="h-1.5 bg-secondary rounded-full transition-all" style={{ width: `${card.progress}%` }} />
        </div>
      )}
      {card.comments && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-on-surface-variant">
          <Icon name="chat_bubble" className="text-xs" /> {card.comments}
        </div>
      )}
    </div>
  );
}
