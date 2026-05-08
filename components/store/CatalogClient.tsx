'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Product, Category } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/lib/cart'
import QuickView from './QuickView'
import CartDrawer from './CartDrawer'

const SIZES = ['XS','S','M','L','XL','2XL','3XL']
const CARD_BG = ['linear-gradient(165deg,#f3c8be,#d99c8e)','linear-gradient(165deg,#ead0c4,#d4a094)','linear-gradient(165deg,#f5d8d0,#d8a89c)','linear-gradient(165deg,#e8c4b6,#c8907e)','linear-gradient(165deg,#f0c8be,#d8907e)']
const SECTION_NAMES: Record<string, string> = {
  lingerie: 'Бельё', swim: 'Купальники', clothes: 'Одежда',
  tights: 'Колготки', men: 'Мужчинам', kids: 'Детям',
}

export default function CatalogClient({ products, categories, activeCategory, section, collection, title: titleProp, subtitle: subtitleProp, isNew, isFeatured }: {
  products: Product[]; categories: Category[]; activeCategory?: string;
  section?: string; collection?: string;
  title?: string; subtitle?: string;
  isNew?: boolean; isFeatured?: boolean
}) {
  const { addItem } = useCart()
  const [activeSizes, setActiveSizes] = useState<string[]>([])
  const [maxPrice, setMaxPrice] = useState(500000)
  const [sort, setSort] = useState('new')
  const [quickProduct, setQuickProduct] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  const toggleSize = (s: string) => setActiveSizes(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])

  const filtered = useMemo(() => {
    let list = [...products]
    if (activeSizes.length > 0) {
      list = list.filter(p => p.product_variants?.some(v => activeSizes.includes(v.size)))
    }
    list = list.filter(p => p.price <= maxPrice)
    if (sort === 'price_asc') list.sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') list.sort((a, b) => b.price - a.price)
    return list
  }, [products, activeSizes, maxPrice, sort])

  const title = titleProp || (isNew ? 'Новинки' : isFeatured ? 'Хиты продаж' : activeCategory
    ? categories.find(c => c.slug === activeCategory)?.name || 'Каталог'
    : 'Бельё')

  const subtitle = subtitleProp ? `— ${subtitleProp}` : (isNew ? '— новинки' : isFeatured ? '— хиты' : '— все модели')

  const allPrices = products.map(p => p.price)
  const priceMax = allPrices.length > 0 ? Math.max(...allPrices) : 500000

  return (
    <>
      {/* Шапка каталога */}
      <div className="catalog-head">
        <div className="crumbs">
          <Link href="/">Главная</Link> / {title}
        </div>
        <div className="catalog-title">
          <h1>{title} <em>{subtitle}</em></h1>
          <span className="section-meta">{filtered.length} моделей</span>
        </div>
      </div>

      {/* Тело каталога */}
      <div className="catalog-body">
        {/* Фильтры */}
        <aside>
          <h6>Фильтры</h6>

          {collection && (
            <div className="filter-item">
              <div style={{fontSize:10,opacity:0.5,marginBottom:6,fontFamily:'JetBrains Mono,monospace',letterSpacing:'0.12em',textTransform:'uppercase'}}>Коллекция</div>
              <div className="filter-link active" style={{cursor:'default'}}>{decodeURIComponent(collection)}</div>
              <Link href={section ? `/catalog?section=${section}` : '/catalog'} style={{fontSize:11,opacity:0.6,padding:'4px 12px',display:'inline-block',color:'var(--ink-soft)'}}>← снять фильтр</Link>
            </div>
          )}

          <div className="filter-item">
            <div style={{fontSize:10,opacity:0.5,marginBottom:6,fontFamily:'JetBrains Mono,monospace',letterSpacing:'0.12em',textTransform:'uppercase'}}>
              {section ? SECTION_NAMES[section] || 'Категория' : 'Категория'}
            </div>
            <Link href={section ? `/catalog?section=${section}` : '/catalog'} className={`filter-link ${!activeCategory && !isNew && !isFeatured && !collection ? 'active' : ''}`}>
              {section ? 'Все товары раздела' : 'Все товары'}
            </Link>
            {(section ? categories.filter((c: any) => c.section === section) : categories).map(cat => {
              const href = section ? `/catalog?section=${section}&cat=${cat.slug}` : `/catalog?cat=${cat.slug}`
              return (
                <Link key={cat.id} href={href} className={`filter-link ${activeCategory === cat.slug ? 'active' : ''}`}>
                  {cat.name}
                </Link>
              )
            })}
          </div>

          <div className="filter-item">
            <div style={{fontSize:10,opacity:0.5,marginBottom:8,fontFamily:'JetBrains Mono,monospace',letterSpacing:'0.12em',textTransform:'uppercase'}}>Размер</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {SIZES.map(s => (
                <button key={s} onClick={() => toggleSize(s)} style={{
                  padding:'6px 12px',borderRadius:999,
                  border:`1px solid ${activeSizes.includes(s) ? 'var(--ink)' : 'rgba(58,40,40,0.2)'}`,
                  background: activeSizes.includes(s) ? 'var(--ink)' : 'transparent',
                  color: activeSizes.includes(s) ? 'var(--cream)' : 'var(--ink)',
                  fontFamily:'inherit',fontSize:12,cursor:'pointer',transition:'all .2s',
                }}>{s}</button>
              ))}
            </div>
          </div>

          <div className="filter-item">
            <div style={{fontSize:10,opacity:0.5,marginBottom:8,fontFamily:'JetBrains Mono,monospace',letterSpacing:'0.12em',textTransform:'uppercase'}}>Цена</div>
            <input type="range" min={0} max={priceMax} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
              style={{width:'100%',accentColor:'var(--ink)',marginBottom:8}} />
            <div style={{display:'flex',justifyContent:'space-between',fontSize:12,opacity:0.7}}>
              <span>0 ₸</span><span>{formatPrice(maxPrice)}</span>
            </div>
          </div>

          <div className="filter-item">
            <Link href={section ? `/catalog?section=${section}&new=true` : '/catalog?new=true'} className={`filter-link ${isNew ? 'active' : ''}`} style={{color: isNew ? undefined : 'var(--rose-deep)'}}>✿ Новинки</Link>
            <Link href={section ? `/catalog?section=${section}&featured=true` : '/catalog?featured=true'} className={`filter-link ${isFeatured ? 'active' : ''}`} style={{color: isFeatured ? undefined : 'var(--rose-deep)'}}>✿ Хиты продаж</Link>
            <Link href="/catalog?sale=true" className="filter-link" style={{color:'var(--rose-deep)'}}>✿ Outlet</Link>
          </div>
        </aside>

        {/* Товары */}
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:18}}>
            <span style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'0.1em',textTransform:'uppercase',opacity:0.6}}>
              {filtered.length} моделей ✿ обновлено сегодня
            </span>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{
              background:'transparent',border:'1px solid rgba(58,40,40,0.2)',padding:'8px 14px',
              borderRadius:999,fontFamily:'inherit',fontSize:13,cursor:'pointer',outline:'none',
            }}>
              <option value="new">Сортировка: новинки</option>
              <option value="price_asc">Сначала дешевле</option>
              <option value="price_desc">Сначала дороже</option>
            </select>
          </div>

          <div className="product-grid">
            {filtered.map((p, i) => (
              <CatalogCard key={p.id} product={p} idx={i} onQuick={() => setQuickProduct(p)} onCartOpen={() => setCartOpen(true)} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{textAlign:'center',padding:'80px 0',color:'var(--ink-soft)'}}>
              <div style={{fontSize:40,opacity:0.3,marginBottom:12}}>✿</div>
              <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,fontStyle:'italic'}}>Ничего не найдено</p>
              <p style={{fontSize:13,marginTop:8,opacity:0.6}}>Попробуйте изменить фильтры</p>
            </div>
          )}
        </div>
      </div>

      {quickProduct && <QuickView product={quickProduct} onClose={() => setQuickProduct(null)} onCartOpen={() => setCartOpen(true)} />}
      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </>
  )
}

