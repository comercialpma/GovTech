# GovTech

Repositório principal do projeto **GovTech**. Este repositório serve como base para o desenvolvimento de soluções voltadas para gestão e inovação tecnológica governamental.

## 🚀 Sobre o Projeto

O objetivo do GovTech é fornecer ferramentas robustas, acessíveis e escaláveis para facilitar os processos operacionais e administrativos no contexto governamental.

## 🛠 Pré-requisitos

Para contribuir ou rodar o projeto localmente, certifique-se de ter as seguintes ferramentas instaladas:

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/en/) (Versão LTS recomendada)
- Gerenciador de pacotes (`npm` ou `yarn`)

## 📦 Como Instalar

Clone o repositório na sua máquina local:

```bash
git clone https://github.com/comercialpma/GovTech.git
cd GovTech
npm install
```

## ✨ Sistema de Commits e Contribuição

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

---
Feito com 💻 e ☕ pela equipe GovTech!
