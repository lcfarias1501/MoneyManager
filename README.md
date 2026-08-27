# MoneyManager

Painel pessoal para organizar economias: entradas, custos fixos, gastos
variáveis, metas de poupança, evolução do patrimônio e limites por categoria —
com um espaço reservado para dicas diárias geradas por IA (Claude) numa fase
seguinte.

🔗 **Produção:** https://money-manager-delta-five.vercel.app

---

# 📖 Como usar o app

## 1. Entrar

Abra o site e digite seu e-mail em **Entrar**. Você recebe um **link mágico** por
e-mail (sem senha) — clique nele e pronto, está dentro. Seus dados são privados:
só você, logado, enxerga as suas informações.

> Para sair: clique no **avatar** (a inicial do seu e-mail, no canto superior
> direito) → **Sair da conta**.

## 2. Monte sua base do mês (o mais importante primeiro)

Antes de lançar o dia a dia, cadastre o que se repete todo mês. Clique no botão
**+** (topo direito) → **Item fixo**:

- **Entradas recorrentes** — salário, renda fixa, etc.
- **Custos fixos** — aluguel, contas, assinaturas, faculdade...

Com isso o app calcula sua **Base líquida do mês** = entradas fixas − custos
fixos. É o quanto você tem, por mês, antes de gastar no dia a dia.

## 3. Crie suas categorias (e defina orçamentos)

Categorias classificam seus gastos (lazer, mercado, transporte...). Crie por:

- Botão **+** → **Categoria**, **ou**
- No card **“Gasto real por tipo”** → botão **Categorias** (⚙️), onde também dá
  para **editar** e **excluir**.

Ao criar uma categoria de gasto **variável**, você pode definir um **orçamento
mensal** (ex.: Lazer 200 €). Esse valor alimenta a tabela **Limites de gastos por
categoria**.

> Grupos de categoria: **Fixo** (obrigatório) ou **Variável** (livre). Só as
> variáveis contam no “disponível para gastar” e nos orçamentos.

## 4. Lance seus gastos e entradas do dia a dia

Botão **+** → **Lançamento**. Escolha **Gasto** ou **Entrada**, informe o valor,
a data, a categoria e (opcional) uma descrição e o pote afetado. Cada lançamento
atualiza **na hora**:

- **Disponível p/ gastar** (quanto sobra no mês)
- O donut de **gasto por tipo**
- Os **limites por categoria**
- O indicador de **saúde** (quanto por dia)

> Seus últimos lançamentos aparecem no card **“Lançamentos recentes”**, onde dá
> para **editar** (lápis) ou **excluir** (lixeira).

## 5. Acompanhe seu patrimônio (potes)

“Potes” são reservas separadas do seu dinheiro: **Principal, Poupança, Viagem,
Reserva de emergência**... o que quiser.

1. Botão **+** → **Pote/conta**. Dê um nome, cor e, se for uma meta, um valor-alvo.
2. Para desenhar a curva de evolução, registre o saldo em datas diferentes:
   botão **+** → **Atualizar saldo** (ou o ícone 🔄 no pote).

Com pelo menos **dois registros de saldo**, o gráfico **Evolução do patrimônio**
mostra se você está crescendo ou encolhendo ao longo do tempo.

## 6. Leia os indicadores-chave

- **Base líquida do mês** — sua folga mensal antes dos gastos livres.
- **Disponível p/ gastar** — base + entradas extras − gastos variáveis do mês.
- **Você pode gastar X/dia** — disponível ÷ dias que faltam no mês. Gastando até
  esse valor por dia, você fecha o mês dentro da meta.
- **Limites por categoria** — para cada categoria com orçamento: quanto já usou
  (valor e %), o **status** (Normal / Atenção / No limite / Estourado) e a **ação
  recomendada**.

## 7. Navegue por meses

No topo, use as setas **◀ ▶** ou clique no **mês** para abrir o seletor: navegue
por ano e escolha qualquer mês na grade, ou **“Ir para o mês atual”**. Todos os
números do painel se ajustam ao mês selecionado.

## 8. Tema claro/escuro

Botão de **sol/lua** no topo alterna o tema — sua preferência fica salva.

---

## 💡 Fluxo recomendado

1. Cadastre **itens fixos** (salário + custos obrigatórios).
2. Crie **categorias** variáveis com **orçamento** (Lazer, Mercado, Transporte...).
3. (Opcional) Crie **potes** e registre os saldos atuais.
4. No dia a dia, lance seus **gastos** pelo botão **+**.
5. Uma vez por semana/mês, **atualize os saldos** dos potes.

## 🗺️ Em breve

- 📥 **Upload de extrato** — enviar Excel/PDF do banco e a IA insere as
  transações automaticamente (menos digitação manual).
- 🤖 **Dicas diárias às 9h** — o Claude entrega no topo um incentivo ou alerta
  no tom certo (via Anthropic API).

---

# 🛠️ Documentação técnica

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** (tokens de tema claro/escuro)
- **Recharts** (gráficos)
- **Supabase** (Postgres + Auth por magic link + RLS)
- Deploy: **Vercel** (`main` → produção, `dev` → preview)

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # preencha as chaves do Supabase
npm run dev                  # http://localhost:3000
npm run build                # build de produção
```

Variáveis (em `.env.local` e na Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

> Sem essas variáveis o app cai em **modo local** (sem login, dados só no
> navegador) — útil para desenvolvimento rápido.

## Banco de dados

Rode `supabase/schema.sql` no SQL Editor do Supabase. Cria as tabelas
(`buckets`, `balance_snapshots`, `categories`, `fixed_items`, `transactions`) e
as políticas de **RLS** (cada usuário só acessa `user_id = auth.uid()`).

No Supabase → **Authentication → URL Configuration**, adicione os domínios em
**Redirect URLs** (`http://localhost:3000/**` e o domínio `.vercel.app/**`).

## Arquitetura de dados

A persistência fica atrás de um `Repository` (`src/lib/data/repository.ts`):

- `localStorageRepository` — modo local (blob no navegador).
- `supabaseRepository` (`src/lib/supabase/repository.ts`) — por usuário, com RLS.

O store (`src/lib/data/store.tsx`) calcula o próximo estado e chama
`repo.apply(prev, next)`; o repositório do Supabase faz o *diff* e gera
`upsert`/`delete` por linha. Trocar de backend não muda a UI.

Todo o cálculo financeiro vive em `src/lib/finance.ts` (base líquida, disponível,
gasto por categoria, saúde/dia, evolução de patrimônio).

## Estrutura

```
src/
  app/            rotas (dashboard, /login, /auth/callback), layout, proxy de sessão
  components/
    dashboard/    Header, seções, gráficos, menus
    forms/        modais de criação/edição
    ui/           primitivos (Card, Button, Menu, Modal...)
  lib/
    data/         store + repository (local)
    supabase/     clients (browser/server) + repository (remoto)
    finance.ts    motor de cálculos
    types.ts      modelo de domínio
supabase/schema.sql   tabelas + RLS
```
