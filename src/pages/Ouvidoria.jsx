import { useState } from 'react';
import Icon from '../components/Icon.jsx';

const tipos = [
  { id: 'denuncia', label: 'Denúncia', icon: 'report', desc: 'Irregularidade, fraude ou abuso de poder.', color: 'border-error text-error' },
  { id: 'reclamacao', label: 'Reclamação', icon: 'sentiment_dissatisfied', desc: 'Insatisfação com serviço público.', color: 'border-amber-500 text-amber-700' },
  { id: 'sugestao', label: 'Sugestão', icon: 'lightbulb', desc: 'Ideia para melhorar a gestão municipal.', color: 'border-secondary text-secondary' },
  { id: 'elogio', label: 'Elogio', icon: 'sentiment_very_satisfied', desc: 'Reconhecimento de bom atendimento.', color: 'border-emerald-500 text-emerald-700' },
  { id: 'informacao', label: 'Pedido de Informação', icon: 'help_outline', desc: 'Solicitação baseada na LAI.', color: 'border-primary text-primary' },
];

const stats = [
  { label: 'MANIFESTAÇÕES (2024)', value: '8.412', icon: 'mail' },
  { label: 'TEMPO MÉDIO DE RESPOSTA', value: '6,2 dias', icon: 'schedule' },
  { label: 'TAXA DE RESOLUÇÃO', value: '94,8%', icon: 'check_circle' },
  { label: 'SATISFAÇÃO COM A OUVIDORIA', value: '4.6 / 5', icon: 'star' },
];

const direitosTitular = [
  'Anonimato: sua identidade pode ser preservada conforme a Lei 13.460/2017.',
  'Resposta em até 30 dias (LAI), prorrogáveis por mais 30 mediante justificativa.',
  'Acesso ao status da manifestação em tempo real.',
  'Recurso administrativo em caso de insatisfação com a resposta.',
];

