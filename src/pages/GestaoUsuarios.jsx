import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';

const NOMES = ['Ricardo Mendonça', 'Mariana Souza', 'Carlos Alberto', 'Beatriz Rocha', 'Hugo Ferreira', 'Patrícia Lima', 'João Pereira', 'Camila Rodrigues', 'André Sales', 'Renata Gomes', 'Bruno Martins', 'Thiago Ferreira', 'Isabela Nunes', 'Roberto Tavares', 'Sabrina Teixeira', 'Lucas Almeida', 'Juliana Costa', 'Felipe Oliveira', 'Aline Pereira', 'Rodrigo Silva', 'Larissa Santos', 'Marcelo Rocha', 'Tatiana Lima', 'Vinícius Souza', 'Carolina Alves'];
const BAIRROS = ['Centro', 'Eldorado', 'Cidade Industrial', 'Riacho das Pedras', 'Petrolândia', 'Sapucaias', 'Vargem das Flores', 'Cabral', 'Industrial', 'Nacional', 'Vila Nova', 'Jardins', 'Inconfidentes'];
const VEREADORES = [
  { id: 'mv', name: 'Dr. Marcos Valente', party: 'PR' },
  { id: 'mc', name: 'Mariana Costa', party: 'PVG' },
  { id: 'rs', name: 'Ricardo Souza', party: 'PR' },
  { id: 'ap', name: 'Ana Paula Vaz', party: 'PT' },
  { id: 'cn', name: 'Carla Nogueira', party: 'PSDB' },
  { id: 'sf', name: 'Sérgio Freitas', party: 'MDB' },
];
const CATEGORIAS = ['Saúde', 'Educação', 'Infraestrutura', 'Segurança', 'Meio Ambiente', 'Cultura', 'Esporte'];
const STATUSES = ['Ativo', 'Inativo', 'Pendente'];

function gerarBase() {
  return NOMES.map((nome, i) => {
    const partes = nome.split(' ');
    const username = (partes[0] + '.' + (partes[1] || '')).toLowerCase();
    const cpfs = ['482', '123', '981', '552', '744', '619', '432', '208', '155', '866', '294', '317', '193', '847', '562', '730', '418', '925', '683', '275', '801', '459', '362', '094', '617'];
    return {
      id: i + 1,
      nome,
      email: `${username}@email.com`,
      cpf: `${cpfs[i % cpfs.length]}.***.***-${10 + i}`,
      telefone: `(31) 9${8000 + i * 13}-${1000 + i * 7}`.slice(0, 16),
      bairro: BAIRROS[i % BAIRROS.length],
      categorias: [CATEGORIAS[i % CATEGORIAS.length], CATEGORIAS[(i + 2) % CATEGORIAS.length]],
      status: STATUSES[i % 5 === 0 ? 1 : i % 7 === 0 ? 2 : 0],
      ultimaAtividade: new Date(2025, 9, 30 - (i % 28)).toISOString(),
      vinculo: i % 4 === 0 ? null : VEREADORES[i % VEREADORES.length],
      protocolos: (i * 3) % 12,
      cadastradoEm: new Date(2024, (i * 2) % 12, 1 + (i % 28)).toISOString(),
      genero: i % 2 === 0 ? 'F' : 'M',
      idade: 22 + (i * 3) % 50,
    };
  });
}

const STORAGE = 'govtech.usuarios';
const PAGE_SIZE = 10;

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE));
    return Array.isArray(stored) && stored.length ? stored : gerarBase();
  } catch { return gerarBase(); }
}

const statusTone = {
  'Ativo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Inativo': 'bg-error/10 text-error border-error/30',
  'Pendente': 'bg-amber-100 text-amber-700 border-amber-200',
};

