'use client'
import { useCart } from '@/lib/cart'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import CartDrawer from './CartDrawer'

export default function Header() {
  const totalItems = useCart(s => s.totalItems())
  const [mounted, setMounted] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      <header className="nav">
        <div className="nav-left">
          <Link href="/catalog" className="nav-link">Каталог</Link>
          <Link href="/catalog?new=true" className="nav-link">Новинки</Link>
          <Link href="/about" className="nav-link">О бренде</Link>
        </div>
        <Link href="/" className="brand">Annabelle <b>Arto</b></Link>
        <div className="nav-right">
          <Link href="/catalog?category=komplekty" className="nav-link" style={{fontSize:13}}>Комплекты</Link>
          <Link href="/catalog?category=pijamy" className="nav-link" style={{fontSize:13}}>Пижамы</Link>
          <button className="nav-icon" title="Поиск">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          </button>
          <button onClick={() => setCartOpen(true)} className="cart-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>
            Корзина
            {mounted && totalItems > 0 && (
              <span style={{background:'var(--rose)',color:'var(--ink)',fontSize:10,width:18,height:18,borderRadius:999,display:'grid',placeItems:'center',fontFamily:'JetBrains Mono,monospace',fontWeight:500}}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>
      <div className="marquee">
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
