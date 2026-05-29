# GovTech — Plataforma Integrada de Gestão Municipal

**Versão Atual:** 1.4.0
**Município Piloto:** Contagem-MG
**Stack:** React 18 + Vite 5 + Tailwind + Firebase

A plataforma GovTech é uma solução web abrangente e responsiva voltada à gestão pública municipal, com ênfase em transparência, inteligência política, comunicação oficial multicanal e governança de dados (LGPD). Este documento serve como referência técnica e gerencial, consolidando as diretrizes do Produto (PRD) e as utilidades operacionais de cada módulo do sistema.

---

## 1. Product Requirements Document (PRD)

### 1.1 Visão Geral e Escopo
O objetivo principal da plataforma é centralizar dados de gestão, ferramentas de comunicação com cidadãos e métricas de desempenho em um único portal governamental. A aplicação foi concebida para modernizar a relação entre o poder legislativo, o executivo e os cidadãos.

### 1.2 Público-Alvo e Multi-tenancy (Roles)
O sistema opera através de controle de acesso baseado em papéis (RBAC) com permissões granulares aplicadas em `ProtectedRoute`:

| Role | Acesso |
| :--- | :--- |
| `cidadao` | Portal do Cidadão, Vereadores, Impostômetro, Central de Ajuda |
| `vereador` | Tudo do cidadão + Painel do Mandato, Inteligência, Protocolos |
| `admin_municipal` | Tudo do vereador + Centro de Comando, Gestão de Usuários, Configurações |
| `admin_estadual` | Tudo do admin municipal + Radar Estadual |
| `admin_master` | Acesso total + atribuição de papéis via `setCustomRole` |

---

## 2. Arquitetura e Estrutura de Diretórios

```text
src/
├── components/      # Layout, Sidebar, TopBar, Icon, ProtectedRoute
├── pages/           # 20 páginas funcionais (rotas)
├── hooks/           # useAuth, useLogo, useNovoProtocolo
├── services/        # Integrações externas + persistência (Firebase + localStorage)
├── App.jsx          # Roteamento (React Router v6)
└── main.jsx         # Bootstrap

functions/           # Cloud Functions v6 (southamerica-east1)
├── index.js         # setCustomRole + dispatchCampaign
public/              # Assets estáticos (logo, contagem-bg.jpg)
```

**Persistência híbrida:** dados de demonstração e preferências do usuário ficam em `localStorage` (sincronizados via `subscribe` pattern); operações reais (auth, disparos, auditoria) usam Firestore + Cloud Functions.

---

## 3. Módulos e Funcionalidades (Diretrizes de Apresentação)

### 3.1 Autenticação e Segurança
**Utilidade:** Porta de entrada segura ao ecossistema.
- Login com e-mail/senha via Firebase Auth.
- Recuperação de senha funcional (`sendPasswordResetEmail`).
- Acesso via Gov.br (modal explicativo — OAuth2 pendente).
- Tratamento de erros por código Firebase (`wrong-password`, `user-not-found`, `too-many-requests`).
- Imagem de fundo institucional da Prefeitura com overlay SVG animado com linhas tecnológicas.

### 3.2 Observatório (Dashboard Principal)
**Utilidade:** Apresentação macroeconômica e demográfica da região.
- Indicadores oficiais do município (população, PIB, IDH, IDHM).
- Integração com API do IBGE em tempo real (sidra.ibge.gov.br).
- Gráficos SVG nativos (linha e barras).
- Exportação de relatório completo em PDF.

### 3.3 Mapa de Distribuição Georreferenciada (Radar)
**Utilidade:** Identificar concentrações de demandas no município.
- Mapa Leaflet com heatmap de demandas por bairro.
- Marcadores interativos de parlamentares em suas respectivas bases eleitorais.
- Link direto para o protocolo no painel de Gestão.

### 3.4 Gestão Legislativa (Vereadores)
**Utilidade:** Visão das autoridades atuantes e métricas do mandato.
- Lista completa dos vereadores da Câmara Municipal.
- Filtros por partido, comissão e bairro de atuação.
- **Pesquisa de Opinião:** criação de enquetes com gráfico de barras em tempo real.
- **Minhas Atividades:** CRUD de atividades parlamentares públicas.

### 3.5 Centro de Comando Multicanal
**Utilidade:** Motor unificado de comunicações e gestão da base aliada.
- **Painel de Coordenação Legislativa:** CRUD completo de parlamentares aliados.
- **Motor de Comunicação:**
  - Disparos via WhatsApp Cloud API (Meta), SMS (Twilio), Push notifications (FCM) e E-mail transacional (SendGrid).
  - Segmentação por bairro, categoria e vínculo político.
  - Histórico de envios (com indicativos visuais de simulação ou produção).
