'use client'
import { useState, useEffect } from 'react'
import { formatPrice, slugify, ORDER_STATUSES } from '@/lib/utils'
import { COLLECTIONS_BY_SECTION } from '@/lib/collections'

type Product = {
  id: string; name: string; slug: string; description: string | null
  price: number; price_old: number | null; category_id: string | null
  images: string[]; in_stock: boolean; is_new: boolean; is_featured: boolean
  created_at: string; categories?: { name: string; slug: string } | null
  product_variants?: { size: string; color?: string }[]
}
type Order = {
  id: string; order_number: number; status: string; customer_name: string
  customer_phone: string; city: string; address: string; total_amount: number; created_at: string
}
type Category = { id: string; name: string; slug: string; section?: string }

const SECTIONS: { value: string; label: string }[] = [
  { value: 'lingerie', label: 'Бельё' },
  { value: 'swim', label: 'Купальники' },
  { value: 'clothes', label: 'Одежда' },
  { value: 'tights', label: 'Колготки' },
  { value: 'men', label: 'Мужчинам' },
  { value: 'kids', label: 'Детям' },
]

// Слот для загрузки одного изображения настройки
function SettingImageSlot({ settingKey, value, uploading, onUpload, onRemove, wide, square, tall }: {
  settingKey: string
  value?: string
  uploading: boolean
  onUpload: (files: FileList | null, key: string) => void
  onRemove: (key: string) => void
  wide?: boolean
  square?: boolean
  tall?: boolean
}) {
  const aspect = wide ? '16/9' : square ? '1' : tall ? '3/4' : '4/3'
  return (
    <div>
      <div style={{
        aspectRatio: aspect, borderRadius: 12, overflow: 'hidden', position: 'relative',
        border: '1px solid rgba(58,40,40,0.15)',
        background: value ? '#fbe9e3' : 'linear-gradient(135deg,#f3c8be,#c98e88)',
      }}>
        {value ? (
          <img src={value} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', color: 'rgba(255,247,243,0.8)', fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            нет фото
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <label style={{
          flex: 1, textAlign: 'center', padding: '8px 10px', borderRadius: 999,
          border: '1px solid rgba(58,40,40,0.25)', cursor: uploading ? 'wait' : 'pointer',
          fontSize: 12, background: 'transparent', color: '#3a2828',
        }}>
          <input type="file" accept="image/*" disabled={uploading} style={{ display: 'none' }}
            onChange={e => onUpload(e.target.files, settingKey)} />
          {uploading ? '⏳...' : value ? '🔄 Заменить' : '📷 Загрузить'}
        </label>
        {value && (
          <button type="button" onClick={() => onRemove(settingKey)} style={{
            padding: '8px 12px', borderRadius: 999, border: 'none',
            background: 'transparent', color: '#c98e88', cursor: 'pointer', fontSize: 12,
          }}>
            убрать
          </button>
        )}
      </div>
    </div>
  )
}

const S = {
  page: { minHeight: '100vh', background: '#fbe9e3', color: '#3a2828', fontFamily: "'Inter Tight', -apple-system, sans-serif", fontSize: '15px', lineHeight: 1.5 } as React.CSSProperties,
  bg: { position: 'fixed', inset: 0, zIndex: -1, background: 'radial-gradient(1200px 800px at 80% -10%,#fcd9cc 0%,transparent 60%),radial-gradient(1000px 700px at -10% 110%,#f3c8be 0%,transparent 55%),#fbe9e3' } as React.CSSProperties,
  container: { maxWidth: '1100px', margin: '0 auto', padding: '36px 24px 80px' } as React.CSSProperties,

  topbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 36px', background: 'rgba(251,233,227,0.75)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(58,40,40,0.06)', position: 'sticky', top: 0, zIndex: 50 } as React.CSSProperties,
  brand: { fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontStyle: 'italic', color: '#3a2828', textDecoration: 'none' } as React.CSSProperties,
  brandTag: { fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5a4040', opacity: 0.7, marginLeft: '12px' } as React.CSSProperties,
  backLink: { color: '#3a2828', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '999px', border: '1px solid rgba(58,40,40,0.15)', transition: 'all .25s' } as React.CSSProperties,

  pageTitle: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: 'clamp(40px,5vw,64px)', lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '8px' } as React.CSSProperties,
  pageMeta: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '40px' } as React.CSSProperties,

  tabs: { display: 'flex', gap: '8px', marginBottom: '32px', borderBottom: '1px solid rgba(58,40,40,0.12)' } as React.CSSProperties,
  tab: { background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', color: '#5a4040', padding: '12px 20px', borderRadius: '999px 999px 0 0', transition: 'all .25s' } as React.CSSProperties,
  tabActive: { background: '#3a2828', color: '#fff7f3' } as React.CSSProperties,
  tabBadge: { fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', marginLeft: '8px', padding: '2px 6px', borderRadius: '999px', background: '#c98e88', color: '#fff7f3' } as React.CSSProperties,

  btnPrimary: { display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 22px', borderRadius: '999px', background: '#3a2828', color: '#fff7f3', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', letterSpacing: '0.04em', transition: 'all .3s' } as React.CSSProperties,
  btnGhost: { display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '999px', background: 'transparent', color: '#3a2828', border: '1px solid rgba(58,40,40,0.2)', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', transition: 'all .25s' } as React.CSSProperties,

  card: { background: 'rgba(255,247,243,0.6)', border: '1px solid rgba(58,40,40,0.08)', borderRadius: '14px', overflow: 'hidden', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' } as React.CSSProperties,
  row: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', borderBottom: '1px solid rgba(58,40,40,0.06)', transition: 'background .2s' } as React.CSSProperties,
  rowName: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 400, marginBottom: '2px' } as React.CSSProperties,
  rowMeta: { fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.06em', color: '#5a4040', opacity: 0.7, textTransform: 'uppercase' } as React.CSSProperties,

  pillStock: { fontSize: '10px', fontFamily: "'JetBrains Mono', monospace", padding: '4px 10px', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase', border: '1px solid', whiteSpace: 'nowrap' } as React.CSSProperties,
  pillIn: { background: 'rgba(186, 230, 175, 0.3)', borderColor: 'rgba(72, 130, 60, 0.3)', color: '#3d6b32' } as React.CSSProperties,
  pillOut: { background: 'rgba(232, 180, 166, 0.3)', borderColor: 'rgba(201, 142, 136, 0.4)', color: '#7a3a36' } as React.CSSProperties,

  empty: { textAlign: 'center', padding: '64px 24px', color: '#5a4040', opacity: 0.7 } as React.CSSProperties,
  emptyTitle: { fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: '28px', marginBottom: '8px', opacity: 0.85 } as React.CSSProperties,

  loginWrap: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' } as React.CSSProperties,
  loginCard: { width: '100%', maxWidth: '380px', background: 'rgba(255,247,243,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(58,40,40,0.08)', borderRadius: '20px', padding: '48px 36px', boxShadow: '0 30px 60px -20px rgba(58,40,40,0.15)' } as React.CSSProperties,
  loginBrand: { textAlign: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '34px', fontStyle: 'italic', fontWeight: 300, marginBottom: '4px' } as React.CSSProperties,
  loginSub: { textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5a4040', opacity: 0.7, marginBottom: '36px' } as React.CSSProperties,

  input: { width: '100%', border: '1px solid rgba(58,40,40,0.15)', background: 'rgba(255,247,243,0.5)', padding: '12px 16px', fontSize: '14px', borderRadius: '10px', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit', color: '#3a2828' } as React.CSSProperties,
  label: { fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#5a4040', display: 'block', marginBottom: '8px', opacity: 0.8 } as React.CSSProperties,

  overlay: { position: 'fixed', inset: 0, background: 'rgba(58,40,40,0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' } as React.CSSProperties,
  modal: { background: '#fdf2ee', width: '100%', maxWidth: '560px', maxHeight: '92vh', overflowY: 'auto', borderRadius: '20px', padding: '36px', boxShadow: '0 40px 80px -20px rgba(58,40,40,0.3)' } as React.CSSProperties,
  modalTitle: { fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: '32px', fontStyle: 'italic', marginBottom: '28px', color: '#3a2828' } as React.CSSProperties,

  price: { fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 500 } as React.CSSProperties,
  priceOld: { fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', textDecoration: 'line-through', color: '#5a4040', opacity: 0.5, marginRight: '8px' } as React.CSSProperties,
}

export default function AdminPage() {
  const [mounted, setMounted] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<'products' | 'orders' | 'settings'>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [uploadingSetting, setUploadingSetting] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [uploadingColorIdx, setUploadingColorIdx] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    name: '', description: '', price: '', price_old: '',
    category_id: '', section: '', collection: '', is_new: false, is_featured: false, in_stock: true,
    colors: [] as { id?: string; name: string; hex: string; images: string; sizes: string }[],
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
      const [{ data: p }, { data: o }, { data: c }, { data: s }] = await Promise.all([
        sb.from('products').select('*, categories(*), product_variants(size, color)').order('created_at', { ascending: false }),
        sb.from('orders').select('*').order('created_at', { ascending: false }),
        sb.from('categories').select('*').order('name'),
        sb.from('site_settings').select('key, value'),
      ])
      setProducts(p || [])
      setOrders(o || [])
      setCategories(c || [])
      const sMap: Record<string, string> = {}
      for (const row of s || []) { if (row.value) sMap[row.key] = row.value }
      setSettings(sMap)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  function openAddForm() {
    setEditProduct(null)
    setForm({
      name: '', description: '', price: '', price_old: '',
      category_id: '', section: '', collection: '', is_new: false, is_featured: false, in_stock: true,
      colors: [{ name: 'Основной', hex: '#3a2828', images: '', sizes: 'XS,S,M,L,XL' }],
    })
    setShowForm(true)
  }

  async function openEditForm(p: Product) {
    setEditProduct(p)
    const cat = categories.find(c => c.id === p.category_id)
    const section = cat?.section || ''

    // Загружаем цвета этого товара из БД
    const sb = await getSupabase()
    const { data: colorRows } = await sb
      .from('product_colors')
      .select('*')
      .eq('product_id', p.id)
      .order('sort_order', { ascending: true })

    let colors: { id?: string; name: string; hex: string; images: string; sizes: string }[]
    if (colorRows && colorRows.length > 0) {
      // Для каждого цвета подбираем его размеры из product_variants
      colors = colorRows.map(c => {
        const sizesForColor = (p.product_variants || [])
          .filter(v => v.color === c.name)
          .map(v => v.size)
        const uniqueSizes = Array.from(new Set(sizesForColor))
        return {
          id: c.id,
          name: c.name,
          hex: c.hex,
          images: (c.images || []).join('\n'),
          sizes: uniqueSizes.length > 0 ? uniqueSizes.join(',') : 'XS,S,M,L,XL',
        }
      })
    } else {
      // Старый товар без цветов — конвертируем в один цвет "Основной"
      const allSizes = Array.from(new Set(p.product_variants?.map(v => v.size) || []))
      colors = [{
        name: 'Основной',
        hex: '#3a2828',
        images: p.images?.join('\n') || '',
        sizes: allSizes.length > 0 ? allSizes.join(',') : 'XS,S,M,L,XL',
      }]
    }

    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      price_old: p.price_old ? String(p.price_old) : '',
      category_id: p.category_id || '',
      section,
      collection: (p as any).collection || '',
      is_new: p.is_new,
      is_featured: p.is_featured,
      in_stock: p.in_stock,
      colors,
    })
    setShowForm(true)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const sb = await getSupabase()

      // Собираем все фото со всех цветов в общий массив images (для совместимости и превью в каталоге)
      const allImages = form.colors.flatMap(c =>
        c.images.split('\n').map(s => s.trim()).filter(Boolean)
      )

      const productData = {
        name: form.name,
        slug: slugify(form.name),
        description: form.description || null,
        price: parseInt(form.price),
        price_old: form.price_old ? parseInt(form.price_old) : null,
        category_id: form.category_id || null,
        collection: form.collection.trim() || null,
        is_new: form.is_new,
        is_featured: form.is_featured,
        in_stock: form.in_stock,
        images: allImages,
      }

      let productId = editProduct?.id
      if (editProduct) {
        await sb.from('products').update(productData).eq('id', editProduct.id)
        // Удаляем старые цвета и варианты — пересоздадим заново
        await sb.from('product_colors').delete().eq('product_id', editProduct.id)
        await sb.from('product_variants').delete().eq('product_id', editProduct.id)
      } else {
        const { data, error } = await sb.from('products').insert(productData).select().single()
        if (error) { alert('Ошибка: ' + error.message); setLoading(false); return }
        productId = data?.id
      }

      if (!productId) { setLoading(false); return }

      // Сохраняем цвета и варианты
      for (let i = 0; i < form.colors.length; i++) {
        const c = form.colors[i]
        if (!c.name.trim()) continue

        const colorImages = c.images.split('\n').map(s => s.trim()).filter(Boolean)
        await sb.from('product_colors').insert({
          product_id: productId,
          name: c.name.trim(),
          hex: c.hex || '#3a2828',
          images: colorImages,
          sort_order: i,
        })

        // Размеры этого цвета — каждый создаёт строку в product_variants (size + color)
        const sizes = c.sizes.split(',').map(s => s.trim()).filter(Boolean)
        if (sizes.length > 0) {
          const variants = sizes.map(s => ({
            product_id: productId,
            size: s,
            color: c.name.trim(),
            stock_qty: 10,
          }))
          await sb.from('product_variants').insert(variants)
        }
      }

      setShowForm(false)
      loadData()
    } catch (err: any) {
      alert('Ошибка сохранения: ' + (err?.message || 'неизвестная'))
    }
    setLoading(false)
  }

  async function handleUploadFiles(files: FileList | null, colorIdx: number) {
    if (!files || files.length === 0) return
    setUploadingColorIdx(colorIdx)
    try {
      const sb = await getSupabase()
      const uploaded: string[] = []
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const safeName = `${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`
        const { error } = await sb.storage.from('product-images').upload(safeName, file, {
          cacheControl: '3600',
          upsert: false,
        })
        if (error) {
          alert(`Ошибка загрузки ${file.name}: ${error.message}`)
          continue
        }
        const { data } = sb.storage.from('product-images').getPublicUrl(safeName)
        if (data?.publicUrl) uploaded.push(data.publicUrl)
      }
      if (uploaded.length > 0) {
        setForm(p => {
          const colors = [...p.colors]
          const cur = colors[colorIdx]
          colors[colorIdx] = {
            ...cur,
            images: cur.images ? cur.images + '\n' + uploaded.join('\n') : uploaded.join('\n')
          }
          return { ...p, colors }
        })
      }
    } catch (err: any) {
      alert('Ошибка при загрузке: ' + (err?.message || 'неизвестная'))
    }
    setUploadingColorIdx(null)
  }

  function removeImageFromColor(colorIdx: number, url: string) {
    setForm(p => {
      const colors = [...p.colors]
      const cur = colors[colorIdx]
      colors[colorIdx] = {
        ...cur,
        images: cur.images.split('\n').filter(s => s.trim() !== url.trim()).join('\n')
      }
      return { ...p, colors }
    })
  }

  function addColor() {
    setForm(p => ({
      ...p,
      colors: [...p.colors, { name: '', hex: '#3a2828', images: '', sizes: 'XS,S,M,L,XL' }]
    }))
  }

  function removeColor(idx: number) {
    setForm(p => ({
      ...p,
      colors: p.colors.filter((_, i) => i !== idx)
    }))
  }

  function updateColor(idx: number, patch: Partial<typeof form.colors[0]>) {
    setForm(p => {
      const colors = [...p.colors]
      colors[idx] = { ...colors[idx], ...patch }
      return { ...p, colors }
    })
  }

  // === НАСТРОЙКИ САЙТА: загрузка фото для конкретного ключа ===
  async function handleSettingUpload(files: FileList | null, key: string) {
    if (!files || files.length === 0) return
    setUploadingSetting(key)
    try {
      const sb = await getSupabase()
      const file = files[0]
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const safeName = `settings-${key}-${Date.now()}.${ext}`
      const { error } = await sb.storage.from('product-images').upload(safeName, file, { cacheControl: '3600', upsert: false })
      if (error) { alert(`Ошибка загрузки: ${error.message}`); setUploadingSetting(null); return }
      const { data } = sb.storage.from('product-images').getPublicUrl(safeName)
      const url = data?.publicUrl
      if (url) {
        // upsert настройку в БД
        await sb.from('site_settings').upsert({ key, value: url, updated_at: new Date().toISOString() })
        setSettings(prev => ({ ...prev, [key]: url }))
      }
    } catch (err: any) {
      alert('Ошибка: ' + (err?.message || 'неизвестная'))
    }
    setUploadingSetting(null)
  }

  async function handleSettingRemove(key: string) {
    if (!confirm('Убрать это изображение? Вернётся стандартный фон.')) return
    try {
      const sb = await getSupabase()
      await sb.from('site_settings').upsert({ key, value: '', updated_at: new Date().toISOString() })
      setSettings(prev => { const n = { ...prev }; delete n[key]; return n })
    } catch (err: any) {
      alert('Ошибка: ' + (err?.message || 'неизвестная'))
    }
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
      <div style={S.page}>
        <div style={S.bg} />
        <div style={S.loginWrap}>
          <form onSubmit={handleLogin} style={S.loginCard}>
            <h1 style={S.loginBrand}>
              Annabelle <span style={{ color: '#c98e88' }}>Arto</span>
            </h1>
            <p style={S.loginSub}>✶ Панель управления ✶</p>
            <label style={S.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ ...S.input, marginBottom: '20px' }}
              autoFocus
            />
            <button type="submit" style={{ ...S.btnPrimary, width: '100%', justifyContent: 'center', padding: '14px' }}>
              Войти
            </button>
          </form>
        </div>
      </div>
    )
  }

  const newOrdersCount = orders.filter(o => o.status === 'pending').length

  return (
    <div style={S.page}>
      <div style={S.bg} />

      <div style={S.topbar}>
        <a href="/admin" style={S.brand}>
          Annabelle <b style={{ fontStyle: 'normal', fontWeight: 500 }}>Arto</b>
          <span style={S.brandTag}>· Admin</span>
        </a>
        <a href="/" style={S.backLink}>← На сайт</a>
      </div>

      <div style={S.container}>
        <h1 style={S.pageTitle}>
          Панель <span style={{ fontStyle: 'italic', color: '#c98e88' }}>управления</span>
        </h1>
        <p style={S.pageMeta}>✶ {products.length} товаров · {orders.length} заказов</p>

        <div style={S.tabs}>
          <button
            onClick={() => setTab('products')}
            style={{ ...S.tab, ...(tab === 'products' ? S.tabActive : {}) }}
          >
            Товары
          </button>
          <button
            onClick={() => setTab('orders')}
            style={{ ...S.tab, ...(tab === 'orders' ? S.tabActive : {}) }}
          >
            Заказы
            {newOrdersCount > 0 && <span style={S.tabBadge}>{newOrdersCount}</span>}
          </button>
          <button
            onClick={() => setTab('settings')}
            style={{ ...S.tab, ...(tab === 'settings' ? S.tabActive : {}) }}
          >
            Настройки
          </button>
        </div>

        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6 }}>
                Каталог
              </p>
              <button onClick={openAddForm} style={S.btnPrimary}>
                + Добавить товар
              </button>
            </div>

            <div style={S.card}>
              {loading && <div style={S.empty}><p>Загрузка...</p></div>}
              {!loading && products.length === 0 && (
                <div style={S.empty}>
                  <p style={S.emptyTitle}>Пусто, как чистый лист</p>
                  <p style={{ fontSize: '13px' }}>Добавьте первый товар, чтобы начать.</p>
                </div>
              )}
              {products.map(p => {
                const cat = categories.find(c => c.id === p.category_id)
                const sectionName = cat?.section ? SECTIONS.find(s => s.value === cat.section)?.label : null
                return (
                <div key={p.id} style={S.row}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={S.rowName}>{p.name}</p>
                    <p style={S.rowMeta}>
                      {sectionName ? `${sectionName} · ` : ''}{p.categories?.name || 'Без категории'}
                      {(p as any).collection && ` · ✿ ${(p as any).collection}`}
                      {p.is_new && ' · Новинка'}
                      {p.is_featured && ' · Хит'}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {p.price_old && <span style={S.priceOld}>{formatPrice(p.price_old)}</span>}
                    <span style={S.price}>{formatPrice(p.price)}</span>
                  </div>
                  <span style={{ ...S.pillStock, ...(p.in_stock ? S.pillIn : S.pillOut) }}>
                    {p.in_stock ? 'В наличии' : 'Нет'}
                  </span>
                  <button onClick={() => openEditForm(p)} style={{ ...S.btnGhost, padding: '8px 14px', fontSize: '12px' }}>
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    style={{ background: 'transparent', border: 'none', color: '#c98e88', cursor: 'pointer', fontSize: '16px', padding: '8px', fontFamily: 'inherit', lineHeight: 1 }}
                    title="Удалить"
                  >
                    ✕
                  </button>
                </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '20px' }}>
              История заказов
            </p>
            <div style={S.card}>
              {!loading && orders.length === 0 && (
                <div style={S.empty}>
                  <p style={S.emptyTitle}>Пока тихо</p>
                  <p style={{ fontSize: '13px' }}>Заказы появятся здесь.</p>
                </div>
              )}
              {orders.map(o => (
                <div key={o.id} style={{ ...S.row, flexDirection: 'column', alignItems: 'stretch', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                    <div>
                      <p style={S.rowName}>Заказ №{o.order_number}</p>
                      <p style={S.rowMeta}>
                        {o.customer_name} · {o.customer_phone} · {o.city}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                      <span style={S.price}>{formatPrice(o.total_amount)}</span>
                      <select
                        value={o.status}
                        onChange={e => updateOrderStatus(o.id, e.target.value)}
                        style={{ ...S.input, width: 'auto', padding: '8px 14px', fontSize: '12px', borderRadius: '999px', cursor: 'pointer' }}
                      >
                        {Object.entries(ORDER_STATUSES).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', opacity: 0.5, letterSpacing: '0.08em' }}>
                    {new Date(o.created_at).toLocaleDateString('ru-KZ', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.6, marginBottom: '20px' }}>
              Изображения сайта
            </p>

            {/* Hero */}
            <div style={S.card}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '24px', marginBottom: '6px' }}>
                Главный баннер
              </h3>
              <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>
                Большое фото на главной странице (где «Бельё, в котором хочется жить»). Рекомендуемый размер: 1920×1080 или больше.
              </p>
              <SettingImageSlot
                settingKey="hero_bg"
                value={settings['hero_bg']}
                uploading={uploadingSetting === 'hero_bg'}
                onUpload={handleSettingUpload}
                onRemove={handleSettingRemove}
                wide
              />
            </div>

            {/* Найди нас */}
            <div style={{ ...S.card, marginTop: '20px' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '24px', marginBottom: '6px' }}>
                Блок «Найди нас»
              </h3>
              <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>
                Четыре квадрата справа от контактов. Можно загрузить от 1 до 4 фото.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                {['contact_img_1', 'contact_img_2', 'contact_img_3', 'contact_img_4'].map((k, i) => (
                  <div key={k}>
                    <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace" }}>Фото {i + 1}</p>
                    <SettingImageSlot
                      settingKey={k}
                      value={settings[k]}
                      uploading={uploadingSetting === k}
                      onUpload={handleSettingUpload}
                      onRemove={handleSettingRemove}
                      square
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Баннеры меню */}
            <div style={{ ...S.card, marginTop: '20px' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontWeight: 300, fontSize: '24px', marginBottom: '6px' }}>
                Баннеры в выпадающем меню
              </h3>
              <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>
                Картинка справа в выпадающем меню каждого раздела. Вертикальный формат (примерно 3:4).
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
                {[
                  ['menu_banner_lingerie', 'Бельё'],
                  ['menu_banner_swim', 'Купальники'],
                  ['menu_banner_clothes', 'Одежда'],
                  ['menu_banner_tights', 'Колготки'],
                  ['menu_banner_men', 'Мужчинам'],
                  ['menu_banner_kids', 'Детям'],
                ].map(([k, label]) => (
                  <div key={k}>
                    <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '6px', fontFamily: "'JetBrains Mono', monospace" }}>{label}</p>
                    <SettingImageSlot
                      settingKey={k}
                      value={settings[k]}
                      uploading={uploadingSetting === k}
                      onUpload={handleSettingUpload}
                      onRemove={handleSettingRemove}
                      tall
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div style={S.overlay} onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div style={S.modal}>
            <h2 style={S.modalTitle}>
              {editProduct ? 'Редактировать товар' : 'Новый товар'}
            </h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={S.label}>Название</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  required
                  style={S.input}
                />
              </div>

              <div>
                <label style={S.label}>Описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  style={{ ...S.input, resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={S.label}>Цена, ₸</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => setForm(p => ({ ...p, price: e.target.value }))}
                    required
                    style={S.input}
                  />
                </div>
                <div>
                  <label style={S.label}>Старая цена, ₸</label>
                  <input
                    type="number"
                    value={form.price_old}
                    onChange={e => setForm(p => ({ ...p, price_old: e.target.value }))}
                    style={S.input}
                  />
                </div>
              </div>

              <div>
                <label style={S.label}>Раздел</label>
                <select
                  value={form.section}
                  onChange={e => setForm(p => ({ ...p, section: e.target.value, category_id: '' }))}
                  style={S.input}
                >
                  <option value="">— выберите раздел —</option>
                  {SECTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={S.label}>Категория</label>
                <select
                  value={form.category_id}
                  onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}
                  style={{ ...S.input, opacity: form.section ? 1 : 0.5 }}
                  disabled={!form.section}
                >
                  <option value="">
                    {form.section ? '— выберите категорию —' : 'Сначала выберите раздел'}
                  </option>
                  {categories
                    .filter(c => !form.section || c.section === form.section)
                    .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                  }
                </select>
              </div>

              <div>
                <label style={S.label}>Коллекция (необязательно)</label>
                <select
                  value={form.collection}
                  onChange={e => setForm(p => ({ ...p, collection: e.target.value }))}
                  style={{ ...S.input, opacity: form.section ? 1 : 0.5 }}
                  disabled={!form.section}
                >
                  <option value="">— без коллекции —</option>
                  {form.section && (COLLECTIONS_BY_SECTION[form.section] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {form.section && (
                  <details style={{ marginTop: '6px' }}>
                    <summary style={{ fontSize: '11px', color: '#5a4040', cursor: 'pointer', padding: '2px 0' }}>
                      или ввести свою коллекцию вручную
                    </summary>
                    <input
                      value={form.collection}
                      onChange={e => setForm(p => ({ ...p, collection: e.target.value }))}
                      placeholder="Название коллекции"
                      style={{ ...S.input, marginTop: '6px', fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}
                    />
                  </details>
                )}
                <p style={{ fontSize: '11px', opacity: 0.55, marginTop: '6px', lineHeight: 1.5 }}>
                  Товары одной коллекции показываются друг другу в блоке «Из этой коллекции» на странице товара.
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <label style={{ ...S.label, marginBottom: 0 }}>Цвета товара</label>
                  <button
                    type="button"
                    onClick={addColor}
                    style={{ ...S.btnGhost, padding: '6px 14px', fontSize: '12px' }}
                  >
                    + Добавить цвет
                  </button>
                </div>

                {form.colors.length === 0 && (
                  <p style={{ fontSize: '12px', opacity: 0.6, padding: '12px', background: 'rgba(255,247,243,0.4)', borderRadius: '10px', textAlign: 'center' }}>
                    У товара должен быть хотя бы один цвет. Жми «+ Добавить цвет».
                  </p>
                )}

                {form.colors.map((color, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,247,243,0.5)',
                    border: '1px solid rgba(58,40,40,0.1)',
                    borderRadius: '14px',
                    padding: '18px',
                    marginBottom: '14px',
                  }}>
                    {/* Заголовок цвета: свотч + название + удалить */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
                        <input
                          type="color"
                          value={color.hex}
                          onChange={e => updateColor(idx, { hex: e.target.value })}
                          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                          title="Выбрать цвет"
                        />
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          background: color.hex, border: '2px solid rgba(58,40,40,0.15)',
                          boxShadow: 'inset 0 0 0 2px rgba(255,247,243,0.6)',
                        }} />
                      </div>
                      <input
                        value={color.name}
                        onChange={e => updateColor(idx, { name: e.target.value })}
                        placeholder="Название цвета (Чёрный, Бежевый...)"
                        style={{ ...S.input, flex: 1 }}
                      />
                      {form.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => { if (confirm(`Удалить цвет «${color.name || 'без названия'}»?`)) removeColor(idx) }}
                          style={{ background: 'transparent', border: 'none', color: '#c98e88', cursor: 'pointer', fontSize: '20px', padding: '4px 10px', lineHeight: 1 }}
                          title="Удалить цвет"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Размеры этого цвета */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ ...S.label, marginBottom: '6px' }}>Размеры в наличии</label>
                      <input
                        value={color.sizes}
                        onChange={e => updateColor(idx, { sizes: e.target.value })}
                        placeholder="XS,S,M,L"
                        style={S.input}
                      />
                      <p style={{ fontSize: '11px', opacity: 0.55, marginTop: '4px' }}>
                        Перечисли через запятую только те размеры, что есть в наличии для этого цвета
                      </p>
                    </div>

                    {/* Фото этого цвета */}
                    <div>
                      <label style={{ ...S.label, marginBottom: '6px' }}>Фотографии</label>

                      {color.images.trim() && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                          {color.images.split('\n').map(s => s.trim()).filter(Boolean).map((url, i) => (
                            <div key={i} style={{ position: 'relative', width: '70px', height: '70px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(58,40,40,0.15)', background: '#fbe9e3' }}>
                              <img src={url} alt={`${color.name} ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button type="button" onClick={() => removeImageFromColor(idx, url)} style={{ position: 'absolute', top: '3px', right: '3px', width: '20px', height: '20px', borderRadius: '50%', border: 'none', background: 'rgba(58,40,40,0.85)', color: '#fff7f3', cursor: 'pointer', fontSize: '11px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Удалить">×</button>
                            </div>
                          ))}
                        </div>
                      )}

                      <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: '1px dashed rgba(58,40,40,0.3)', background: 'rgba(255,247,243,0.4)', cursor: uploadingColorIdx === idx ? 'wait' : 'pointer', fontSize: '12px', color: '#3a2828' }}>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingColorIdx !== null}
                          onChange={e => handleUploadFiles(e.target.files, idx)}
                          style={{ display: 'none' }}
                        />
                        {uploadingColorIdx === idx ? '⏳ Загружаем...' : '📷 Загрузить фото для этого цвета'}
                      </label>

                      <details style={{ fontSize: '11px', marginTop: '8px' }}>
                        <summary style={{ cursor: 'pointer', color: '#5a4040', padding: '4px 0' }}>
                          или вставить ссылки вручную
                        </summary>
                        <textarea
                          value={color.images}
                          onChange={e => updateColor(idx, { images: e.target.value })}
                          rows={2}
                          placeholder="https://..."
                          style={{ ...S.input, resize: 'vertical', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', marginTop: '6px' }}
                        />
                      </details>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', padding: '8px 0' }}>
                {([['is_new', 'Новинка'], ['is_featured', 'Хит продаж'], ['in_stock', 'В наличии']] as const).map(([key, label]) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#3a2828' }}>
                    <input
                      type="checkbox"
                      checked={(form as any)[key]}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                      style={{ accentColor: '#c98e88', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ ...S.btnPrimary, flex: 1, justifyContent: 'center', padding: '14px', opacity: loading ? 0.5 : 1 }}
                >
                  {loading ? 'Сохраняем...' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={S.btnGhost}
                >
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
