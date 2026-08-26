# MoneyManager

Painel pessoal para organizar economias: entradas, custos fixos, gastos variáveis,
metas de poupança, evolução do patrimônio e limites por categoria — com um espaço
reservado para dicas diárias geradas por IA (Claude) numa fase seguinte.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (tokens de tema claro/escuro)
- **Recharts** (gráficos)
- **Supabase** (Postgres + Auth + RLS) — _a conectar_
- Deploy alvo: **Vercel**

## Como rodar

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de produção
```

## Arquitetura de dados (importante)

A camada de dados é **desacoplada** por trás de um adaptador
(`src/lib/data/storage.ts` → interface `StorageAdapter`).

- **Hoje:** `localStorageAdapter` — os dados ficam no navegador. Já dá para usar
  o app de verdade, sem dados falsos.
- **Depois:** criamos um `supabaseAdapter` implementando a mesma interface. O
  resto do app (`useData()`, componentes, cálculos) **não muda**.

Todo o cálculo financeiro vive em `src/lib/finance.ts` (base líquida, disponível,
gasto por categoria, saúde/dia, evolução de patrimônio).

## Seções do dashboard

1. **Entradas & Custos Fixos** → base líquida do mês
2. **Gastos variáveis / disponível** → quanto sobra para gastar
3. **Gasto real por tipo** → donut por categoria
4. **Evolução do patrimônio** → potes (Principal, Poupança, Viagem...) no tempo
5. **Indicadores de saúde** → quanto dá para gastar por dia
6. **Dica diária (co-piloto)** → placeholder; será gerada pelo Claude às 9h
7. **Limites por categoria** → orçamento, uso %, status e ação recomendada

## Próximos passos

1. Conectar Supabase (rodar `supabase/schema.sql`, preencher `.env.local` a
   partir de `.env.example`), criar o `supabaseAdapter` e a tela de login.
2. Ativar as **dicas diárias com IA** (Anthropic API) via cron às 9h.
3. Deploy na Vercel.
