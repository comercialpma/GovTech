import { useMemo, useState } from 'react';
import Icon from '../components/Icon.jsx';

const categories = [
  { id: 'protocolos', icon: 'assignment', title: 'Protocolos', desc: 'Aberturas, acompanhamento e prazos.' },
  { id: 'usuarios', icon: 'group', title: 'Gestão de Usuários', desc: 'Cadastros, vínculos e permissões.' },
  { id: 'mandato', icon: 'assignment_ind', title: 'Painel do Mandato', desc: 'Kanban, demandas e CRM.' },
  { id: 'radar', icon: 'map', title: 'Observatório', desc: 'Mapa de calor e indicadores públicos.' },
  { id: 'comunicacao', icon: 'campaign', title: 'Motor de Comunicação', desc: 'Disparos, créditos e segmentação.' },
  { id: 'config', icon: 'settings', title: 'Configurações', desc: 'Identidade visual, segurança e integrações.' },
];

const articles = [
  // Protocolos
  { id: 'p1', cat: 'protocolos', title: 'Como abrir meu primeiro protocolo', time: '3 min', views: 4218, body: [
    'Para abrir um novo protocolo, clique no botão "Novo Protocolo" disponível no menu lateral esquerdo da plataforma. Um formulário em etapas será exibido.',
    'Etapa 1 — Identificação: confirme seus dados cadastrais (CPF, e-mail e telefone). Caso esteja desatualizado, edite antes de prosseguir.',
    'Etapa 2 — Categoria: escolha entre Saneamento, Iluminação, Trânsito, Saúde, Educação, Limpeza Urbana, entre outras.',
    'Etapa 3 — Descrição: descreva o problema em até 500 caracteres. Seja claro e objetivo. Inclua endereço de referência e horários relevantes.',
    'Etapa 4 — Mídia: anexe até 5 fotos (máx. 5MB cada) ou um vídeo curto (até 30s) para evidenciar a situação.',
    'Após o envio, você receberá um número de protocolo (#PRT-XXXX) por e-mail e SMS. Use esse número para acompanhar o atendimento.',
  ] },
  { id: 'p2', cat: 'protocolos', title: 'Acompanhar o status de um protocolo aberto', time: '2 min', views: 3120, body: [
    'Acesse "Portal do Cidadão" no menu lateral. Na seção "Meus Protocolos" você verá todas as solicitações abertas, em análise ou concluídas.',
    'Cada card mostra o status atual, atualizações da equipe responsável e prazo estimado.',
    'Clique no protocolo para abrir o histórico completo com timeline, mensagens trocadas e mídias anexadas.',
  ] },
  { id: 'p3', cat: 'protocolos', title: 'Prazos legais e SLA por categoria', time: '4 min', views: 1840, body: [
    'O prazo padrão da Lei de Acesso à Informação é 20 dias corridos, prorrogáveis por mais 10.',
    'Protocolos classificados como "Crítico" devem ser respondidos em até 48h.',
    'Saneamento e Saúde possuem SLA reduzido de 15 dias. Iluminação e limpeza urbana seguem o padrão de 20 dias.',
    'O sistema notifica automaticamente o setor responsável quando o prazo está a 3 dias do vencimento.',
  ] },
  { id: 'p4', cat: 'protocolos', title: 'Reabrir um protocolo encerrado', time: '2 min', views: 980, body: [
    'Protocolos podem ser reabertos em até 30 dias após o encerramento caso a situação não tenha sido resolvida.',
    'Acesse o protocolo, clique em "Reabrir" e descreva o motivo. Será gerado um novo número vinculado ao histórico original.',
  ] },
  { id: 'p5', cat: 'protocolos', title: 'Exportar protocolos para Excel/PDF', time: '3 min', views: 1450, body: [
    'Na página "Gestão de Protocolos", clique em "Exportar Relatório" no canto superior direito.',
    'Escolha o formato (XLSX, CSV ou PDF) e aplique filtros por status, prioridade ou período antes da exportação.',
    'Relatórios são gerados em background e enviados por e-mail quando passam de 10 mil linhas.',
  ] },

  // Usuários
  { id: 'u1', cat: 'usuarios', title: 'Vincular cidadãos ao mandato de um vereador', time: '5 min', views: 2810, body: [
    'Acesse "Gestão de Usuários" e localize o cidadão desejado pelo CPF, nome ou e-mail.',
    'Clique no ícone de edição (lápis) na linha do cidadão para abrir o painel lateral.',
    'Na aba "Vínculo Político", selecione o parlamentar e a base territorial. O vínculo passa por aprovação do próprio cidadão via SMS antes de ser ativado.',
  ] },
  { id: 'u2', cat: 'usuarios', title: 'Importar base de cidadãos via CSV', time: '6 min', views: 1530, body: [
    'Baixe o modelo CSV em "Gestão de Usuários" → "Baixar Modelo".',
    'Preencha as colunas obrigatórias: CPF, nome completo, e-mail, telefone e bairro.',
    'Clique em "Importar" e selecione o arquivo. O sistema valida CPFs duplicados e formato dos campos antes de processar.',
    'Importações grandes (>5 mil registros) rodam em fila e o usuário recebe e-mail ao finalizar.',
  ] },
  { id: 'u3', cat: 'usuarios', title: 'Níveis de permissão e perfis de acesso', time: '4 min', views: 1190, body: [
    'Existem 5 perfis: Cidadão, Vereador, Admin Municipal, Admin Estadual e Admin Master.',
    'Cidadãos veem apenas os próprios protocolos. Vereadores enxergam demandas da sua base. Admins acessam relatórios consolidados e configurações.',
    'Perfis podem ser ajustados em "Configurações" → "Segurança" → "Perfis e Permissões".',
  ] },
  { id: 'u4', cat: 'usuarios', title: 'Anonimizar dados sob solicitação LGPD', time: '5 min', views: 720, body: [
    'O titular pode solicitar anonimização em "Portal do Cidadão" → "Privacidade" → "Solicitar Anonimização".',
    'Após validação, o sistema substitui CPF, nome e contatos por hash irreversível, preservando estatísticas agregadas.',
    'O processo ocorre em até 15 dias corridos conforme prazo da ANPD.',
  ] },

  // Mandato
  { id: 'm1', cat: 'mandato', title: 'Mover demandas no Kanban', time: '2 min', views: 2240, body: [
    'No "Painel do Mandato", arraste qualquer card entre as colunas Pendentes, Em Andamento e Resolvidos.',
    'O status, progresso e timestamp são atualizados automaticamente e o cidadão é notificado.',
    'Apenas o vereador responsável e administradores têm permissão de mover cards.',
  ] },
  { id: 'm2', cat: 'mandato', title: 'Configurar agenda do mandato', time: '4 min', views: 980, body: [
    'A agenda sincroniza com Google Calendar e Outlook via OAuth. Configure em "Configurações" → "Integrações".',
    'Eventos importados podem ser marcados como públicos (exibidos no Portal do Cidadão) ou internos.',
  ] },
  { id: 'm3', cat: 'mandato', title: 'CRM do Cidadão: gerenciar contatos estratégicos', time: '5 min', views: 870, body: [
    'O CRM permite cadastrar líderes comunitários, sindicatos e formadores de opinião com tags de relacionamento.',
    'Cada contato exibe histórico de interações, demandas vinculadas e notas privadas do gabinete.',
  ] },

  // Observatório / Radar
  { id: 'r1', cat: 'radar', title: 'Usar filtros do mapa de calor', time: '3 min', views: 1980, body: [
    'O mapa permite filtrar por região/bairro, status e categoria. Os pins e a camada de calor atualizam em tempo real.',
    'Toggle "Calor" exibe densidade; "Pins" mostra cada demanda individualmente.',
    'Clique em qualquer pin para ver detalhes do protocolo associado.',
  ] },
  { id: 'r2', cat: 'radar', title: 'Interpretar indicadores públicos do município', time: '6 min', views: 1240, body: [
    'O Observatório consolida PIB, IDH-M, IDEB, dados de saúde e empresas ativas a partir de IBGE, PNUD, INEP, DataSUS e SEBRAE.',
    'Os dados são atualizados em ciclos: PIB anualmente, DataSUS diariamente, IDEB bienalmente.',
    'O ranking por bairro permite priorizar políticas públicas em territórios de menor densidade econômica.',
  ] },
  { id: 'r3', cat: 'radar', title: 'Exportar relatório do Observatório', time: '2 min', views: 640, body: [
    'Clique em "Exportar Relatório" no header. O documento PDF contém todos os indicadores, gráficos e o ranking de bairros.',
    'O relatório usa a identidade visual definida em Configurações.',
  ] },

  // Comunicação
  { id: 'c1', cat: 'comunicacao', title: 'Disparar campanha multicanal segmentada', time: '7 min', views: 2120, body: [
    'No Painel de Coordenação, acesse o "Motor de Comunicação" no painel lateral.',
    'Selecione os canais (WhatsApp, SMS, Push, E-mail) — o custo estimado é calculado em tempo real.',
    'Escolha a segmentação por mandato e/ou distrito e ajuste o tamanho da audiência.',
    'Personalize a mensagem com variáveis {nome}, {bairro}, {protocolo}. Anexe imagem (até 5MB) ou link de vídeo.',
    'Revise o custo total vs créditos disponíveis e clique em "DISPARAR CAMPANHA".',
  ] },
  { id: 'c2', cat: 'comunicacao', title: 'Entender o consumo de créditos', time: '4 min', views: 1480, body: [
    'WhatsApp: R$ 0,040 por envio. SMS: R$ 0,080. Push: R$ 0,010. E-mail: R$ 0,005.',
    'Créditos são debitados após confirmação de entrega — falhas não consomem saldo.',
    'O ciclo é mensal e renova no primeiro dia útil. Saldo não usado expira em 90 dias.',
  ] },
  { id: 'c3', cat: 'comunicacao', title: 'Boas práticas de mensagens (CTR e engajamento)', time: '6 min', views: 980, body: [
    'Mensagens com até 160 caracteres têm 32% mais taxa de leitura.',
    'Use a variável {nome} no início — personalização aumenta o CTR em 2,7x.',
    'Evite disparos entre 22h e 7h. Pico de engajamento: terça e quinta, 10h-12h e 18h-20h.',
  ] },
  { id: 'c4', cat: 'comunicacao', title: 'Histórico e auditoria de disparos', time: '3 min', views: 720, body: [
    'Cada campanha gera log imutável com timestamp, audiência, autor e status de entrega por destinatário.',
    'O histórico fica disponível por 5 anos para fins de auditoria e prestação de contas.',
  ] },

  // Config
  { id: 'g1', cat: 'config', title: 'Alterar identidade visual (logo e cor primária)', time: '4 min', views: 1610, body: [
    'Em "Configurações" → "Identidade Visual", clique em "Alterar Logo" para enviar uma imagem (PNG, JPG, SVG, máx. 2MB).',
    'A logo aparece automaticamente na sidebar, na topbar e no rodapé.',
    'Escolha a cor primária entre os presets ou informe um hexadecimal personalizado e clique em "Aplicar".',
  ] },
  { id: 'g2', cat: 'config', title: 'Integrar com Gov.br, Protheus, SAP e 1Doc', time: '7 min', views: 540, body: [
    'A integração é feita em "Configurações" → "Integrações". Para Gov.br use OAuth 2.0 e o client_id fornecido pelo SERPRO.',
    'Para Protheus/SAP, configure o endpoint REST e a chave de API gerada no painel administrativo.',
    '1Doc utiliza webhook bidirecional — registre a URL exposta pelo seu firewall na aba "1Doc".',
  ] },
  { id: 'g3', cat: 'config', title: 'Habilitar autenticação em dois fatores (2FA)', time: '3 min', views: 870, body: [
    'Em "Configurações" → "Segurança", ative "Autenticação em Duas Etapas".',
    'O usuário será solicitado a cadastrar Google Authenticator, Authy ou receber código por SMS no próximo login.',
    'Administradores podem tornar o 2FA obrigatório para todos os perfis com acesso a dados sensíveis.',
  ] },
];

