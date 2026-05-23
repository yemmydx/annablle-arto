'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type Product = {
  id: string
  name: string
  slug: string
  price: number
  price_old?: number
  in_stock: boolean
  is_new: boolean
  is_featured: boolean
  images: string[]
  created_at: string
  categories?: { name: string; slug: string } | null
  product_variants?: { size: string }[]
}

type Order = {
  id: string
  order_number: number
  status: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  city?: string
  address?: string
  delivery_method?: string
  payment_method?: string
  notes?: string
  total_amount: number
  created_at: string
}

type Category = { id: string; name: string; slug: string }

const STATUS_LABELS: Record<string, string> = {
  new: 'Новый',
  confirmed: 'Подтверждён',
  shipping: 'Доставляется',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

const STATUS_COLORS: Record<string, string> = {
  new: '#c084fc',
  confirmed: '#60a5fa',
  shipping: '#fb923c',
  delivered: '#4ade80',
  cancelled: '#f87171',
}

function formatPrice(n: number) {
  return n?.toLocaleString('ru-RU') + ' ₸'
}

function formatDate(s: string) {
  return new Date(s).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const S = {
  page: { minHeight: '100vh', background: 'var(--cream, #faf7f4)', color: 'var(--ink, #1a1a1a)', fontFamily: 'inherit' } as React.CSSProperties,
  header: { borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white' } as React.CSSProperties,
  logo: { fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, textDecoration: 'none', color: 'inherit' } as React.CSSProperties,
  wrap: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' } as React.CSSProperties,
  title: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(32px,4vw,48px)', lineHeight: 1.1, marginBottom: 8 } as React.CSSProperties,
  tabs: { display: 'flex', gap: 4, marginBottom: 32, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: 0 } as React.CSSProperties,
  tab: { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, letterSpacing: '0.06em', textTransform: 'uppercase' as const, opacity: 0.5, borderBottom: '2px solid transparent', marginBottom: -1 },
  tabActive: { opacity: 1, borderBottomColor: 'var(--ink, #1a1a1a)' },
  tabBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 999, background: '#c084fc', color: 'white', fontSize: 10, fontWeight: 700, marginLeft: 6 } as React.CSSProperties,
  card: { background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '20px 24px', marginBottom: 12 } as React.CSSProperties,
  btn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 999, border: 'none', cursor: 'pointer', fontSize: 13, letterSpacing: '0.04em' } as React.CSSProperties,
  btnDark: { background: 'var(--ink, #1a1a1a)', color: 'white' } as React.CSSProperties,
  btnOutline: { background: 'transparent', color: 'var(--ink, #1a1a1a)', border: '1px solid rgba(0,0,0,0.2)' } as React.CSSProperties,
  input: { width: '100%', padding: '10px 14px', border: '1px solid rgba(0,0,0,0.15)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', background: 'white', boxSizing: 'border-box' as const },
  label: { display: 'block', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase' as const, opacity: 0.5, marginBottom: 6 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 } as React.CSSProperties,
  statusBadge: (s: string): React.CSSProperties => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: 999, fontSize: 11,
    fontWeight: 600, background: STATUS_COLORS[s] + '22', color: STATUS_COLORS[s],
  }),
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'products' | 'orders' | 'settings'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', price_old: '',
    category_id: '', is_new: false, is_featured: false, in_stock: true,
    sizes: 'XS,S,M,L,XL', images: '',
  })

  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return null

  const newOrdersCount = orders.filter(o => o.status === 'new').length

  async function getSupabase() {
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) { setAuthed(true); loadData() }
    else alert('Неверный пароль')
  }

  async function loadData() {
    setLoading(true)
    try {
      const sb = await getSupabase()
      const [{ data: p }, ordersRes, { data: c }] = await Promise.all([
        sb.from('products').select('*, categories(*), product_variants(size)').order('created_at', { ascending: false }),
        fetch('/api/admin/orders').then(r => r.json()),
        sb.from('categories').select('*').order('name'),
      ])
      setProducts(p || [])
      setOrders(Array.isArray(ordersRes) ? ordersRes : [])
      setCategories(c || [])
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  async function updateOrderStatus(id: string, status: string) {
    await fetch('/api/admin/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))
  }

  function openAddForm() {
    setEditProduct(null)
    setForm({ name: '', description: '', price: '', price_old: '', category_id: categories[0]?.id || '', is_new: false, is_featured: false, in_stock: true, sizes: 'XS,S,M,L,XL', images: '' })
    setShowForm(true)
  }

  function openEditForm(p: Product) {
    setEditProduct(p)
    const sizes = [...new Set(p.product_variants?.map(v => v.size) || [])].join(',')
    setForm({
      name: p.name, description: p.description || '', price: String(p.price),
      price_old: p.price_old ? String(p.price_old) : '',
      category_id: (p.categories as any)?.id || '',
      is_new: p.is_new, is_featured: p.is_featured, in_stock: p.in_stock,
      sizes, images: (p.images || []).join('\n'),
    })
    setShowForm(true)
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    const sb = await getSupabase()
    const images = form.images.split('\n').map(s => s.trim()).filter(Boolean)
    const sizes = form.sizes.split(',').map(s => s.trim()).filter(Boolean)
    const { createClient } = await import('@supabase/supabase-js')
    const sbAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    function slugify(s: string) {
      return s.toLowerCase().replace(/[^a-zа-яё0-9\s-]/gi, '').replace(/\s+/g, '-').replace(/[а-яё]/g, c => ({ а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'ts',ч:'ch',ш:'sh',щ:'sch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya' }[c] || c))
    }

    const payload = {
      name: form.name,
      slug: editProduct?.slug || slugify(form.name) + '-' + Date.now(),
      description: form.description,
      price: Number(form.price),
      price_old: form.price_old ? Number(form.price_old) : null,
      category_id: form.category_id || null,
      is_new: form.is_new,
      is_featured: form.is_featured,
      in_stock: form.in_stock,
      images,
    }

    if (editProduct) {
      await sb.from('products').update(payload).eq('id', editProduct.id)
      await sb.from('product_variants').delete().eq('product_id', editProduct.id)
      await sb.from('product_variants').insert(sizes.map(size => ({ product_id: editProduct.id, size, in_stock: true })))
    } else {
      const { data: newP } = await sb.from('products').insert(payload).select().single()
      if (newP) await sb.from('product_variants').insert(sizes.map(size => ({ product_id: newP.id, size, in_stock: true })))
    }

    setShowForm(false)
    loadData()
  }

  async function deleteProduct(id: string) {
    if (!confirm('Удалить товар?')) return
    const sb = await getSupabase()
    await sb.from('product_variants').delete().eq('product_id', id)
    await sb.from('products').delete().eq('id', id)
    loadData()
  }

  // ─── LOGIN ────────────────────────────────────────────────────────────────
  if (!authed) return (
    <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 360, background: 'white', borderRadius: 16, padding: '40px 32px', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 32, marginBottom: 4, textAlign: 'center' }}>
          Annabelle Arto
        </h1>
        <p style={{ textAlign: 'center', fontSize: 12, opacity: 0.4, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 32 }}>
          Панель управления
        </p>
        <form onSubmit={handleLogin}>
          <label style={S.label}>Пароль</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ ...S.input, marginBottom: 20 }} placeholder="••••••••" autoFocus
          />
          <button type="submit" style={{ ...S.btn, ...S.btnDark, width: '100%', justifyContent: 'center' }}>
            Войти
          </button>
        </form>
      </div>
    </div>
  )

  // ─── MAIN ─────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      {/* Header */}
      <header style={S.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={S.logo}>Annabelle Arto</Link>
          <span style={{ fontSize: 11, opacity: 0.3, letterSpacing: '0.1em', textTransform: 'uppercase' }}>· admin</span>
        </div>
        <Link href="/" style={{ ...S.btn, ...S.btnOutline, fontSize: 12 }}>← На сайт</Link>
      </header>

      <div style={S.wrap}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={S.title}>Панель <em style={{ fontStyle: 'italic', color: 'var(--rose-deep, #b07060)' }}>управления</em></h1>
          <p style={{ fontSize: 12, opacity: 0.4, letterSpacing: '0.06em' }}>
            · {products.length} товаров · {orders.length} заказов
          </p>
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {(['products', 'orders', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ ...S.tab, ...(tab === t ? S.tabActive : {}) }}>
              {t === 'products' ? 'Товары' : t === 'orders' ? (
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Заказы {newOrdersCount > 0 && <span style={S.tabBadge}>{newOrdersCount}</span>}
                </span>
              ) : 'Настройки'}
            </button>
          ))}
        </div>

        {loading && <p style={{ opacity: 0.4, fontSize: 13 }}>Загрузка...</p>}

        {/* ═══════════════ ORDERS TAB ═══════════════ */}
        {tab === 'orders' && !loading && (
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4, marginBottom: 20 }}>
              История заказов
            </p>

            {orders.length === 0 ? (
              <div style={{ ...S.card, textAlign: 'center', padding: '60px 24px' }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 24, opacity: 0.3, marginBottom: 8 }}>Пока тихо</p>
                <p style={{ fontSize: 13, opacity: 0.4 }}>Заказы появятся здесь.</p>
              </div>
            ) : orders.map(order => (
              <div key={order.id} style={S.card}>
                {/* Order header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 400 }}>
                      #{order.order_number}
                    </span>
                    <span style={S.statusBadge(order.status)}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                    <span style={{ fontSize: 13, opacity: 0.5 }}>{order.customer_name}</span>
                    <span style={{ fontSize: 13, opacity: 0.5 }}>{order.customer_phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>
                      {formatPrice(order.total_amount)}
                    </span>
                    <span style={{ fontSize: 12, opacity: 0.4 }}>{formatDate(order.created_at)}</span>
                    <span style={{ opacity: 0.3 }}>{expandedOrder === order.id ? '▲' : '▼'}</span>
                  </div>
                </div>

                {/* Order details */}
                {expandedOrder === order.id && (
                  <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid rgba(0,0,0,0.07)' }}>
                    <div style={S.grid2}>
                      <div>
                        <p style={S.label}>Покупатель</p>
                        <p style={{ fontSize: 14, marginBottom: 4 }}>{order.customer_name}</p>
                        <p style={{ fontSize: 13, opacity: 0.6 }}>{order.customer_phone}</p>
                        {order.customer_email && <p style={{ fontSize: 13, opacity: 0.6 }}>{order.customer_email}</p>}
                      </div>
                      <div>
                        <p style={S.label}>Доставка</p>
                        <p style={{ fontSize: 14, marginBottom: 4 }}>{order.city}</p>
                        {order.address && <p style={{ fontSize: 13, opacity: 0.6 }}>{order.address}</p>}
                        {order.delivery_method && <p style={{ fontSize: 12, opacity: 0.4, marginTop: 4 }}>{order.delivery_method}</p>}
                      </div>
                    </div>

                    {order.notes && (
                      <div style={{ marginTop: 16 }}>
                        <p style={S.label}>Примечание</p>
                        <p style={{ fontSize: 13, opacity: 0.7, fontStyle: 'italic' }}>{order.notes}</p>
                      </div>
                    )}

                    {/* Status change */}
                    <div style={{ marginTop: 20 }}>
                      <p style={S.label}>Изменить статус</p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                          <button
                            key={key}
                            onClick={() => updateOrderStatus(order.id, key)}
                            style={{
                              ...S.btn,
                              padding: '6px 14px',
                              fontSize: 12,
                              background: order.status === key ? STATUS_COLORS[key] : 'transparent',
                              color: order.status === key ? 'white' : STATUS_COLORS[key],
                              border: `1px solid ${STATUS_COLORS[key]}`,
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ PRODUCTS TAB ═══════════════ */}
        {tab === 'products' && !loading && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <p style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.4 }}>
                Все товары ({products.length})
              </p>
              <button onClick={openAddForm} style={{ ...S.btn, ...S.btnDark }}>+ Добавить товар</button>
            </div>

            {/* Product form */}
            {showForm && (
              <div style={{ ...S.card, marginBottom: 24, border: '1px solid rgba(0,0,0,0.15)' }}>
                <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 24, marginBottom: 20 }}>
                  {editProduct ? 'Редактировать товар' : 'Новый товар'}
                </h3>
                <form onSubmit={handleSaveProduct}>
                  <div style={{ ...S.grid2, marginBottom: 16 }}>
                    <div>
                      <label style={S.label}>Название *</label>
                      <input style={S.input} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={S.label}>Категория</label>
                      <select style={S.input} value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}>
                        <option value="">— без категории —</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={S.label}>Описание</label>
                    <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                  </div>
                  <div style={{ ...S.grid2, marginBottom: 16 }}>
                    <div>
                      <label style={S.label}>Цена ₸ *</label>
                      <input style={S.input} type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required />
                    </div>
                    <div>
                      <label style={S.label}>Старая цена ₸</label>
                      <input style={S.input} type="number" value={form.price_old} onChange={e => setForm(f => ({ ...f, price_old: e.target.value }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={S.label}>Размеры (через запятую)</label>
                    <input style={S.input} value={form.sizes} onChange={e => setForm(f => ({ ...f, sizes: e.target.value }))} placeholder="XS,S,M,L,XL" />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={S.label}>Ссылки на фото (каждая с новой строки)</label>
                    <textarea style={{ ...S.input, minHeight: 80, resize: 'vertical', fontSize: 12 }} value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} placeholder="https://..." />
                  </div>
                  <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
                    {[['is_new', 'Новинка'], ['is_featured', 'Хит'], ['in_stock', 'В наличии']].map(([key, label]) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form[key as keyof typeof form] as boolean} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" style={{ ...S.btn, ...S.btnDark }}>
                      {editProduct ? 'Сохранить' : 'Создать товар'}
                    </button>
                    <button type="button" onClick={() => setShowForm(false)} style={{ ...S.btn, ...S.btnOutline }}>
                      Отмена
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products list */}
            {products.map(p => (
              <div key={p.id} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 48, height: 64, borderRadius: 8, background: '#e8d5ce', overflow: 'hidden', flexShrink: 0 }}>
                  {p.images?.[0] && <img src={p.images[0]} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>{p.name}</span>
                    {p.is_new && <span style={{ fontSize: 10, background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: 999 }}>Новинка</span>}
                    {!p.in_stock && <span style={{ fontSize: 10, background: '#fee2e2', color: '#991b1b', padding: '2px 8px', borderRadius: 999 }}>Нет в наличии</span>}
                  </div>
                  <span style={{ fontSize: 13, opacity: 0.5 }}>{(p.categories as any)?.name}</span>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18 }}>{formatPrice(p.price)}</p>
                  {p.price_old && <p style={{ fontSize: 12, opacity: 0.4, textDecoration: 'line-through' }}>{formatPrice(p.price_old)}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEditForm(p)} style={{ ...S.btn, ...S.btnOutline, padding: '6px 14px', fontSize: 12 }}>Изменить</button>
                  <button onClick={() => deleteProduct(p.id)} style={{ ...S.btn, background: '#fee2e2', color: '#991b1b', border: 'none', padding: '6px 14px', fontSize: 12 }}>Удалить</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══════════════ SETTINGS TAB ═══════════════ */}
        {tab === 'settings' && (
          <div style={S.card}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 24, marginBottom: 12 }}>
              Настройки
            </h3>
            <p style={{ fontSize: 13, opacity: 0.5 }}>Раздел в разработке.</p>
          </div>
        )}
      </div>
    </div>
  )
}
