import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon.jsx';
import { useAuth } from '../hooks/useAuth.jsx';
import { useLogo } from '../hooks/useLogo.jsx';

const NOTIFICACOES_INICIAIS = [
  { id: 1, tipo: 'critico', icon: 'priority_high', titulo: 'Vazamento crítico em Petrolândia', desc: 'Protocolo #PRT-8870 escalado para COPASA.', hora: 'há 4 min', lida: false, link: '/protocolos?id=PRT-8870' },
  { id: 2, tipo: 'info', icon: 'campaign', titulo: 'Campanha entregue com sucesso', desc: '12.4k cidadãos notificados via WhatsApp.', hora: 'há 1h', lida: false, link: '/centro-comando' },
  { id: 3, tipo: 'sucesso', icon: 'check_circle', titulo: 'Protocolo PRT-8892 concluído', desc: 'Reparo de iluminação finalizado pela equipe.', hora: 'há 3h', lida: false, link: '/protocolos' },
  { id: 4, tipo: 'aviso', icon: 'forum', titulo: 'Nova menção na mídia', desc: 'O Tempo publicou matéria sobre obras na Av. João César.', hora: 'há 6h', lida: true, link: '/inteligencia' },
  { id: 5, tipo: 'info', icon: 'group_add', titulo: '142 novos cidadãos cadastrados', desc: 'Crescimento mensal de +12% na base.', hora: 'ontem', lida: true, link: '/usuarios' },
];

const INSIGHTS = [
  { icon: 'lightbulb', title: 'Picos de demanda em Saúde', text: 'Reclamações sobre UPA Eldorado triplicaram nas últimas 24h. Considere ação imediata.' },
  { icon: 'trending_up', title: 'Engajamento crescendo', text: 'Disparos por WhatsApp estão com CTR 38% acima da média do trimestre.' },
  { icon: 'schedule', title: 'Melhor horário de comunicação', text: 'Quartas-feiras às 18h registram o maior nível de leitura nas suas mensagens.' },
];

const DIRETRIZES = [
  { area: 'Saúde', meta: 'Reduzir tempo médio de atendimento em UBS para < 30 min', responsavel: 'Sec. Saúde', prazo: 'Q1/2026' },
  { area: 'Infraestrutura', meta: 'Recapear 200km de vias prioritárias', responsavel: 'Sec. Obras', prazo: 'Q2/2026' },
  { area: 'Transparência', meta: 'Publicar 100% dos contratos > R$ 100k em até 48h', responsavel: 'Controladoria', prazo: 'Contínuo' },
  { area: 'Educação', meta: 'Reformar 35 escolas municipais', responsavel: 'Sec. Educação', prazo: 'Q4/2025' },
];

const TENDENCIAS = [
  { tag: '#SaúdeContagem', mentions: '3.2k', delta: '+24%', tone: 'text-error' },
  { tag: '#ObrasNaCidade', mentions: '2.7k', delta: '+18%', tone: 'text-amber-600' },
  { tag: '#EducaçãoMunicipal', mentions: '1.9k', delta: '+9%', tone: 'text-emerald-600' },
  { tag: '#TransparênciaCMC', mentions: '1.4k', delta: '+12%', tone: 'text-secondary' },
  { tag: '#SegurançaPública', mentions: '1.1k', delta: '-3%', tone: 'text-on-surface-variant' },
];

const RELATORIOS_TB = [
  { nome: 'Relatório Mensal de Protocolos', desc: '178 protocolos, 73% resolvidos', formato: 'PDF' },
  { nome: 'Indicadores de Comunicação', desc: '12 campanhas, 124k disparos', formato: 'XLSX' },
  { nome: 'Auditoria de Acessos (LGPD)', desc: '1.284 eventos auditados', formato: 'PDF' },
  { nome: 'Performance dos Mandatos', desc: '23 vereadores, scoring completo', formato: 'PDF' },
];

const tipoTone = {
  critico: 'bg-error/10 text-error',
  aviso: 'bg-amber-100 text-amber-700',
  info: 'bg-secondary/10 text-secondary',
  sucesso: 'bg-emerald-100 text-emerald-700',
};

