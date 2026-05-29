# GovTech — Plataforma Integrada de Gestão Municipal

**Versão Atual:** 1.3.0
**Município Piloto:** Contagem-MG

A plataforma GovTech é uma solução web abrangente e responsiva voltada à gestão pública municipal, com ênfase em transparência, inteligência política, comunicação oficial multicanal e governança de dados (LGPD). Este documento serve como referência técnica e gerencial, consolidando as diretrizes do Produto (PRD) e as utilidades operacionais de cada módulo do sistema.

---

## 1. Product Requirements Document (PRD)

### 1.1 Visão Geral e Escopo
O objetivo principal da plataforma é centralizar dados de gestão, ferramentas de comunicação com cidadãos e métricas de desempenho em um único portal governamental. A aplicação foi concebida para modernizar a relação entre o poder legislativo, o poder executivo e os cidadãos, minimizando a burocracia e aumentando a eficiência administrativa.

### 1.2 Público-Alvo e Multi-tenancy
O sistema opera através de um controle de acesso baseado em papéis (Role-Based Access Control - RBAC) em cinco níveis:
- **Cidadão:** Acesso ao portal do cidadão, ouvidoria, indicadores públicos e impostômetro.
- **Vereador / Parlamentar:** Funcionalidades do cidadão acrescidas de painel de mandato (kanban), inteligência política e gestão de protocolos.
- **Administrador Municipal:** Visão gerencial sobre comunicações (Centro de Comando), gestão global de usuários e configurações da prefeitura.
- **Administrador Estadual:** Consolidação de múltiplos municípios.
- **Administrador Master:** Controle absoluto sobre parâmetros do sistema, revogação de acessos e atribuições de infraestrutura.

### 1.3 Casos de Uso Críticos
- Acompanhamento em tempo real das finanças públicas (Impostômetro).
- Disparo de comunicações oficiais em massa ou segmentadas.
- Rastreamento de solicitações e protocolos urbanos via mapa de calor.
- Acompanhamento do mandato parlamentar com painéis ágeis.

---

## 2. Arquitetura e Stack Técnica

O projeto adota uma arquitetura Serverless suportada pelo ecossistema Firebase e Google Cloud. O frontend foi desenvolvido para garantir alta performance e manutenibilidade.

**Frontend:**
- Framework: React 18.3
- Build Tool: Vite 5.4
- Estilização: Tailwind CSS 3.4 (Design System focado no Material 3)
- Roteamento: React Router v6
- Mapeamento: Leaflet / react-leaflet 4

**Backend e Persistência:**
- Autenticação: Firebase Auth (E-mail/Senha, futura integração OAuth2 Gov.br)
- Banco de Dados: Firestore
- Armazenamento: Cloud Storage
- Serverless Computing: Cloud Functions v6 (southamerica-east1)
- Armazenamento Local Híbrido: `localStorage` (preferências e dados transientes)

---

## 3. Diretrizes de Apresentação e Módulos Detalhados

As diretrizes abaixo definem como cada módulo deve ser apresentado ao usuário final ou durante demonstrações do sistema.

### 3.1 Módulo de Autenticação e Segurança
**Utilidade:** Porta de entrada segura ao ecossistema.
- **Apresentação:** Tela imersiva com plano de fundo da prefeitura e overlay em SVG animado. 
- **Recursos Detalhados:** Integração direta com Firebase Auth. Tratamento explícito de erros como bloqueio por tentativas excessivas e credenciais inválidas. Recuperação de senha automatizada via e-mail. Exibição condicional da logo do município. Suporte a "Lembrar de mim".

### 3.2 Observatório de Indicadores (Dashboard Principal)
**Utilidade:** Apresentação macroeconômica e demográfica da região.
- **Apresentação:** Interface orientada a dados, composta por gráficos e tabelas responsivas.
- **Recursos Detalhados:** Integração com a API SIDRA do IBGE. Fornecimento em tempo real de população, IDH e PIB. Opção nativa para geração de relatórios consolidados em formato PDF.

### 3.3 Gestão Georreferenciada (Radar)
**Utilidade:** Identificar pontos de concentração de solicitações públicas.
- **Apresentação:** Mapa interativo de ampla escala focado nos limites geográficos do município.
- **Recursos Detalhados:** Integração de heatmap baseado nas demandas por bairro. Marcadores interativos de parlamentares ativos em suas respectivas bases eleitorais.

