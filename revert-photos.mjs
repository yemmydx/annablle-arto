// ============================================================
// ОТКАТ ФОТО: возвращает исходные фотографии (до нормализации).
// Оригиналы не удалялись — скрипт восстанавливает старые ссылки в БД.
// Запуск:  node revert-photos.mjs         — пробно, 3 товара
//          node revert-photos.mjs --all   — все
// ============================================================
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL
const KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_ || !KEY) { console.error('Нет ключей в .env.local'); process.exit(1) }
const sb = createClient(URL_, KEY)
const ALL = process.argv.includes('--all')
const EXTS = ['jpg', 'jpeg', 'png', 'webp', 'JPG', 'JPEG', 'PNG']

// из norm34-ссылки восстанавливаем базовый путь оригинала
function baseFromNorm(u) {
  // .../object/public/<bucket>/norm34/<origPathБезРасширения>-<5случ>.webp
  const m = u.match(/\/object\/public\/([^/]+)\/norm34\/(.+)-[a-z0-9]{5}\.webp$/)
  return m ? { bucket: m[1], base: decodeURIComponent(m[2]) } : null
}

async function findOriginal(bucket, base) {
  for (const ext of EXTS) {
    const candidate = `${URL_}/storage/v1/object/public/${bucket}/${base}.${ext}`
    const r = await fetch(candidate, { method: 'HEAD' })
    if (r.ok) return candidate
  }
  return null
}

async function main() {
  const { data: products, error } = await sb
    .from('products').select('id, name, images').not('images', 'is', null)
  if (error) throw error

  let list = products.filter(p => Array.isArray(p.images) && p.images.some(u => u && u.includes('/norm34/')))
  if (!ALL) list = list.slice(0, 3)
  console.log(`Товаров к откату: ${list.length}${ALL ? '' : '  (ПРОБНО — 3 шт; для всех: --all)'}`)

  let done = 0, misses = 0
  for (const p of list) {
    const restored = []
    for (const u of p.images) {
      if (!u || !u.includes('/norm34/')) { restored.push(u); continue }
      const info = baseFromNorm(u)
      if (!info) { restored.push(u); misses++; continue }
      const orig = await findOriginal(info.bucket, info.base)
      if (orig) restored.push(orig)
      else { console.warn(`  ! оригинал не найден (${p.name}): ${info.base}`); restored.push(u); misses++ }
    }
    const { error: e2 } = await sb.from('products').update({ images: restored }).eq('id', p.id)
    if (e2) console.error(`  !! не обновлён ${p.name}: ${e2.message}`)
    else { done++; console.log(`✓ [${done}/${list.length}] ${p.name}`) }
  }
  console.log(`\nГотово: ${done}. Не найдено оригиналов: ${misses}`)
  if (!ALL) console.log('Проверь 3 товара на сайте. Если ок — запусти с --all')
}
main().catch(e => { console.error(e); process.exit(1) })
