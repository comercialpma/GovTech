import Icon from '../components/Icon.jsx';
import { useNovoProtocolo } from '../hooks/useNovoProtocolo.jsx';

export default function PortalCidadao() {
  const { open: openNovoProtocolo } = useNovoProtocolo();
  return (
    <>
      {/* Hero */}
      <section className="mb-12">
        <div className="relative rounded-2xl overflow-hidden bg-primary-container p-12 flex flex-col items-start justify-center min-h-[360px] shadow-xl">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=1920&q=70')",
            }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/95 via-primary-container/85 to-primary/95" />
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block bg-secondary text-on-secondary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
              GovTech Master
            </span>
            <h2 className="text-headline-xl text-on-primary mb-4 leading-tight">Sua cidade, sua voz.</h2>
            <p className="text-body-lg text-on-primary-container/90 mb-8 max-w-lg leading-relaxed">
              Participe da gestão do seu município. Abra protocolos, acompanhe suas solicitações em
              tempo real ou compartilhe ideias inovadoras para o seu bairro.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={openNovoProtocolo} className="bg-secondary text-on-secondary px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:shadow-lg hover:shadow-secondary/20 transition-all active:scale-95">
                <Icon name="add_circle" /> Abrir Novo Protocolo
              </button>
              <button className="bg-surface-container-lowest text-primary px-8 py-4 rounded-xl font-bold flex items-center gap-3 hover:bg-surface-container-high transition-all active:scale-95">
                <Icon name="lightbulb" /> Sugerir Ideia
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter-md">
        {/* Coluna 8: Protocolos */}
        <div className="col-span-12 lg:col-span-8 space-y-gutter-md">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-headline-md text-on-surface">Meus Protocolos</h3>
                <p className="text-on-surface-variant text-body-md">Gestão ativa das suas solicitações</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/30">
                  <Icon name="filter_list" className="text-on-surface-variant" />
                </button>
                <button className="p-2 hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/30">
                  <Icon name="search" className="text-on-surface-variant" />
                </button>
              </div>
            </div>

            <ProtocolTimelineItem
              status="done"
              tag="Concluído"
              tagClass="text-on-tertiary-fixed-variant bg-tertiary-fixed/40"
              icon="check"
              iconBg="bg-tertiary-fixed-dim text-on-tertiary-fixed"
              title="Reparo de Iluminação Pública"
              text="Rua das Flores, 123 - Centro. Poste #4552 identificado e reparado pela equipe noturna."
              meta={[
                { icon: 'calendar_today', label: '12/10/2023' },
                { icon: 'tag', label: '#PRT-8892' },
                { icon: 'chat_bubble', label: '2 Atualizações' },
              ]}
            />

            <ProtocolTimelineItem
              status="pending"
              tag="Em Análise"
              tagClass="text-on-secondary-fixed-variant bg-secondary-fixed/50"
              icon="pending"
              iconBg="bg-secondary-container text-on-secondary-container animate-pulse"
              title="Solicitação de Poda de Árvore"
              text="Equipe técnica agendada para vistoria no local para avaliar riscos à rede elétrica."
              meta={[
                { icon: 'calendar_today', label: '14/10/2023' },
                { icon: 'tag', label: '#PRT-9041' },
              ]}
              last
            />

            <button className="w-full text-secondary font-bold text-body-md py-4 mt-4 border-t border-outline-variant/30 hover:bg-surface-container-low transition-colors rounded-b-xl flex items-center justify-center gap-2">
              Ver histórico completo de protocolos <Icon name="arrow_forward" className="text-sm" />
            </button>
          </div>

          {/* Ideas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
            <IdeaCard
              icon="park"
              title="Revitalização da Praça Central"
              text="Sugestão de novos bancos ergonômicos, Wi-Fi gratuito de alta velocidade e playground inclusivo."
              supporters={142}
            />
            <IdeaCard
              icon="directions_bike"
              title="Ciclovia na Av. Brasil"
              text="Integração estratégica do bairro industrial ao centro comercial através de ciclovias seguras e iluminadas."
              supporters={86}
            />
          </div>
        </div>

        {/* Coluna 4: Agenda do Vereador + Stats */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter-md">
          <div className="bg-primary text-on-primary rounded-xl p-8 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Icon name="account_balance" className="text-7xl" />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-secondary bg-secondary-container flex items-center justify-center shadow-lg">
                <Icon name="person" className="text-3xl" />
              </div>
              <div>
                <h4 className="font-bold text-xl leading-tight">Vereador Ricardo Santos</h4>
                <p className="text-on-primary-container text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                  Agenda Legislativa
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <AgendaItem when="Hoje • 14:00" title="Audiência Pública: Saneamento Básico e Sustentabilidade" loc="Plenário da Câmara Municipal" highlight />
              <AgendaItem when="Amanhã • 09:00" title="Votação: Revisão do Plano Diretor Estratégico 2024" loc="Câmara Municipal - Sala de Comissões" />
              <AgendaItem when="18 Out • 15:30" title="Visita Técnica: Urbanização Bairro Nova Esperança" loc="Encontro com lideranças comunitárias locais" />
            </div>

            <button className="w-full mt-8 py-4 border border-secondary/50 rounded-xl text-secondary font-bold text-xs hover:bg-secondary hover:text-on-secondary transition-all active:scale-95">
              Enviar mensagem ao gabinete
            </button>
          </div>

          <div className="bg-surface-container-high border border-outline-variant rounded-xl p-8 shadow-sm">
            <h4 className="font-bold text-on-surface mb-8 flex items-center gap-3">
              <Icon name="analytics" className="text-secondary" />
              Transparência em Números
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <StatBox value="92%" label="Solicitações Atendidas" />
              <StatBox value="4.2d" label="Tempo Médio Resposta" />
            </div>
            <p className="text-[10px] text-on-surface-variant/70 text-center mt-6">
              Dados atualizados em tempo real pelo Portal da Transparência.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ProtocolTimelineItem({ icon, iconBg, title, tag, tagClass, text, meta, last }) {
  return (
    <div className={`relative ${last ? 'pb-6' : 'pb-10'}`}>
      {!last && <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-outline-variant/30" />}
      <div className="flex gap-6 relative">
        <div className={`w-8 h-8 rounded-full ${iconBg} flex items-center justify-center z-10 shadow-sm`}>
          <Icon name={icon} className="text-sm" />
        </div>
        <div className="flex-1 bg-surface-container-low/50 p-6 rounded-xl border border-outline-variant/30 hover:border-secondary/40 transition-colors">
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-bold text-on-surface text-lg">{title}</h4>
            <span className={`${tagClass} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
              {tag}
            </span>
          </div>
          <p className="text-on-surface-variant text-body-md mb-6 leading-relaxed">{text}</p>
          <div className="flex items-center gap-6 text-on-surface-variant text-xs font-medium flex-wrap">
            {meta.map((m, i) => (
              <span key={i} className="flex items-center gap-2">
                <Icon name={m.icon} className="text-sm opacity-60" />
                {m.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function IdeaCard({ icon, title, text, supporters }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 relative overflow-hidden group cursor-pointer hover:border-secondary hover:-translate-y-1 transition-all shadow-sm">
      <div className="mb-6">
        <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center">
          <Icon name={icon} className="text-3xl text-secondary" />
        </div>
      </div>
      <h4 className="text-headline-md mb-3">{title}</h4>
      <p className="text-on-surface-variant text-body-md mb-8 leading-relaxed">{text}</p>
      <div className="flex items-center justify-between mt-auto">
        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center text-xs font-bold border-2 border-surface-container-lowest">
          +{supporters}
        </div>
        <span className="text-secondary font-bold flex items-center gap-2 text-label-sm group-hover:scale-110 transition-transform">
          <Icon name="thumb_up" filled className="text-sm" />
          Apoiar Ideia
        </span>
      </div>
    </div>
  );
}

function AgendaItem({ when, title, loc, highlight }) {
  return (
    <div className={`bg-white/5 p-5 rounded-xl border border-white/10 ${highlight ? 'hover:bg-white/10' : 'opacity-70 hover:opacity-100'} transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-secondary-fixed-dim uppercase tracking-wider">{when}</span>
        {highlight && <Icon name="open_in_new" className="text-xs opacity-60" />}
      </div>
      <p className="font-bold text-sm leading-snug">{title}</p>
      <p className="text-xs text-on-primary-container mt-2">{loc}</p>
    </div>
  );
}

function StatBox({ value, label }) {
  return (
    <div className="bg-surface-container-lowest p-6 rounded-xl text-center border border-outline-variant/30 shadow-inner">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mt-2">{label}</div>
    </div>
  );
}
