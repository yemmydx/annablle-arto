export const revalidate = 0
import { supabase } from '@/lib/supabase'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import CatalogClient from '@/components/store/CatalogClient'

const SECTION_NAMES: Record<string, string> = {
  lingerie: 'Ð‘ÐµÐ»ÑŒÑ‘',
  swim: 'ÐšÑƒÐ¿Ð°Ð»ÑŒÐ½Ð¸ÐºÐ¸',
  clothes: 'ÐžÐ´ÐµÐ¶Ð´Ð°',
  tights: 'ÐšÐ¾Ð»Ð³Ð¾Ñ‚ÐºÐ¸',
  men: 'ÐœÑƒÐ¶Ñ‡Ð¸Ð½Ð°Ð¼',
  kids: 'Ð”ÐµÑ‚ÑÐ¼',
  outlet: 'Outlet',
}

type SP = {
  section?: string       // lingerie | swim | clothes | tights | men | kids
  cat?: string           // slug ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸ (Ð½Ð°Ð¿Ñ€Ð¸Ð¼ÐµÑ€, 'bra', 'panties')
  category?: string      // legacy â€” ÑÑ‚Ð°Ñ€Ð¾Ðµ Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ Ð¿Ð°Ñ€Ð°Ð¼ÐµÑ‚Ñ€Ð°, Ð¿Ð¾Ð´Ð´ÐµÑ€Ð¶Ð¸Ð²Ð°ÐµÐ¼ Ð´Ð»Ñ Ð¾Ð±Ñ€Ð°Ñ‚Ð½Ð¾Ð¹ ÑÐ¾Ð²Ð¼ÐµÑÑ‚Ð¸Ð¼Ð¾ÑÑ‚Ð¸
  col?: string           // Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ ÐºÐ¾Ð»Ð»ÐµÐºÑ†Ð¸Ð¸ (FATALE, Cotton...)
  new?: string
  featured?: string
  sale?: string
  promo?: string
}

