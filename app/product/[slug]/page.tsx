import { supabase } from '@/lib/supabase'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import ProductDetail from '@/components/store/ProductDetail'
import { notFound } from 'next/navigation'

export default async function ProductPage({
  params,
}: {
  params: { slug: string }
}) {
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('slug', params.slug)
    .single()

  if (!product) notFound()

  // Цвета товара (с фото для каждого цвета)
  const { data: colors } = await supabase
    .from('product_colors')
    .select('*')
    .eq('product_id', product.id)
    .order('sort_order', { ascending: true })

  // Похожие товары из той же категории
  const { data: related } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4)

  return (
    <main>
      <Header />
      <ProductDetail product={product} colors={colors || []} related={related || []} />
      <Footer />
    </main>
  )
}
