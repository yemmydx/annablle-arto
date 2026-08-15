export const revalidate = 0
import { supabase } from '@/lib/supabase'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import HomeClient from '@/components/store/HomeClient'

const SELECT = '*, categories(*), product_variants(*)'

export default async function HomePage() {
  // Ð˜Ð·Ð±Ñ€Ð°Ð½Ð½Ð¾Ðµ (is_featured). Ð•ÑÐ»Ð¸ Ñ‚Ð°ÐºÐ¸Ñ… Ð½ÐµÑ‚ â€” Ð¿Ð¾ÐºÐ°Ð·Ñ‹Ð²Ð°ÐµÐ¼ ÑÐ²ÐµÐ¶Ð¸Ðµ Ñ‚Ð¾Ð²Ð°Ñ€Ñ‹, Ñ‡Ñ‚Ð¾Ð±Ñ‹ Ð±Ð»Ð¾Ðº Ð½Ðµ Ð¿ÑƒÑÑ‚Ð¾Ð²Ð°Ð».
  let { data: featured } = await supabase
    .from('products')
    .select(SELECT)
    .eq('in_stock', true)
    .eq('is_featured', true).not('images', 'is', null).not('images', 'eq', '{}')
    .order('created_at', { ascending: false })
    .limit(8)

  if (!featured || featured.length === 0) {
    const res = await supabase
      .from('products')
      .select(SELECT)
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
      .limit(8)
    featured = res.data || []
  }

  // ÐÐ¾Ð²Ð¸Ð½ÐºÐ¸ (is_new)
  const { data: newProducts } = await supabase
    .from('products')
    .select(SELECT)
    .eq('in_stock', true)
    .eq('is_new', true).not('images', 'is', null).not('images', 'eq', '{}')
    .order('created_at', { ascending: false })
    .limit(8)

  // Ð¤Ð¾Ñ‚Ð¾ Ð´Ð»Ñ Ð¿Ð»Ð¸Ñ‚Ð¾Ðº ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¹. ÐšÐ°Ð¶Ð´Ð¾Ð¹ Ð¿Ð»Ð¸Ñ‚ÐºÐµ Ð½Ð° Ð³Ð»Ð°Ð²Ð½Ð¾Ð¹ ÑÐ¾Ð¾Ñ‚Ð²ÐµÑ‚ÑÑ‚Ð²ÑƒÐµÑ‚ Ð½Ð°Ð±Ð¾Ñ€ Ñ€ÐµÐ°Ð»ÑŒÐ½Ñ‹Ñ…
  // ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¹ Ð¸Ð· Ð‘Ð”. Ð‘ÐµÑ€Ñ‘Ð¼ ÑÐ»ÑƒÑ‡Ð°Ð¹Ð½Ñ‹Ð¹ Ñ‚Ð¾Ð²Ð°Ñ€ Ñ Ñ„Ð¾Ñ‚Ð¾ Ð¸Ð· ÑÑ‚Ð¸Ñ… ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¹ (Ð¼ÐµÐ½ÑÐµÑ‚ÑÑ Ð¿Ñ€Ð¸ Ð·Ð°Ð³Ñ€ÑƒÐ·ÐºÐµ).
  const CAT_TILE_GROUPS: Record<string, string[]> = {
    'lingerie-all': ['classic-lingerie', 'fashion-lingerie', 'seamless'], // Ð‘ÐµÐ»ÑŒÑ‘
    'pajamas': ['pajamas'],                                                // ÐŸÐ¸Ð¶Ð°Ð¼Ñ‹
    'bodysuit': ['bodysuit'],                                              // Ð‘Ð¾Ð´Ð¸
    'robes': ['robes'],                                                    // Ð¥Ð°Ð»Ð°Ñ‚Ñ‹
    'panties-all': ['panties', 'panties-cotton'],                         // Ð¢Ñ€ÑƒÑÐ¸ÐºÐ¸
  }
  const { data: pool } = await supabase
    .from('products')
    .select('images, categories(slug)')
    .eq('in_stock', true)
    .not('images', 'is', null)
    .limit(800)

  const withPhoto = (pool || []).filter(
    (p: any) => Array.isArray(p.images) && p.images.length > 0 && p.images[0]
  )
  const pick = (arr: any[]) => (arr.length ? arr[Math.floor(Math.random() * arr.length)] : null)

  const catImages: Record<string, string> = {}
  for (const [tile, slugs] of Object.entries(CAT_TILE_GROUPS)) {
    const matches = withPhoto.filter((p: any) => slugs.includes((p.categories as any)?.slug))
    const chosen = pick(matches.length ? matches : withPhoto)
    if (chosen) catImages[tile] = chosen.images[0]
  }

  return (
    <main>
      <Header />
      <HomeClient featured={featured || []} newProducts={newProducts || []} catImages={catImages} />
      <Footer />
    </main>
  )
}
