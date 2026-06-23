-- Table des commandes de paiement PayTech
create table if not exists payment_orders (
  id              uuid primary key default gen_random_uuid(),
  ref_command     text unique not null,
  university_id   uuid not null references universities(id) on delete cascade,
  plan            text not null,
  amount_fcfa     integer not null,
  status          text not null default 'pending', -- pending | paid | cancelled
  paid_at         timestamptz,
  created_at      timestamptz default now()
);

-- Index pour les lookups par ref_command (webhook IPN)
create index if not exists payment_orders_ref_command_idx on payment_orders(ref_command);
create index if not exists payment_orders_university_id_idx on payment_orders(university_id);

-- RLS : accessible uniquement via service_role (webhook + admin server)
alter table payment_orders enable row level security;
