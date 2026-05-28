import { useEffect, useState } from 'react';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import {
  TIPOS,
  listAtividades,
  addAtividade,
  updateAtividade,
  deleteAtividade,
  subscribe,
} from '../services/atividades.js';

// Vereadores conhecidos (mesma lista de Vereadores.jsx) para mapear o usuário logado.
const vereadores = [
  { id: 'mv', name: 'Dr. Marcos Valente', email: 'marcos.valente@camara.gov.br' },
  { id: 'mc', name: 'Mariana Costa', email: 'mariana.costa@camara.gov.br' },
  { id: 'rs', name: 'Ricardo Souza', email: 'ricardo.souza@camara.gov.br' },
  { id: 'ap', name: 'Ana Paula Vaz', email: 'ana.vaz@camara.gov.br' },
  { id: 'jb', name: 'João Batista', email: 'joao.batista@camara.gov.br' },
  { id: 'cn', name: 'Carla Nogueira', email: 'carla.nogueira@camara.gov.br' },
  { id: 'sf', name: 'Sérgio Freitas', email: 'sergio.freitas@camara.gov.br' },
];

const tipoTone = {
  'Projeto': 'bg-blue-100 text-blue-700',
  'Votação': 'bg-emerald-100 text-emerald-700',
  'Audiência': 'bg-amber-100 text-amber-700',
  'Indicação': 'bg-purple-100 text-purple-700',
  'Discurso': 'bg-rose-100 text-rose-700',
};

const statusTone = {
  'Publicado': 'bg-emerald-100 text-emerald-700',
  'Rascunho': 'bg-amber-100 text-amber-700',
  'Arquivado': 'bg-surface-container text-on-surface-variant',
};

