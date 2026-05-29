# GovTech — Plataforma Integrada de Gestão Municipal

**Versão atual:** `1.3.0` · **Município piloto:** Contagem-MG · **Stack:** React 18 + Vite 5 + Tailwind + Firebase

GovTech é uma plataforma completa de gestão pública municipal que integra **observatório de indicadores, comunicação multicanal com cidadãos, inteligência política, fiscalização tributária em tempo real e governança LGPD** em uma única solução web responsiva.

---

## Sumário

1. [Arquitetura](#arquitetura)
2. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
3. [Stack Técnica](#stack-técnica)
4. [Instalação e Execução](#instalação-e-execução)
5. [Roles e Multi-tenancy](#roles-e-multi-tenancy)
6. [APIs Externas Integradas](#apis-externas-integradas)
7. [Conformidade LGPD](#conformidade-lgpd)
8. [Pendências para Produção](#pendências-para-produção)
9. [Padrão de Commits](#padrão-de-commits)
10. [Histórico de Versões](#histórico-de-versões)

---

## Arquitetura

```
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

**Persistência híbrida:** dados de demonstração e preferências do usuário ficam em `localStorage` (sincronizados via `subscribe` pattern entre componentes); operações reais (auth, disparos, auditoria) usam Firestore + Cloud Functions.

---

## Módulos e Funcionalidades

### 🔐 Autenticação (Login)
- Login com e-mail/senha via Firebase Auth
- **Esqueci minha senha** funcional (`sendPasswordResetEmail`)
- **Acesso via Gov.br** (modal explicativo — OAuth2 pendente)
- **Lembrar de mim** com persistência do último e-mail
- Tratamento de erros por código Firebase (`wrong-password`, `user-not-found`, `too-many-requests`)
- Imagem de fundo da Prefeitura de Contagem-MG + overlay SVG animado com linhas tecnológicas
- Logo dinâmica (carrega a logo cadastrada nas Configurações)

### 📊 Observatório (Dashboard)
- Indicadores oficiais de Contagem-MG (população, PIB, IDH, IDHM)
- Integração com API do IBGE em tempo real (sidra.ibge.gov.br)
- PIB oficial hardcoded (devido a defasagem de 2 anos no IBGE)
- Gráficos SVG nativos (linha + barras)
- Exportação de relatório completo em PDF (window.print de página HTML formatada)
- Imagem de fundo institucional

### 🗺️ Mapa de Distribuição (Radar)
- Mapa Leaflet com heatmap de demandas por bairro
- Pins clicáveis vinculados ao vereador responsável pela região
- Link direto para o protocolo no painel de Gestão
- Cobertura completa do território de Contagem

### 👥 Vereadores
- Lista de 25 vereadores da Câmara Municipal de Contagem
- Filtros por partido, comissão e bairro de atuação
- **Sub-página: Pesquisa de Opinião** — criação de enquetes com gráfico de barras em tempo real
- **Sub-página: Minhas Atividades** — CRUD de atividades parlamentares públicas (visíveis ao cidadão)

### 🎯 Centro de Comando
- **Painel de Coordenação Legislativa**: CRUD completo de parlamentares aliados
- **Motor de Comunicação Multicanal**:
  - Disparos via WhatsApp Cloud API (Meta)
  - Disparos via SMS (Twilio)
  - Push notifications (Firebase Cloud Messaging)
  - E-mail transacional (SendGrid)
  - Segmentação por bairro, categoria, vínculo político
  - Modal de confirmação → progresso → histórico (com badge `firebase` ou `simulation`)
- **Análise de Impacto**: modal com 4 abas (Demográfico, Engajamento, Custo, ROI)

### 🧠 Inteligência Política
- **Radar Sinergia**: 3 KPIs (alinhamento, alcance, sentimento) + gráfico de barras + heatmap de menções + sugestões automáticas com botão "Gerar Minuta"
- **Imprensa Local**: agregador RSS de 6 jornais pré-cadastrados de Contagem (api.rss2json.com) — adicionar/remover fontes
- **Rastreamento Instagram**:
  - Perfil público em tempo real (foto via wsrv.nl proxy)
  - Lista de seguidores via cookie de sessão OU importação CSV OU amostra gerada (com badges REAL/CSV/AMOSTRA)
- **Análise de Fontes Públicas**: agregação de Wikipedia + DuckDuckGo + Google News sobre o alvo

### 📋 Gestão de Protocolos
- CRUD completo com filtros, busca e paginação
- Status: Aberto, Em Análise, Em Andamento, Resolvido, Arquivado
- Prioridade: Baixa, Média, Alta, Crítica
- Modais de detalhe e edição
- Exportação CSV com BOM UTF-8 (compatível com Excel)
- Auditoria de cada alteração

### 👤 Gestão de Usuários (População)
- 25 cidadãos cadastrados (base de demonstração)
- **Cadastro de novo usuário** (modal completo com CPF, telefone, bairro, categorias, vínculo político)
- Edição inline, exclusão com confirmação LGPD
- Filtros por bairro, categoria de interesse e status
- Vínculo a vereador responsável
- Estatísticas: total, novos no mês, região mais ativa
- Exportação CSV da base filtrada
- CPF mascarado por padrão (LGPD)

### 💰 Impostômetro Contagem
- Contador em tempo real (R$ 104,50/segundo, atualizado a cada 100ms)
- Donut chart com distribuição por tributo (ISS, IPTU, ITBI, etc.)
- 3 cards de score (Saúde, Educação, Infraestrutura) com modal "Ver Projetos"
- **Central de Transparência**:
  - Modal de Relatórios Fiscais (download por exercício)
  - Modal de Leis Tributárias (Lei Complementar Municipal vigente)
- Imagem de fundo institucional

### 🏛️ Painel do Mandato
- Kanban drag-and-drop nativo (HTML5, sem libs)
- 4 colunas: Backlog, Em Andamento, Em Revisão, Concluído
- Cards com prazo, responsável e prioridade

### 🌐 Portal do Cidadão
- Sugerir Ideia (modal multi-etapas)
- Enviar mensagem ao gabinete (com seletor de vereador)
- Transparência em Números (atualização em tempo real)
- Acompanhamento de protocolos

### ⚙️ Configurações (6 abas)
1. **Gerais** — dados do município, identidade
2. **Identidade Visual** — upload de logo (persistida e sincronizada via `useLogo`)
3. **Segurança** — políticas de senha, 2FA, sessão
4. **Notificações** — preferências por canal
5. **Integrações** — status das APIs externas
6. **Trilha de Auditoria** — log imutável de eventos LGPD
- Indicador `isDirty` quando há alterações não salvas

### 📚 Central de Ajuda
- 24 artigos organizados em 6 categorias
- FAQ pesquisável
- Abertura de ticket com modal

### 📑 Documentos Legais
- **Termos de Uso** — completos
- **Política de Privacidade** — LGPD com sumário lateral, 10 seções detalhadas, 6 direitos do titular, imagem de fundo
- **Ouvidoria** — formulário de contato funcional

### 🔝 TopBar (Barra Superior)
- 6 dropdowns 100% funcionais:
  - **Diretrizes Estratégicas** (4 metas com responsável/prazo)
  - **Tendências** (top 5 hashtags do município nas últimas 24h)
  - **Relatórios Rápidos** (gera PDF via print HTML formatado ou CSV/XLSX com BOM UTF-8)
  - **Insights IA** (3 análises automáticas)
  - **Notificações** (5 notificações tipadas, badge de não-lidas, marcar todas como lidas)
  - **Avatar** (perfil, configurações, ajuda, privacidade, logout)
- Click-outside automático via `useRef` + `mousedown`
- Navegação real via `useNavigate`

### 📌 Sidebar
- Menu lateral colapsável
- Suporte a sub-itens aninhados (ex.: Vereadores > Pesquisa de Opinião)
- Logo branca com filtro de contraste
- Botão "Novo Protocolo" global (via `NovoProtocoloProvider`)

---

## Stack Técnica

| Camada | Tecnologia |
| :--- | :--- |
| Frontend | React 18.3 + Vite 5.4 |
| Estilização | Tailwind CSS 3.4 (tema customizado Material 3) |
| Roteamento | React Router v6 (rotas aninhadas + ProtectedRoute) |
| Ícones | Material Symbols + lucide-react |
| Mapas | Leaflet + react-leaflet 4 + leaflet.heat |
| Auth/DB | Firebase Auth + Firestore + Cloud Storage |
| Backend | Cloud Functions v6 (`southamerica-east1`) com `defineSecret` |
| Push | Firebase Cloud Messaging |
| Persistência local | localStorage com event sync entre componentes |
| Drag-and-drop | HTML5 nativo (zero dependências) |
| Gráficos | SVG nativo (linha, barras, donut) |

---

## Instalação e Execução

### Pré-requisitos
- [Node.js](https://nodejs.org/) LTS (18+)
- [Git](https://git-scm.com/)

### Setup
```bash
git clone https://github.com/comercialpma/GovTech.git
cd GovTech
npm install
npm run dev      # http://localhost:5173
```

### Build para produção
```bash
npm run build
npm run preview  # testa o build localmente
```

### Cloud Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

---

## Roles e Multi-tenancy

A plataforma suporta 5 papéis com permissões granulares aplicadas em `ProtectedRoute`:

| Role | Acesso |
| :--- | :--- |
| `cidadao` | Portal do Cidadão, Vereadores, Impostômetro, Central de Ajuda |
| `vereador` | Tudo do cidadão + Painel do Mandato, Inteligência, Protocolos |
| `admin_municipal` | Tudo do vereador + Centro de Comando, Gestão de Usuários, Configurações |
| `admin_estadual` | Tudo do admin municipal + Radar Estadual |
| `admin_master` | Acesso total + atribuição de papéis via `setCustomRole` |

---

## APIs Externas Integradas

| API | Uso | Status |
| :--- | :--- | :--- |
| IBGE Sidra | População, PIB, IDH | ✅ Ativo |
| RSS2JSON | Agregação de jornais locais | ✅ Ativo |
| Instagram Web (público) | Perfil, foto, contadores | ✅ Ativo (com proxy CORS) |
| Wikipedia REST | Biografia de pessoas públicas | ✅ Ativo |
| DuckDuckGo Instant Answer | Resumos rápidos | ✅ Ativo |
| Google News | Menções na mídia | ✅ Ativo |
| BrasilAPI CNPJ | Consulta de empresas | ✅ Ativo |
| Meta WhatsApp Cloud API | Disparos WhatsApp | ⏳ Pendente secrets |
| Twilio | Disparos SMS | ⏳ Pendente secrets |
| SendGrid | E-mail transacional | ⏳ Pendente secrets |
| Firebase FCM | Push notifications | ⏳ Pendente projeto FCM |

---

## Conformidade LGPD

- ✅ Política de Privacidade completa com 10 seções (`/privacidade`)
- ✅ Termos de Uso (`/termos`)
- ✅ Canal de Ouvidoria (`/ouvidoria`)
- ✅ DPO designado (`dpo@govtech.gov.br`)
- ✅ CPF mascarado por padrão na Gestão de Usuários
- ✅ Confirmação LGPD em exclusões
- ✅ Trilha de Auditoria imutável (`Configurações > Auditoria`)
- ✅ Criptografia TLS 1.3 + AES-256
- ✅ Retenção de logs por 6 meses (Marco Civil)
- ✅ 6 direitos do titular operáveis via interface (art. 18 LGPD)

---

## Pendências para Produção

### 1. Disparos Reais (Motor de Comunicação)

O `dispatchCampaign` opera em **simulação** por padrão. Para ativar:

```bash
firebase deploy --only functions:dispatchCampaign

firebase functions:secrets:set META_WA_TOKEN       # Bearer Meta WhatsApp
firebase functions:secrets:set META_WA_PHONE_ID    # PHONE_NUMBER_ID
firebase functions:secrets:set TWILIO_SID
firebase functions:secrets:set TWILIO_TOKEN
firebase functions:secrets:set TWILIO_FROM         # E.164
firebase functions:secrets:set FCM_PROJECT_ID
firebase functions:secrets:set SENDGRID_KEY
firebase functions:secrets:set SENDGRID_FROM       # remetente verificado
```

Pré-requisitos por provedor:

| Provedor | Pré-requisito |
| :--- | :--- |
| Meta WhatsApp | Business Manager + template aprovado |
| Twilio | Saldo + número provisionado para BR |
| Firebase FCM | Projeto Firebase com FCM habilitado |
| SendGrid | Domínio verificado + Single Sender Auth |

### 2. Coleção `cidadaos` no Firestore

```json
{
  "nome": "Mariana Souza",
  "telefone": "+5531999990000",
  "email": "mariana@exemplo.com",
  "fcmToken": "<opcional>",
  "bairro": "Centro",
  "vereadorId": "ap"
}
```

### 3. Atribuição de Roles

Use a Cloud Function `setCustomRole` (já implantada) com o Admin SDK para conceder os papéis.

### 4. Raspagem Real do Instagram (Inteligência Política)

- **Cookie de sessão**: já operacional (`fetchInstagramFollowersReal()` — paginação até 200/exec)
- **CSV**: importação de planilhas do Meta Business Suite (parser automático)
- **Produção (recomendado)**: Meta Graph API via Instagram Business Account vinculada à Page do Facebook do parlamentar

### 5. Integração Gov.br (Login Único)

OAuth2 com SERPRO/DTI pendente de aprovação para cadastrar o município como aplicação oficial.

---

## Padrão de Commits

Conventional Commits validado por **Husky + Commitlint**.

Formato: `<tipo>[escopo opcional]: <descrição>`

Tipos aceitos: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

```bash
git add .
npm run commit   # menu interativo Commitizen
```

---

## Histórico de Versões

| Versão | Data | Descrição |
| :---: | :---: | :--- |
| **1.0.0** | 27/05/2026 | Inicialização, Husky + Commitlint + Commitizen |
| **1.1.0** | 28/05/2026 | Módulo de Desempenho Legislativo + Pesquisa de Opinião |
| **1.2.0** | 28/05/2026 | Inteligência Política com Instagram + CSV |
| **1.3.0** | 29/05/2026 | TopBar 100% funcional (6 dropdowns), Impostômetro real-time, Trilha de Auditoria LGPD em Configurações, Login redesenhado (foto Contagem + linhas SVG animadas + reset de senha), cadastro de novos usuários, relatórios PDF via print HTML, fundo institucional na Política de Privacidade |

---

## Roadmap

- [ ] Cloud Function `fetchInstagramData` (raspagem server-side com cache Firestore)
- [ ] Integração Meta Graph API (Instagram Business)
- [ ] Ativação dos provedores de disparo (WhatsApp/SMS/Push/E-mail)
- [ ] Dashboard de auditoria de campanhas
- [ ] Análise de sentimento via OpenAI/Cohere
- [ ] Workflow multi-etapas de aprovação de campanhas
- [ ] Integração Gov.br OAuth2
- [ ] App mobile (React Native)

---

Feito pela equipe **GovTech** 💙
