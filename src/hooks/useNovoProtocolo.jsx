import { createContext, useContext, useState } from 'react';
import Icon from '../components/Icon.jsx';

const ProtocoloContext = createContext(null);

const categorias = [
  { id: 'saneamento', label: 'Saneamento', icon: 'water_drop' },
  { id: 'iluminacao', label: 'Iluminação Pública', icon: 'lightbulb' },
  { id: 'transito', label: 'Trânsito', icon: 'traffic' },
  { id: 'saude', label: 'Saúde', icon: 'local_hospital' },
  { id: 'educacao', label: 'Educação', icon: 'school' },
  { id: 'limpeza', label: 'Limpeza Urbana', icon: 'delete' },
  { id: 'urbanismo', label: 'Urbanismo', icon: 'park' },
  { id: 'seguranca', label: 'Segurança', icon: 'shield' },
];

const prioridades = [
  { id: 'baixa', label: 'Baixa', color: 'text-on-surface-variant border-outline-variant' },
  { id: 'media', label: 'Média', color: 'text-secondary border-secondary' },
  { id: 'alta', label: 'Alta', color: 'text-amber-600 border-amber-500' },
  { id: 'critica', label: 'Crítica', color: 'text-error border-error' },
];

export function NovoProtocoloProvider({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <ProtocoloContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      {open && <NovoProtocoloModal onClose={() => setOpen(false)} />}
    </ProtocoloContext.Provider>
  );
}

export function useNovoProtocolo() {
  const ctx = useContext(ProtocoloContext);
  if (!ctx) throw new Error('useNovoProtocolo deve estar dentro de NovoProtocoloProvider');
  return ctx;
}

