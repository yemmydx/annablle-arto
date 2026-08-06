// ============================================================
// НОРМАЛИЗАЦИЯ ФОТО ТОВАРОВ: приведение всех фото к формату 3:4
// - скачивает каждое фото из Supabase Storage
// - добавляет белые поля до пропорции 3:4 (НИЧЕГО не обрезая)
// - ужимает до max 1200px по ширине, качество 90 (webp)
// - заливает как НОВЫЙ файл (старые не трогает)
// - обновляет ссылки в таблице products
// Запуск:  node normalize-photos.mjs           — пробный прогон на 3 товарах
//          node normalize-photos.mjs --all     — все товары
// ============================================================
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { config } from 'dotenv'
config({ path: '.env.local' })

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !KEY) { console.error('Нет ключей в .env.local'); process.exit(1) }
const sb = createClient(URL_, KEY)

const BUCKET = 'product-images'          // бакет с фото
const TARGET_RATIO = 3 / 4               // ширина/высота = 3:4
const MAX_W = 1200
const ALL = process.argv.includes('--all')

function pathFromUrl(u) {
  // .../object/public/<bucket>/<path>
  const m = u.match(/\/object\/public\/([^/]+)\/(.+)$/)
  return m ? { bucket: m[1], path: decodeURIComponent(m[2]) } : null
}

async function processImage(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`fetch ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const img = sharp(buf, { failOn: 'none' })
  const meta = await img.metadata()
  if (!meta.width || !meta.height) throw new Error('no dimensions')

  // целевой холст 3:4, фото по центру, белые поля
  let w = meta.width, h = meta.height
  let canvasW, canvasH
  if (w / h > TARGET_RATIO) { canvasW = w; canvasH = Math.round(w / TARGET_RATIO) }
  else { canvasH = h; canvasW = Math.round(h * TARGET_RATIO) }

  let pipeline = sharp(buf, { failOn: 'none' })
    .flatten({ background: '#ffffff' }) // убираем прозрачность на белый
    .extend({
      top: Math.floor((canvasH - h) / 2), bottom: Math.ceil((canvasH - h) / 2),
      left: Math.floor((canvasW - w) / 2), right: Math.ceil((canvasW - w) / 2),
      background: '#ffffff',
    })
  if (canvasW > MAX_W) pipeline = pipeline.resize({ width: MAX_W })
  return pipeline.webp({ quality: 90 }).toBuffer()
}

async function main() {
  const { data: products, error } = await sb
    .from('products')
    .select('id, name, images')
    .not('images', 'is', null)
  if (error) throw error

  let list = products.filter(p => Array.isArray(p.images) && p.images.length > 0)
  if (!ALL) list = list.slice(0, 3)
  console.log(`Товаров к обработке: ${list.length}${ALL ? '' : '  (ПРОБНЫЙ ПРОГОН — только 3; для всех: --all)'}`)

  let done = 0, failed = 0
  for (const p of list) {
    const newUrls = []
    for (const url of p.images) {
      try {
        if (!url || !url.includes('/object/public/')) { newUrls.push(url); continue }
        if (url.includes('/norm34/')) { newUrls.push(url); continue } // уже нормализовано
        const out = await processImage(url)
        const src = pathFromUrl(url)
        const newPath = `norm34/${src ? src.path.replace(/\.[a-zA-Z0-9]+$/, '') : Date.now()}-${Math.random().toString(36).slice(2,7)}.webp`
        const { error: upErr } = await sb.storage.from(BUCKET).upload(newPath, out, { contentType: 'image/webp', upsert: true })
        if (upErr) throw upErr
        const { data: pub } = sb.storage.from(BUCKET).getPublicUrl(newPath)
        newUrls.push(pub.publicUrl)
      } catch (e) {
        console.warn(`  ! фото пропущено (${p.name}): ${e.message}`)
        newUrls.push(url) // оставляем старую ссылку
      }
    }
    const { error: updErr } = await sb.from('products').update({ images: newUrls }).eq('id', p.id)
    if (updErr) { console.error(`  !! не обновлён ${p.name}: ${updErr.message}`); failed++ }
    else { done++; console.log(`✓ [${done}/${list.length}] ${p.name}`) }
  }
  console.log(`\nГотово: ${done}, с ошибками: ${failed}`)
  if (!ALL) console.log('Проверь эти 3 товара на сайте. Если всё ок — запусти с --all')
}
main().catch(e => { console.error(e); process.exit(1) })
