import { useState } from 'react';
import Icon from '../components/Icon.jsx';

const principios = [
  { icon: 'shield', title: 'Segurança', desc: 'Criptografia TLS 1.3 em trânsito e AES-256 em repouso.' },
  { icon: 'visibility_off', title: 'Minimização', desc: 'Coletamos apenas o estritamente necessário.' },
  { icon: 'fingerprint', title: 'Anonimização', desc: 'Estatísticas agregadas e dados anonimizados por padrão.' },
  { icon: 'gavel', title: 'Base Legal', desc: 'Tratamento baseado em obrigação legal e consentimento.' },
  { icon: 'history', title: 'Retenção', desc: 'Prazo definido por finalidade — descarte automático após expirado.' },
  { icon: 'admin_panel_settings', title: 'Governança', desc: 'DPO designado, comitê de privacidade e auditoria anual.' },
];

const direitos = [
  { icon: 'visibility', label: 'Confirmação e Acesso', desc: 'Confirmar se tratamos seus dados e obter cópia.' },
  { icon: 'edit', label: 'Correção', desc: 'Solicitar correção de dados incompletos, inexatos ou desatualizados.' },
  { icon: 'block', label: 'Anonimização ou Eliminação', desc: 'Pedir anonimização, bloqueio ou eliminação de dados desnecessários.' },
  { icon: 'sync_alt', label: 'Portabilidade', desc: 'Receber seus dados em formato estruturado e interoperável.' },
  { icon: 'do_not_disturb_on', label: 'Revogação', desc: 'Revogar consentimento a qualquer momento.' },
  { icon: 'support_agent', label: 'Petição à ANPD', desc: 'Apresentar reclamação à Autoridade Nacional de Proteção de Dados.' },
];

const sections = [
  { id: 'controlador', title: '1. Quem é o Controlador dos seus dados', body: [
    'O Município Contratante é o Controlador dos dados pessoais tratados na plataforma, conforme art. 5º, VI da LGPD. A GovTech atua como Operador, executando o tratamento exclusivamente segundo as instruções do Controlador.',
  ]},
  { id: 'dados', title: '2. Quais dados tratamos', body: [
    'Dados de identificação: nome completo, CPF, RG, data de nascimento.',
    'Dados de contato: e-mail, telefone, endereço residencial.',
    'Dados de uso: logs de acesso, IP, dispositivo, geolocalização (quando autorizada).',
    'Dados de protocolos: conteúdo, mídias anexadas, histórico de interações.',
    'Dados sensíveis (art. 5º, II LGPD): apenas quando estritamente necessário e com consentimento específico.',
  ]},
  { id: 'finalidades', title: '3. Para quê tratamos os dados', body: [
    'Cumprimento de obrigações legais (LAI, transparência ativa, prestação de contas).',
    'Atendimento de protocolos e demandas do cidadão.',
    'Comunicação institucional de utilidade pública.',
    'Análises estatísticas e indicadores agregados para planejamento de políticas públicas.',
    'Em nenhuma hipótese vendemos, alugamos ou cedemos dados pessoais a terceiros para fins comerciais.',
  ]},
  { id: 'bases', title: '4. Bases legais (art. 7º LGPD)', body: [
    'Cumprimento de obrigação legal ou regulatória (inciso II).',
    'Execução de políticas públicas pelo Poder Público (inciso III).',
    'Exercício regular de direitos em processos administrativos (inciso VI).',
    'Consentimento livre e informado para comunicações opcionais (inciso I).',
  ]},
  { id: 'compartilhamento', title: '5. Compartilhamento', body: [
    'Dados podem ser compartilhados com órgãos públicos integrados (Receita Federal, Tribunal de Contas, Ministério Público) estritamente para o cumprimento de obrigações legais.',
    'Operadores terceirizados (cloud, e-mail, SMS) atuam sob contrato de confidencialidade e DPA (Data Processing Agreement).',
  ]},
  { id: 'seguranca', title: '6. Medidas de segurança', body: [
    'Criptografia AES-256 em repouso e TLS 1.3 em trânsito.',
    'Autenticação em duas etapas obrigatória para administradores.',
    'Logs de acesso imutáveis com retenção de 5 anos para auditoria.',
    'Backups diários geograficamente distribuídos.',
    'Pentests anuais por empresa independente.',
    'Plano de resposta a incidentes com comunicação à ANPD em até 48h.',
  ]},
  { id: 'retencao', title: '7. Prazos de retenção', body: [
    'Dados de protocolos: 5 anos após o encerramento (Lei nº 8.159/1991 – Arquivos Públicos).',
    'Logs de acesso: 6 meses (Marco Civil da Internet, art. 15).',
    'Dados de cadastro: pelo período de vínculo + 5 anos para fins de prestação de contas.',
    'Após os prazos, dados são anonimizados ou eliminados de forma irreversível.',
  ]},
  { id: 'cookies', title: '8. Cookies e tecnologias similares', body: [
    'Utilizamos cookies essenciais (sessão e autenticação) e analíticos (anonimizados).',
    'Não há cookies publicitários ou de rastreamento entre sites.',
    'O usuário pode gerenciar preferências em "Configurações" → "Privacidade".',
  ]},
  { id: 'criancas', title: '9. Crianças e adolescentes', body: [
    'O tratamento de dados de menores de 18 anos exige consentimento específico de pelo menos um dos pais ou responsável, em conformidade com o art. 14 da LGPD.',
  ]},
  { id: 'dpo', title: '10. Encarregado (DPO) e Canal de Atendimento', body: [
    'Encarregado pelo Tratamento de Dados Pessoais (DPO): equipe designada pelo Município Contratante.',
    'Canal direto: dpo@govtech.gov.br | Telefone: 0800 707 1234',
    'Tempo médio de resposta a requisições do titular: 10 dias úteis (limite legal: 15 dias).',
  ]},
];

