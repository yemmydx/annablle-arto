-- Категории товаров
create table categories (
  id uuid default gen_random_uuid() primary key,
  name varchar(100) not null,
  slug varchar(100) unique not null,
  description text,
  created_at timestamp with time zone default now()
);

-- Товары
create table products (
  id uuid default gen_random_uuid() primary key,
  name varchar(200) not null,
  slug varchar(200) unique not null,
  description text,
  price integer not null, -- в тенге (целые числа)
  price_old integer, -- старая цена для скидки
  category_id uuid references categories(id),
  images text[] default '{}', -- массив URL фото из Supabase Storage
  in_stock boolean default true,
  is_new boolean default false,
  is_featured boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Размеры и наличие
create table product_variants (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references products(id) on delete cascade,
  size varchar(10) not null, -- XS, S, M, L, XL, XXL, 3XL
  color varchar(50),
  stock_qty integer default 0,
  created_at timestamp with time zone default now()
);

-- Заказы
create table orders (
  id uuid default gen_random_uuid() primary key,
  order_number serial,
  status varchar(50) default 'pending', -- pending, paid, shipped, delivered, cancelled
  customer_name varchar(200) not null,
  customer_phone varchar(20) not null,
  customer_email varchar(200),
  city varchar(100) not null,
  address text not null,
  delivery_method varchar(50) default 'courier', -- courier, pickup, kazpost
  payment_method varchar(50) default 'kaspi', -- kaspi, halyk, card, cash
  total_amount integer not null, -- в тенге
  notes text,
  kaspi_payment_id varchar(200), -- ID транзакции от Kaspi
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Позиции заказа
create table order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name varchar(200) not null, -- сохраняем на случай удаления товара
  size varchar(10),
  color varchar(50),
  qty integer not null,
  price integer not null -- цена на момент заказа
);

-- Начальные категории
insert into categories (name, slug) values
  ('Комплекты', 'komplekty'),
  ('Пижамы', 'pijamy'),
  ('Боди', 'body'),
  ('Халаты', 'halaty'),
  ('Бюстгальтеры', 'byustgaltery'),
  ('Трусики', 'trusiki');

-- RLS политики (Row Level Security)
-- Товары и категории - читают все, пишет только сервис
alter table products enable row level security;
alter table categories enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table product_variants enable row level security;

create policy "Products are viewable by everyone" on products for select using (true);
create policy "Categories are viewable by everyone" on categories for select using (true);
create policy "Variants are viewable by everyone" on product_variants for select using (true);

-- Заказы создаёт кто угодно, читает только сервис (через service_role key)
create policy "Anyone can create orders" on orders for insert with check (true);
create policy "Anyone can create order items" on order_items for insert with check (true);

-- Функция обновления updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_products_updated_at before update on products
  for each row execute function update_updated_at();

create trigger update_orders_updated_at before update on orders
  for each row execute function update_updated_at();
