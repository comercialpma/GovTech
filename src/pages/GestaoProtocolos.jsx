import Icon from '../components/Icon.jsx';

const stats = [
  { icon: 'pending_actions', label: 'Abertos hoje', value: '42', tone: 'bg-secondary/10 text-secondary', hover: 'group-hover:bg-secondary group-hover:text-white' },
  { icon: 'check_circle', label: 'Concluídos (24h)', value: '128', tone: 'bg-tertiary-fixed text-on-tertiary-fixed-variant', hover: 'group-hover:bg-on-tertiary-fixed-variant group-hover:text-tertiary-fixed' },
  { icon: 'priority_high', label: 'Urgência Crítica', value: '08', tone: 'bg-error-container text-on-error-container', hover: 'group-hover:bg-error group-hover:text-white' },
  { icon: 'groups', label: 'Cidadãos Únicos', value: '2.4k', tone: 'bg-primary-container text-on-primary-container', hover: 'group-hover:bg-primary group-hover:text-white' },
];

const protocols = [
  { id: 'PRT-9041', citizen: 'Maria Souza', subject: 'Solicitação de Poda de Árvore', status: 'Em Análise', priority: 'Média', date: '14/10/2023' },
  { id: 'PRT-9038', citizen: 'João Pereira', subject: 'Buraco na via — Av. Brasil 1240', status: 'Encaminhado', priority: 'Alta', date: '14/10/2023' },
  { id: 'PRT-8892', citizen: 'Ana Lima', subject: 'Reparo de Iluminação Pública', status: 'Concluído', priority: 'Baixa', date: '12/10/2023' },
  { id: 'PRT-8870', citizen: 'Carlos Dias', subject: 'Vazamento de água — Rua Bahia', status: 'Crítico', priority: 'Crítica', date: '11/10/2023' },
  { id: 'PRT-8855', citizen: 'Beatriz Rocha', subject: 'Coleta de entulho não realizada', status: 'Em Análise', priority: 'Média', date: '10/10/2023' },
];

const statusClass = {
  'Em Análise': 'text-on-secondary-fixed-variant bg-secondary-fixed/60',
  'Encaminhado': 'text-on-primary-container bg-primary-fixed',
  'Concluído': 'text-on-tertiary-fixed-variant bg-tertiary-fixed/50',
  'Crítico': 'text-on-error-container bg-error-container',
};

const priorityClass = {
  'Crítica': 'text-error font-bold',
  'Alta': 'text-amber-600 font-semibold',
  'Média': 'text-on-surface-variant',
  'Baixa': 'text-on-surface-variant/70',
};

export default function GestaoProtocolos() {
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
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant text-on-surface text-label-sm rounded-lg hover:bg-surface-container transition-all">
            <Icon name="download" className="text-base" />
            Exportar Relatório
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-on-secondary text-label-sm rounded-lg hover:bg-secondary/90 transition-all active:scale-95 shadow-lg shadow-secondary/20">
            <Icon name="add_circle" className="text-base" />
            Novo Protocolo
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-md">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-surface p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${s.tone} ${s.hover}`}>
              <Icon name={s.icon} />
            </div>
            <div>
              <p className="text-label-sm text-on-surface-variant">{s.label}</p>
              <p className="text-headline-md text-primary">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-surface rounded-2xl border border-outline-variant/30 shadow-sm overflow-hidden">
        {/* Filters */}
        <div className="p-6 border-b border-outline-variant/30 flex flex-wrap gap-4 items-center justify-between bg-surface-container-lowest">
          <div className="flex gap-6 items-center flex-wrap">
            <FilterSelect label="Status" options={['Todos os Status', 'Em Análise', 'Encaminhado', 'Concluído', 'Crítico']} />
            <FilterSelect label="Prioridade" options={['Todas', 'Crítica', 'Alta', 'Média', 'Baixa']} />
            <FilterSelect label="Período" options={['Últimos 7 dias', 'Últimos 30 dias', 'Este ano']} />
          </div>
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar por número ou CPF..."
              className="pl-10 pr-4 py-2 border border-outline-variant/60 rounded-lg text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none w-72 bg-white"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full protocol-table">
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
              {protocols.map((p) => (
                <tr key={p.id} className="border-t border-outline-variant/30 hover:bg-surface-container-low/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-data-mono text-primary">#{p.id}</td>
                  <td className="px-6 py-4 text-body-md">{p.citizen}</td>
                  <td className="px-6 py-4 text-body-md text-on-surface">{p.subject}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-body-md ${priorityClass[p.priority]}`}>{p.priority}</td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">{p.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant hover:text-secondary">
                      <Icon name="more_horiz" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest text-label-sm text-on-surface-variant">
          <span>Exibindo 1 – {protocols.length} de 178 protocolos</span>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <Icon name="chevron_left" className="text-base" />
            </button>
            <span className="px-3 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold">1</span>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">2</button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">3</button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
              <Icon name="chevron_right" className="text-base" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, options }) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-label-sm text-on-surface-variant font-semibold">{label}:</label>
      <select className="bg-white border border-outline-variant/60 rounded-lg px-4 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none transition-all cursor-pointer">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
