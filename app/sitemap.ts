import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

const BASE = 'https://podplatiem.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages = ['', '/catalog', '/about', '/contacts', '/delivery', '/offer', '/privacy', '/returns', '/size-guide']
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((p) => ({
    url: BASE + p,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }))

  let productEntries: MetadataRoute.Sitemap = []
  try {
    const { data } = await supabase
      .from('products')
      .select('slug, created_at')
      .eq('in_stock', true)
      .eq('is_hidden', false)
      .not('images', 'is', null)
      .not('images', 'eq', '{}')
      .limit(2000)
    productEntries = (data || []).map((p: any) => ({
      url: BASE + '/product/' + p.slug,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: 'weekly',
      priority: 0.6,
    }))
  } catch (e) {
    productEntries = []
  }

  return [...staticEntries, ...productEntries]
}