export const revalidate = 0
import { supabase } from '@/lib/supabase'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import CatalogClient from '@/components/store/CatalogClient'

const SECTION_NAMES: Record<string, string> = {
  lingerie: 'ÃƒÂÃ¢â‚¬ËœÃƒÂÃ‚ÂµÃƒÂÃ‚Â»Ãƒâ€˜Ã…â€™Ãƒâ€˜Ã¢â‚¬Ëœ',
  swim: 'ÃƒÂÃ…Â¡Ãƒâ€˜Ã†â€™ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â°ÃƒÂÃ‚Â»Ãƒâ€˜Ã…â€™ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¸ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¸',
  clothes: 'ÃƒÂÃ…Â¾ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒÂÃ‚Â¶ÃƒÂÃ‚Â´ÃƒÂÃ‚Â°',
  tights: 'ÃƒÂÃ…Â¡ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â»ÃƒÂÃ‚Â³ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¸',
  men: 'ÃƒÂÃ…â€œÃƒâ€˜Ã†â€™ÃƒÂÃ‚Â¶Ãƒâ€˜Ã¢â‚¬Â¡ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â½ÃƒÂÃ‚Â°ÃƒÂÃ‚Â¼',
  kids: 'ÃƒÂÃ¢â‚¬ÂÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â¼',
  outlet: 'Outlet',
}

type SP = {
  section?: string       // lingerie | swim | clothes | tights | men | kids
  cat?: string           // slug ÃƒÂÃ‚ÂºÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚ÂµÃƒÂÃ‚Â³ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¸ (ÃƒÂÃ‚Â½ÃƒÂÃ‚Â°ÃƒÂÃ‚Â¿Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¼ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â€šÂ¬, 'bra', 'panties')
  category?: string      // legacy ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚Âµ ÃƒÂÃ‚Â½ÃƒÂÃ‚Â°ÃƒÂÃ‚Â·ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¸ÃƒÂÃ‚Âµ ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°ÃƒÂÃ‚Â¼ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°, ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â´ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¶ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°ÃƒÂÃ‚ÂµÃƒÂÃ‚Â¼ ÃƒÂÃ‚Â´ÃƒÂÃ‚Â»Ãƒâ€˜Ã‚Â ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â±Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹ Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â¼ÃƒÂÃ‚ÂµÃƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¼ÃƒÂÃ‚Â¾Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¸
  col?: string           // ÃƒÂÃ‚Â½ÃƒÂÃ‚Â°ÃƒÂÃ‚Â·ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¸ÃƒÂÃ‚Âµ ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¾ÃƒÂÃ‚Â»ÃƒÂÃ‚Â»ÃƒÂÃ‚ÂµÃƒÂÃ‚ÂºÃƒâ€˜Ã¢â‚¬Â ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¸ (FATALE, Cotton...)
  new?: string
  featured?: string
  sale?: string
  promo?: string
}

