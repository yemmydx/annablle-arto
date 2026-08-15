import { createClient } from '@supabase/supabase-js'

// Клиент для фронтенда (браузер)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Серверный клиент с полным доступом (только для API routes и серверных компонентов)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Типы для TypeScript
export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  price_old: number | null
  category_id: string | null
  images: string[]
  in_stock: boolean
  is_new: boolean
  is_featured: boolean
  is_hidden: boolean
  created_at: string
  categories?: Category
  product_variants?: ProductVariant[]
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
}

export type ProductVariant = {
  id: string
  product_id: string
  size: string
  color: string | null
  stock_qty: number
}

export type Order = {
  id: string
  order_number: number
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  customer_name: string
  customer_phone: string
  customer_email: string | null
  city: string
  address: string
  delivery_method: string
  payment_method: string
  total_amount: number
  notes: string | null
  created_at: string
}

export type CartItem = {
  product: Product
  size: string
  color: string | null
  qty: number
}
