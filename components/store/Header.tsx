'use client'
import { useCart } from '@/lib/cart'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import CartDrawer from './CartDrawer'
import { MENU, MenuItem } from './menuData'
import { supabase } from '@/lib/supabase'

// Раздел (из href ?section=) → ключ настройки баннера
const SECTION_BANNER_KEY: Record<string, string> = {
  lingerie: 'menu_banner_lingerie',
  swim: 'menu_banner_swim',
  clothes: 'menu_banner_clothes',
  tights: 'menu_banner_tights',
  men: 'menu_banner_men',
  kids: 'menu_banner_kids',
}

function sectionFromHref(href?: string): string | null {
  if (!href) return null
  const m = href.match(/section=([a-z]+)/)
  return m ? m[1] : null
}

export default function Header() {
  const totalItems = useCart(s => s.totalItems())
  const [mounted, setMounted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [banners, setBanners] = useState<Record<string, string>>({})
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setMounted(true), [])

  // Загружаем баннеры меню из настроек
  useEffect(() => {
    supabase.from('site_settings').select('key, value').then(({ data }) => {
      const map: Record<string, string> = {}
      for (const row of data || []) { if (row.value) map[row.key] = row.value }
      setBanners(map)
    })
  }, [])

  // Закрываем меню с задержкой — чтобы можно было водить мышью между пунктом и панелью
  function scheduleClose() {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    closeTimer.current = setTimeout(() => setOpenIndex(null), 150)
  }
  function cancelClose() {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null }
  }

  // ESC закрывает меню
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpenIndex(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header className="nav">
        <nav className="mega-nav" onMouseLeave={scheduleClose}>
          {MENU.map((item, i) => {
            const sec = sectionFromHref(item.href)
            const bannerImg = sec ? banners[SECTION_BANNER_KEY[sec]] : undefined
            return (
            <MegaItem
              key={item.label}
              item={item}
              isOpen={openIndex === i}
              onOpen={() => { cancelClose(); setOpenIndex(i) }}
              bannerImg={bannerImg}
            />
            )
          })}
        </nav>

        <Link href="/" className="brand" onMouseEnter={() => setOpenIndex(null)}>
          Annabelle <b>Arto</b>
        </Link>

        <div className="nav-right" onMouseEnter={() => setOpenIndex(null)}>
          <button className="nav-icon" title="Поиск">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
            </svg>
          </button>
          <button onClick={() => setCartOpen(true)} className="cart-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            Корзина
            {mounted && totalItems > 0 && (
              <span style={{ background:'var(--rose)', color:'var(--ink)', fontSize:10, width:18, height:18, borderRadius:999, display:'grid', placeItems:'center', fontFamily:'JetBrains Mono,monospace', fontWeight:500 }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="marquee" onMouseEnter={() => setOpenIndex(null)}>
        <div className="marquee-track">
          {['Доставка по всему Казахстану','Kaspi Pay · Halyk Bank · Visa / MC','Возврат 30 дней','Размеры XS – 3XL','Новая коллекция 2025',
            'Доставка по всему Казахстану','Kaspi Pay · Halyk Bank · Visa / MC','Возврат 30 дней','Размеры XS – 3XL','Новая коллекция 2025',
          ].map((t,i) => <span key={i}>{t}</span>)}
        </div>
      </div>

      {cartOpen && <CartDrawer onClose={() => setCartOpen(false)} />}
    </>
  )
}

function MegaItem({ item, isOpen, onOpen, bannerImg }: { item: MenuItem; isOpen: boolean; onOpen: () => void; bannerImg?: string }) {
  // Outlet и др. без выпадения — обычная ссылка
  if (item.href && !item.columns) {
    return <Link href={item.href} className="mega-link">{item.label}</Link>
  }

  const colCount = item.columns?.length || 0
  const hasBanner = !!bannerImg

  // Если у пункта есть и href и columns — это кликабельный заголовок раздела
  // Клик ведёт на страницу раздела, наведение раскрывает выпадашку
  return (
    <div className="mega-wrap" onMouseEnter={onOpen}>
      {item.href ? (
        <Link href={item.href} className={`mega-link ${isOpen ? 'is-active' : ''}`}>
          {item.label}
        </Link>
      ) : (
        <button className={`mega-link ${isOpen ? 'is-active' : ''}`} type="button">
          {item.label}
        </button>
      )}

      {isOpen && item.columns && (
        <div className="mega-panel" data-cols={colCount + (hasBanner ? 1 : 0)}>
          <div className="mega-panel-inner">
            {item.columns.map(col => (
              <div key={col.title} className="mega-col">
                <div className="mega-col-title">{col.title}</div>
                <ul className="mega-col-list">
                  {col.items.map(it => (
                    <li key={it.label}>
                      <Link href={it.href} className="mega-col-link">{it.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {bannerImg && (
              <Link href={item.href || '/catalog'} className="mega-banner" style={{ position: 'relative', overflow: 'hidden', minHeight: 280, borderRadius: 14, display: 'block' }}>
                <img src={bannerImg} alt={item.label} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(58,40,40,0.5), transparent 60%)' }} />
                <div className="mega-banner-text" style={{ position: 'absolute', bottom: 18, left: 18, zIndex: 2 }}>
                  <div className="mega-banner-title" style={{ color: '#fff7f3' }}>{item.label}</div>
                  <div className="mega-banner-subtitle" style={{ color: 'rgba(255,247,243,0.85)' }}>Смотреть раздел →</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
