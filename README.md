# Annabelle Arto — Интернет-магазин

Next.js + Supabase + Tailwind CSS

## Быстрый старт

### 1. Установка зависимостей
```bash
npm install
```

### 2. Supabase
1. Создай аккаунт на [supabase.com](https://supabase.com) (бесплатно)
2. Создай новый проект
3. Зайди в SQL Editor и выполни `supabase-schema.sql` — создаст все таблицы
4. В Settings > API скопируй URL и ключи

### 3. Переменные окружения
```bash
cp .env.local.example .env.local
# Заполни .env.local своими ключами
```

### 4. Запуск
```bash
npm run dev
# Открой http://localhost:3000
```

### 5. Деплой на Vercel
```bash
npm install -g vercel
vercel
# Добавь переменные окружения в Vercel Dashboard
```

## Структура проекта

```
app/
  page.tsx              — Главная страница
  catalog/page.tsx      — Каталог товаров
  product/[slug]/       — Страница товара
  cart/page.tsx         — Корзина
  checkout/page.tsx     — Оформление заказа
  admin/                — Панель управления (защищена паролем)

components/
  store/                — Компоненты магазина
  admin/                — Компоненты админки

lib/
  supabase.ts           — Клиент Supabase + типы
  cart.ts               — Zustand хранилище корзины
  utils.ts              — Хелперы (форматирование цен, городa KZ, etc)
```

## Страницы (следующие шаги)

- [ ] `/catalog` — каталог с фильтрами по категории, цене, новинкам
- [ ] `/product/[slug]` — страница товара с выбором размера и добавлением в корзину
- [ ] `/cart` — корзина
- [ ] `/checkout` — оформление заказа с формой доставки
- [ ] `/admin` — добавление/редактирование товаров, просмотр заказов

## Платёжки (следующий этап)

- **Kaspi Pay** — регистрируйся на [kaspi.kz/business](https://kaspi.kz/business)
- **Freedom Pay** — работает через API, хорошая документация
- Временное решение: принимай заказы через форму, оплата на Kaspi номер вручную