export default function Privacidade() {
  const [active, setActive] = useState('controlador');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden bg-primary text-on-primary p-8 shadow-xl">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,#316bf3,transparent_55%)]" />
        <div className="relative flex items-start justify-between flex-wrap gap-4">
          <div className="max-w-3xl">
            <span className="inline-block bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-[0.2em] px-2 py-1 rounded flex items-center gap-1.5 w-fit">
              <Icon name="verified_user" className="text-sm" /> 100% EM CONFORMIDADE COM A LGPD
            </span>
            <h2 className="text-headline-xl mt-3">Política de Privacidade</h2>
            <p className="text-on-primary-container mt-2">
              A plataforma GovTech trata dados pessoais em estrita observância à Lei Geral de Proteção
              de Dados (Lei nº 13.709/2018), à Constituição Federal, ao Marco Civil da Internet e às
              normativas da Autoridade Nacional de Proteção de Dados (ANPD).
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] tracking-wider text-on-primary-container">CERTIFICAÇÕES</p>
            <div className="flex gap-2 mt-1">
              <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold">ISO 27001</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold">ISO 27701</span>
              <span className="bg-white/10 px-2 py-1 rounded text-[10px] font-bold">SOC 2</span>
            </div>
          </div>
        </div>
      </section>

      {/* Princípios */}
      <div>
        <h3 className="text-headline-md text-primary mb-4">Nossos compromissos</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-gutter-md">
          {principios.map((p) => (
            <div key={p.title} className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-5 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <Icon name={p.icon} />
              </div>
              <p className="font-bold text-on-surface mt-3">{p.title}</p>
              <p className="text-xs text-on-surface-variant mt-1">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Direitos */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="text-headline-md text-emerald-800 flex items-center gap-2">
              <Icon name="how_to_reg" /> Seus direitos como titular (art. 18 LGPD)
            </h3>
            <p className="text-sm text-emerald-700 mt-1">
              A LGPD garante a você 9 direitos fundamentais sobre seus dados pessoais. Você pode exercê-los gratuitamente.
            </p>
          </div>
          <a href="mailto:dpo@govtech.gov.br?subject=Exercício de direitos LGPD" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-label-sm font-bold hover:opacity-90 flex items-center gap-2">
            <Icon name="send" className="text-base" /> Exercer meus direitos
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {direitos.map((d) => (
            <div key={d.label} className="bg-white rounded-xl p-4 border border-emerald-200">
              <div className="flex items-center gap-2">
                <Icon name={d.icon} className="text-emerald-600" />
                <p className="font-bold text-sm">{d.label}</p>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sumário + Conteúdo */}
      <div className="grid grid-cols-12 gap-gutter-md">
        <aside className="col-span-12 lg:col-span-3">
          <nav className="bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-3 shadow-sm sticky top-24">
            <p className="text-[10px] font-bold tracking-wider text-on-surface-variant px-3 py-2">SUMÁRIO</p>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActive(s.id)}
                className={`block px-3 py-2 rounded-lg text-label-sm transition-colors ${
                  active === s.id ? 'bg-secondary/10 text-secondary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="col-span-12 lg:col-span-9 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-8 shadow-sm space-y-8">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h3 className="text-headline-md text-primary">{s.title}</h3>
              <div className="mt-3 space-y-3 text-body-lg text-on-surface leading-relaxed">
                {s.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          ))}

          <div className="mt-8 pt-6 border-t border-outline-variant/40 grid grid-cols-1 md:grid-cols-3 gap-3">
            <a href="mailto:dpo@govtech.gov.br" className="p-4 rounded-xl border border-outline-variant/40 hover:border-secondary text-center group">
              <Icon name="mail" className="text-secondary text-2xl" />
              <p className="text-sm font-bold mt-2">DPO</p>
              <p className="text-xs text-on-surface-variant group-hover:text-secondary">dpo@govtech.gov.br</p>
            </a>
            <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="p-4 rounded-xl border border-outline-variant/40 hover:border-secondary text-center group">
              <Icon name="account_balance" className="text-secondary text-2xl" />
              <p className="text-sm font-bold mt-2">ANPD</p>
              <p className="text-xs text-on-surface-variant group-hover:text-secondary">gov.br/anpd</p>
            </a>
            <button onClick={() => window.print()} className="p-4 rounded-xl border border-outline-variant/40 hover:border-secondary text-center group">
              <Icon name="download" className="text-secondary text-2xl" />
              <p className="text-sm font-bold mt-2">Baixar PDF</p>
              <p className="text-xs text-on-surface-variant group-hover:text-secondary">Política completa</p>
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