export default function MinhasAtividades() {
  const { user, role } = useAuth();
  // Identifica o vereador: pelo e-mail (em produção) ou por seleção (modo demo)
  const matched = vereadores.find((v) => v.email === user?.email);
  const [selectedVereador, setSelectedVereador] = useState(matched?.id || vereadores[0].id);
  const isAdmin = ['admin_municipal', 'admin_estadual', 'admin_master'].includes(role);
  const isVereador = role === 'vereador';
  const canPickVereador = isAdmin || !matched; // admin escolhe; cidadão demo escolhe; vereador real fica fixo

  const vereadorId = canPickVereador ? selectedVereador : matched.id;
  const vereador = vereadores.find((v) => v.id === vereadorId);

  const [list, setList] = useState(() => listAtividades(vereadorId));
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [filter, setFilter] = useState('Todos');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => setList(listAtividades(vereadorId)), [vereadorId]);
  useEffect(() => subscribe(() => setList(listAtividades(vereadorId))), [vereadorId]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  function openNew() {
    setEditing({ tipo: 'Projeto', titulo: '', desc: '', data: new Date().toISOString().slice(0, 10), status: 'Publicado', link: '' });
  }

  function save(form) {
    if (!form.titulo.trim() || !form.desc.trim()) return;
    if (form.id) {
      updateAtividade(vereadorId, form.id, form);
      showToast('Atividade atualizada.');
    } else {
      addAtividade(vereadorId, form);
      showToast('Atividade registrada e publicada.');
    }
    setEditing(null);
  }

  function remove(id) {
    deleteAtividade(vereadorId, id);
    setConfirmDel(null);
    showToast('Atividade removida.');
  }

  const filtered = list.filter((a) => {
    if (filter !== 'Todos' && a.tipo !== filter) return false;
    if (search && !`${a.titulo} ${a.desc}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: list.length,
    publicadas: list.filter((a) => a.status === 'Publicado').length,
    rascunhos: list.filter((a) => a.status === 'Rascunho').length,
    mes: list.filter((a) => new Date(a.createdAt).getMonth() === new Date().getMonth()).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-headline-lg text-primary">Minhas Atividades Legislativas</h2>
          <p className="text-on-surface-variant">
            Registre projetos, votações, audiências e indicações. As atividades publicadas aparecem
            no perfil público do vereador.
          </p>
        </div>
        <button onClick={openNew} className="bg-secondary text-on-secondary px-5 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all">
          <Icon name="add_circle" className="text-base" /> Nova Atividade
        </button>
      </div>

      {/* Identificação */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm flex items-center gap-4 flex-wrap">
        <div className="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-sm font-bold">
          {vereador?.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
        </div>
        <div className="flex-1 min-w-[220px]">
          <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">REGISTRANDO COMO</p>
          <p className="font-bold text-on-surface">{vereador?.name}</p>
          <p className="text-xs text-on-surface-variant">{vereador?.email}</p>
        </div>
        {canPickVereador && (
          <div>
            <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">VEREADOR (ADMIN/DEMO)</label>
            <select value={vereadorId} onChange={(e) => setSelectedVereador(e.target.value)} className="px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary text-sm">
              {vereadores.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
        )}
        {!isAdmin && !isVereador && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2">
            <Icon name="info" className="text-base" /> Modo demonstração. Em produção apenas o próprio vereador edita.
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-md">
        <Stat label="TOTAL" value={stats.total} icon="receipt_long" tone="bg-secondary/10 text-secondary" />
        <Stat label="PUBLICADAS" value={stats.publicadas} icon="check_circle" tone="bg-emerald-100 text-emerald-700" />
        <Stat label="RASCUNHOS" value={stats.rascunhos} icon="edit_note" tone="bg-amber-100 text-amber-700" />
        <Stat label="ESTE MÊS" value={stats.mes} icon="calendar_month" tone="bg-primary/10 text-primary" />
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex bg-surface-container-lowest border border-outline-variant/40 rounded-lg p-1">
          {['Todos', ...TIPOS].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                filter === t ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou conteúdo..."
            className="w-full pl-9 pr-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary"
          />
        </div>
      </div>

      {/* Lista */}
      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="article" className="text-5xl text-on-surface-variant/40" />
            <p className="text-on-surface-variant mt-3">Nenhuma atividade registrada {filter !== 'Todos' && `como "${filter}"`}.</p>
            <button onClick={openNew} className="mt-4 text-secondary font-bold text-sm hover:underline">+ Registrar a primeira atividade</button>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/40">
            {filtered.map((a) => (
              <div key={a.id} className="p-5 hover:bg-surface-container-low/30">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-[220px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tipoTone[a.tipo]}`}>{a.tipo}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusTone[a.status]}`}>{a.status}</span>
                      <span className="text-[10px] text-on-surface-variant">{new Date(a.data).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <p className="font-bold text-on-surface mt-2">{a.titulo}</p>
                    <p className="text-sm text-on-surface-variant mt-1">{a.desc}</p>
                    {a.link && (
                      <a href={a.link} target="_blank" rel="noreferrer" className="text-xs text-secondary hover:underline mt-1 inline-flex items-center gap-1">
                        <Icon name="link" className="text-sm" /> {a.link}
                      </a>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(a)} title="Editar" className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-secondary">
                      <Icon name="edit" className="text-base" />
                    </button>
                    <button onClick={() => setConfirmDel(a)} title="Excluir" className="p-2 hover:bg-error/10 rounded-lg text-on-surface-variant hover:text-error">
                      <Icon name="delete" className="text-base" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: editar/criar */}
      {editing && (
        <AtividadeModal
          atividade={editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Modal: confirmar exclusão */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <Icon name="delete" className="text-4xl" />
            </div>
            <h3 className="text-headline-md mt-3">Excluir atividade</h3>
            <p className="text-on-surface-variant text-sm mt-1">
              Tem certeza que deseja remover <strong>"{confirmDel.titulo}"</strong>?
            </p>
            <div className="flex gap-2 justify-center mt-5">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
              <button onClick={() => remove(confirmDel.id)} className="px-4 py-2 bg-error text-white rounded-lg font-bold text-label-sm">Excluir</button>
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

function Stat({ label, value, icon, tone }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-4 shadow-sm flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl ${tone} flex items-center justify-center`}>
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label}</p>
        <p className="text-headline-lg text-primary leading-tight">{value}</p>
      </div>
    </div>
  );
}

function AtividadeModal({ atividade, onSave, onClose }) {
  const [form, setForm] = useState(atividade);
  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function submit(e) { e.preventDefault(); onSave(form); }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline-md flex items-center gap-2">
            <Icon name={form.id ? 'edit' : 'add_circle'} className="text-secondary" />
            {form.id ? 'Editar atividade' : 'Nova atividade legislativa'}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant"><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="TIPO">
              <select value={form.tipo} onChange={(e) => update('tipo', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                {TIPOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="DATA">
              <input type="date" required value={form.data} onChange={(e) => update('data', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
          </div>
          <Field label="TÍTULO">
            <input required value={form.titulo} onChange={(e) => update('titulo', e.target.value)} placeholder="Ex: PL 145/2026 — Programa de Acessibilidade" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" maxLength={140} />
          </Field>
          <Field label={`DESCRIÇÃO (${form.desc.length}/600)`}>
            <textarea required rows="4" value={form.desc} onChange={(e) => update('desc', e.target.value.slice(0, 600))} placeholder="Descreva o conteúdo, justificativa e resultado da atividade." className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary resize-none" />
          </Field>
          <Field label="LINK COMPLEMENTAR (OPCIONAL)">
            <input type="url" value={form.link} onChange={(e) => update('link', e.target.value)} placeholder="https://..." className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </Field>
          <Field label="STATUS">
            <div className="flex gap-2">
              {['Publicado', 'Rascunho', 'Arquivado'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => update('status', s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 ${
                    form.status === s ? 'border-secondary bg-secondary/10 text-secondary' : 'border-outline-variant text-on-surface-variant'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
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

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">{label}</label>
      {children}
    </div>
  );
}
