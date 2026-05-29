import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useNovoProtocolo } from '../hooks/useNovoProtocolo.jsx';

const initialProtocols = [
  { id: 'PRT-9041', cpf: '482.***.***-89', citizen: 'Maria Souza', subject: 'Solicitação de Poda de Árvore', categoria: 'Meio Ambiente', status: 'Em Análise', priority: 'Média', date: '14/10/2025', bairro: 'Eldorado', responsavel: 'Sec. de Meio Ambiente' },
  { id: 'PRT-9038', cpf: '123.***.***-44', citizen: 'João Pereira', subject: 'Buraco na via — Av. Brasil 1240', categoria: 'Infraestrutura', status: 'Encaminhado', priority: 'Alta', date: '14/10/2025', bairro: 'Centro', responsavel: 'Sec. de Obras' },
  { id: 'PRT-8892', cpf: '981.***.***-11', citizen: 'Ana Lima', subject: 'Reparo de Iluminação Pública', categoria: 'Iluminação', status: 'Concluído', priority: 'Baixa', date: '12/10/2025', bairro: 'Riacho das Pedras', responsavel: 'CEMIG' },
  { id: 'PRT-8870', cpf: '552.***.***-82', citizen: 'Carlos Dias', subject: 'Vazamento de água — Rua Bahia', categoria: 'Saneamento', status: 'Crítico', priority: 'Crítica', date: '11/10/2025', bairro: 'Petrolândia', responsavel: 'COPASA' },
  { id: 'PRT-8855', cpf: '317.***.***-22', citizen: 'Beatriz Rocha', subject: 'Coleta de entulho não realizada', categoria: 'Limpeza', status: 'Em Análise', priority: 'Média', date: '10/10/2025', bairro: 'Industrial', responsavel: 'SLU' },
  { id: 'PRT-8820', cpf: '744.***.***-30', citizen: 'Roberto Tavares', subject: 'Semáforo apagado no cruzamento', categoria: 'Trânsito', status: 'Encaminhado', priority: 'Alta', date: '09/10/2025', bairro: 'Cidade Industrial', responsavel: 'TransContagem' },
  { id: 'PRT-8795', cpf: '619.***.***-17', citizen: 'Sabrina Teixeira', subject: 'Reforma da praça depredada', categoria: 'Urbanismo', status: 'Em Análise', priority: 'Média', date: '08/10/2025', bairro: 'Sapucaias', responsavel: 'Sec. de Obras' },
  { id: 'PRT-8770', cpf: '432.***.***-91', citizen: 'André Sales', subject: 'Esgoto a céu aberto', categoria: 'Saneamento', status: 'Crítico', priority: 'Crítica', date: '07/10/2025', bairro: 'Vargem das Flores', responsavel: 'COPASA' },
  { id: 'PRT-8754', cpf: '208.***.***-63', citizen: 'Isabela Nunes', subject: 'Acessibilidade em calçada', categoria: 'Mobilidade', status: 'Encaminhado', priority: 'Alta', date: '06/10/2025', bairro: 'Centro', responsavel: 'Sec. de Obras' },
  { id: 'PRT-8730', cpf: '155.***.***-08', citizen: 'Camila Rodrigues', subject: 'Vandalismo em escola', categoria: 'Educação', status: 'Concluído', priority: 'Média', date: '05/10/2025', bairro: 'Nacional', responsavel: 'Sec. de Educação' },
  { id: 'PRT-8715', cpf: '866.***.***-44', citizen: 'Thiago Ferreira', subject: 'Falta de iluminação em parque', categoria: 'Iluminação', status: 'Concluído', priority: 'Baixa', date: '04/10/2025', bairro: 'Inconfidentes', responsavel: 'CEMIG' },
  { id: 'PRT-8702', cpf: '294.***.***-71', citizen: 'Renata Gomes', subject: 'Lixo acumulado em terreno', categoria: 'Limpeza', status: 'Crítico', priority: 'Crítica', date: '03/10/2025', bairro: 'Cabral', responsavel: 'SLU' },
];

const statusClass = {
  'Em Análise': 'text-secondary bg-secondary/10',
  'Encaminhado': 'text-amber-700 bg-amber-100',
  'Concluído': 'text-emerald-700 bg-emerald-100',
  'Crítico': 'text-error bg-error/10',
};
const priorityClass = {
  'Crítica': 'text-error font-bold',
  'Alta': 'text-amber-600 font-semibold',
  'Média': 'text-on-surface-variant',
  'Baixa': 'text-on-surface-variant/70',
};
const STATUSES = ['Em Análise', 'Encaminhado', 'Concluído', 'Crítico'];
const PRIORIDADES = ['Crítica', 'Alta', 'Média', 'Baixa'];
const STORAGE = 'govtech.protocolos';
const PAGE_SIZE = 5;

