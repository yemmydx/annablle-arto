// ============================================================
// АНАЛИЗ ФОТО: ничего не меняет. Меряет пропорции всех фото
// у выборки товаров и показывает, у кого первым стоит "полоска",
// хотя в списке есть нормальное полное фото.
// Запуск: node analyze-photos.mjs
// ============================================================
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

// пропорция w/h: "нормальное" фото товара ~ 0.55–0.85 (вертикальное 2:3..3:4)
const isNormal = r => r >= 0.5 && r <= 0.95
const isStrip  = r => r < 0.45   // узкая полоска

async function dims(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  const buf = Buffer.from(await res.arrayBuffer())
  try { const m = await sharp(buf).metadata(); return m.width && m.height ? { w: m.width, h: m.height, r: +(m.width/m.height).toFixed(2) } : null }
  catch { return null }
}

async function main() {
  const { data: products } = await sb.from('products')
    .select('id,name,images').not('images','is',null).limit(500)
  const withImgs = products.filter(p => Array.isArray(p.images) && p.images.length > 0)
  // выборка: 25 случайных товаров
  const sample = withImgs.sort(() => Math.random() - 0.5).slice(0, 25)

  let stripFirst_fixable = 0, stripFirst_only = 0, normalFirst = 0
  for (const p of sample) {
    const infos = []
    for (const u of p.images.slice(0, 5)) {
      const d = await dims(u)
      infos.push(d ? d : { w:0,h:0,r:0 })
    }
    const first = infos[0]
    const hasNormalLater = infos.slice(1).some(d => isNormal(d.r))
    const tag = isStrip(first.r)
      ? (hasNormalLater ? 'ПОЛОСКА первым, но есть нормальное дальше → ЧИНИТСЯ' : 'только полоски')
      : (isNormal(first.r) ? 'ок' : 'нестандарт')
    if (isStrip(first.r) && hasNormalLater) stripFirst_fixable++
    else if (isStrip(first.r)) stripFirst_only++
    else if (isNormal(first.r)) normalFirst++
    console.log(`${p.name}`)
    infos.forEach((d,i) => console.log(`   фото${i+1}: ${d.w}x${d.h}  ratio=${d.r}`))
    console.log(`   => ${tag}\n`)
  }
  console.log('================ ИТОГ ПО ВЫБОРКЕ (25) ================')
  console.log(`нормальное фото первым: ${normalFirst}`)
  console.log(`полоска первым, НО есть нормальное в списке (чинится перестановкой): ${stripFirst_fixable}`)
  console.log(`полоски и только полоски: ${stripFirst_only}`)
}
main().catch(e => { console.error(e); process.exit(1) })
