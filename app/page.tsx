export const revalidate = 0
import { supabase } from '@/lib/supabase'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import HomeClient from '@/components/store/HomeClient'

const SELECT = '*, categories(*), product_variants(*)'

export default async function HomePage() {
  // Избранное (is_featured). Если таких нет — показываем свежие товары, чтобы блок не пустовал.
  let { data: featured } = await supabase
    .from('products')
    .select(SELECT)
    .eq('in_stock', true)
    .eq('is_featured', true)
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

  // Новинки (is_new)
  const { data: newProducts } = await supabase
    .from('products')
    .select(SELECT)
    .eq('in_stock', true)
    .eq('is_new', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <main>
      <Header />
      <HomeClient featured={featured || []} newProducts={newProducts || []} />
      <Footer />
    </main>
  )
}