const faqs = [
  { q: 'Como recuperar minha senha de acesso?', a: 'Na tela de login, clique em "Esqueci minha senha". Você receberá um e-mail com instruções em até 5 minutos. Verifique também a caixa de spam.' },
  { q: 'Qual o prazo legal para resposta de um protocolo?', a: 'O prazo padrão definido pela LAI é de 20 dias corridos, prorrogáveis por mais 10. Protocolos marcados como "Crítico" devem ser respondidos em até 48h.' },
  { q: 'Posso integrar a plataforma com sistemas externos?', a: 'Sim. A GovTech oferece API REST com autenticação OAuth 2.0 e webhooks para Protheus, SAP, 1Doc, entre outros. Veja em Configurações → Integrações.' },
  { q: 'Como funciona a cobrança de créditos de comunicação?', a: 'Cada canal tem um custo por envio (WhatsApp R$ 0,04, SMS R$ 0,08, Push R$ 0,01, E-mail R$ 0,005). Os créditos são debitados em tempo real e o ciclo se renova mensalmente.' },
  { q: 'Os dados dos cidadãos estão em conformidade com a LGPD?', a: 'Sim. A plataforma é auditada anualmente, possui criptografia em repouso e em trânsito (TLS 1.3), DPO designado e oferece o portal de exercício de direitos do titular.' },
  { q: 'Como solicitar treinamento para minha equipe?', a: 'Use o canal "Solicitar Treinamento" abaixo ou envie um e-mail para suporte@govtech.gov.br. Oferecemos sessões mensais gratuitas e workshops in-company.' },
];

