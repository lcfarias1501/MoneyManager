-- MoneyManager — schema Supabase (Postgres)
-- Executar no SQL Editor do Supabase quando formos conectar.
-- Cada usuário só enxerga os próprios dados (Row Level Security por user_id).

-- ---------- Tabelas ----------
create table if not exists buckets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind text not null default 'custom' check (kind in ('principal','poupanca','meta','custom')),
  color text not null default 'var(--chart-3)',
  goal numeric,
  created_at timestamptz not null default now()
);

create table if not exists balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  bucket_id uuid not null references buckets (id) on delete cascade,
  date date not null,
  balance numeric not null,
  created_at timestamptz not null default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income','expense')),
  "group" text not null default 'variable' check ("group" in ('fixed','variable')),
  color text not null default 'var(--chart-1)',
  icon text,
  budget numeric,
  created_at timestamptz not null default now()
);

create table if not exists fixed_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('income','expense')),
  amount numeric not null,
  category_id uuid references categories (id) on delete set null,
  day_of_month int check (day_of_month between 1 and 31),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income','expense')),
  amount numeric not null,
  date date not null,
  category_id uuid references categories (id) on delete set null,
  bucket_id uuid references buckets (id) on delete set null,
  description text,
  created_at timestamptz not null default now()
);

-- Dica diária gerada por IA (uma por usuário por dia)
create table if not exists daily_tips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  message text not null,
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ---------- Índices ----------
create index if not exists idx_tx_user_date on transactions (user_id, date);
create index if not exists idx_tips_user_date on daily_tips (user_id, date);
create index if not exists idx_snap_user_bucket on balance_snapshots (user_id, bucket_id, date);
create index if not exists idx_cat_user on categories (user_id);
create index if not exists idx_fixed_user on fixed_items (user_id);

-- ---------- Row Level Security ----------
alter table buckets enable row level security;
alter table balance_snapshots enable row level security;
alter table categories enable row level security;
alter table fixed_items enable row level security;
alter table transactions enable row level security;
alter table daily_tips enable row level security;

-- Política padrão: dono é quem tem auth.uid() = user_id
do $$
declare t text;
begin
  foreach t in array array['buckets','balance_snapshots','categories','fixed_items','transactions','daily_tips']
  loop
    execute format('drop policy if exists "own_rows" on %I;', t);
    execute format(
      'create policy "own_rows" on %I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;
