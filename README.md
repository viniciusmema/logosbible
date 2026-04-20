# Lógos — Estudos Bíblicos

Aplicação pessoal de estudos bíblicos com geração via IA. Para cada bloco de capítulos lido, gera um estudo completo com contexto histórico, autoria, estrutura literária, curiosidades culturais e seção devocional.

---

## Pré-requisitos

- [Node.js 18+](https://nodejs.org/)
- Uma chave de API da Anthropic → [console.anthropic.com](https://console.anthropic.com)

---

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar a chave de API

Crie um arquivo `.env.local` na raiz do projeto:

```bash
cp .env.local.example .env.local
```

Abra o `.env.local` e substitua pelo valor real:

```
ANTHROPIC_API_KEY=sk-ant-api03-sua-chave-aqui
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## Estrutura do projeto

```
logos-nextjs/
├── app/
│   ├── api/
│   │   └── study/
│   │       └── route.js       # Chamada à API da Anthropic (server-side)
│   ├── layout.jsx
│   └── page.jsx
├── components/
│   └── LogosApp.jsx           # Toda a UI da aplicação
├── .env.local.example
├── next.config.js
└── package.json
```

---

## Como funciona

- A UI roda no browser, os estudos ficam salvos no `localStorage`
- Quando você gera um estudo, a requisição vai para `/api/study` (server-side)
- O servidor chama a API da Anthropic com sua chave — ela nunca fica exposta no browser
- O estudo retorna em JSON estruturado e é salvo localmente

---

## Deploy (opcional)

O jeito mais simples é via [Vercel](https://vercel.com):

```bash
npm i -g vercel
vercel
```

Durante o deploy, adicione a variável `ANTHROPIC_API_KEY` nas configurações de ambiente do projeto na Vercel.

---

## Próximos passos sugeridos

- [ ] Exportar estudo como PDF
- [ ] Modo de busca entre estudos salvos
- [ ] Sincronização com banco de dados (para multi-dispositivo)
- [ ] Seleção de tradução por estudo
- [ ] Modo de leitura focado (fullscreen sem sidebar)
