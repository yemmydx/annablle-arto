'use client'
import Link from 'next/link'
import { Category } from '@/lib/supabase'

export default function CatalogFilters({ categories, active }: { categories: Category[], active?: string }) {
  return (
    <div>
      <h6 style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:12,opacity:0.7}}>
        Фильтры
      </h6>
      <div className="filter-item">
        <Link href="/catalog" className={`filter-link ${!active ? 'active' : ''}`}>Все товары</Link>
        {categories.map(cat => (
          <Link key={cat.id} href={`/catalog?category=${cat.slug}`} className={`filter-link ${active === cat.slug ? 'active' : ''}`}>
            {cat.name}
          </Link>
        ))}
      </div>
      <div className="filter-item">
        <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,letterSpacing:'0.12em',textTransform:'uppercase',opacity:0.5,marginBottom:8,padding:'0 12px'}}>
          Подборки
        </div>
        <Link href="/catalog?new=true" className="filter-link" style={{color:'var(--rose-deep)'}}>✿ Новинки</Link>
        <Link href="/catalog?featured=true" className="filter-link" style={{color:'var(--rose-deep)'}}>✿ Хиты продаж</Link>
      </div>
    </div>
  )
}