- **Análise de Impacto:** Modal analítico dividido em Demográfico, Engajamento, Custo e ROI.

### 3.6 Inteligência Política
**Utilidade:** Extração de insights a partir de dados públicos abertos e mídias sociais.
- **Radar Sinergia:** KPIs (alinhamento, alcance, sentimento), gráfico de barras e sugestões automáticas para "Gerar Minuta".
- **Imprensa Local:** Agregador RSS de jornais locais pré-cadastrados.
- **Rastreamento Instagram:** 
  - Extração do perfil público em tempo real e análise detalhada dos 10 melhores posts.
  - Extração rigorosa de Seguidores: *Deep Scan* de perfis (bio, contagem real, classificação) via proxy CORS customizado com injeção de Cookie (`X-Session-Id`), garantindo dados reais e transpondo bloqueios de navegadores.
  - Motor Heurístico: Análise semântica da biografia pública do seguidor para inferir cidade de atuação e interesses, exibindo N/D para dados não públicos a fim de manter a transparência da coleta.
  - Persistência: Histórico local de concorrentes salvos e retenção persistente do `sessionid`.
- **Análise de Fontes Públicas:** Agregação de dados via Wikipedia, DuckDuckGo e Google News.

### 3.7 Gestão de Protocolos
**Utilidade:** Acompanhamento resolutivo de processos.
- CRUD completo com filtros, busca e paginação.
- Modais de edição, categorização de prioridades (Baixa a Crítica) e status (Aberto a Arquivado).
- Exportação CSV com BOM UTF-8.
- Registro em trilha de auditoria para cada movimentação do protocolo.

### 3.8 Gestão de Usuários (População)
**Utilidade:** Administração da base demográfica do município.
- Cadastro, edição inline e exclusão de cidadãos.
- Filtros por bairro, interesse e vínculo político.
- Mascaramento de CPF ativado por padrão (conformidade LGPD).

### 3.9 Impostômetro Contagem (Transparência Fiscal)
**Utilidade:** Transparência radical da arrecadação em tempo real.
- Contador atualizado a cada 100ms.
- Distribuição por tributo estruturada em gráficos de rosca (Donut chart).
- Central de Transparência contendo relatórios fiscais para download e referências às Leis Tributárias (Lei Complementar Municipal vigente).

### 3.10 Painel do Mandato (Kanban)
**Utilidade:** Operacionalização do fluxo de trabalho dos gabinetes.
- Sistema Kanban nativo (HTML5 Drag-and-drop).
- Estrutura com colunas de Backlog, Em Andamento, Em Revisão e Concluído.
- Gestão de prazos, prioridades e responsáveis.

### 3.11 Portal do Cidadão e Documentos Legais
**Utilidade:** Interface dedicada para interação direta da população e regularidade jurídica.
- Sugerir ideias, envio de mensagens ao gabinete e acompanhamento de chamados.
- Termos de Uso completos e Política de Privacidade detalhada com 10 seções, garantindo os direitos do titular.
- Formulário de Ouvidoria.

### 3.12 TopBar e Sidebar
**Utilidade:** Navegação global rápida e notificações de sistema.
- 6 menus suspensos (Dropdowns): Diretrizes Estratégicas, Tendências, Relatórios Rápidos (PDF e CSV), Insights IA e Notificações avançadas.
- Sidebar colapsável com sub-itens aninhados e botão global de Novo Protocolo.

---

## 4. Integrações de APIs Externas

| API | Uso | Status |
| :--- | :--- | :--- |
| IBGE Sidra | População, PIB, IDH | Ativo |
| RSS2JSON | Agregação de jornais locais | Ativo |
| Instagram Web (público) | Perfil, foto, contadores | Ativo (proxy CORS) |
| Wikipedia REST | Biografia de pessoas públicas | Ativo |
| DuckDuckGo Instant Answer | Resumos rápidos | Ativo |
| Google News | Menções na mídia | Ativo |
| BrasilAPI CNPJ | Consulta de empresas | Ativo |
| Meta WhatsApp Cloud API | Disparos WhatsApp | Pendente secrets |
| Twilio | Disparos SMS | Pendente secrets |
| SendGrid | E-mail transacional | Pendente secrets |
| Firebase FCM | Push notifications | Pendente projeto FCM |

---

