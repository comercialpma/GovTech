import Icon from '../components/Icon.jsx';

const summary = [
  { icon: 'group', tone: 'bg-secondary/10 text-secondary', label: 'TOTAL DE CIDADÃOS', value: '12.432' },
  { icon: 'trending_up', tone: 'bg-emerald-100 text-emerald-700', label: 'NOVOS ESTE MÊS', value: '+142' },
  { icon: 'place', tone: 'bg-amber-100 text-amber-700', label: 'REGIÃO MAIS ATIVA', value: 'Centro' },
];

const users = [
  { name: 'Ricardo Mendonça', email: 'ricardo.m@email.com', cpf: '482.***.***-89', area: 'Centro', last: '15 Out, 2023', link: 'Ver. Ana Silva', linkTone: 'bg-secondary/10 text-secondary' },
  { name: 'Mariana Souza', email: 'm.souza@email.com', cpf: '123.***.***-44', area: 'Vila Nova', last: '18 Out, 2023', link: 'Nenhum', linkTone: 'bg-surface-container text-on-surface-variant' },
  { name: 'Carlos Alberto', email: 'carlos.ab@email.com', cpf: '981.***.***-11', area: 'Jardins', last: '12 Out, 2023', link: 'Ver. Marcos Paz', linkTone: 'bg-secondary/10 text-secondary' },
  { name: 'Beatriz Rocha', email: 'beatriz.r@email.com', cpf: '552.***.***-82', area: 'Centro', last: '19 Out, 2023', link: 'Ver. Ana Silva', linkTone: 'bg-secondary/10 text-secondary' },
];

export default function GestaoUsuarios() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-headline-lg text-primary">Gestão de Usuários (População)</h2>
          <p className="text-on-surface-variant">Gerenciamento completo da base de cidadãos e exportação de dados estratégicos.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-secondary text-secondary rounded-lg font-bold text-label-sm hover:bg-secondary hover:text-on-secondary transition-colors">
          <Icon name="download" className="text-base" /> Baixar Base de Dados
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
        {summary.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${s.tone} flex items-center justify-center`}>
              <Icon name={s.icon} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{s.label}</p>
              <p className="text-headline-lg text-primary leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-surface-container-low/40 border border-outline-variant/40 rounded-2xl p-4 flex flex-wrap items-end gap-4">
        <Filter label="Bairro/Região" options={['Todos os bairros', 'Centro', 'Vila Nova', 'Jardins']} />
        <Filter label="Categoria de Interesse" options={['Todas as categorias', 'Saúde', 'Educação', 'Infraestrutura']} />
        <Filter label="Status do Vínculo" options={['Ativo', 'Inativo', 'Pendente']} />
        <button className="ml-auto bg-primary text-on-primary px-5 py-2.5 rounded-lg font-bold text-label-sm hover:opacity-90">
          Aplicar Filtros
        </button>
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
              {users.map((u) => (
                <tr key={u.email} className="border-t border-outline-variant/30 hover:bg-surface-container-low/40">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold">
                        {u.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface text-sm">{u.name}</p>
                        <p className="text-xs text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-data-mono text-on-surface-variant">{u.cpf}</td>
                  <td className="px-6 py-4 text-body-md">{u.area}</td>
                  <td className="px-6 py-4 text-body-md text-on-surface-variant">{u.last}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${u.linkTone}`}>{u.link}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 text-on-surface-variant">
                      <button className="p-1.5 hover:text-secondary"><Icon name="visibility" className="text-base" /></button>
                      <button className="p-1.5 hover:text-secondary"><Icon name="edit" className="text-base" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest text-label-sm text-on-surface-variant">
          <span>Mostrando 1 a 10 de 12.432 registros</span>
          <div className="flex items-center gap-2">
            <button className="p-1.5 border border-outline-variant rounded-lg"><Icon name="chevron_left" className="text-base" /></button>
            <span className="px-3 py-1.5 bg-secondary text-on-secondary rounded-lg font-bold">1</span>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg">2</button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg">3</button>
            <span className="px-2 text-on-surface-variant">…</span>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg">1244</button>
            <button className="p-1.5 border border-outline-variant rounded-lg"><Icon name="chevron_right" className="text-base" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Filter({ label, options }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold tracking-wider text-on-surface-variant">{label}</label>
      <select className="bg-white border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-2 focus:ring-secondary/20 outline-none min-w-[180px]">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