export default async function CatalogPage({ searchParams }: { searchParams: SP }) {
  // ÃƒÂÃ…Â¸ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â´ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¶ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°ÃƒÂÃ‚ÂµÃƒÂÃ‚Â¼ ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â±ÃƒÂÃ‚Â° ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°ÃƒÂÃ‚Â¼ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â° (cat ÃƒÂÃ‚Â¸ category) ÃƒÂÃ‚Â´ÃƒÂÃ‚Â»Ãƒâ€˜Ã‚Â Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â¼ÃƒÂÃ‚ÂµÃƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¼ÃƒÂÃ‚Â¾Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¸
  const catSlug = searchParams.cat || searchParams.category

  const { data: categories } = await supabase.from('categories').select('*').order('name')

  // ÃƒÂÃ…Â¾ÃƒÂÃ‚Â¿Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚ÂµÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒÂÃ‚Â»Ãƒâ€˜Ã‚ÂÃƒÂÃ‚ÂµÃƒÂÃ‚Â¼ Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°ÃƒÂÃ‚Â·ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒÂÃ‚Â»: ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â±ÃƒÂÃ‚Â¾ ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â· URL (?section=), ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â±ÃƒÂÃ‚Â¾ ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â¾ ÃƒÂÃ‚Â²Ãƒâ€˜Ã¢â‚¬Â¹ÃƒÂÃ‚Â±Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°ÃƒÂÃ‚Â½ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹ ÃƒÂÃ‚ÂºÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚ÂµÃƒÂÃ‚Â³ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¸
  let effectiveSection = searchParams.section
  if (!effectiveSection && catSlug) {
    const cat = (categories || []).find(c => c.slug === catSlug)
    if (cat && (cat as any).section) effectiveSection = (cat as any).section
  }

  let query = supabase as any
    .from('products')
    .select('*, categories(*), product_variants(*)')
    .eq('in_stock', true)
    .not('images', 'is', null).not('images', 'eq', '{}').order('created_at', { ascending: false })

  // ÃƒÂÃ‚Â¤ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â»Ãƒâ€˜Ã…â€™Ãƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â¾ Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°ÃƒÂÃ‚Â·ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒÂÃ‚Â»Ãƒâ€˜Ã†â€™: Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬Ãƒâ€˜Ã¢â‚¬Â¹ ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¾Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã‚Â ÃƒÂÃ‚Âº ÃƒÂÃ‚ÂºÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚ÂµÃƒÂÃ‚Â³ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¸Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â¼ Ãƒâ€˜Ã‚Â section = X
  if (searchParams.section) {
    const sectionCatIds = (categories || [])
      .filter((c: any) => c.section === searchParams.section)
      .map(c => c.id)
    if (sectionCatIds.length > 0) {
      query = query.in('category_id', sectionCatIds)
    }
  }

  // ÃƒÂÃ‚Â¤ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â»Ãƒâ€˜Ã…â€™Ãƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â¾ ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¾ÃƒÂÃ‚Â½ÃƒÂÃ‚ÂºÃƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹ ÃƒÂÃ‚ÂºÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚ÂµÃƒÂÃ‚Â³ÃƒÂÃ‚Â¾Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¸
  if (catSlug) {
    const cat = categories?.find(c => c.slug === catSlug)
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (searchParams.new === 'true') query = query.eq('is_new', true)
  if (searchParams.featured === 'true') query = query.eq('is_featured', true)

  // Outlet ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬Ãƒâ€˜Ã¢â‚¬Â¹ Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â¾ Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹ Ãƒâ€˜Ã¢â‚¬Â ÃƒÂÃ‚ÂµÃƒÂÃ‚Â½ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹ (Ãƒâ€˜Ã¢â‚¬Å¡.ÃƒÂÃ‚Âµ. Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â¾ Ãƒâ€˜Ã‚ÂÃƒÂÃ‚ÂºÃƒÂÃ‚Â¸ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹)
  if (searchParams.sale === 'true') query = query.not('price_old', 'is', null)

  // ÃƒÂÃ‚Â¤ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â»Ãƒâ€˜Ã…â€™Ãƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ ÃƒÂÃ‚Â¿ÃƒÂÃ‚Â¾ ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¾ÃƒÂÃ‚Â»ÃƒÂÃ‚Â»ÃƒÂÃ‚ÂµÃƒÂÃ‚ÂºÃƒâ€˜Ã¢â‚¬Â ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â¸ (FATALE, Cotton, MAVKA ÃƒÂÃ‚Â¸ Ãƒâ€˜Ã¢â‚¬Å¡.ÃƒÂÃ‚Â´.)
  if (searchParams.col) {
    query = query.eq('collection', decodeURIComponent(searchParams.col))
  }

  const { data: products } = await query

  // ÃƒÂÃ…Â¡ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â° "ÃƒÂÃ‚Â½ÃƒÂÃ‚Â°ÃƒÂÃ‚Â·ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¸ÃƒÂÃ‚Âµ Ãƒâ€˜Ã¢â‚¬Â ÃƒÂÃ‚Â²ÃƒÂÃ‚ÂµÃƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â° ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢ hex" ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â· product_colors (ÃƒÂÃ‚Â´ÃƒÂÃ‚Â»Ãƒâ€˜Ã‚Â ÃƒÂÃ‚Â¿Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°ÃƒÂÃ‚Â²ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â»Ãƒâ€˜Ã…â€™ÃƒÂÃ‚Â½Ãƒâ€˜Ã¢â‚¬Â¹Ãƒâ€˜Ã¢â‚¬Â¦ ÃƒÂÃ‚ÂºÃƒâ€˜Ã¢â€šÂ¬Ãƒâ€˜Ã†â€™ÃƒÂÃ‚Â¶ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¾ÃƒÂÃ‚Â² ÃƒÂÃ‚Â² Ãƒâ€˜Ã¢â‚¬Å¾ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â»Ãƒâ€˜Ã…â€™Ãƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Âµ)
  const { data: colorRows } = await supabase
    .from('product_colors')
    .select('name, hex')
  const colorHexMap: Record<string, string> = {}
  for (const row of colorRows || []) {
    if (row.name && row.hex) colorHexMap[row.name.trim()] = row.hex
  }

  // ÃƒÂÃ¢â‚¬â€ÃƒÂÃ‚Â°ÃƒÂÃ‚Â³ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â¾ÃƒÂÃ‚Âº Ãƒâ€˜Ã‚ÂÃƒâ€˜Ã¢â‚¬Å¡Ãƒâ€˜Ã¢â€šÂ¬ÃƒÂÃ‚Â°ÃƒÂÃ‚Â½ÃƒÂÃ‚Â¸Ãƒâ€˜Ã¢â‚¬Â Ãƒâ€˜Ã¢â‚¬Â¹
  let title = 'ÃƒÂÃ…Â¡ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â°ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â³'
  let subtitle = 'ÃƒÂÃ‚Â²Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Âµ ÃƒÂÃ‚Â¼ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒÂÃ‚Â»ÃƒÂÃ‚Â¸'
  if (searchParams.col) {
    title = decodeURIComponent(searchParams.col)
    subtitle = 'ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¾ÃƒÂÃ‚Â»ÃƒÂÃ‚Â»ÃƒÂÃ‚ÂµÃƒÂÃ‚ÂºÃƒâ€˜Ã¢â‚¬Â ÃƒÂÃ‚Â¸Ãƒâ€˜Ã‚Â'
  } else if (catSlug) {
    const cat = categories?.find(c => c.slug === catSlug)
    if (cat) { title = cat.name; subtitle = 'ÃƒÂÃ‚Â²Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Âµ ÃƒÂÃ‚Â¼ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒÂÃ‚Â»ÃƒÂÃ‚Â¸' }
  } else if (searchParams.section && SECTION_NAMES[searchParams.section]) {
    title = SECTION_NAMES[searchParams.section]
    subtitle = 'ÃƒÂÃ‚Â²Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Âµ ÃƒÂÃ‚Â¼ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂµÃƒÂÃ‚Â»ÃƒÂÃ‚Â¸'
  } else if (searchParams.sale === 'true') {
    title = 'Outlet'
    subtitle = 'Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â€šÂ¬Ãƒâ€˜Ã¢â‚¬Â¹ Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â¾ Ãƒâ€˜Ã‚ÂÃƒÂÃ‚ÂºÃƒÂÃ‚Â¸ÃƒÂÃ‚Â´ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¾ÃƒÂÃ‚Â¹'
  } else if (searchParams.new === 'true') {
    title = 'ÃƒÂÃ‚ÂÃƒÂÃ‚Â¾ÃƒÂÃ‚Â²ÃƒÂÃ‚Â¸ÃƒÂÃ‚Â½ÃƒÂÃ‚ÂºÃƒÂÃ‚Â¸'
    subtitle = 'Ãƒâ€˜Ã‚ÂÃƒÂÃ‚Â²ÃƒÂÃ‚ÂµÃƒÂÃ‚Â¶ÃƒÂÃ‚ÂµÃƒÂÃ‚Âµ ÃƒÂÃ‚Â² ÃƒÂÃ‚ÂºÃƒÂÃ‚Â°Ãƒâ€˜Ã¢â‚¬Å¡ÃƒÂÃ‚Â°ÃƒÂÃ‚Â»ÃƒÂÃ‚Â¾ÃƒÂÃ‚Â³ÃƒÂÃ‚Âµ'
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
