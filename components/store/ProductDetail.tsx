'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Product } from '@/lib/supabase'
import { formatPrice } from '@/lib/utils'
import { useCart } from '@/lib/cart'
import ProductGrid from './ProductGrid'
import CartDrawer from './CartDrawer'
import SizeGuideModal from './SizeGuideModal'
import ProductDescription from './ProductDescription'

const CARD_BG = ['linear-gradient(165deg,#f3c8be,#d99c8e)','linear-gradient(165deg,#ead0c4,#d4a094)','linear-gradient(165deg,#f5d8d0,#d8a89c)','linear-gradient(165deg,#e8c4b6,#c8907e)']

type ColorRow = {
  id: string
  product_id: string
  name: string
  hex: string
  images: string[]
  sort_order: number
}

export default function ProductDetail({ product: p, colors, related, collectionProducts = [] }: {
  product: Product; colors: ColorRow[]; related: Product[]; collectionProducts?: Product[]
}) {
  const { addItem } = useCart()
  const [size, setSize] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [added, setAdded] = useState(false)
  const [error, setError] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false)

  // Активный цвет: первый из списка (или null если цветов нет — старый товар)
  const [activeColorIdx, setActiveColorIdx] = useState(0)
  const activeColor = colors[activeColorIdx] || null

  // Размеры — отфильтрованные по выбранному цвету (если есть variants с color)
  const sizes = useMemo(() => {
    if (!p.product_variants) return []
    if (activeColor) {
      const filtered = p.product_variants.filter((v: any) => v.color === activeColor.name)
      return Array.from(new Set(filtered.map((v: any) => v.size)))
    }
    return Array.from(new Set(p.product_variants.map((v: any) => v.size)))
  }, [p.product_variants, activeColor])

  // Фото — для активного цвета (или общие images товара если цветов нет)
  const images = useMemo(() => {
    if (activeColor && activeColor.images && activeColor.images.length > 0) {
      return activeColor.images
    }
    return p.images && p.images.length > 0 ? p.images : []
  }, [activeColor, p.images])

  // При смене цвета — сбрасываем выбранное фото и размер
  function pickColor(idx: number) {
    setActiveColorIdx(idx)
    setActiveImg(0)
    setSize('')
  }

  function handleAdd() {
    if (sizes.length > 0 && !size) { setError('Выберите размер'); return }
    setError('')
    addItem(p, size || 'M', activeColor?.name || null)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
    setCartOpen(true)
  }

  return (
    <>
      <div className="catalog-head">
        <div className="crumbs">
          <Link href="/">Главная</Link> / <Link href="/catalog">Каталог</Link>
          {p.categories && <> / <Link href={`/catalog?cat=${(p.categories as any).slug}`}>{(p.categories as any).name}</Link></>}
          {' '} / {p.name}
        </div>
      </div>

      <div className="pdp">
        {/* Галерея */}
        <div className="pdp-gallery">
          <div className="thumbs">
            {(images.length > 0 ? images : [null, null, null, null]).slice(0,4).map((img, i) => (
              <div key={i} className={`thumb ${activeImg === i ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                style={{background: CARD_BG[i % CARD_BG.length], position:'relative', overflow:'hidden'}}>
                {img ? (
                  <img src={img} alt={`${p.name} ${i+1}`}
                    style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
                ) : (
                  <div className="ph" style={{borderRadius:8}}></div>
                )}
              </div>
            ))}
          </div>
          <div className="pdp-main" style={{background: CARD_BG[activeImg % CARD_BG.length], position:'relative', overflow:'hidden'}}>
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={p.name}
                style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}} />
            ) : (
              <div className="ph"><div className="ph-label">[ {p.name} · вид {activeImg+1}/{Math.max(images.length,1)} ]</div></div>
            )}
            {p.is_new && <span className="card-tag" style={{top:16,left:16,zIndex:2}}>Новинка</span>}
          </div>
        </div>

        {/* Инфо */}
        <div className="pdp-info">
          <div className="pdp-cat">{(p.categories as any)?.name || ''} ✿ {p.name}</div>
          <h1>{p.name}</h1>
          <div className="pdp-price">
            {p.price_old && <s>{formatPrice(p.price_old)}</s>}
            <span>{formatPrice(p.price)}</span>
            {p.price_old && <span className="save">−{Math.round((1-p.price/p.price_old)*100)}%</span>}
          </div>

          {p.description && (
            <ProductDescription text={p.description} />
          )}

          {/* Цвета */}
          {colors.length > 0 && (
            <div className="pdp-row">
              <div className="head">
                <span>Цвет: {activeColor?.name || '—'}</span>
              </div>
              <div className="color-row">
                {colors.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => pickColor(i)}
                    className={`color-swatch ${i === activeColorIdx ? 'on' : ''}`}
                    style={{ background: c.hex }}
                    title={c.name}
                    aria-label={`Выбрать цвет ${c.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Размеры */}
          {sizes.length > 0 && (
            <div className="pdp-row">
              <div className="head">
                <span>Размер: {size || '—'}</span>
                <button onClick={() => setSizeGuideOpen(true)} style={{textTransform:'none',letterSpacing:0,opacity:0.7,textDecoration:'underline',fontFamily:'Inter Tight,sans-serif',fontSize:12,background:'none',border:'none',color:'inherit',cursor:'pointer',padding:0}}>
                  Таблица размеров
                </button>
              </div>
              <div className="size-row">
                {sizes.map(s => (
                  <button key={s} className={`size-btn ${size === s ? 'on' : ''}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
              {error && <p style={{color:'#c0392b',fontSize:12,marginTop:8}}>{error}</p>}
            </div>
          )}

          {/* CTA */}
          <div className="pdp-cta">
            <button onClick={handleAdd} style={{padding:'18px 28px',borderRadius:999,background:'var(--ink)',color:'var(--cream)',border:'none',cursor:'pointer',fontFamily:'inherit',fontSize:14,letterSpacing:'0.04em',transition:'all .3s',display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
              {added ? '✓ Добавлено!' : `В корзину · ${formatPrice(p.price)}`}
            </button>
            <button onClick={() => setCartOpen(true)} style={{width:56,height:56,borderRadius:999,border:'1px solid var(--ink)',background:'transparent',cursor:'pointer',display:'grid',placeItems:'center'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
            </button>
          </div>

          {/* Фичи */}
          <div className="pdp-features">
            {[
              [<svg key="t" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 19c5-13 14-15 16-15 0 7-3 18-15 16M5 19l8-8"/></svg>, 'Материал', '78% полиамид · 22% эластан'],
              [<svg key="c" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 12a9 9 0 1 1-3-6.7M21 4v5h-5"/></svg>, 'Уход', 'Стирка 30°C · без отбеливания'],
              [<svg key="d" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 7h12v10H3zM15 10h4l3 3v4h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>, 'Доставка', '2–5 дней по всему Казахстану'],
              [<svg key="r" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5L12 2z"/></svg>, 'Возврат', '30 дней · бесплатно'],
            ].map(([icon, title, sub], i) => (
              <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                <div style={{width:22,height:22,color:'var(--rose-deep)',flexShrink:0,marginTop:2}}>{icon}</div>
                <div><h6 style={{fontSize:13,fontWeight:500,marginBottom:2}}>{title as string}</h6><p style={{fontSize:12,color:'var(--ink-soft)'}}>{sub as string}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Из этой коллекции */}
      {collectionProducts.length > 0 && (
        <section>
          <div className="section-head">
            <div>
              <div style={{fontFamily:'JetBrains Mono,monospace',fontSize:11,letterSpacing:'0.14em',textTransform:'uppercase',opacity:0.55,marginBottom:8}}>
                Коллекция {(p as any).collection}
              </div>
              <h2>Из этой <em>коллекции</em></h2>
            </div>
            <Link href={`/catalog?col=${encodeURIComponent((p as any).collection)}`}
              style={{fontSize:12,color:'var(--rose-deep)',textDecoration:'underline',fontFamily:'Inter Tight,sans-serif',display:'inline-flex',alignItems:'center',gap:6}}>
              Вся коллекция
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </Link>
          </div>
          <ProductGrid products={collectionProducts} />
        </section>
      )}

      {/* Похожие — показываем только если нет коллекции (иначе дублирование) */}
      {collectionProducts.length === 0 && related.length > 0 && (
        <section>
          <div className="section-head">
            <h2>Похожие <em>товары</em></h2>
          </div>
          <ProductGrid products={related} />
        </section>
      )}

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
      {sizeGuideOpen && <SizeGuideModal section={(p.categories as any)?.section || null} onClose={() => setSizeGuideOpen(false)} />}
    </>
  )
}