function loadStored() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE));
    return Array.isArray(stored) && stored.length ? stored : initialProtocols;
  } catch { return initialProtocols; }
}

export default function GestaoProtocolos() {
  const { open: openNovoProtocolo } = useNovoProtocolo();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const highlightId = params.get('id');

  const [protocols, setProtocols] = useState(loadStored);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterPriority, setFilterPriority] = useState('Todas');
  const [filterPeriod, setFilterPeriod] = useState('Últimos 30 dias');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(null);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(protocols)); }, [protocols]);

  useEffect(() => {
    if (highlightId) {
      const p = protocols.find((x) => x.id === highlightId);
      if (p) setDetail(p);
    }
  }, []); // eslint-disable-line

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const filtered = useMemo(() => protocols.filter((p) => {
    if (filterStatus !== 'Todos' && p.status !== filterStatus) return false;
    if (filterPriority !== 'Todas' && p.priority !== filterPriority) return false;
    if (search && !`${p.id} ${p.citizen} ${p.cpf} ${p.subject} ${p.bairro}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [protocols, filterStatus, filterPriority, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  const stats = useMemo(() => ({
    abertos: protocols.filter((p) => p.status !== 'Concluído').length,
    concluidos24h: protocols.filter((p) => p.status === 'Concluído').length,
    criticos: protocols.filter((p) => p.priority === 'Crítica').length,
    cidadaos: new Set(protocols.map((p) => p.cpf)).size,
  }), [protocols]);

  function updateStatus(id, newStatus) {
    setProtocols((arr) => arr.map((p) => p.id === id ? { ...p, status: newStatus } : p));
    setMenuOpen(null);
    showToast(`Protocolo #${id} atualizado para "${newStatus}".`);
  }

  function updatePriority(id, newPriority) {
    setProtocols((arr) => arr.map((p) => p.id === id ? { ...p, priority: newPriority } : p));
    setMenuOpen(null);
    showToast(`Prioridade do #${id} alterada para "${newPriority}".`);
  }

  function saveEdit(data) {
    setProtocols((arr) => arr.map((p) => p.id === data.id ? data : p));
    setEditing(null);
    showToast(`Protocolo #${data.id} atualizado.`);
  }

  function deleteProtocol(id) {
    setProtocols((arr) => arr.filter((p) => p.id !== id));
    setConfirmDel(null);
    setMenuOpen(null);
    showToast(`Protocolo #${id} arquivado.`);
  }

  function exportarCSV() {
    const rows = [['Protocolo', 'Cidadão', 'CPF', 'Assunto', 'Categoria', 'Bairro', 'Status', 'Prioridade', 'Data', 'Responsável']];
    filtered.forEach((p) => rows.push([p.id, p.citizen, p.cpf, p.subject, p.categoria, p.bairro, p.status, p.priority, p.date, p.responsavel]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `protocolos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`${filtered.length} protocolos exportados em CSV.`);
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <nav className="flex text-on-surface-variant text-label-sm mb-2 gap-2">
            <span>Administrativo</span>
            <span className="opacity-40">/</span>
            <span className="text-secondary font-bold">Gestão de Protocolos</span>
          </nav>
          <h2 className="text-headline-lg text-primary">Gestão de Protocolos</h2>
        </div>
        <div className="flex gap-3">
          <button onClick={exportarCSV} className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface text-label-sm rounded-lg hover:bg-surface-container transition-all">
            <Icon name="download" className="text-base" /> Exportar Relatório
          </button>
          <button onClick={openNovoProtocolo} className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary text-label-sm rounded-lg hover:bg-secondary/90 transition-all active:scale-95 shadow-lg shadow-secondary/20">
            <Icon name="add_circle" className="text-base" /> Novo Protocolo
          </button>
        </div>
      </div>

      {/* Stats — derivado em tempo real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-md">
        <StatCard icon="pending_actions" label="Abertos" value={stats.abertos} tone="bg-secondary/10 text-secondary" />
        <StatCard icon="check_circle" label="Concluídos" value={stats.concluidos24h} tone="bg-tertiary-fixed text-on-tertiary-fixed-variant" />
        <StatCard icon="priority_high" label="Urgência Crítica" value={String(stats.criticos).padStart(2, '0')} tone="bg-error-container text-on-error-container" />
        <StatCard icon="groups" label="Cidadãos Únicos" value={stats.cidadaos} tone="bg-primary-container text-on-primary-container" />
      </div>

      {/* Tabela */}
      <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant/30 flex flex-wrap gap-4 items-center justify-between bg-surface-container-lowest">
          <div className="flex gap-6 items-center flex-wrap">
            <FilterSelect label="Status" value={filterStatus} onChange={setFilterStatus} options={['Todos', ...STATUSES]} />
            <FilterSelect label="Prioridade" value={filterPriority} onChange={setFilterPriority} options={['Todas', ...PRIORIDADES]} />
            <FilterSelect label="Período" value={filterPeriod} onChange={setFilterPeriod} options={['Últimos 7 dias', 'Últimos 30 dias', 'Este ano']} />
          </div>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Buscar por número, nome, CPF ou bairro..."
              className="pl-10 pr-4 py-2 border border-outline-variant/60 rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none w-80 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low text-label-sm text-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="text-left px-6 py-4 font-semibold">Protocolo</th>
                <th className="text-left px-6 py-4 font-semibold">Cidadão</th>
                <th className="text-left px-6 py-4 font-semibold">Assunto</th>
                <th className="text-left px-6 py-4 font-semibold">Status</th>
                <th className="text-left px-6 py-4 font-semibold">Prioridade</th>
                <th className="text-left px-6 py-4 font-semibold">Data</th>
                <th className="text-right px-6 py-4 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr><td colSpan={7} className="text-center px-6 py-12 text-on-surface-variant text-sm">
                  Nenhum protocolo encontrado para os filtros aplicados.
                </td></tr>
              )}
              {pageItems.map((p) => (
                <tr key={p.id} className={`border-t border-outline-variant/30 hover:bg-surface-container-low/50 transition-colors ${highlightId === p.id ? 'bg-secondary/5' : ''}`}>
                  <td className="px-6 py-4 font-mono text-data-mono text-primary cursor-pointer" onClick={() => setDetail(p)}>#{p.id}</td>
                  <td className="px-6 py-4 text-body-md">
                    <p>{p.citizen}</p>
                    <p className="text-[10px] text-on-surface-variant">{p.bairro}</p>
                  </td>
                  <td className="px-6 py-4 text-body-md text-on-surface">{p.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass[p.status]}`}>{p.status}</span>
                  </td>
                  <td className={`px-6 py-4 text-body-md ${priorityClass[p.priority]}`}>{p.priority}</td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.date}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)} className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-secondary">
                      <Icon name="more_horiz" />
                    </button>
                    {menuOpen === p.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                        <div className="absolute right-6 top-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl py-1 w-56 z-20 text-left">
                          <button onClick={() => { setDetail(p); setMenuOpen(null); }} className="w-full px-3 py-2 text-sm hover:bg-surface-container flex items-center gap-2">
                            <Icon name="visibility" className="text-base text-secondary" /> Ver detalhes
                          </button>
                          <button onClick={() => { setEditing(p); setMenuOpen(null); }} className="w-full px-3 py-2 text-sm hover:bg-surface-container flex items-center gap-2">
                            <Icon name="edit" className="text-base text-secondary" /> Editar
                          </button>
                          <div className="border-t border-outline-variant/40 my-1" />
                          <p className="px-3 py-1 text-[10px] font-bold text-on-surface-variant">MUDAR STATUS</p>
                          {STATUSES.filter((s) => s !== p.status).map((s) => (
                            <button key={s} onClick={() => updateStatus(p.id, s)} className="w-full px-3 py-1.5 text-xs hover:bg-surface-container flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${statusClass[s].split(' ')[1].replace('bg-', 'bg-')}`} /> {s}
                            </button>
                          ))}
                          <div className="border-t border-outline-variant/40 my-1" />
                          <p className="px-3 py-1 text-[10px] font-bold text-on-surface-variant">PRIORIDADE</p>
                          {PRIORIDADES.filter((pr) => pr !== p.priority).map((pr) => (
                            <button key={pr} onClick={() => updatePriority(p.id, pr)} className="w-full px-3 py-1.5 text-xs hover:bg-surface-container flex items-center gap-2">
                              <Icon name="flag" className={`text-sm ${priorityClass[pr]}`} /> {pr}
                            </button>
                          ))}
                          <div className="border-t border-outline-variant/40 my-1" />
                          <button onClick={() => setConfirmDel(p)} className="w-full px-3 py-2 text-sm text-error hover:bg-error/10 flex items-center gap-2">
                            <Icon name="archive" className="text-base" /> Arquivar
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
          <span>Exibindo {pageItems.length ? (page - 1) * PAGE_SIZE + 1 : 0} – {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} protocolos</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed">
              <Icon name="chevron_left" className="text-base" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`px-3 py-1.5 rounded-lg font-bold ${page === n ? 'bg-secondary text-on-secondary' : 'border border-outline-variant hover:bg-surface-container'}`}>
                {n}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed">
              <Icon name="chevron_right" className="text-base" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal: detalhes */}
      {detail && (
        <DetailModal protocolo={detail} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail); setDetail(null); }} />
      )}

      {/* Modal: editar */}
      {editing && <EditModal protocolo={editing} onClose={() => setEditing(null)} onSave={saveEdit} />}

      {/* Modal: arquivar */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <Icon name="archive" className="text-4xl" />
            </div>
            <h3 className="text-headline-md mt-3">Arquivar protocolo</h3>
            <p className="text-on-surface-variant text-sm mt-1">
              Remover <strong>#{confirmDel.id}</strong> da lista ativa? O histórico será mantido para auditoria.
            </p>
            <div className="flex gap-2 justify-center mt-5">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
              <button onClick={() => deleteProtocol(confirmDel.id)} className="px-4 py-2 bg-amber-600 text-white rounded-lg font-bold text-label-sm">Arquivar</button>
            </div>
          </div>
        </div>
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

function StatCard({ icon, label, value, tone }) {
  return (
    <div className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tone}`}>
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-label-sm text-on-surface-variant">{label}</p>
        <p className="text-headline-md text-primary">{value}</p>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-label-sm text-on-surface-variant font-semibold">{label}:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white border border-outline-variant/60 rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all cursor-pointer">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DetailModal({ protocolo: p, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-outline-variant/40 bg-primary text-on-primary flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-on-primary-container">PROTOCOLO</p>
            <h3 className="text-headline-md font-mono">#{p.id}</h3>
          </div>
          <button onClick={onClose} className="text-on-primary-container hover:text-on-primary"><Icon name="close" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass[p.status]}`}>{p.status}</span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${priorityClass[p.priority]} border-current`}>{p.priority}</span>
          </div>
          <p className="text-headline-md text-on-surface">{p.subject}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailRow label="Cidadão" value={p.citizen} />
            <DetailRow label="CPF" value={p.cpf} />
            <DetailRow label="Bairro" value={p.bairro} />
            <DetailRow label="Data abertura" value={p.date} />
            <DetailRow label="Categoria" value={p.categoria} />
            <DetailRow label="Responsável" value={p.responsavel} />
          </div>
          <div className="bg-surface-container-low/40 border border-outline-variant/40 rounded-xl p-4">
            <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">TIMELINE</p>
            <div className="mt-2 space-y-2 text-xs">
              <p>📥 <strong>{p.date}</strong> — Protocolo aberto pelo cidadão</p>
              <p>📨 <strong>{p.date}</strong> — Encaminhado para {p.responsavel}</p>
              {p.status !== 'Em Análise' && <p>🔄 <strong>{p.date}</strong> — Status atualizado para "{p.status}"</p>}
              {p.status === 'Concluído' && <p>✅ Resolução comunicada ao cidadão via SMS e e-mail</p>}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-outline-variant/40 flex justify-end gap-2 bg-surface-container-low/30">
          <button onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Fechar</button>
          <button onClick={onEdit} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
            <Icon name="edit" className="text-base" /> Editar
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label.toUpperCase()}</p>
      <p className="text-on-surface mt-0.5">{value}</p>
    </div>
  );
}

function EditModal({ protocolo, onClose, onSave }) {
  const [form, setForm] = useState(protocolo);
  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit(e) { e.preventDefault(); onSave(form); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline-md flex items-center gap-2"><Icon name="edit" className="text-secondary" /> Editar #{protocolo.id}</h3>
          <button onClick={onClose} className="text-on-surface-variant"><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">ASSUNTO</label>
            <input required value={form.subject} onChange={(e) => update('subject', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">STATUS</label>
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">PRIORIDADE</label>
              <select value={form.priority} onChange={(e) => update('priority', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                {PRIORIDADES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">BAIRRO</label>
              <input value={form.bairro} onChange={(e) => update('bairro', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </div>
            <div>
              <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">CATEGORIA</label>
              <input value={form.categoria} onChange={(e) => update('categoria', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">SETOR RESPONSÁVEL</label>
            <input value={form.responsavel} onChange={(e) => update('responsavel', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm flex items-center gap-2">
              <Icon name="save" className="text-base" /> Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
