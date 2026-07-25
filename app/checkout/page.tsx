'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { useCart } from '@/lib/cart'
import { formatPrice, DELIVERY_METHODS, PAYMENT_METHODS, KZ_CITIES, optimizeImage } from '@/lib/utils'

const FREE_SHIP = 15000
const SHIP_COST = 1500

const labelStyle: React.CSSProperties = {
  fontSize: 11, color: 'var(--ink-soft)', display: 'block', marginBottom: 6,
}
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1px solid var(--line)', borderRadius: 10,
  padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', color: 'var(--ink)',
  background: 'var(--cream)', outline: 'none', transition: 'border-color .2s',
}
const legendStyle: React.CSSProperties = {
  fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em',
  textTransform: 'uppercase', color: 'var(--ink)', opacity: 0.6, marginBottom: 16,
  display: 'block',
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    city: 'Алматы',
    address: '',
    delivery_method: 'courier',
    payment_method: 'kaspi',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  const subtotal = totalPrice()
  const shipping = subtotal > FREE_SHIP ? 0 : SHIP_COST

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        total_amount: totalPrice(),
        items: items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          size: i.size,
          color: i.color,
          qty: i.qty,
          price: i.product.price,
        })),
      }),
    })

    setLoading(false)

    if (res.ok) {
      clearCart()
      setSuccess(true)
    } else {
      alert('Не удалось оформить заказ. Попробуйте ещё раз или напишите нам.')
    }
  }

  if (items.length === 0 && !success) {
    router.push('/cart')
    return null
  }

  if (success) {
    return (
      <main>
        <Header />
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: 999, background: 'var(--rose)', display: 'grid', placeItems: 'center', margin: '0 auto 24px', fontSize: 32, color: 'var(--ink)' }}>✓</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 40, lineHeight: 1.1, marginBottom: 16 }}>
            Заказ <em style={{ fontStyle: 'italic', color: 'var(--rose-deep)' }}>оформлен!</em>
          </h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.6, marginBottom: 32 }}>
            Спасибо за покупку! Мы свяжемся с вами в ближайшее время для подтверждения заказа и уточнения деталей доставки.
          </p>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 32px', borderRadius: 999, background: 'var(--ink)', color: 'var(--cream)', textDecoration: 'none', fontSize: 13, letterSpacing: '0.04em' }}>
            На главную
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px 80px' }}>
        <div className="crumbs" style={{ marginBottom: 18 }}>
          <Link href="/">Главная</Link> / <Link href="/cart">Корзина</Link> / Оформление
        </div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.05, marginBottom: 36 }}>
          Оформление <em style={{ fontStyle: 'italic', color: 'var(--rose-deep)' }}>заказа</em>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="checkout-grid">
            {/* ЛЕВАЯ КОЛОНКА — ФОРМА */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {/* Контакты */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={legendStyle}>Контактные данные</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Имя и фамилия *</label>
                    <input name="customer_name" value={form.customer_name} onChange={handleChange} required placeholder="Айгерим Сейткали" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Телефон *</label>
                    <input name="customer_phone" value={form.customer_phone} onChange={handleChange} required placeholder="+7 700 000 00 00" style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Email</label>
                    <input name="customer_email" value={form.customer_email} onChange={handleChange} type="email" placeholder="email@example.com" style={inputStyle} />
                  </div>
                </div>
              </fieldset>

              {/* Доставка */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={legendStyle}>Доставка</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Город *</label>
                    <select name="city" value={form.city} onChange={handleChange} style={inputStyle}>
                      {KZ_CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Способ доставки *</label>
                    <select name="delivery_method" value={form.delivery_method} onChange={handleChange} style={inputStyle}>
                      {DELIVERY_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Адрес *</label>
                    <input name="address" value={form.address} onChange={handleChange} required placeholder="ул. Абая 10, кв. 5" style={inputStyle} />
                  </div>
                </div>
              </fieldset>

              {/* Оплата */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={legendStyle}>Оплата</legend>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {PAYMENT_METHODS.map(m => {
                    const active = form.payment_method === m.value
                    return (
                      <label key={m.value} style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px',
                        borderRadius: 12, cursor: 'pointer', transition: 'all .2s',
                        border: `1px solid ${active ? 'var(--ink)' : 'var(--line)'}`,
                        background: active ? 'rgba(255,247,243,0.7)' : 'transparent',
                      }}>
                        <input type="radio" name="payment_method" value={m.value} checked={active} onChange={handleChange} style={{ accentColor: 'var(--ink)' }} />
                        <span style={{ fontSize: 13, color: 'var(--ink)' }}>{m.label}</span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>

              {/* Примечание */}
              <div>
                <label style={legendStyle}>Примечание к заказу</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} placeholder="Любые пожелания по доставке..." style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
            </div>

            {/* ПРАВАЯ КОЛОНКА — СВОДКА */}
            <div>
              <div style={{ background: 'rgba(255,247,243,0.6)', border: '1px solid var(--line)', borderRadius: 16, padding: 24, position: 'sticky', top: 24 }}>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 26, marginBottom: 18 }}>Ваш заказ</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 18 }}>
                  {items.map(item => {
                    const img = item.product.images?.[0]
                    return (
                      <div key={`${item.product.id}-${item.size}`} style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 12, alignItems: 'center' }}>
                        <div style={{ aspectRatio: '3/4', width: 56, borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(165deg,#f3c8be,#d99c8e)', position: 'relative', flexShrink: 0 }}>
                          {img && <img src={optimizeImage(img, {width:250, quality:85})} alt={item.product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                          <span style={{ position: 'absolute', top: -6, right: -6, background: 'var(--ink)', color: 'var(--cream)', fontSize: 10, width: 18, height: 18, borderRadius: 999, display: 'grid', placeItems: 'center', fontFamily: 'JetBrains Mono, monospace' }}>{item.qty}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.3 }}>{item.product.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-soft)', marginTop: 2 }}>
                            р. {item.size}{item.color ? ` · ${item.color}` : ''}
                          </div>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{formatPrice(item.product.price * item.qty)}</div>
                      </div>
                    )
                  })}
                </div>

                <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-soft)' }}>
                    <span>Подытог</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-soft)' }}>
                    <span>Доставка</span><span>{shipping === 0 ? 'Бесплатно' : formatPrice(shipping)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 10, marginTop: 4, borderTop: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 14 }}>Итого</span>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26 }}>{formatPrice(subtotal + shipping)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading} style={{
                  width: '100%', marginTop: 20, padding: '16px 24px', borderRadius: 999,
                  background: 'var(--ink)', color: 'var(--cream)', border: 'none',
                  cursor: loading ? 'wait' : 'pointer', fontFamily: 'inherit', fontSize: 13,
                  letterSpacing: '0.04em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  opacity: loading ? 0.6 : 1, transition: 'opacity .2s',
                }}>
                  {loading ? 'Оформляем...' : 'Подтвердить заказ'}
                  {!loading && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>}
                </button>

                {shipping > 0 && (
                  <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-soft)', opacity: 0.7, marginTop: 12 }}>
                    Бесплатная доставка от {formatPrice(FREE_SHIP)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />

      <style jsx>{`
        .checkout-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 32px;
          }
        }
      `}</style>
    </main>
  )
}
