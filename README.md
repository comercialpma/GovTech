# GovTech

Repositório principal do projeto **GovTech**. Este repositório serve como base para o desenvolvimento de soluções voltadas para gestão e inovação tecnológica governamental.

## Sobre o Projeto

O objetivo do GovTech é fornecer ferramentas robustas, acessíveis e escaláveis para facilitar os processos operacionais e administrativos no contexto governamental.

## Pré-requisitos

Para contribuir ou rodar o projeto localmente, certifique-se de ter as seguintes ferramentas instaladas:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (Versão LTS recomendada)
- Gerenciador de pacotes (`npm` ou `yarn`)

## Como Instalar

Clone o repositório na sua máquina local:

```bash
git clone https://github.com/comercialpma/GovTech.git
cd GovTech
npm install
```

## Sistema de Commits e Contribuição

Este projeto utiliza um rigoroso padrão de commits baseado no **Conventional Commits**. As mensagens de commit são automaticamente validadas através de ferramentas como **Husky** e **Commitlint** antes de serem aceitas.

### Padrão de Commits

Sua mensagem de commit deve seguir o formato:
`<tipo>[escopo opcional]: <descrição>`

Exemplos:
- `feat: adiciona componente de login`
- `fix(header): corrige alinhamento no mobile`
- `docs: atualiza readme.md`
- `chore: atualiza dependências`

### Tipos Permitidos

- `feat`: Uma nova funcionalidade.
- `fix`: Uma correção de bug.
- `docs`: Apenas mudanças na documentação.
- `style`: Alterações de formatação de código (espaços em branco, formatação, etc).
- `refactor`: Uma mudança no código que não corrige bugs nem adiciona features.
- `perf`: Mudança focada em melhorar o desempenho.
- `test`: Adição de testes ou correção de testes existentes.
- `build`: Mudanças que afetam o sistema de build ou dependências externas.
- `ci`: Mudanças nos arquivos e scripts de configuração de CI.
- `chore`: Outras mudanças que não modificam arquivos de `src` ou `test`.
- `revert`: Reverte um commit anterior.

### Como commitar facilmente (Commitizen)

Em vez de usar `git commit`, você pode utilizar o comando `npm run commit` (ou `npx cz`). Ele abrirá um menu interativo ajudando você a formatar a mensagem de commit corretamente.

```bash
git add .
npm run commit
```

## Histórico de Versão

| Versão | Data | Descrição | Autor |
| :---: | :---: | :--- | :--- |
| **1.0.0** | 27/05/2026 | Inicialização do projeto, criação do README e configuração do sistema de commits (Husky, Commitlint, Commitizen). | Equipe GovTech |
| **1.1.0** | 28/05/2026 | Adiciona módulo de Desempenho Legislativo (Vereadores) e Pesquisa de Opinião. | Equipe GovTech |
| **1.2.0** | 28/05/2026 | Adiciona módulo de Inteligência Política com rastreamento real do Instagram, raspagem autenticada de seguidores e importação CSV. | Equipe GovTech |

> **Nota:** Para mais detalhes sobre as alterações, consulte o arquivo [CHANGELOG.md](CHANGELOG.md) (caso seja gerado posteriormente por ferramentas de CI/CD).

## Pendências para ativar Disparos Reais (Centro de Comando)

O **Motor de Comunicação Multicanal** está 100% codificado (frontend + Cloud Function `dispatchCampaign`), mas opera em **modo simulação** por padrão. Para habilitar disparos reais via WhatsApp / SMS / Push / E-mail, é necessário concluir as etapas abaixo:

### 1. Deploy da Cloud Function

```bash
firebase deploy --only functions:dispatchCampaign
```

### 2. Configurar os 8 secrets no Firebase

```bash
firebase functions:secrets:set META_WA_TOKEN       # Bearer da Meta WhatsApp Cloud API
firebase functions:secrets:set META_WA_PHONE_ID    # PHONE_NUMBER_ID do WhatsApp Business
firebase functions:secrets:set TWILIO_SID          # Account SID da Twilio
firebase functions:secrets:set TWILIO_TOKEN        # Auth Token da Twilio
firebase functions:secrets:set TWILIO_FROM         # Número remetente (formato E.164)
firebase functions:secrets:set FCM_PROJECT_ID      # Project ID do Firebase Cloud Messaging
firebase functions:secrets:set SENDGRID_KEY        # API Key do SendGrid
firebase functions:secrets:set SENDGRID_FROM       # E-mail remetente verificado
```

