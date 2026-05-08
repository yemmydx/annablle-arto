export const revalidate = 0
import { supabase } from '@/lib/supabase'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import CatalogClient from '@/components/store/CatalogClient'

const SECTION_NAMES: Record<string, string> = {
  lingerie: 'Бельё',
  swim: 'Купальники',
  clothes: 'Одежда',
  tights: 'Колготки',
  men: 'Мужчинам',
  kids: 'Детям',
}

type SP = {
  section?: string       // lingerie | swim | clothes | tights | men | kids
  cat?: string           // slug категории (например, 'bra', 'panties')
  category?: string      // legacy — старое название параметра, поддерживаем для обратной совместимости
  col?: string           // название коллекции (FATALE, Cotton...)
  new?: string
  featured?: string
  sale?: string
  promo?: string
}

export default async function CatalogPage({ searchParams }: { searchParams: SP }) {
  // Поддерживаем оба параметра (cat и category) для совместимости
  const catSlug = searchParams.cat || searchParams.category

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  let query = supabase
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })

  // Фильтр по разделу: товары относятся к категориям с section = X
  if (searchParams.section) {
    const sectionCatIds = (categories || [])
      .filter((c: any) => c.section === searchParams.section)
      .map(c => c.id)
    if (sectionCatIds.length > 0) {
      query = query.in('category_id', sectionCatIds)
    }
  }

  // Фильтр по конкретной категории
  if (catSlug) {
    const cat = categories?.find(c => c.slug === catSlug)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (searchParams.new === 'true') query = query.eq('is_new', true)
  if (searchParams.featured === 'true') query = query.eq('is_featured', true)

  // Outlet — товары со старой ценой (т.е. со скидкой)
  if (searchParams.sale === 'true') query = query.not('price_old', 'is', null)

  const { data: products } = await query

  // Заголовок страницы
  let title = 'Каталог'
  let subtitle = 'все модели'
  if (searchParams.col) {
    title = decodeURIComponent(searchParams.col)
    subtitle = 'коллекция'
  } else if (catSlug) {
    const cat = categories?.find(c => c.slug === catSlug)
    if (cat) { title = cat.name; subtitle = 'все модели' }
  } else if (searchParams.section && SECTION_NAMES[searchParams.section]) {
    title = SECTION_NAMES[searchParams.section]
    subtitle = 'все модели'
  } else if (searchParams.sale === 'true') {
    title = 'Outlet'
    subtitle = 'товары со скидкой'
  } else if (searchParams.new === 'true') {
    title = 'Новинки'
    subtitle = 'свежее в каталоге'
  }

  return (
    <main>
      <Header />
      <CatalogClient
        products={products || []}
        categories={categories || []}
        activeCategory={catSlug}
        section={searchParams.section}
        collection={searchParams.col}
        title={title}
        subtitle={subtitle}
        isNew={searchParams.new === 'true'}
        isFeatured={searchParams.featured === 'true'}
      />
      <Footer />
    </main>
  )
}