export default async function CatalogPage({ searchParams }: { searchParams: SP }) {
  // ÐŸÐ¾Ð´Ð´ÐµÑ€Ð¶Ð¸Ð²Ð°ÐµÐ¼ Ð¾Ð±Ð° Ð¿Ð°Ñ€Ð°Ð¼ÐµÑ‚Ñ€Ð° (cat Ð¸ category) Ð´Ð»Ñ ÑÐ¾Ð²Ð¼ÐµÑÑ‚Ð¸Ð¼Ð¾ÑÑ‚Ð¸
  const catSlug = searchParams.cat || searchParams.category

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  // ÐžÐ¿Ñ€ÐµÐ´ÐµÐ»ÑÐµÐ¼ Ñ€Ð°Ð·Ð´ÐµÐ»: Ð»Ð¸Ð±Ð¾ Ð¸Ð· URL (?section=), Ð»Ð¸Ð±Ð¾ Ð¿Ð¾ Ð²Ñ‹Ð±Ñ€Ð°Ð½Ð½Ð¾Ð¹ ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸
  let effectiveSection = searchParams.section
  if (!effectiveSection && catSlug) {
    const cat = (categories || []).find(c => c.slug === catSlug)
    if (cat && (cat as any).section) effectiveSection = (cat as any).section
  }

  let query = supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('in_stock', true)
    .not('images', 'is', null).not('images', 'eq', '{}').order('created_at', { ascending: false })

  // Ð¤Ð¸Ð»ÑŒÑ‚Ñ€ Ð¿Ð¾ Ñ€Ð°Ð·Ð´ÐµÐ»Ñƒ: Ñ‚Ð¾Ð²Ð°Ñ€Ñ‹ Ð¾Ñ‚Ð½Ð¾ÑÑÑ‚ÑÑ Ðº ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸ÑÐ¼ Ñ section = X
  if (searchParams.section) {
    const sectionCatIds = (categories || [])
      .filter((c: any) => c.section === searchParams.section)
      .map(c => c.id)
    if (sectionCatIds.length > 0) {
      query = query.in('category_id', sectionCatIds)
    }
  }

  // Ð¤Ð¸Ð»ÑŒÑ‚Ñ€ Ð¿Ð¾ ÐºÐ¾Ð½ÐºÑ€ÐµÑ‚Ð½Ð¾Ð¹ ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸
  if (catSlug) {
    const cat = categories?.find(c => c.slug === catSlug)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (searchParams.new === 'true') query = query.eq('is_new', true)
  if (searchParams.featured === 'true') query = query.eq('is_featured', true)

  // Outlet â€” Ñ‚Ð¾Ð²Ð°Ñ€Ñ‹ ÑÐ¾ ÑÑ‚Ð°Ñ€Ð¾Ð¹ Ñ†ÐµÐ½Ð¾Ð¹ (Ñ‚.Ðµ. ÑÐ¾ ÑÐºÐ¸Ð´ÐºÐ¾Ð¹)
  if (searchParams.sale === 'true') query = query.not('price_old', 'is', null)

  // Ð¤Ð¸Ð»ÑŒÑ‚Ñ€ Ð¿Ð¾ ÐºÐ¾Ð»Ð»ÐµÐºÑ†Ð¸Ð¸ (FATALE, Cotton, MAVKA Ð¸ Ñ‚.Ð´.)
  if (searchParams.col) {
    query = query.eq('collection', decodeURIComponent(searchParams.col))
  }

  const { data: products } = await query

  // ÐšÐ°Ñ€Ñ‚Ð° "Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ðµ Ñ†Ð²ÐµÑ‚Ð° â†’ hex" Ð¸Ð· product_colors (Ð´Ð»Ñ Ð¿Ñ€Ð°Ð²Ð¸Ð»ÑŒÐ½Ñ‹Ñ… ÐºÑ€ÑƒÐ¶ÐºÐ¾Ð² Ð² Ñ„Ð¸Ð»ÑŒÑ‚Ñ€Ðµ)
  const { data: colorRows } = await supabase
    .from('product_colors')
    .select('name, hex')
  const colorHexMap: Record<string, string> = {}
  for (const row of colorRows || []) {
    if (row.name && row.hex) colorHexMap[row.name.trim()] = row.hex
  }

  // Ð—Ð°Ð³Ð¾Ð»Ð¾Ð²Ð¾Ðº ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ñ‹
  let title = 'ÐšÐ°Ñ‚Ð°Ð»Ð¾Ð³'
  let subtitle = 'Ð²ÑÐµ Ð¼Ð¾Ð´ÐµÐ»Ð¸'
  if (searchParams.col) {
    title = decodeURIComponent(searchParams.col)
    subtitle = 'ÐºÐ¾Ð»Ð»ÐµÐºÑ†Ð¸Ñ'
  } else if (catSlug) {
    const cat = categories?.find(c => c.slug === catSlug)
    if (cat) { title = cat.name; subtitle = 'Ð²ÑÐµ Ð¼Ð¾Ð´ÐµÐ»Ð¸' }
  } else if (searchParams.section && SECTION_NAMES[searchParams.section]) {
    title = SECTION_NAMES[searchParams.section]
    subtitle = 'Ð²ÑÐµ Ð¼Ð¾Ð´ÐµÐ»Ð¸'
  } else if (searchParams.sale === 'true') {
    title = 'Outlet'
    subtitle = 'Ñ‚Ð¾Ð²Ð°Ñ€Ñ‹ ÑÐ¾ ÑÐºÐ¸Ð´ÐºÐ¾Ð¹'
  } else if (searchParams.new === 'true') {
    title = 'ÐÐ¾Ð²Ð¸Ð½ÐºÐ¸'
    subtitle = 'ÑÐ²ÐµÐ¶ÐµÐµ Ð² ÐºÐ°Ñ‚Ð°Ð»Ð¾Ð³Ðµ'
  }

  return (
    <main>
      <Header />
      <CatalogClient
        products={products || []}
        categories={categories || []}
        activeCategory={catSlug}
        section={effectiveSection}
        collection={searchParams.col}
        title={title}
        subtitle={subtitle}
        isNew={searchParams.new === 'true'}
        isFeatured={searchParams.featured === 'true'}
        colorHexMap={colorHexMap}
      />
      <Footer />
    </main>
  )
}