export default function GestaoUsuarios() {
  const [usuarios, setUsuarios] = useState(load);
  const [filterBairro, setFilterBairro] = useState('Todos');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => { localStorage.setItem(STORAGE, JSON.stringify(usuarios)); }, [usuarios]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const filtered = useMemo(() => usuarios.filter((u) => {
    if (filterBairro !== 'Todos' && u.bairro !== filterBairro) return false;
    if (filterCategoria !== 'Todas' && !u.categorias.includes(filterCategoria)) return false;
    if (filterStatus !== 'Todos' && u.status !== filterStatus) return false;
    if (search && !`${u.nome} ${u.email} ${u.cpf} ${u.bairro}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [usuarios, filterBairro, filterCategoria, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  useEffect(() => { if (page > totalPages) setPage(1); }, [totalPages, page]);

  const stats = useMemo(() => {
    const total = usuarios.length;
    const novosMes = usuarios.filter((u) => {
      const c = new Date(u.cadastradoEm);
      const agora = new Date();
      return c.getMonth() === agora.getMonth() && c.getFullYear() === agora.getFullYear();
    }).length;
    const bairroCount = {};
    usuarios.forEach((u) => { bairroCount[u.bairro] = (bairroCount[u.bairro] || 0) + 1; });
    const regiaoAtiva = Object.entries(bairroCount).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
    return { total, novosMes, regiaoAtiva };
  }, [usuarios]);

  function aplicarFiltros() {
    setPage(1);
    showToast(`Filtros aplicados — ${filtered.length} cidadão(s) encontrado(s).`);
  }

  function limparFiltros() {
    setFilterBairro('Todos');
    setFilterCategoria('Todas');
    setFilterStatus('Todos');
    setSearch('');
    setPage(1);
  }

  function salvarEdicao(data) {
    if (data.__novo) {
      const novoId = (usuarios.reduce((m, u) => Math.max(m, u.id), 0) || 0) + 1;
      const novo = {
        ...data,
        id: novoId,
        cadastradoEm: new Date().toISOString(),
        ultimaAtividade: new Date().toISOString(),
        protocolos: 0,
      };
      delete novo.__novo;
      setUsuarios((arr) => [novo, ...arr]);
      setEditing(null);
      showToast(`${data.nome} cadastrado(a) com sucesso.`);
      return;
    }
    setUsuarios((arr) => arr.map((u) => u.id === data.id ? { ...u, ...data, ultimaAtividade: new Date().toISOString() } : u));
    setEditing(null);
    showToast(`Cadastro de ${data.nome} atualizado.`);
  }

  function novoUsuario() {
    setEditing({
      __novo: true,
      nome: '',
      email: '',
      cpf: '',
      telefone: '',
      bairro: BAIRROS[0],
      categorias: [],
      status: 'Pendente',
      vinculo: null,
      genero: 'F',
      idade: 30,
    });
  }

  function removerUsuario(id) {
    const u = usuarios.find((x) => x.id === id);
    setUsuarios((arr) => arr.filter((x) => x.id !== id));
    setConfirmDel(null);
    showToast(`${u?.nome} removido(a) da base.`);
  }

  function exportarBase() {
    const rows = [['ID', 'Nome', 'Email', 'CPF', 'Telefone', 'Bairro', 'Categorias', 'Status', 'Vínculo Político', 'Protocolos', 'Cadastrado em', 'Última Atividade']];
    filtered.forEach((u) => rows.push([
      u.id, u.nome, u.email, u.cpf, u.telefone, u.bairro, u.categorias.join('|'), u.status,
      u.vinculo ? `${u.vinculo.name} (${u.vinculo.party})` : 'Sem vínculo', u.protocolos,
      new Date(u.cadastradoEm).toLocaleDateString('pt-BR'), new Date(u.ultimaAtividade).toLocaleDateString('pt-BR')
    ]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base-cidadaos-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Base com ${filtered.length} cidadãos exportada.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-headline-lg text-primary">Gestão de Usuários (População)</h2>
          <p className="text-on-surface-variant">Gerenciamento completo da base de cidadãos e exportação de dados estratégicos.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportarBase} className="flex items-center gap-2 px-4 py-2 border border-secondary text-secondary rounded-lg font-bold text-label-sm hover:bg-secondary hover:text-on-secondary transition-colors">
            <Icon name="download" className="text-base" /> Baixar Base de Dados
          </button>
          <button onClick={novoUsuario} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-sm hover:opacity-90">
            <Icon name="person_add" className="text-base" /> Novo Usuário
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
        <StatBox icon="group" tone="bg-secondary/10 text-secondary" label="TOTAL DE CIDADÃOS" value={stats.total.toLocaleString('pt-BR')} />
        <StatBox icon="trending_up" tone="bg-emerald-100 text-emerald-700" label="NOVOS ESTE MÊS" value={`+${stats.novosMes}`} />
        <StatBox icon="place" tone="bg-amber-100 text-amber-700" label="REGIÃO MAIS ATIVA" value={stats.regiaoAtiva} />
      </div>

      <div className="bg-surface-container-low/40 border border-outline-variant/40 rounded-2xl p-4 flex flex-wrap items-end gap-4">
        <Filter label="Bairro/Região" value={filterBairro} onChange={setFilterBairro} options={['Todos', ...BAIRROS]} />
        <Filter label="Categoria de Interesse" value={filterCategoria} onChange={setFilterCategoria} options={['Todas', ...CATEGORIAS]} />
        <Filter label="Status do Vínculo" value={filterStatus} onChange={setFilterStatus} options={['Todos', ...STATUSES]} />
        <div className="flex-1 min-w-[180px]">
          <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">BUSCA</label>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Nome, CPF, e-mail..." className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <button onClick={limparFiltros} className="px-4 py-2.5 border border-outline-variant text-on-surface rounded-lg font-bold text-label-sm hover:bg-surface-container">
            Limpar
          </button>
          <button onClick={aplicarFiltros} className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-label-sm hover:opacity-90">
            Aplicar Filtros
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container-low text-[10px] font-bold tracking-[0.15em] text-on-surface-variant uppercase">
              <tr>
                <th className="text-left px-6 py-3">Nome Completo</th>
                <th className="text-left px-6 py-3">CPF</th>
                <th className="text-left px-6 py-3">Bairro/Região</th>
                <th className="text-left px-6 py-3">Última Atividade</th>
                <th className="text-left px-6 py-3">Vínculo Político</th>
                <th className="text-right px-6 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-on-surface-variant text-sm">
                  Nenhum cidadão encontrado para os filtros aplicados.
                </td></tr>
              )}
              {pageItems.map((u) => (
                <tr key={u.id} className="border-t border-outline-variant/30 hover:bg-surface-container-low/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                        {u.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{u.nome}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-data-mono text-on-surface-variant">{u.cpf}</td>
                  <td className="px-6 py-4 text-body-md">{u.bairro}</td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">
                    {new Date(u.ultimaAtividade).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    {u.vinculo ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary">
                        {u.vinculo.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-surface-container text-on-surface-variant">
                        Nenhum
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-on-surface-variant">
                      <button onClick={() => setDetail(u)} title="Ver detalhes" className="p-1.5 hover:bg-surface-container rounded hover:text-secondary"><Icon name="visibility" className="text-base" /></button>
                      <button onClick={() => setEditing({ ...u })} title="Editar" className="p-1.5 hover:bg-surface-container rounded hover:text-secondary"><Icon name="edit" className="text-base" /></button>
                      <button onClick={() => setConfirmDel(u)} title="Excluir" className="p-1.5 hover:bg-error/10 rounded hover:text-error"><Icon name="delete" className="text-base" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest text-label-sm text-on-surface-variant">
          <span>Mostrando {pageItems.length ? (page - 1) * PAGE_SIZE + 1 : 0} a {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length} registros</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 border border-outline-variant rounded-lg disabled:opacity-40"><Icon name="chevron_left" className="text-base" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`px-3 py-1.5 rounded-lg font-bold ${page === n ? 'bg-secondary text-on-secondary' : 'border border-outline-variant'}`}>{n}</button>
            ))}
            {totalPages > 5 && (
              <>
                <span className="px-2 text-on-surface-variant">…</span>
                <button onClick={() => setPage(totalPages)} className={`px-3 py-1.5 rounded-lg ${page === totalPages ? 'bg-secondary text-on-secondary font-bold' : 'border border-outline-variant'}`}>{totalPages}</button>
              </>
            )}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 border border-outline-variant rounded-lg disabled:opacity-40"><Icon name="chevron_right" className="text-base" /></button>
          </div>
        </div>
      </div>

      {detail && <DetailModal usuario={detail} onClose={() => setDetail(null)} onEdit={() => { setEditing({ ...detail }); setDetail(null); }} />}
      {editing && <EditModal usuario={editing} onClose={() => setEditing(null)} onSave={salvarEdicao} />}

      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDel(null)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
              <Icon name="delete" className="text-4xl" />
            </div>
            <h3 className="text-headline-md mt-3">Remover cidadão</h3>
            <p className="text-on-surface-variant text-sm mt-1">Remover <strong>{confirmDel.nome}</strong> da base? Esta ação está sujeita à LGPD e será auditada.</p>
            <div className="flex gap-2 justify-center mt-5">
              <button onClick={() => setConfirmDel(null)} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
              <button onClick={() => removerUsuario(confirmDel.id)} className="px-4 py-2 bg-error text-white rounded-lg font-bold text-label-sm">Remover</button>
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

function StatBox({ icon, tone, label, value }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl ${tone} flex items-center justify-center`}>
        <Icon name={icon} />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label}</p>
        <p className="text-headline-lg text-primary leading-tight">{value}</p>
      </div>
    </div>
  );
}

function Filter({ label, value, onChange, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label.toUpperCase()}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none min-w-[180px]">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DetailModal({ usuario: u, onClose, onEdit }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-outline-variant/40 bg-primary text-on-primary flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-lg font-bold">
            {u.nome.split(' ').map((n) => n[0]).slice(0, 2).join('')}
          </div>
          <div className="flex-1">
            <h3 className="text-headline-md">{u.nome}</h3>
            <p className="text-xs text-on-primary-container">{u.email} • CPF {u.cpf}</p>
          </div>
          <button onClick={onClose} className="text-on-primary-container hover:text-on-primary"><Icon name="close" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${statusTone[u.status]}`}>{u.status}</span>
            {u.vinculo && <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary">Vínculo: {u.vinculo.name}</span>}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <DetailRow label="Telefone" value={u.telefone} />
            <DetailRow label="Idade" value={`${u.idade} anos`} />
            <DetailRow label="Gênero" value={u.genero === 'F' ? 'Feminino' : 'Masculino'} />
            <DetailRow label="Bairro" value={u.bairro} />
            <DetailRow label="Cadastrado em" value={new Date(u.cadastradoEm).toLocaleDateString('pt-BR')} />
            <DetailRow label="Última atividade" value={new Date(u.ultimaAtividade).toLocaleDateString('pt-BR')} />
          </div>
          <div>
            <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">CATEGORIAS DE INTERESSE</p>
            <div className="flex gap-1 flex-wrap">
              {u.categorias.map((c) => <span key={c} className="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold">{c}</span>)}
            </div>
          </div>
          <div className="bg-surface-container-low/40 border border-outline-variant/40 rounded-xl p-4">
            <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">PROTOCOLOS ABERTOS</p>
            <p className="text-2xl font-bold text-primary mt-1">{u.protocolos}</p>
            <p className="text-[10px] text-on-surface-variant">no histórico de relacionamento com a Prefeitura</p>
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

function EditModal({ usuario, onClose, onSave }) {
  const [form, setForm] = useState(usuario);
  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }
  function toggleCategoria(c) {
    setForm((f) => ({ ...f, categorias: f.categorias.includes(c) ? f.categorias.filter((x) => x !== c) : [...f.categorias, c] }));
  }
  function submit(e) { e.preventDefault(); onSave(form); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-headline-md flex items-center gap-2"><Icon name={form.__novo ? 'person_add' : 'edit'} className="text-secondary" /> {form.__novo ? 'Cadastrar novo cidadão' : 'Editar cidadão'}</h3>
          <button onClick={onClose} className="text-on-surface-variant"><Icon name="close" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Field label="NOME">
            <input required value={form.nome} onChange={(e) => update('nome', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
          </Field>
          {form.__novo && (
            <Field label="CPF">
              <input required value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="E-MAIL">
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
            <Field label="TELEFONE">
              <input value={form.telefone} onChange={(e) => update('telefone', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="BAIRRO">
              <select value={form.bairro} onChange={(e) => update('bairro', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                {BAIRROS.map((b) => <option key={b}>{b}</option>)}
              </select>
            </Field>
            <Field label="STATUS">
              <select value={form.status} onChange={(e) => update('status', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <Field label="VÍNCULO POLÍTICO">
            <select
              value={form.vinculo?.id || ''}
              onChange={(e) => update('vinculo', e.target.value ? VEREADORES.find((v) => v.id === e.target.value) : null)}
              className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary"
            >
              <option value="">Sem vínculo</option>
              {VEREADORES.map((v) => <option key={v.id} value={v.id}>{v.name} ({v.party})</option>)}
            </select>
          </Field>
          <Field label="CATEGORIAS DE INTERESSE">
            <div className="flex flex-wrap gap-1">
              {CATEGORIAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategoria(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 ${form.categorias.includes(c) ? 'border-secondary bg-secondary/10 text-secondary' : 'border-outline-variant text-on-surface-variant'}`}
                >
                  {c}
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
