import { useState } from 'react';
import Icon from '../components/Icon.jsx';

const sections = [
  { id: 'aceite', title: '1. Aceite dos Termos', body: [
    'Ao acessar ou utilizar a plataforma GovTech, o usuário declara ter lido, compreendido e concordado integralmente com estes Termos de Uso, bem como com a Política de Privacidade.',
    'O uso da plataforma é facultativo. Caso não concorde com qualquer cláusula, o usuário deve interromper imediatamente a utilização.',
  ]},
  { id: 'definicoes', title: '2. Definições', body: [
    'Plataforma: o sistema GovTech de gestão pública municipal e estadual, incluindo todas as suas interfaces web, móveis e APIs.',
    'Usuário: pessoa física que acessa a plataforma, podendo ser Cidadão, Vereador, Administrador Municipal, Administrador Estadual ou Administrador Master.',
    'Controlador: o município ou ente público contratante da plataforma, responsável pelas decisões sobre o tratamento de dados.',
    'Operador: a GovTech, responsável pela execução do tratamento de dados conforme instruções do Controlador.',
  ]},
  { id: 'cadastro', title: '3. Cadastro e Conta', body: [
    'O cadastro requer CPF válido, e-mail ativo e número de telefone celular. As informações fornecidas devem ser verdadeiras e atualizadas.',
    'O usuário é responsável pela guarda de suas credenciais. Recomenda-se ativar a autenticação em duas etapas (2FA).',
    'Contas inativas por mais de 24 meses podem ser arquivadas. Dados serão anonimizados conforme política de retenção.',
  ]},
  { id: 'uso', title: '4. Uso Permitido e Vedações', body: [
    'É permitido utilizar a plataforma para abrir protocolos, acompanhar demandas, interagir com representantes e acessar informações públicas.',
    'É vedado: (a) submeter conteúdo falso, ofensivo ou ilegal; (b) tentar acessar áreas restritas sem autorização; (c) realizar engenharia reversa, scraping não autorizado ou ataques de qualquer natureza; (d) utilizar a plataforma para fins comerciais sem contrato específico.',
    'O descumprimento pode resultar em suspensão imediata e responsabilização civil e criminal.',
  ]},
  { id: 'protocolos', title: '5. Protocolos e Prazos', body: [
    'Os prazos de resposta seguem a Lei de Acesso à Informação (Lei nº 12.527/2011): 20 dias corridos, prorrogáveis por mais 10.',
    'Protocolos classificados como "Crítico" possuem SLA reduzido de 48 horas.',
    'A veracidade das informações prestadas é de inteira responsabilidade do solicitante.',
  ]},
  { id: 'propriedade', title: '6. Propriedade Intelectual', body: [
    'Todo o código-fonte, marcas, layouts e materiais da plataforma são de propriedade da GovTech ou licenciados a ela.',
    'É vedada a reprodução, distribuição ou modificação sem autorização expressa por escrito.',
  ]},
  { id: 'limitacao', title: '7. Limitação de Responsabilidade', body: [
    'A GovTech envida seus melhores esforços para manter a plataforma disponível e segura, com SLA de 99,9% de uptime contratual.',
    'Não nos responsabilizamos por: (i) indisponibilidades decorrentes de força maior; (ii) condutas de terceiros que violem estes Termos; (iii) decisões administrativas tomadas a partir de dados inseridos na plataforma.',
  ]},
  { id: 'alteracoes', title: '8. Alterações dos Termos', body: [
    'Estes Termos podem ser atualizados periodicamente. Alterações relevantes serão comunicadas com 30 dias de antecedência por e-mail e notificação na plataforma.',
    'O uso continuado após a vigência das novas condições representa aceite tácito.',
  ]},
  { id: 'foro', title: '9. Lei Aplicável e Foro', body: [
    'Estes Termos são regidos pela legislação brasileira, em especial: Constituição Federal, Lei de Acesso à Informação (12.527/2011), Marco Civil da Internet (12.965/2014) e LGPD (13.709/2018).',
    'Fica eleito o foro da comarca da sede do município contratante para dirimir quaisquer controvérsias.',
  ]},
];

export default function Termos() {
  const [active, setActive] = useState('aceite');

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <section className="relative rounded-2xl overflow-hidden bg-primary text-on-primary p-8 shadow-xl">
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_80%_20%,#316bf3,transparent_55%)]" />
        <div className="relative">
          <span className="inline-block bg-secondary/20 text-secondary-fixed-dim text-[10px] font-bold tracking-[0.2em] px-2 py-1 rounded">
            DOCUMENTO LEGAL
          </span>
          <h2 className="text-headline-xl mt-3">Termos de Uso</h2>
          <p className="text-on-primary-container mt-2 max-w-3xl">
            Condições gerais que regem o uso da plataforma GovTech por todos os usuários. Em conformidade
            com a LGPD (Lei nº 13.709/2018), o Marco Civil da Internet e a Lei de Acesso à Informação.
          </p>
          <p className="text-xs text-on-primary-container/80 mt-3">
            Versão 2.4 • Vigente desde 01/01/{new Date().getFullYear()}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-12 gap-gutter-md">
        {/* TOC */}
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

        {/* Content */}
        <article className="col-span-12 lg:col-span-9 bg-surface-container-lowest border border-outline-variant/40 rounded-2xl p-8 shadow-sm space-y-8">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h3 className="text-headline-md text-primary">{s.title}</h3>
              <div className="mt-3 space-y-3 text-body-lg text-on-surface leading-relaxed">
                {s.body.map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </section>
          ))}

          <div className="mt-8 pt-6 border-t border-outline-variant/40 flex items-center justify-between flex-wrap gap-3">
            <p className="text-xs text-on-surface-variant flex items-center gap-2">
              <Icon name="verified" className="text-secondary" />
              Documento auditado por escritório jurídico especializado em direito digital.
            </p>
            <button onClick={() => window.print()} className="px-4 py-2 border border-outline-variant rounded-lg text-label-sm font-bold flex items-center gap-2 hover:bg-surface-container">
              <Icon name="download" className="text-base" /> Baixar PDF
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