export default function Ouvidoria() {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({
    tipo: 'reclamacao',
    anonimo: false,
    nome: '',
    email: '',
    cpf: '',
    assunto: '',
    descricao: '',
    orgao: '',
  });
  const [protocolo, setProtocolo] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function submit(e) {
    e.preventDefault();
    const id = 'OUV-' + Math.floor(100000 + Math.random() * 900000);
    setProtocolo({ id, ...form, createdAt: new Date() });
    setStep('success');
  }

  function consultar(e) {
    e.preventDefault();
    if (trackId.toUpperCase().startsWith('OUV-')) {
      setTrackResult({
        id: trackId.toUpperCase(),
        status: 'Em Análise',
        responsavel: 'Ouvidoria Municipal',
        prazo: '30/06/2026',
        historico: [
          { date: '25/05/2026', text: 'Manifestação recebida e protocolada.' },
          { date: '26/05/2026', text: 'Encaminhada para o setor responsável.' },
          { date: '27/05/2026', text: 'Em análise pela equipe técnica.' },
        ],
      });
    } else {
      setTrackResult({ error: 'Protocolo não encontrado. Verifique o formato (OUV-XXXXXX).' });
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-primary text-on-primary p-8 shadow-xl">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,#316bf3,transparent_55%)]" />
        <div className="relative">
          <span className="inline-block bg-secondary/20 text-secondary-fixed-dim text-[10px] font-bold tracking-[0.2em] px-2 py-1 rounded">
            CANAL OFICIAL DO CIDADÃO
          </span>
          <h2 className="text-headline-xl mt-3">Ouvidoria</h2>
          <p className="text-on-primary-container mt-2 max-w-3xl">
            Canal independente regido pela Lei nº 13.460/2017 (Código de Defesa do Usuário do Serviço Público)
            e pela Lei nº 12.527/2011 (LAI). Todas as manifestações são tratadas sob estrito sigilo e em
            conformidade com a LGPD.
          </p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter-md">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <Icon name={s.icon} />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">{s.label}</p>
              <p className="text-headline-md text-primary leading-tight">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Formulário ou Sucesso */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-7 shadow-sm">
          {step === 'success' ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Icon name="check_circle" className="text-5xl" />
              </div>
              <h3 className="text-headline-md mt-4 text-primary">Manifestação registrada!</h3>
              <p className="text-on-surface-variant mt-1">Você receberá atualizações por e-mail conforme o andamento.</p>
              <div className="mt-5 mx-auto inline-block bg-surface-container px-5 py-3 rounded-xl">
                <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">PROTOCOLO DE OUVIDORIA</p>
                <p className="font-mono text-2xl font-bold text-secondary mt-1">#{protocolo.id}</p>
              </div>
              <p className="text-xs text-on-surface-variant mt-4">
                Prazo de resposta: <strong>30 dias corridos</strong> conforme art. 16 da Lei 13.460/2017.
              </p>
              <button onClick={() => { setStep('form'); setProtocolo(null); }} className="mt-5 px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm">
                Nova manifestação
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <h3 className="text-headline-md flex items-center gap-2">
                <Icon name="record_voice_over" className="text-secondary" /> Registrar Manifestação
              </h3>

              <div>
                <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-2">TIPO DE MANIFESTAÇÃO</label>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {tipos.map((t) => {
                    const active = form.tipo === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => update('tipo', t.id)}
                        title={t.desc}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          active ? `${t.color} bg-current/5` : 'border-outline-variant/40 text-on-surface-variant hover:border-secondary/40'
                        }`}
                      >
                        <Icon name={t.icon} className="text-xl" />
                        <p className="text-xs font-bold mt-1">{t.label}</p>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-on-surface-variant mt-2">{tipos.find((t) => t.id === form.tipo)?.desc}</p>
              </div>

              <label className="flex items-center gap-2 p-3 bg-surface-container-low/50 rounded-lg border border-outline-variant/40 cursor-pointer">
                <input type="checkbox" checked={form.anonimo} onChange={(e) => update('anonimo', e.target.checked)} className="w-4 h-4 accent-secondary" />
                <Icon name="visibility_off" className="text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">Manifestação anônima</p>
                  <p className="text-[10px] text-on-surface-variant">Sua identidade não será divulgada ao órgão demandado (Lei 13.460/2017).</p>
                </div>
              </label>

              {!form.anonimo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="NOME COMPLETO">
                    <input required={!form.anonimo} value={form.nome} onChange={(e) => update('nome', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
                  </Field>
                  <Field label="CPF">
                    <input value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="000.000.000-00" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label="E-MAIL PARA RESPOSTA">
                      <input type="email" required={!form.anonimo} value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
                    </Field>
                  </div>
                </div>
              )}

              <Field label="ÓRGÃO OU SETOR (OPCIONAL)">
                <select value={form.orgao} onChange={(e) => update('orgao', e.target.value)} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                  <option value="">Não sei / Direcionar automaticamente</option>
                  <option>Secretaria de Obras</option>
                  <option>Secretaria de Saúde</option>
                  <option>Secretaria de Educação</option>
                  <option>Secretaria de Fazenda</option>
                  <option>Câmara Municipal</option>
                  <option>Guarda Civil Municipal</option>
                </select>
              </Field>

              <Field label="ASSUNTO">
                <input required value={form.assunto} onChange={(e) => update('assunto', e.target.value)} placeholder="Resumo em poucas palavras" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" maxLength={120} />
              </Field>

              <Field label={`RELATO DETALHADO (${form.descricao.length}/2000)`}>
                <textarea required rows="6" value={form.descricao} onChange={(e) => update('descricao', e.target.value.slice(0, 2000))} placeholder="Descreva os fatos com clareza, incluindo datas, locais e pessoas envolvidas, se aplicável." className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary resize-none" />
              </Field>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
                <Icon name="lock" className="text-base mt-0.5" />
                <p>
                  <strong>Seus dados estão protegidos.</strong> O tratamento desta manifestação segue
                  integralmente a Lei Geral de Proteção de Dados (LGPD nº 13.709/2018).
                  O conteúdo só é acessado pela equipe da Ouvidoria e pelo setor responsável.
                </p>
              </div>

              <button type="submit" className="w-full py-3 bg-secondary text-on-secondary rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95">
                <Icon name="send" /> Enviar Manifestação
              </button>
            </form>
          )}
        </div>

        {/* Lateral */}
        <aside className="col-span-12 lg:col-span-4 space-y-gutter-md">
          {/* Consultar protocolo */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-on-surface flex items-center gap-2 mb-3">
              <Icon name="search" className="text-secondary text-base" /> Consultar manifestação
            </h4>
            <form onSubmit={consultar} className="space-y-2">
              <input
                value={trackId}
                onChange={(e) => setTrackId(e.target.value)}
                placeholder="OUV-XXXXXX"
                className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary font-mono"
              />
              <button type="submit" className="w-full py-2 bg-primary text-on-primary rounded-lg font-bold text-label-sm">Consultar</button>
            </form>
            {trackResult && (
              <div className="mt-3 p-3 bg-surface-container-low/50 rounded-lg">
                {trackResult.error ? (
                  <p className="text-xs text-error">{trackResult.error}</p>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <p className="font-mono text-sm font-bold">#{trackResult.id}</p>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{trackResult.status}</span>
                    </div>
                    <p className="text-[10px] text-on-surface-variant mt-1">Responsável: {trackResult.responsavel}</p>
                    <p className="text-[10px] text-on-surface-variant">Prazo: {trackResult.prazo}</p>
                    <div className="mt-2 pt-2 border-t border-outline-variant/40 space-y-1">
                      {trackResult.historico.map((h, i) => (
                        <p key={i} className="text-[10px]"><strong>{h.date}:</strong> {h.text}</p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Direitos */}
          <div className="bg-primary text-on-primary rounded-2xl p-5 shadow-xl">
            <h4 className="font-bold flex items-center gap-2 mb-3">
              <Icon name="gavel" className="text-secondary-fixed-dim" /> Seus Direitos
            </h4>
            <ul className="space-y-2">
              {direitosTitular.map((d, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-on-primary-container">
                  <Icon name="check_circle" className="text-tertiary-fixed-dim text-sm mt-0.5" /> {d}
                </li>
              ))}
            </ul>
          </div>

          {/* Outros canais */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
            <h4 className="font-bold text-on-surface mb-3">Outros canais</h4>
            <div className="space-y-2 text-sm">
              <a href="tel:162" className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg">
                <Icon name="call" className="text-secondary" />
                <div><p className="font-bold">162</p><p className="text-[10px] text-on-surface-variant">Disque Ouvidoria 24h</p></div>
              </a>
              <a href="mailto:ouvidoria@govtech.gov.br" className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg">
                <Icon name="mail" className="text-secondary" />
                <div><p className="font-bold">ouvidoria@govtech.gov.br</p><p className="text-[10px] text-on-surface-variant">Atendimento por e-mail</p></div>
              </a>
              <a href="https://www.gov.br/cgu" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-2 hover:bg-surface-container-low rounded-lg">
                <Icon name="account_balance" className="text-secondary" />
                <div><p className="font-bold">CGU Federal</p><p className="text-[10px] text-on-surface-variant">Instância recursal</p></div>
              </a>
            </div>
          </div>
        </aside>
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