function NovoProtocoloModal({ onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    categoria: '',
    prioridade: 'media',
    titulo: '',
    descricao: '',
    endereco: '',
    cep: '',
    bairro: '',
    anexos: [],
  });
  const [protocolo, setProtocolo] = useState(null);

  function update(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function handleFile(e) {
    const files = Array.from(e.target.files || []).slice(0, 5 - form.anexos.length);
    e.target.value = '';
    const valid = files.filter((f) => f.size <= 5 * 1024 * 1024);
    if (valid.length < files.length) alert('Arquivos acima de 5MB foram ignorados.');
    Promise.all(valid.map((f) => new Promise((res) => {
      const reader = new FileReader();
      reader.onload = () => res({ name: f.name, type: f.type, size: f.size, url: reader.result });
      reader.readAsDataURL(f);
    }))).then((arr) => setForm((f) => ({ ...f, anexos: [...f.anexos, ...arr] })));
  }

  function removeAnexo(i) {
    setForm((f) => ({ ...f, anexos: f.anexos.filter((_, idx) => idx !== i) }));
  }

  function canNext() {
    if (step === 1) return !!form.categoria;
    if (step === 2) return form.titulo.trim().length >= 5 && form.descricao.trim().length >= 10;
    if (step === 3) return form.endereco.trim().length >= 5 && form.bairro.trim().length >= 2;
    return true;
  }

  function submit() {
    const id = 'PRT-' + Math.floor(10000 + Math.random() * 90000);
    setProtocolo({ id, ...form, createdAt: new Date() });
  }

  function close() {
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={close}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        {protocolo ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Icon name="check_circle" className="text-5xl" />
            </div>
            <h3 className="text-headline-md mt-4 text-primary">Protocolo registrado!</h3>
            <p className="text-on-surface-variant mt-1">Sua solicitação foi recebida e está em análise.</p>
            <div className="mt-5 mx-auto inline-block bg-surface-container px-5 py-3 rounded-xl">
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant">NÚMERO DO PROTOCOLO</p>
              <p className="font-mono text-2xl font-bold text-secondary mt-1">#{protocolo.id}</p>
            </div>
            <p className="text-xs text-on-surface-variant mt-4">
              Acompanhe pelo Portal do Cidadão. Notificações serão enviadas por e-mail e SMS.
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <button onClick={close} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Fechar</button>
              <button onClick={() => { navigator.clipboard?.writeText(protocolo.id); }} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm hover:opacity-90 flex items-center gap-2">
                <Icon name="content_copy" className="text-base" /> Copiar número
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-5 border-b border-outline-variant/40 flex items-center justify-between">
              <div>
                <h3 className="text-headline-md flex items-center gap-2">
                  <Icon name="add_circle" className="text-secondary" /> Novo Protocolo
                </h3>
                <p className="text-xs text-on-surface-variant">Etapa {step} de 4</p>
              </div>
              <button onClick={close} className="text-on-surface-variant hover:text-on-surface p-1"><Icon name="close" /></button>
            </div>

            {/* Stepper */}
            <div className="px-5 pt-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${s <= step ? 'bg-secondary' : 'bg-surface-container'}`} />
                ))}
              </div>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {step === 1 && (
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Selecione a categoria</h4>
                  <p className="text-xs text-on-surface-variant mb-4">Escolha o tipo de demanda que você quer registrar.</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {categorias.map((c) => {
                      const active = form.categoria === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => update('categoria', c.id)}
                          className={`p-3 rounded-xl border-2 text-center transition-all ${
                            active ? 'border-secondary bg-secondary/10 text-secondary' : 'border-outline-variant/40 hover:border-secondary/40'
                          }`}
                        >
                          <Icon name={c.icon} className="text-2xl" />
                          <p className="text-xs font-semibold mt-1">{c.label}</p>
                        </button>
                      );
                    })}
                  </div>

                  <h4 className="font-bold text-on-surface mt-6 mb-2">Prioridade</h4>
                  <div className="flex gap-2 flex-wrap">
                    {prioridades.map((p) => {
                      const active = form.prioridade === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => update('prioridade', p.id)}
                          className={`px-4 py-2 rounded-lg border-2 text-label-sm font-bold ${
                            active ? p.color + ' bg-current/10' : 'border-outline-variant/40 text-on-surface-variant'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-on-surface mb-1">Descreva o problema</h4>
                  <Field label="TÍTULO">
                    <input
                      value={form.titulo}
                      onChange={(e) => update('titulo', e.target.value)}
                      placeholder="Ex: Poste de luz queimado na Rua das Flores"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary"
                      maxLength={120}
                    />
                  </Field>
                  <Field label={`DESCRIÇÃO (${form.descricao.length}/500)`}>
                    <textarea
                      rows="5"
                      value={form.descricao}
                      onChange={(e) => update('descricao', e.target.value.slice(0, 500))}
                      placeholder="Descreva com detalhes o que está acontecendo, há quanto tempo e qualquer informação relevante para o atendimento."
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary resize-none"
                    />
                  </Field>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-on-surface mb-1">Localização</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="CEP">
                      <input value={form.cep} onChange={(e) => update('cep', e.target.value)} placeholder="00000-000" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
                    </Field>
                    <div className="col-span-2">
                      <Field label="BAIRRO">
                        <input value={form.bairro} onChange={(e) => update('bairro', e.target.value)} placeholder="Ex: Centro" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
                      </Field>
                    </div>
                  </div>
                  <Field label="ENDEREÇO COMPLETO">
                    <input value={form.endereco} onChange={(e) => update('endereco', e.target.value)} placeholder="Rua, número e referência" className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" />
                  </Field>
                  <button className="text-secondary text-label-sm font-bold flex items-center gap-1 hover:underline">
                    <Icon name="my_location" className="text-base" /> Usar minha localização atual
                  </button>
                </div>
              )}

              {step === 4 && (
                <div>
                  <h4 className="font-bold text-on-surface mb-1">Anexar evidências (opcional)</h4>
                  <p className="text-xs text-on-surface-variant mb-3">Até 5 arquivos de imagem ou vídeo, máx. 5MB cada.</p>
                  <label className="block border-2 border-dashed border-outline-variant rounded-xl p-6 text-center cursor-pointer hover:border-secondary transition-colors">
                    <Icon name="cloud_upload" className="text-3xl text-secondary" />
                    <p className="text-sm font-semibold mt-2">Clique para enviar arquivos</p>
                    <p className="text-xs text-on-surface-variant">ou arraste e solte aqui</p>
                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFile} disabled={form.anexos.length >= 5} />
                  </label>
                  {form.anexos.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {form.anexos.map((a, i) => (
                        <div key={i} className="relative group border border-outline-variant/40 rounded-lg overflow-hidden">
                          {a.type.startsWith('image/') ? (
                            <img src={a.url} alt={a.name} className="w-full h-20 object-cover" />
                          ) : (
                            <div className="h-20 bg-surface-container flex items-center justify-center">
                              <Icon name="movie" className="text-3xl text-secondary" />
                            </div>
                          )}
                          <button onClick={() => removeAnexo(i)} className="absolute top-1 right-1 w-6 h-6 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Icon name="close" className="text-sm" />
                          </button>
                          <p className="text-[10px] truncate p-1">{a.name}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resumo */}
                  <div className="mt-5 p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/40">
                    <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">RESUMO</p>
                    <p className="text-sm"><strong>Categoria:</strong> {categorias.find((c) => c.id === form.categoria)?.label}</p>
                    <p className="text-sm"><strong>Prioridade:</strong> {prioridades.find((p) => p.id === form.prioridade)?.label}</p>
                    <p className="text-sm"><strong>Título:</strong> {form.titulo}</p>
                    <p className="text-sm"><strong>Local:</strong> {form.endereco}, {form.bairro}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-outline-variant/40 flex items-center justify-between gap-2 bg-surface-container-low/30">
              <button
                onClick={() => step === 1 ? close() : setStep(step - 1)}
                className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm hover:bg-surface-container"
              >
                {step === 1 ? 'Cancelar' : 'Voltar'}
              </button>
              {step < 4 ? (
                <button
                  onClick={() => canNext() && setStep(step + 1)}
                  disabled={!canNext()}
                  className="px-5 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continuar <Icon name="arrow_forward" className="text-base" />
                </button>
              ) : (
                <button
                  onClick={submit}
                  className="px-5 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm hover:opacity-90 flex items-center gap-2"
                >
                  <Icon name="send" className="text-base" /> Registrar Protocolo
                </button>
              )}
            </div>
          </>
        )}
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
