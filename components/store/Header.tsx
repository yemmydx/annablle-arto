'use client'
import { useCart } from '@/lib/cart'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import CartDrawer from './CartDrawer'
import { MENU, MenuItem } from './menuData'

export default function Header() {
  const totalItems = useCart(s => s.totalItems())
  const [mounted, setMounted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => setMounted(true), [])

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
          {MENU.map((item, i) => (
            <MegaItem
              key={item.label}
              item={item}
              isOpen={openIndex === i}
              onOpen={() => { cancelClose(); setOpenIndex(i) }}
            />
          ))}
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

function MegaItem({ item, isOpen, onOpen }: { item: MenuItem; isOpen: boolean; onOpen: () => void }) {
  // Outlet и др. без выпадения — обычная ссылка
  if (item.href && !item.columns) {
    return <Link href={item.href} className="mega-link">{item.label}</Link>
  }

  const colCount = item.columns?.length || 0
  const hasBanner = !!item.banner

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

            {item.banner && (
              <Link href={item.banner.href} className="mega-banner">
                <div className="mega-banner-overlay" />
                <div className="mega-banner-text">
                  <div className="mega-banner-title">{item.banner.title}</div>
                  <div className="mega-banner-subtitle">{item.banner.subtitle}</div>
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