const tutoriais = [
  { title: 'Tour completo da plataforma', duration: '12:45', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
  { title: 'Mapa de calor: filtros e camadas', duration: '06:20', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
  { title: 'Análise de impacto legislativo', duration: '09:10', url: 'https://www.youtube.com/watch?v=aqz-KE-bpKQ' },
];

export default function CentralAjuda() {
  const [view, setView] = useState({ type: 'home' });
  const [search, setSearch] = useState('');
  const [openFaq, setOpenFaq] = useState(0);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSent, setTicketSent] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Protocolos', message: '' });

  const counts = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = articles.filter((a) => a.cat === c.id).length; });
    return map;
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return {
      articles: articles.filter((a) => a.title.toLowerCase().includes(q) || a.body.some((p) => p.toLowerCase().includes(q))),
      faqs: faqs.filter((f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)),
    };
  }, [search]);

  const popular = useMemo(() => [...articles].sort((a, b) => b.views - a.views).slice(0, 4), []);

  function openArticle(id) {
    const a = articles.find((x) => x.id === id);
    if (a) setView({ type: 'article', article: a });
  }
  function openCategory(id) {
    setView({ type: 'category', cat: id });
    setSearch('');
  }
  function backHome() {
    setView({ type: 'home' });
  }
  function submitTicket(e) {
    e.preventDefault();
    setTicketSent(true);
    setTimeout(() => {
      setTicketOpen(false);
      setTicketSent(false);
      setTicketForm({ subject: '', category: 'Protocolos', message: '' });
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-primary text-on-primary p-10 shadow-xl">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1920&q=70')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/85 to-primary/80" />
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,#316bf3,transparent_55%)]" />
        <div className="relative max-w-2xl mx-auto text-center">
          <span className="inline-block bg-secondary/20 text-secondary-fixed-dim text-[10px] font-bold tracking-[0.2em] px-2 py-1 rounded">
            CENTRAL DE AJUDA
          </span>
          <h2 className="text-headline-xl mt-3">Como podemos te ajudar?</h2>
          <p className="text-on-primary-container mt-2">
            Pesquise na base de conhecimento, assista a tutoriais ou fale com nossa equipe.
          </p>
          <div className="relative mt-6">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); if (view.type !== 'home') setView({ type: 'home' }); }}
              placeholder="Buscar artigos, perguntas ou tutoriais..."
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-on-surface placeholder:text-on-surface-variant outline-none focus:ring-2 focus:ring-secondary shadow-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                <Icon name="close" />
              </button>
            )}
          </div>
          <div className="flex justify-center gap-3 mt-3 text-xs text-on-primary-container flex-wrap">
            <span>Buscas frequentes:</span>
            {['protocolo', 'LGPD', 'integrações', 'créditos'].map((t) => (
              <button key={t} onClick={() => setSearch(t)} className="underline hover:text-on-primary">{t}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      {view.type !== 'home' && (
        <nav className="flex items-center gap-2 text-label-sm">
          <button onClick={backHome} className="text-secondary hover:underline font-semibold">Central de Ajuda</button>
          <Icon name="chevron_right" className="text-base text-on-surface-variant" />
          {view.type === 'category' && (
            <span className="text-on-surface">{categories.find((c) => c.id === view.cat).title}</span>
          )}
          {view.type === 'article' && (
            <>
              <button onClick={() => openCategory(view.article.cat)} className="text-secondary hover:underline font-semibold">
                {categories.find((c) => c.id === view.article.cat).title}
              </button>
              <Icon name="chevron_right" className="text-base text-on-surface-variant" />
              <span className="text-on-surface line-clamp-1">{view.article.title}</span>
            </>
          )}
        </nav>
      )}

      {/* Search Results */}
      {searchResults && (
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
          <h3 className="text-headline-md mb-1">Resultados para "{search}"</h3>
          <p className="text-on-surface-variant text-label-sm mb-5">
            {searchResults.articles.length} artigo(s) e {searchResults.faqs.length} pergunta(s) encontrados.
          </p>
          {searchResults.articles.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">ARTIGOS</p>
              <div className="space-y-2">
                {searchResults.articles.map((a) => (
                  <button key={a.id} onClick={() => { openArticle(a.id); setSearch(''); }} className="w-full text-left p-3 border border-outline-variant/40 rounded-lg hover:border-secondary hover:bg-surface-container-low/40 transition-all flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-on-surface text-sm">{a.title}</p>
                      <p className="text-[10px] text-on-surface-variant mt-0.5">
                        {categories.find((c) => c.id === a.cat).title} • {a.time} • {a.views.toLocaleString('pt-BR')} visualizações
                      </p>
                    </div>
                    <Icon name="arrow_forward" className="text-base text-secondary" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {searchResults.faqs.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-wider text-on-surface-variant mb-2">PERGUNTAS FREQUENTES</p>
              <div className="divide-y divide-outline-variant/40 border-y border-outline-variant/40">
                {searchResults.faqs.map((f, i) => (
                  <div key={i} className="py-3">
                    <p className="font-semibold text-on-surface text-sm">{f.q}</p>
                    <p className="text-body-md text-on-surface-variant mt-1">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {searchResults.articles.length === 0 && searchResults.faqs.length === 0 && (
            <p className="text-center py-8 text-on-surface-variant">
              Nenhum resultado encontrado. <button onClick={() => setTicketOpen(true)} className="text-secondary font-bold hover:underline">Abrir chamado</button> para falar com nossa equipe.
            </p>
          )}
        </div>
      )}

      {/* HOME */}
      {!searchResults && view.type === 'home' && (
        <>
          <div>
            <h3 className="text-headline-md text-primary mb-4">Navegue por categoria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
              {categories.map((c) => (
                <button key={c.id} onClick={() => openCategory(c.id)} className="text-left bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm hover:border-secondary hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center group-hover:bg-secondary group-hover:text-on-secondary transition-colors">
                      <Icon name={c.icon} />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider text-on-surface-variant bg-surface-container px-2 py-1 rounded">
                      {counts[c.id]} ARTIGOS
                    </span>
                  </div>
                  <h4 className="text-headline-md mt-4">{c.title}</h4>
                  <p className="text-on-surface-variant text-body-md mt-1">{c.desc}</p>
                  <span className="text-secondary font-bold text-label-sm flex items-center gap-1 mt-3">
                    Explorar <Icon name="arrow_forward" className="text-sm" />
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-gutter-md">
            <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
              <h3 className="text-headline-md flex items-center gap-2 mb-5">
                <Icon name="quiz" className="text-secondary" /> Perguntas Frequentes
              </h3>
              <div className="divide-y divide-outline-variant/40 border-y border-outline-variant/40">
                {faqs.map((f, i) => {
                  const open = openFaq === i;
                  return (
                    <div key={f.q}>
                      <button onClick={() => setOpenFaq(open ? -1 : i)} className="w-full flex items-center justify-between py-4 text-left hover:text-secondary transition-colors">
                        <span className="font-semibold text-on-surface">{f.q}</span>
                        <Icon name={open ? 'remove' : 'add'} className="text-base text-secondary" />
                      </button>
                      {open && <p className="pb-4 text-body-md text-on-surface-variant leading-relaxed">{f.a}</p>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 p-4 rounded-xl bg-secondary/5 border border-secondary/20 flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <Icon name="help" className="text-secondary text-2xl" />
                  <div>
                    <p className="font-semibold text-on-surface">Não encontrou o que procurava?</p>
                    <p className="text-xs text-on-surface-variant">Nossa equipe responde em até 2 horas úteis.</p>
                  </div>
                </div>
                <button onClick={() => setTicketOpen(true)} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:opacity-90">Abrir Chamado</button>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-4 space-y-gutter-md">
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
                <h3 className="font-bold text-on-surface flex items-center gap-2 mb-4">
                  <Icon name="trending_up" className="text-secondary text-base" /> Artigos Populares
                </h3>
                <div className="space-y-3">
                  {popular.map((p, i) => (
                    <button key={p.id} onClick={() => openArticle(p.id)} className="w-full text-left flex gap-3 group">
                      <span className="w-7 h-7 rounded-lg bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-on-surface group-hover:text-secondary transition-colors">{p.title}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                          <Icon name="schedule" className="text-xs" /> {p.time} • {p.views.toLocaleString('pt-BR')} visualizações
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider text-emerald-700">TODOS OS SISTEMAS OPERACIONAIS</span>
                </div>
                <p className="text-sm text-on-surface">API: <strong>99,98%</strong> uptime • Última verificação há 30s</p>
                <a href="https://status.govtech.gov.br" target="_blank" rel="noreferrer" className="text-secondary text-xs font-bold hover:underline mt-2 inline-flex items-center gap-1">
                  Ver status page completo <Icon name="open_in_new" className="text-sm" />
                </a>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-headline-md text-primary flex items-center gap-2">
                <Icon name="smart_display" className="text-secondary" /> Tutoriais em Vídeo
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
              {tutoriais.map((t) => (
                <a key={t.title} href={t.url} target="_blank" rel="noreferrer" className="block bg-surface-container-lowest border border-outline-variant/40 rounded-2xl overflow-hidden shadow-sm hover:border-secondary group transition-colors">
                  <div className="relative h-40 bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                    <Icon name="play_circle" className="text-5xl text-white opacity-90 group-hover:scale-110 transition-transform" />
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">{t.duration}</span>
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-on-surface">{t.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">Tutorial oficial GovTech</p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <ContactBar onTicket={() => setTicketOpen(true)} />
        </>
      )}

      {/* CATEGORY */}
      {!searchResults && view.type === 'category' && (
        <CategoryView
          category={categories.find((c) => c.id === view.cat)}
          articles={articles.filter((a) => a.cat === view.cat)}
          onArticle={openArticle}
        />
      )}

      {/* ARTICLE */}
      {!searchResults && view.type === 'article' && (
        <ArticleView
          article={view.article}
          category={categories.find((c) => c.id === view.article.cat)}
          related={articles.filter((a) => a.cat === view.article.cat && a.id !== view.article.id).slice(0, 3)}
          onArticle={openArticle}
          onTicket={() => setTicketOpen(true)}
        />
      )}

      {/* Ticket Modal */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setTicketOpen(false)}>
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            {ticketSent ? (
              <div className="text-center py-8">
                <Icon name="check_circle" className="text-5xl text-emerald-500" />
                <h3 className="text-headline-md mt-3">Chamado registrado!</h3>
                <p className="text-on-surface-variant mt-1">Nossa equipe responderá em até 2 horas úteis.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-headline-md flex items-center gap-2">
                    <Icon name="support_agent" className="text-secondary" /> Abrir Chamado
                  </h3>
                  <button onClick={() => setTicketOpen(false)} className="text-on-surface-variant hover:text-on-surface">
                    <Icon name="close" />
                  </button>
                </div>
                <form onSubmit={submitTicket} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">ASSUNTO</label>
                    <input required value={ticketForm.subject} onChange={(e) => setTicketForm((f) => ({ ...f, subject: e.target.value }))} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary" placeholder="Descreva o problema em poucas palavras" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">CATEGORIA</label>
                    <select value={ticketForm.category} onChange={(e) => setTicketForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary">
                      {categories.map((c) => <option key={c.id}>{c.title}</option>)}
                      <option>Outro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-wider text-on-surface-variant block mb-1">MENSAGEM</label>
                    <textarea required rows="5" value={ticketForm.message} onChange={(e) => setTicketForm((f) => ({ ...f, message: e.target.value }))} className="w-full px-3 py-2 border border-outline-variant rounded-lg outline-none focus:border-secondary resize-none" placeholder="Detalhe o que está acontecendo..." />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button type="button" onClick={() => setTicketOpen(false)} className="px-4 py-2 border border-outline-variant rounded-lg font-bold text-label-sm">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-secondary text-on-secondary rounded-lg font-bold text-label-sm hover:opacity-90">Enviar Chamado</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryView({ category, articles, onArticle }) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
          <Icon name={category.icon} className="text-2xl" />
        </div>
        <div>
          <h2 className="text-headline-lg text-primary">{category.title}</h2>
          <p className="text-on-surface-variant">{category.desc} — {articles.length} artigos disponíveis.</p>
        </div>
      </div>
      <div className="space-y-2">
        {articles.map((a) => (
          <button key={a.id} onClick={() => onArticle(a.id)} className="w-full text-left p-4 border border-outline-variant/40 rounded-xl hover:border-secondary hover:bg-surface-container-low/40 transition-all flex items-center justify-between group">
            <div className="flex items-start gap-3">
              <Icon name="article" className="text-secondary text-base mt-0.5" />
              <div>
                <p className="font-semibold text-on-surface group-hover:text-secondary transition-colors">{a.title}</p>
                <p className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-3">
                  <span className="flex items-center gap-1"><Icon name="schedule" className="text-xs" /> {a.time}</span>
                  <span className="flex items-center gap-1"><Icon name="visibility" className="text-xs" /> {a.views.toLocaleString('pt-BR')}</span>
                </p>
              </div>
            </div>
            <Icon name="arrow_forward" className="text-base text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

function ArticleView({ article, category, related, onArticle, onTicket }) {
  const [helpful, setHelpful] = useState(null);

  return (
    <div className="grid grid-cols-12 gap-gutter-md">
      <article className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-7 shadow-sm">
        <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider text-secondary bg-secondary/10 px-2 py-1 rounded">
          <Icon name={category.icon} className="text-sm" /> {category.title.toUpperCase()}
        </span>
        <h1 className="text-headline-xl text-primary mt-3">{article.title}</h1>
        <div className="flex items-center gap-4 text-xs text-on-surface-variant mt-3 pb-5 border-b border-outline-variant/40">
          <span className="flex items-center gap-1"><Icon name="schedule" className="text-sm" /> {article.time} de leitura</span>
          <span className="flex items-center gap-1"><Icon name="visibility" className="text-sm" /> {article.views.toLocaleString('pt-BR')} visualizações</span>
          <span className="flex items-center gap-1"><Icon name="update" className="text-sm" /> Atualizado recentemente</span>
        </div>
        <div className="prose max-w-none mt-6 space-y-4 text-on-surface leading-relaxed">
          {article.body.map((p, i) => <p key={i}>{p}</p>)}
        </div>

        <div className="mt-8 pt-6 border-t border-outline-variant/40">
          {helpful === null ? (
            <>
              <p className="text-sm font-semibold text-on-surface mb-3">Este artigo foi útil?</p>
              <div className="flex gap-2">
                <button onClick={() => setHelpful(true)} className="px-4 py-2 border border-outline-variant rounded-lg text-label-sm font-bold hover:border-emerald-500 hover:text-emerald-600 flex items-center gap-2">
                  <Icon name="thumb_up" className="text-base" /> Sim
                </button>
                <button onClick={() => setHelpful(false)} className="px-4 py-2 border border-outline-variant rounded-lg text-label-sm font-bold hover:border-error hover:text-error flex items-center gap-2">
                  <Icon name="thumb_down" className="text-base" /> Não
                </button>
              </div>
            </>
          ) : helpful ? (
            <p className="text-sm text-emerald-600 font-semibold flex items-center gap-2"><Icon name="check_circle" /> Obrigado pelo feedback!</p>
          ) : (
            <div className="bg-surface-container-low/50 rounded-xl p-4">
              <p className="text-sm font-semibold mb-2">Sentimos muito que não tenha ajudado.</p>
              <button onClick={onTicket} className="px-4 py-2 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold">Abrir chamado</button>
            </div>
          )}
        </div>
      </article>

      <aside className="col-span-12 lg:col-span-4 space-y-gutter-md">
        <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
          <h4 className="font-bold text-on-surface mb-3">Artigos relacionados</h4>
          <div className="space-y-2">
            {related.map((r) => (
              <button key={r.id} onClick={() => onArticle(r.id)} className="w-full text-left p-3 border border-outline-variant/40 rounded-lg hover:border-secondary group transition-colors">
                <p className="text-sm font-semibold text-on-surface group-hover:text-secondary">{r.title}</p>
                <p className="text-[10px] text-on-surface-variant mt-0.5">{r.time}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-secondary/5 border border-secondary/20 rounded-2xl p-5">
          <Icon name="support_agent" className="text-secondary text-2xl" />
          <p className="font-bold text-on-surface mt-2">Precisa de mais ajuda?</p>
          <p className="text-xs text-on-surface-variant mt-1 mb-3">Nosso time responde em até 2h úteis.</p>
          <button onClick={onTicket} className="w-full py-2 bg-secondary text-on-secondary rounded-lg text-label-sm font-bold hover:opacity-90">Abrir Chamado</button>
        </div>
      </aside>
    </div>
  );
}

function ContactBar({ onTicket }) {
  return (
    <div className="bg-primary text-on-primary rounded-2xl p-6 shadow-xl">
      <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
        <div>
          <h3 className="font-bold text-lg">Fale com a nossa equipe</h3>
          <p className="text-on-primary-container text-sm">Escolha o canal que preferir — estamos disponíveis em horário comercial.</p>
        </div>
        <span className="bg-emerald-500/15 text-emerald-300 text-[10px] font-bold tracking-wider px-2 py-1 rounded flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> EQUIPE ONLINE
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ContactCard icon="chat" title="Chat ao Vivo" desc="Resposta em até 2 min" cta="Iniciar Conversa" highlighted onClick={onTicket} />
        <ContactCard icon="mail" title="E-mail Suporte" desc="suporte@govtech.gov.br" cta="Enviar Mensagem" href="mailto:suporte@govtech.gov.br" />
        <ContactCard icon="call" title="Telefone 0800" desc="0800 707 1234 • 8h-20h" cta="Ligar Agora" href="tel:08007071234" />
      </div>
    </div>
  );
}

function ContactCard({ icon, title, desc, cta, highlighted, onClick, href }) {
  const btnClass = highlighted
    ? 'bg-secondary text-on-secondary'
    : 'bg-surface-container border border-outline-variant text-on-surface';
  const Btn = href ? 'a' : 'button';
  const props = href ? { href } : { onClick };
  return (
    <div className="bg-primary-container/60 border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <span className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary-fixed-dim flex items-center justify-center">
          <Icon name={icon} />
        </span>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-[10px] text-on-primary-container">{desc}</p>
        </div>
      </div>
      <Btn {...props} className={`w-full block text-center py-2.5 rounded-lg text-label-sm font-bold ${btnClass} hover:opacity-90 transition-opacity`}>
        {cta}
      </Btn>
    </div>
  );
}
