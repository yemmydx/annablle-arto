export const revalidate = 0  // всегда свежие данные: правки из админки видны сразу
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

  // Товары той же коллекции — по префиксу артикула ("8189-057 ..." -> "8189-")
  let collectionProducts: any[] = []
  const artMatch = (product.name || '').match(/^(\d{3,4})-/)
  const collPrefix = artMatch ? artMatch[1] + '-' : null
  if (collPrefix) {
    const { data } = await supabase
      .from('products')
      .select('*, categories(*), product_variants(*)')
      .ilike('name', collPrefix + '%')
      .neq('id', product.id)
      .eq('in_stock', true)
      .eq('is_hidden', false)
      .not('images', 'is', null)
      .not('images', 'eq', '{}')
      .limit(12)
    collectionProducts = data || []
  }

  // Похожие товары той же категории (используем как fallback если нет коллекции)
  const { data: related } = await supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .eq('in_stock', true)
    .eq('is_hidden', false)
    .not('images', 'is', null)
    .not('images', 'eq', '{}')
    .limit(4)

  return (
    <main>
      <Header />
      <ProductDetail
        product={product}
        colors={colors || []}
        related={related || []}
        collectionProducts={collectionProducts}
      />
      <Footer />
    </main>
  )
}
