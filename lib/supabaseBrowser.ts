import { createClient } from '@supabase/supabase-js'

// Безопасный клиент ТОЛЬКО для браузера (клиентских компонентов).
// Не тянет за собой supabaseAdmin с серверным ключом.
export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