function CatalogCard({ product, idx, onQuick, onCartOpen }: { product: Product; idx: number; onQuick: () => void; onCartOpen: () => void }) {
  const { addItem } = useCart()
  const gi = idx % 5

  return (
    <div className="card" style={{cursor:'pointer'}}>
      <div className="card-img" style={{background: CARD_BG[gi]}} onClick={() => window.location.href = `/product/${product.slug}`}>
        {product.images && product.images.length > 0 ? (
          <>
            <img src={product.images[0]} alt={product.name}
              style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
            {product.images[1] && (
              <img src={product.images[1]} alt={product.name} className="card-img-hover"
                style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:0,transition:'opacity .5s'}} />
            )}
          </>
        ) : (
          <>
            <div className="ph"><div className="ph-label">[ {product.name} ]</div></div>
            <div className="card-img-hover" style={{background:'linear-gradient(135deg,#d4a094,#b8786a)'}} />
          </>
        )}
        {product.is_new && <span className="card-tag">Новинка</span>}
        {product.price_old && !product.is_new && (
          <span className="card-tag">−{Math.round((1 - product.price / product.price_old) * 100)}%</span>
        )}
        <div className="card-quick">
          <button className="card-quick-btn" onClick={e => { e.stopPropagation(); onQuick() }}>Быстрый просмотр</button>
        </div>
      </div>
      <div className="card-info">
        <div>
          <h4>{product.name}</h4>
          <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:10,textTransform:'uppercase',letterSpacing:'0.06em',opacity:0.6,marginTop:2}}>
            {(product.categories as any)?.name || ''}
          </div>
        </div>
        <div className="card-price">
          {product.price_old && <s>{formatPrice(product.price_old)}</s>}
          {formatPrice(product.price)}
        </div>
      </div>
      {product.product_variants && product.product_variants.length > 0 && (
        <div className="card-sizes">
          {[...new Set(product.product_variants.map(v => v.size))].slice(0,5).map(s => (
            <span key={s} className="size-chip">{s}</span>
          ))}
        </div>
      )}
    </div>
  )
}