### 3. Contas e credenciais nos provedores

| Provedor | Pré-requisito |
| :--- | :--- |
| **Meta WhatsApp** | Meta Business Manager + WhatsApp Business Account + template aprovado pela Meta |
| **Twilio SMS** | Conta ativa com saldo + número remetente provisionado e habilitado para BR |
| **Firebase FCM** | Já incluído no projeto Firebase atual |
| **SendGrid** | Conta com domínio verificado e Single Sender Authentication concluída |

### 4. Popular a coleção `cidadaos` no Firestore

A Cloud Function resolve os destinatários a partir do Firestore. Estrutura mínima esperada para cada documento:

```json
{
  "nome": "Mariana Souza",
  "telefone": "+5531999990000",
  "email": "mariana@exemplo.com",
  "fcmToken": "<token-fcm-opcional>",
  "bairro": "Centro",
  "vereadorId": "ap"
}
```

### 5. Atribuir roles aos usuários autorizados

Apenas usuários com `role` em `[vereador, admin_municipal, admin_estadual, admin_master]` podem invocar `dispatchCampaign`. Use a Cloud Function `setCustomRole` (já existente) para atribuir o papel correto via Admin SDK.

### Verificação

- O histórico de disparos mostra um campo `backend: 'firebase'` quando o envio foi real e `backend: 'simulation'` quando caiu no fallback de demonstração.
- Toda campanha disparada é auditada na coleção `campanhas/{id}` do Firestore com `callerUid`, `callerRole`, `summary` por canal, `delivered`, `failed` e `cost`.
- Em caso de falha de algum provedor, os demais canais selecionados continuam sendo executados (graceful degradation).

## Pendências para ativar Raspagem Real do Instagram (Inteligência Política)

O módulo **Inteligência Política** já obtém dados públicos do perfil (seguidores, posts, foto, verificação) em tempo real via API pública do Instagram. Porém, a **lista de seguidores** exige autenticação — o endpoint `friendships/{user_id}/followers/` retorna 401/403 para chamadas anônimas. Há duas alternativas implementadas e uma de produção:

### Alternativas já funcionais na UI

1. **Cookie de sessão (`sessionid`)** — usuário cola o cookie de sua própria sessão do Instagram no campo da UI. A função `fetchInstagramFollowersReal()` injeta o cookie no header e pagina a lista real (até 200 seguidores por execução). Instruções "Como obter?" disponíveis na própria interface.
2. **Importação de CSV** — upload de planilha exportada pelo Meta Business Suite ou ferramenta oficial. O parser identifica colunas `nome`, `username`, `cidade`, `engajamento` automaticamente.

### Pendência para automatizar em produção (sem cookie manual)

Para ambiente produtivo, é necessário implementar uma das abordagens abaixo:

| Abordagem | Custo | Complexidade | Risco de bloqueio |
| :--- | :--- | :--- | :--- |
| **Meta Graph API (oficial)** | Gratuito | Alto (requer Business Account + revisão Meta) | Nenhum |
| **Backend com Puppeteer/Playwright** | Servidor próprio | Médio | Alto (anti-bot do Meta) |
| **Provedor terceiro (RapidAPI, ScrapingBee)** | US$ 50-500/mês | Baixo | Médio |

A recomendação é integrar a **Meta Graph API** via Instagram Business Account vinculada à Page do Facebook do parlamentar (acesso apenas aos próprios seguidores, mas 100% legal e estável).

### Configuração do proxy Vite (já incluído)

O `vite.config.js` já contém um proxy `/ig-api` que injeta os headers corretos (`X-IG-App-ID` + User-Agent de browser) para contornar CORS em desenvolvimento local. Em produção, a chamada deve ser feita pela Cloud Function `fetchInstagramData` (a ser implementada).

## Próximos Passos (Roadmap)

- [ ] Implementar Cloud Function `fetchInstagramData` para raspagem server-side com cache no Firestore.
- [ ] Integrar Meta Graph API para perfis Business com Instagram conectado.
- [ ] Conectar `dispatchCampaign` aos provedores reais via secrets.
- [ ] Adicionar dashboard de auditoria de campanhas disparadas.
- [ ] Implementar análise de sentimento das menções via OpenAI/Cohere.
- [ ] Criar fluxo de aprovação de campanhas (workflow multi-etapas).

---
Feito pela equipe GovTech!
