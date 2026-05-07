export const revalidate = 0
import { supabase } from '@/lib/supabase'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import CatalogClient from '@/components/store/CatalogClient'

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { category?: string; new?: string; featured?: string }
}) {
  const { data: categories } = await supabase.from('categories').select('*').order('name')

  let query = supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  if (searchParams.category) {
    const cat = categories?.find(c => c.slug === searchParams.category)
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (searchParams.new === 'true') query = query.eq('is_new', true)
  if (searchParams.featured === 'true') query = query.eq('is_featured', true)

  const { data: products } = await query

  return (
    <main>
      <Header />
      <CatalogClient
        products={products || []}
        categories={categories || []}
        activeCategory={searchParams.category}
        isNew={searchParams.new === 'true'}
        isFeatured={searchParams.featured === 'true'}
      />
      <Footer />
    </main>
  )
}
