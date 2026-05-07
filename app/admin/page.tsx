'use client'
import { useState, useEffect } from 'react'
import { formatPrice, slugify, ORDER_STATUSES } from '@/lib/utils'

type Product = {
  id: string; name: string; slug: string; description: string | null
  price: number; price_old: number | null; category_id: string | null
  images: string[]; in_stock: boolean; is_new: boolean; is_featured: boolean
  created_at: string; categories?: { name: string; slug: string } | null
  product_variants?: { size: string }[]
}
type Order = {
  id: string; order_number: number; status: string; customer_name: string
  customer_phone: string; city: string; address: string; total_amount: number; created_at: string
}
type Category = { id: string; name: string; slug: string }

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'products' | 'orders'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', price_old: '',
    category_id: '', is_new: false, is_featured: false, in_stock: true,
    sizes: 'XS,S,M,L,XL', images: '',
  })

  useEffect(() => { setMounted(true) }, [])

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
      const [{ data: p }, { data: o }, { data: c }] = await Promise.all([
        sb.from('products').select('*, categories(*), product_variants(size)').order('created_at', { ascending: false }),
        sb.from('orders').select('*').order('created_at', { ascending: false }),
        sb.from('categories').select('*').order('name'),
      ])
      setProducts(p || [])
      setOrders(o || [])
      setCategories(c || [])
    } catch(err) { console.error(err) }
    setLoading(false)
  }

  function openAddForm() {
    setEditProduct(null)
    setForm({ name: '', description: '', price: '', price_old: '', category_id: categories[0]?.id || '', is_new: false, is_featured: false, in_stock: true, sizes: 'XS,S,M,L,XL', images: '' })
    setShowForm(true)
  }

  function openEditForm(p: Product) {
    setEditProduct(p)
    const sizes = Array.from(new Set(p.product_variants?.map(v => v.size) || [])).join(',')
    setForm({ name: p.name, description: p.description || '', price: String(p.price), price_old: p.price_old ? String(p.price_old) : '', category_id: p.category_id || '', is_new: p.is_new, is_featured: p.is_featured, in_stock: p.in_stock, sizes, images: p.images?.join('\n') || '' })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const sb = await getSupabase()
    const productData = {
      name: form.name, slug: slugify(form.name), description: form.description || null,
      price: parseInt(form.price), price_old: form.price_old ? parseInt(form.price_old) : null,
      category_id: form.category_id || null, is_new: form.is_new, is_featured: form.is_featured,
      in_stock: form.in_stock, images: form.images.split('\n').map(s => s.trim()).filter(Boolean),
    }
    let productId = editProduct?.id
    if (editProduct) {
      await sb.from('products').update(productData).eq('id', editProduct.id)
      await sb.from('product_variants').delete().eq('product_id', editProduct.id)
    } else {
      const { data } = await sb.from('products').insert(productData).select().single()
      productId = data?.id
    }
    if (productId && form.sizes) {
      const variants = form.sizes.split(',').map(s => ({ product_id: productId, size: s.trim(), stock_qty: 10 }))
      await sb.from('product_variants').insert(variants)
    }
    setShowForm(false)
    loadData()
  }

  async function handleDelete(id: string) {
    if (!confirm('Удалить товар?')) return
    const sb = await getSupabase()
    await sb.from('products').delete().eq('id', id)
    loadData()
  }

  async function updateOrderStatus(id: string, status: string) {
    const sb = await getSupabase()
    await sb.from('orders').update({ status }).eq('id', id)
    loadData()
  }

  if (!mounted) return null

  if (!authed) {
    return (
      <div style={{ minHeight:'100vh', background:'#faf8f5', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background:'white', padding:'40px', border:'1px solid #e7e5e4', width:'320px' }}>
          <h1 style={{ textAlign:'center', marginBottom:'24px', fontWeight:300, fontSize:'22px' }}>
            Annabelle Arto<br/><span style={{ fontSize:'16px', color:'#b45309' }}>Панель управления</span>
          </h1>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль"
            style={{ width:'100%', border:'1px solid #e7e5e4', padding:'10px 12px', fontSize:'13px', marginBottom:'12px', boxSizing:'border-box', outline:'none' }} />
          <button type="submit" style={{ width:'100%', background:'#1c1917', color:'white', border:'none', padding:'12px', fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer' }}>
            Войти
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ minHeight:'100vh', background:'#faf8f5', fontFamily:'sans-serif' }}>
      {/* Шапка */}
      <div style={{ background:'#1c1917', color:'white', padding:'14px 32px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <span style={{ fontSize:'15px', letterSpacing:'1px' }}>Annabelle Arto · Админ</span>
        <div style={{ display:'flex', gap:'24px', alignItems:'center' }}>
          <button onClick={() => setTab('products')} style={{ background:'none', border:'none', color: tab==='products' ? '#fbbf24' : '#a8a29e', cursor:'pointer', fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase' }}>
            Товары ({products.length})
          </button>
          <button onClick={() => setTab('orders')} style={{ background:'none', border:'none', color: tab==='orders' ? '#fbbf24' : '#a8a29e', cursor:'pointer', fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase' }}>
            Заказы ({orders.filter(o => o.status === 'pending').length} новых)
          </button>
          <a href="/" style={{ color:'#a8a29e', textDecoration:'none', fontSize:'12px' }}>← Сайт</a>
        </div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'32px' }}>
        {/* Товары */}
        {tab === 'products' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontWeight:300, fontSize:'22px', margin:0 }}>Товары</h2>
              <button onClick={openAddForm} style={{ background:'#b45309', color:'white', border:'none', padding:'10px 20px', fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer' }}>
                + Добавить товар
              </button>
            </div>
            <div style={{ background:'white', border:'1px solid #e7e5e4' }}>
              {loading && <p style={{ textAlign:'center', padding:'32px', color:'#a8a29e' }}>Загрузка...</p>}
              {!loading && products.length === 0 && <p style={{ textAlign:'center', padding:'40px', color:'#a8a29e' }}>Товаров пока нет. Добавьте первый!</p>}
              {products.map(p => (
                <div key={p.id} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', borderBottom:'1px solid #f5f5f4' }}>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:'0 0 4px', fontSize:'14px', fontWeight:500 }}>{p.name}</p>
                    <p style={{ margin:0, fontSize:'11px', color:'#a8a29e' }}>
                      {p.categories?.name || 'Без категории'} · {formatPrice(p.price)}
                      {p.is_new && ' · Новинка'}{p.is_featured && ' · Хит'}
                    </p>
                  </div>
                  <span style={{ fontSize:'10px', padding:'2px 8px', background: p.in_stock ? '#dcfce7' : '#fee2e2', color: p.in_stock ? '#166534' : '#991b1b' }}>
                    {p.in_stock ? 'В наличии' : 'Нет'}
                  </span>
                  <button onClick={() => openEditForm(p)} style={{ background:'none', border:'none', color:'#b45309', cursor:'pointer', fontSize:'12px' }}>Изменить</button>
                  <button onClick={() => handleDelete(p.id)} style={{ background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'12px' }}>Удалить</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Заказы */}
        {tab === 'orders' && (
          <div>
            <h2 style={{ fontWeight:300, fontSize:'22px', marginBottom:'20px' }}>Заказы</h2>
            <div style={{ background:'white', border:'1px solid #e7e5e4' }}>
              {!loading && orders.length === 0 && <p style={{ textAlign:'center', padding:'40px', color:'#a8a29e' }}>Заказов пока нет</p>}
              {orders.map(o => (
                <div key={o.id} style={{ padding:'14px 16px', borderBottom:'1px solid #f5f5f4' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                    <span style={{ fontSize:'14px', fontWeight:500 }}>Заказ #{o.order_number} · {new Date(o.created_at).toLocaleDateString('ru-KZ')}</span>
                    <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                      <span style={{ fontSize:'16px' }}>{formatPrice(o.total_amount)}</span>
                      <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                        style={{ fontSize:'12px', border:'1px solid #e7e5e4', padding:'4px 8px', background:'white', outline:'none' }}>
                        {Object.entries(ORDER_STATUSES).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                      </select>
                    </div>
                  </div>
                  <p style={{ margin:0, fontSize:'12px', color:'#a8a29e' }}>{o.customer_name} · {o.customer_phone} · {o.city}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Модалка добавления/редактирования */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'16px' }}
          onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={{ background:'white', width:'100%', maxWidth:'480px', maxHeight:'90vh', overflowY:'auto', padding:'24px' }}>
            <h2 style={{ fontWeight:300, fontSize:'20px', marginBottom:'20px' }}>{editProduct ? 'Изменить товар' : 'Новый товар'}</h2>
            <form onSubmit={handleSave} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {[
                { label:'Название *', key:'name', required:true },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px' }}>{f.label}</label>
                  <input value={(form as any)[f.key]} onChange={e => setForm(p => ({...p, [f.key]: e.target.value}))} required={f.required}
                    style={{ width:'100%', border:'1px solid #e7e5e4', padding:'8px 12px', fontSize:'13px', boxSizing:'border-box', outline:'none' }} />
                </div>
              ))}
              <div>
                <label style={{ fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px' }}>Описание</label>
                <textarea value={form.description} onChange={e => setForm(p => ({...p, description: e.target.value}))} rows={3}
                  style={{ width:'100%', border:'1px solid #e7e5e4', padding:'8px 12px', fontSize:'13px', boxSizing:'border-box', outline:'none', resize:'none' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <label style={{ fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px' }}>Цена (₸) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(p => ({...p, price: e.target.value}))} required
                    style={{ width:'100%', border:'1px solid #e7e5e4', padding:'8px 12px', fontSize:'13px', boxSizing:'border-box', outline:'none' }} />
                </div>
                <div>
                  <label style={{ fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px' }}>Старая цена (₸)</label>
                  <input type="number" value={form.price_old} onChange={e => setForm(p => ({...p, price_old: e.target.value}))}
                    style={{ width:'100%', border:'1px solid #e7e5e4', padding:'8px 12px', fontSize:'13px', boxSizing:'border-box', outline:'none' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px' }}>Категория</label>
                <select value={form.category_id} onChange={e => setForm(p => ({...p, category_id: e.target.value}))}
                  style={{ width:'100%', border:'1px solid #e7e5e4', padding:'8px 12px', fontSize:'13px', background:'white', outline:'none' }}>
                  <option value="">Без категории</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px' }}>Размеры (через запятую)</label>
                <input value={form.sizes} onChange={e => setForm(p => ({...p, sizes: e.target.value}))} placeholder="XS,S,M,L,XL"
                  style={{ width:'100%', border:'1px solid #e7e5e4', padding:'8px 12px', fontSize:'13px', boxSizing:'border-box', outline:'none' }} />
              </div>
              <div>
                <label style={{ fontSize:'11px', color:'#78716c', display:'block', marginBottom:'4px' }}>Ссылки на фото (каждая с новой строки)</label>
                <textarea value={form.images} onChange={e => setForm(p => ({...p, images: e.target.value}))} rows={3} placeholder="https://..."
                  style={{ width:'100%', border:'1px solid #e7e5e4', padding:'8px 12px', fontSize:'13px', boxSizing:'border-box', outline:'none', resize:'none' }} />
              </div>
              <div style={{ display:'flex', gap:'16px', fontSize:'13px' }}>
                {[['is_new','Новинка'],['is_featured','Хит продаж'],['in_stock','В наличии']].map(([key,label]) => (
                  <label key={key} style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer' }}>
                    <input type="checkbox" checked={(form as any)[key]} onChange={e => setForm(p => ({...p, [key]: e.target.checked}))} />
                    {label}
                  </label>
                ))}
              </div>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="submit" disabled={loading}
                  style={{ flex:1, background:'#1c1917', color:'white', border:'none', padding:'12px', fontSize:'12px', letterSpacing:'2px', textTransform:'uppercase', cursor:'pointer', opacity: loading ? 0.5 : 1 }}>
                  {loading ? 'Сохраняем...' : 'Сохранить'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  style={{ padding:'12px 20px', border:'1px solid #e7e5e4', background:'white', fontSize:'12px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'1px' }}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