### 3.4 Inteligência Política e Parlamentar
**Utilidade:** Municiar o representante com dados analíticos sobre sua atuação e presença pública.
- **Apresentação:** Interface segmentada com visualização de métricas comparativas.
- **Recursos Detalhados:** 
  - Radar de Sinergia (alinhamento estratégico, alcance e sentimento).
  - Rastreamento de métricas sociais públicas (API proxy do Instagram e análises via DuckDuckGo/Wikipedia).
  - Feed de notícias consolidado (RSS de jornais locais).
  - Painel de mandato operado em arquitetura Kanban (arrastar e soltar sem dependências adicionais).

### 3.5 Centro de Comando Multicanal
**Utilidade:** Plataforma oficial de disparos de utilidade pública ou informes políticos.
- **Apresentação:** Painel de coordenação avançada, exigindo clareza na exposição do alcance estimado e custos envolvidos.
- **Recursos Detalhados:** Suporte planejado para WhatsApp Cloud API (Meta), SMS (Twilio), Push (FCM) e E-mail (SendGrid). Segmentação robusta por bairro, categoria e engajamento.

### 3.6 Gestão de Protocolos
**Utilidade:** Tramitação de solicitações do cidadão até a sua resolução.
- **Apresentação:** Tabela de dados (Data Table) paginada e filtrável.
- **Recursos Detalhados:** Sistema de status rigoroso (Aberto a Arquivado) e níveis de prioridade. Histórico de auditoria para cada alteração no protocolo. Exportação tabular em formato CSV homologado (UTF-8 com BOM).

### 3.7 Gestão de Usuários e Conformidade LGPD
**Utilidade:** Administração segura do banco de cidadãos cadastrados e registro de logs imutáveis.
- **Apresentação:** Lista padronizada com mascaramento de dados sensíveis aplicado por padrão.
- **Recursos Detalhados:** Mascaramento de CPF em interface. Fluxo de exclusão de conta acompanhado de termo de consentimento explícito. Trilha de auditoria blindada para rastreamento de ações administrativas de alto impacto.

### 3.8 Impostômetro da Arrecadação
**Utilidade:** Transparência financeira extrema ao cidadão.
- **Apresentação:** Contador financeiro operando em frequências de sub-segundos, gerando percepção visual de fluxo constante.
- **Recursos Detalhados:** Análise estratificada por tipo de imposto (IPTU, ISS, ITBI, etc.). Disponibilização de um repositório centralizado para o download de relatórios fiscais e leis complementares.

### 3.9 TopBar e Navegação Operacional
**Utilidade:** Acesso rápido a utilidades globais de sistema sem perder o contexto do módulo atual.
- **Recursos Detalhados:** Suporte a geração de relatórios rápidos a qualquer momento, visualização de diretrizes estratégicas e motor de notificações tipadas em tempo real.

---

## 4. Integrações de API e Serviços Externos

O sistema faz uso de múltiplos endpoints para alimentar seus processos:

- **IBGE Sidra:** Alimentação dos indicadores socioeconômicos do Dashboard.
- **RSS2JSON:** Consumo de fontes RSS locais.
- **BrasilAPI CNPJ:** Validações governamentais.
- **Meta WhatsApp Cloud API / Twilio / SendGrid:** Serviços alocados para o disparador de campanhas e autenticados por meio de Cloud Secret Manager.

---

## 5. Diretrizes de Infraestrutura e Implantação

### 5.1 Requisitos de Ambiente
- Node.js versão LTS (18+).
- Instância Firebase configurada (Auth, Firestore, Storage e Functions ativados).

### 5.2 Inicialização do Ambiente Local
```bash
git clone https://github.com/comercialpma/GovTech.git
cd GovTech
npm install
npm run dev
```

### 5.3 Compilação e Deploy (Produção)
Para empacotar a aplicação com variáveis adequadas (requer configuração do arquivo `.env.production` e `firebase.json`):
```bash
npm run build
firebase deploy --only hosting
```

*Nota para Deployers:* Segredos de Cloud Functions devem ser provisionados estritamente através do comando `firebase functions:secrets:set` para evitar a exposição de chaves privadas em repositórios estáticos.

---

## 6. Padronização de Controle de Versão

O repositório impõe o uso da especificação **Conventional Commits**, fiscalizada localmente pelas ferramentas Husky e Commitlint.
Para submeter modificações:
```bash
git add .
npm run commit
```

As categorias aceitas seguem os rigorosos padrões da indústria corporativa: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`.

---

GovTech Solutions. Todos os direitos reservados. 
Para maiores informações sobre licenciamento e restrições de uso, consulte a documentação legal no diretório interno ou nos painéis administrativos.