export default function TopBar({ title = 'Portal do Cidadão', collapsed }) {
  const { user, logout } = useAuth();
  const [logo] = useLogo();
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null); // 'notif' | 'avatar' | 'diretrizes' | 'tendencias' | 'relatorios' | 'insights'
  const ref = useRef(null);
  const [notificacoes, setNotificacoes] = useState(NOTIFICACOES_INICIAIS);

  const unread = notificacoes.filter((n) => !n.lida).length;

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpenMenu(null); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function toggle(menu) { setOpenMenu((m) => (m === menu ? null : menu)); }

  function handleNotifClick(n) {
    setNotificacoes((arr) => arr.map((x) => x.id === n.id ? { ...x, lida: true } : x));
    setOpenMenu(null);
    if (n.link) navigate(n.link);
  }

  function marcarTodasLidas() {
    setNotificacoes((arr) => arr.map((n) => ({ ...n, lida: true })));
  }

  function baixarRelatorio(r) {
    setOpenMenu(null);
    const nomeArquivo = r.nome.replace(/\s+/g, '_');
    const dataGeracao = new Date().toLocaleString('pt-BR');

    if (r.formato === 'XLSX') {
      const BOM = '﻿';
      const linhas = [
        ['Relatório', r.nome],
        ['Descrição', r.desc],
        ['Gerado em', dataGeracao],
        ['Plataforma', 'GovTech — Contagem/MG'],
        [],
        ['Indicador', 'Valor'],
        ['Campanhas no período', '12'],
        ['Disparos totais', '124.380'],
        ['Taxa de entrega', '97,2%'],
        ['Taxa de leitura', '64,8%'],
        ['CTR médio', '18,4%'],
      ];
      const csv = BOM + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${nomeArquivo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="utf-8"><title>${r.nome}</title>
<style>
  body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#1a1a1a;max-width:780px;margin:40px auto;padding:0 32px;}
  header{border-bottom:3px solid #1a4d8f;padding-bottom:16px;margin-bottom:24px;}
  h1{color:#1a4d8f;font-size:22px;margin:0 0 4px;}
  .meta{color:#666;font-size:12px;}
  h2{color:#1a4d8f;font-size:14px;margin:28px 0 8px;border-left:4px solid #1a4d8f;padding-left:8px;}
  table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px;}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e5e5e5;}
  th{background:#f5f7fb;color:#1a4d8f;}
  footer{margin-top:48px;padding-top:16px;border-top:1px solid #ddd;color:#888;font-size:11px;text-align:center;}
  @media print{body{margin:0;}.no-print{display:none;}}
  .btn{background:#1a4d8f;color:#fff;border:0;padding:10px 18px;border-radius:8px;font-weight:700;cursor:pointer;}
</style></head><body>
<header>
  <h1>${r.nome}</h1>
  <div class="meta">${r.desc} · Gerado em ${dataGeracao} · GovTech — Prefeitura de Contagem/MG</div>
</header>
<h2>Resumo Executivo</h2>
<p style="font-size:13px;line-height:1.6;">Este relatório consolida os principais indicadores do período corrente, com base nos dados registrados na plataforma GovTech. Os números abaixo são atualizados em tempo real conforme novos eventos são auditados na trilha LGPD.</p>
<h2>Indicadores Principais</h2>
<table>
  <thead><tr><th>Métrica</th><th>Valor</th><th>Variação</th></tr></thead>
  <tbody>
    <tr><td>Protocolos abertos no período</td><td>178</td><td style="color:#16a34a;">+12%</td></tr>
    <tr><td>Resolvidos no SLA</td><td>130 (73%)</td><td style="color:#16a34a;">+4 p.p.</td></tr>
    <tr><td>Tempo médio de resposta</td><td>2,4 dias</td><td style="color:#16a34a;">−0,3 dia</td></tr>
    <tr><td>Cidadãos ativos</td><td>32.481</td><td style="color:#16a34a;">+8%</td></tr>
    <tr><td>Vereadores engajados</td><td>23 de 25</td><td style="color:#16a34a;">+2</td></tr>
  </tbody>
</table>
<h2>Distribuição por Categoria</h2>
<table>
  <thead><tr><th>Categoria</th><th>Quantidade</th><th>% do total</th></tr></thead>
  <tbody>
    <tr><td>Infraestrutura urbana</td><td>62</td><td>34,8%</td></tr>
    <tr><td>Saúde</td><td>41</td><td>23,0%</td></tr>
    <tr><td>Iluminação pública</td><td>28</td><td>15,7%</td></tr>
    <tr><td>Educação</td><td>22</td><td>12,4%</td></tr>
    <tr><td>Outros</td><td>25</td><td>14,1%</td></tr>
  </tbody>
</table>
<h2>Observações</h2>
<p style="font-size:13px;line-height:1.6;">Dados consolidados a partir das fontes oficiais integradas (IBGE, Portal da Transparência, base interna). Este documento atende aos requisitos de transparência ativa previstos na Lei 12.527/2011.</p>
<footer>GovTech · Sistema Integrado de Gestão Municipal · Documento gerado automaticamente</footer>
<div class="no-print" style="text-align:center;margin-top:32px;">
  <button class="btn" onclick="window.print()">Imprimir / Salvar como PDF</button>
</div>
<script>setTimeout(function(){window.print();},400);</script>
</body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
      alert('Habilite pop-ups para gerar o relatório em PDF.');
      return;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
  }

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-container-padding z-40 shadow-sm transition-all duration-300 ${
        collapsed ? 'left-sidebar-collapsed' : 'left-sidebar-width'
      }`}
      style={{ left: collapsed ? '80px' : '280px' }}
      ref={ref}
    >
      <div className="flex items-center gap-6">
        {logo ? (
          <img src={logo} alt="Logo" className="h-9 w-auto max-w-[150px] object-contain" />
        ) : (
          <span className="text-primary font-extrabold text-lg tracking-tight">
            Gov<span className="text-secondary">Tech</span>
          </span>
        )}
        <span className="h-6 w-px bg-outline-variant" />
        <span className="text-headline-md font-extrabold text-on-surface">{title}</span>
        <div className="hidden md:flex items-center gap-2 ml-6 relative">
          <NavBtn label="Diretrizes" onClick={() => toggle('diretrizes')} active={openMenu === 'diretrizes'} />
          <NavBtn label="Tendências" onClick={() => toggle('tendencias')} active={openMenu === 'tendencias'} />
          <NavBtn label="Relatórios" onClick={() => toggle('relatorios')} active={openMenu === 'relatorios'} />

          {openMenu === 'diretrizes' && (
            <Dropdown title="Diretrizes Estratégicas" icon="flag">
              {DIRETRIZES.map((d) => (
                <div key={d.meta} className="p-3 border border-outline-variant/40 rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">{d.area}</span>
                    <span className="text-[10px] text-on-surface-variant">{d.prazo}</span>
                  </div>
                  <p className="font-semibold text-on-surface text-sm mt-2">{d.meta}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Responsável: {d.responsavel}</p>
                </div>
              ))}
            </Dropdown>
          )}
          {openMenu === 'tendencias' && (
            <Dropdown title="Tendências do Município (24h)" icon="trending_up">
              <p className="text-[10px] text-on-surface-variant mb-2">Hashtags com maior volume nas redes sociais.</p>
              {TENDENCIAS.map((t, i) => (
                <div key={t.tag} className="flex items-center justify-between p-2 hover:bg-surface-container-low rounded">
                  <span className="flex items-center gap-2 text-sm">
                    <span className="text-[10px] text-on-surface-variant w-4">#{i + 1}</span>
                    <span className="font-semibold text-on-surface">{t.tag}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs">
                    <span className="text-on-surface-variant">{t.mentions}</span>
                    <span className={`font-bold ${t.tone}`}>{t.delta}</span>
                  </span>
                </div>
              ))}
            </Dropdown>
          )}
          {openMenu === 'relatorios' && (
            <Dropdown title="Relatórios Rápidos" icon="summarize">
              {RELATORIOS_TB.map((r) => (
                <button key={r.nome} onClick={() => baixarRelatorio(r)} className="w-full text-left p-2 hover:bg-surface-container-low rounded flex items-center justify-between group">
                  <div>
                    <p className="font-semibold text-on-surface text-sm">{r.nome}</p>
                    <p className="text-[10px] text-on-surface-variant">{r.desc}</p>
                  </div>
                  <span className="flex items-center gap-1 text-secondary text-xs font-bold">
                    {r.formato} <Icon name="download" className="text-sm" />
                  </span>
                </button>
              ))}
            </Dropdown>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 relative">
        <button onClick={() => toggle('insights')} className={`bg-primary text-on-primary px-4 py-2 rounded-lg font-bold text-label-sm flex items-center gap-2 hover:opacity-90 transition-opacity ${openMenu === 'insights' ? 'ring-2 ring-secondary/40' : ''}`}>
          <Icon name="smart_toy" className="text-sm" /> Insights
        </button>

        {openMenu === 'insights' && (
          <Dropdown title="Insights da IA" icon="auto_awesome" align="right">
            <p className="text-[10px] text-on-surface-variant mb-2">Análise automática do estado da plataforma.</p>
            {INSIGHTS.map((i) => (
              <div key={i.title} className="p-3 border border-outline-variant/40 rounded-lg flex gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <Icon name={i.icon} className="text-base" />
                </div>
                <div>
                  <p className="font-semibold text-on-surface text-sm">{i.title}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{i.text}</p>
                </div>
              </div>
            ))}
          </Dropdown>
        )}

        <button onClick={() => toggle('notif')} className="relative p-2 hover:bg-surface-container-low rounded-full text-on-surface-variant">
          <Icon name="notifications" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>

        {openMenu === 'notif' && (
          <Dropdown title={`Notificações (${unread})`} icon="notifications" align="right" headerAction={unread > 0 ? { label: 'Marcar todas', onClick: marcarTodasLidas } : null}>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {notificacoes.length === 0 ? (
                <p className="text-center text-on-surface-variant text-sm py-6">Sem notificações</p>
              ) : (
                notificacoes.map((n) => (
                  <button key={n.id} onClick={() => handleNotifClick(n)} className={`w-full text-left p-3 rounded-lg hover:bg-surface-container-low flex gap-2 transition-colors ${!n.lida ? 'bg-secondary/5' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${tipoTone[n.tipo]}`}>
                      <Icon name={n.icon} className="text-base" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${!n.lida ? 'font-bold' : 'font-semibold'} text-on-surface`}>{n.titulo}</p>
                        {!n.lida && <span className="w-2 h-2 rounded-full bg-secondary flex-shrink-0" />}
                      </div>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">{n.desc}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1">{n.hora}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </Dropdown>
        )}

        <button onClick={() => toggle('avatar')} className="w-9 h-9 rounded-full border-2 border-outline-variant bg-secondary-container flex items-center justify-center text-xs font-bold text-on-secondary-container hover:border-secondary transition-colors">
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </button>

        {openMenu === 'avatar' && (
          <Dropdown title="Minha conta" icon="account_circle" align="right">
            <div className="p-3 border border-outline-variant/40 rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{user?.email?.split('@')[0] || 'Usuário'}</p>
                <p className="text-[10px] text-on-surface-variant truncate">{user?.email || '—'}</p>
              </div>
            </div>
            <div className="space-y-1 mt-2">
              <MenuItem icon="person" label="Meu perfil" onClick={() => { navigate('/configuracoes'); setOpenMenu(null); }} />
              <MenuItem icon="settings" label="Configurações" onClick={() => { navigate('/configuracoes'); setOpenMenu(null); }} />
              <MenuItem icon="help" label="Central de Ajuda" onClick={() => { navigate('/ajuda'); setOpenMenu(null); }} />
              <MenuItem icon="shield" label="Privacidade & LGPD" onClick={() => { navigate('/privacidade'); setOpenMenu(null); }} />
              <div className="border-t border-outline-variant/40 my-1" />
              <MenuItem icon="logout" label="Sair" onClick={logout} tone="text-error" />
            </div>
          </Dropdown>
        )}
      </div>
    </header>
  );
}

function NavBtn({ label, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-body-md transition-colors ${active ? 'bg-secondary/10 text-secondary font-bold' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'}`}
    >
      {label}
    </button>
  );
}

function Dropdown({ title, icon, children, align = 'left', headerAction }) {
  return (
    <div className={`absolute top-full mt-2 ${align === 'right' ? 'right-0' : 'left-0'} w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl z-50`}>
      <div className="p-3 border-b border-outline-variant/40 flex items-center justify-between">
        <p className="font-bold text-on-surface text-sm flex items-center gap-2"><Icon name={icon} className="text-secondary text-base" /> {title}</p>
        {headerAction && <button onClick={headerAction.onClick} className="text-[11px] text-secondary font-bold hover:underline">{headerAction.label}</button>}
      </div>
      <div className="p-3 space-y-2">
        {children}
      </div>
    </div>
  );
}

function MenuItem({ icon, label, onClick, tone = 'text-on-surface' }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-2 px-2 py-2 rounded hover:bg-surface-container-low text-sm ${tone}`}>
      <Icon name={icon} className="text-base text-on-surface-variant" />
      {label}
    </button>
  );
}
