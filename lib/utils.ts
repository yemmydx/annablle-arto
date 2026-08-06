// Ð¤Ð¾Ñ€Ð¼Ð°Ñ‚Ð¸Ñ€Ð¾Ð²Ð°Ð½Ð¸Ðµ Ñ†ÐµÐ½Ñ‹ Ð² Ñ‚ÐµÐ½Ð³Ðµ
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Ð“ÐµÐ½ÐµÑ€Ð°Ñ†Ð¸Ñ slug Ð¸Ð· Ð½Ð°Ð·Ð²Ð°Ð½Ð¸Ñ
export function slugify(text: string): string {
  const cyrillicMap: Record<string, string> = {
    Ð°:'a',Ð±:'b',Ð²:'v',Ð³:'g',Ð´:'d',Ðµ:'e',Ñ‘:'yo',Ð¶:'zh',Ð·:'z',
    Ð¸:'i',Ð¹:'y',Ðº:'k',Ð»:'l',Ð¼:'m',Ð½:'n',Ð¾:'o',Ð¿:'p',Ñ€:'r',
    Ñ:'s',Ñ‚:'t',Ñƒ:'u',Ñ„:'f',Ñ…:'kh',Ñ†:'ts',Ñ‡:'ch',Ñˆ:'sh',
    Ñ‰:'shch',ÑŠ:'',Ñ‹:'y',ÑŒ:'',Ñ:'e',ÑŽ:'yu',Ñ:'ya'
  }
  return text
    .toLowerCase()
    .split('')
    .map(c => cyrillicMap[c] || c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Ð¡Ñ‚Ð°Ñ‚ÑƒÑÑ‹ Ð·Ð°ÐºÐ°Ð·Ð¾Ð² Ð½Ð° Ñ€ÑƒÑÑÐºÐ¾Ð¼
export const ORDER_STATUSES: Record<string, string> = {
  pending: 'ÐžÐ¶Ð¸Ð´Ð°ÐµÑ‚ Ð¾Ð¿Ð»Ð°Ñ‚Ñ‹',
  paid: 'ÐžÐ¿Ð»Ð°Ñ‡ÐµÐ½',
  shipped: 'ÐžÑ‚Ð¿Ñ€Ð°Ð²Ð»ÐµÐ½',
  delivered: 'Ð”Ð¾ÑÑ‚Ð°Ð²Ð»ÐµÐ½',
  cancelled: 'ÐžÑ‚Ð¼ÐµÐ½Ñ‘Ð½',
}

// ÐœÐµÑ‚Ð¾Ð´Ñ‹ Ð´Ð¾ÑÑ‚Ð°Ð²ÐºÐ¸
export const DELIVERY_METHODS = [
  { value: 'courier', label: 'ÐšÑƒÑ€ÑŒÐµÑ€ Ð¿Ð¾ Ð³Ð¾Ñ€Ð¾Ð´Ñƒ' },
  { value: 'kazpost', label: 'ÐšÐ°Ð·Ð¿Ð¾Ñ‡Ñ‚Ð°' },
  { value: 'pickup', label: 'Ð¡Ð°Ð¼Ð¾Ð²Ñ‹Ð²Ð¾Ð·' },
]

// ÐœÐµÑ‚Ð¾Ð´Ñ‹ Ð¾Ð¿Ð»Ð°Ñ‚Ñ‹
export const PAYMENT_METHODS = [
  { value: 'kaspi', label: 'Kaspi Pay' },
  { value: 'halyk', label: 'Halyk Bank' },
  { value: 'card', label: 'Visa / Mastercard' },
  { value: 'cash', label: 'ÐÐ°Ð»Ð¸Ñ‡Ð½Ñ‹Ðµ Ð¿Ñ€Ð¸ Ð¿Ð¾Ð»ÑƒÑ‡ÐµÐ½Ð¸Ð¸' },
]

// Ð“Ð¾Ñ€Ð¾Ð´Ð° ÐšÐ°Ð·Ð°Ñ…ÑÑ‚Ð°Ð½Ð°
export const KZ_CITIES = [
  'ÐÐ»Ð¼Ð°Ñ‚Ñ‹', 'ÐÑÑ‚Ð°Ð½Ð°', 'Ð¨Ñ‹Ð¼ÐºÐµÐ½Ñ‚', 'ÒšÐ°Ñ€Ð°Ò“Ð°Ð½Ð´Ñ‹', 'ÐÒ›Ñ‚Ó©Ð±Ðµ',
  'Ð¢Ð°Ñ€Ð°Ð·', 'ÐŸÐ°Ð²Ð»Ð¾Ð´Ð°Ñ€', 'Ó¨ÑÐºÐµÐ¼ÐµÐ½', 'Ð¡ÐµÐ¼ÐµÐ¹', 'ÐÑ‚Ñ‹Ñ€Ð°Ñƒ',
  'ÒšÐ¾ÑÑ‚Ð°Ð½Ð°Ð¹', 'ÐŸÐµÑ‚Ñ€Ð¾Ð¿Ð°Ð²Ð»', 'ÐžÑ€Ð°Ð»', 'Ð¢Ò¯Ñ€ÐºÑ–ÑÑ‚Ð°Ð½', 'ÒšÑ‹Ð·Ñ‹Ð»Ð¾Ñ€Ð´Ð°',
]

// ÐžÐ¿Ñ‚Ð¸Ð¼Ð¸Ð·Ð°Ñ†Ð¸Ñ Ñ„Ð¾Ñ‚Ð¾ Ñ‡ÐµÑ€ÐµÐ· Supabase Image Transformation (Pro).
// object/public -> render/image/public + width/quality. ÐžÑ‚Ð´Ð°Ñ‘Ñ‚ Ð»Ñ‘Ð³ÐºÐ¸Ð¹ WebP Ð½Ð° Ð»ÐµÑ‚Ñƒ.
// ÐšÐ°Ñ‡ÐµÑÑ‚Ð²Ð¾ 90 = Ð²Ð¸Ð·ÑƒÐ°Ð»ÑŒÐ½Ð¾ Ð½Ðµ Ð¾Ñ‚Ð»Ð¸Ñ‡Ð¸Ñ‚ÑŒ Ð¾Ñ‚ Ð¾Ñ€Ð¸Ð³Ð¸Ð½Ð°Ð»Ð°, Ð½Ð¾ Ñ„Ð°Ð¹Ð» Ð² Ñ€Ð°Ð·Ñ‹ Ð¼ÐµÐ½ÑŒÑˆÐµ.
// ÐÐ ÐšÐ ÐžÐŸ ÐÐ• Ð’Ð›Ð˜Ð¯Ð•Ð¢ â€” Ð¾Ð±Ñ€ÐµÐ·ÐºÐ° Ð·Ð°Ð´Ð°Ñ‘Ñ‚ÑÑ Ð¾Ñ‚Ð´ÐµÐ»ÑŒÐ½Ð¾ Ð² CSS (object-fit).
export function optimizeImage(
  url: string | null | undefined,
  opts: { width?: number; quality?: number } = {}
): string {
  if (!url) return ''
  if (!url.includes('/storage/v1/object/public/')) return url
  const { width = 700, quality = 90 } = opts
  const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}width=${width}&height=${Math.round(width*1.5)}&resize=contain&quality=${quality}`
}