## 5. Conformidade LGPD e Auditoria

- Política de Privacidade com sumário lateral e especificação dos 6 direitos do titular (Art. 18 LGPD).
- Canal oficial de Ouvidoria e indicação clara de um Encarregado (DPO).
- Mascaramento padrão de CPFs.
- Confirmação explícita de riscos em exclusões no banco de dados.
- Trilha de Auditoria imutável acessível via painel de configurações.
- Criptografia de transporte TLS 1.3 + AES-256 e conformidade com retenção de logs do Marco Civil da Internet.

---

## 6. Pendências e Setup para Produção

### 6.1 Disparos Reais (Motor de Comunicação)
O serviço de disparo (`dispatchCampaign`) opera em modo de simulação por padrão. Para viabilizar a produção, configure os segredos na Google Cloud via Firebase CLI:

```bash
firebase deploy --only functions:dispatchCampaign

firebase functions:secrets:set META_WA_TOKEN
firebase functions:secrets:set META_WA_PHONE_ID
firebase functions:secrets:set TWILIO_SID
firebase functions:secrets:set TWILIO_TOKEN
firebase functions:secrets:set TWILIO_FROM
firebase functions:secrets:set FCM_PROJECT_ID
firebase functions:secrets:set SENDGRID_KEY
firebase functions:secrets:set SENDGRID_FROM
```

### 6.2 Atribuição de Roles em Ambiente Real
Para atribuir perfis superiores aos usuários, utilize a Cloud Function `setCustomRole` embarcada juntamente ao Admin SDK no ambiente de deploy.

### 6.3 Integração Gov.br (Login Único)
O protocolo OAuth2 junto ao SERPRO/DTI está pendente da tramitação legal para registro da prefeitura como entidade autorizada.

### 6.4 Inicialização de Ambiente (Desenvolvimento)
```bash
git clone https://github.com/comercialpma/GovTech.git
cd GovTech
npm install
npm run dev
```

### 6.5 Compilação de Produção
```bash
npm run build
npm run preview
firebase deploy --only hosting
```

---

## 7. Padronização de Commits (Versionamento)

O repositório é gerenciado através do framework **Conventional Commits**, fiscalizado pelas ferramentas Husky e Commitlint. 
O formato imperativo é exigido: `<tipo>[escopo opcional]: <descrição>`

Para submeter modificações com facilidade, utilize o utilitário interativo:
```bash
git add .
npm run commit
```

Tipos aceitos de modificação: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

---

## 8. Histórico de Versões

| Versão | Data | Descrição de Entrega |
| :---: | :---: | :--- |
| **1.0.0** | 27/05/2026 | Inicialização do projeto, arquitetura base, Husky + Commitlint + Commitizen configurados. |
| **1.1.0** | 28/05/2026 | Módulo de Desempenho Legislativo finalizado e Pesquisa de Opinião implementada. |
| **1.2.0** | 28/05/2026 | Expansão de Inteligência Política (Instagram Scraper, CSV Parsers). |
| **1.3.0** | 29/05/2026 | TopBar 100% funcional (6 dropdowns), Impostômetro em tempo real, Trilha de Auditoria LGPD, interface de autenticação reprojetada, exportação de PDFs governamentais, scripts de deploy autônomo e adaptação da identidade visual. |
| **1.4.0** | 29/05/2026 | Refinamento da Inteligência Política com Deep Scan de perfis no Instagram, inferência heurística de biografia (cidade/interesses), persistência do sessionid, injeção de cabeçalhos via proxy Vite para bypass de CORS, e histórico de alvos monitorados. |

---

## 9. Roadmap de Desenvolvimento Estratégico

- [ ] Implantação da Cloud Function `fetchInstagramData` para abstração da raspagem server-side e armazenamento otimizado no Firestore.
- [ ] Conclusão da integração oficial da Graph API (Meta) para Instagram Business.
- [ ] Ativação homologada dos canais de disparo (WhatsApp, SMS, Push, E-mail).
- [ ] Elaboração do Dashboard Analítico de Auditoria de Campanhas.
- [ ] Integração com Modelos de Linguagem Natural (OpenAI/Cohere) para processamento semântico e de sentimentos.
- [ ] Formalização do fluxo multi-etapas de aprovações hierárquicas de campanhas públicas.
- [ ] Autorização final para login via Gov.br (OAuth2).
- [ ] Lançamento de versão nativa do portal ciudadano (React Native).

---

Equipe de Desenvolvimento de Soluções Governamentais — GovTech.
Todos os direitos reservados.
