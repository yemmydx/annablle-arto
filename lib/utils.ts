// Форматирование цены в тенге
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('ru-KZ', {
    style: 'currency',
    currency: 'KZT',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Генерация slug из названия
export function slugify(text: string): string {
  const cyrillicMap: Record<string, string> = {
    а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ё:'yo',ж:'zh',з:'z',
    и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',
    с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',
    щ:'shch',ъ:'',ы:'y',ь:'',э:'e',ю:'yu',я:'ya'
  }
  return text
    .toLowerCase()
    .split('')
    .map(c => cyrillicMap[c] || c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Статусы заказов на русском
export const ORDER_STATUSES: Record<string, string> = {
  pending: 'Ожидает оплаты',
  paid: 'Оплачен',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

// Методы доставки
export const DELIVERY_METHODS = [
  { value: 'courier', label: 'Курьер по городу' },
  { value: 'kazpost', label: 'Казпочта' },
  { value: 'pickup', label: 'Самовывоз' },
]

// Методы оплаты (онлайн-оплата картой через Robokassa)
export const PAYMENT_METHODS = [
  { value: 'card', label: 'Visa / Mastercard' },
]

// Города Казахстана
export const KZ_CITIES = [
  'Алматы', 'Астана', 'Шымкент', 'Қарағанды', 'Ақтөбе',
  'Тараз', 'Павлодар', 'Өскемен', 'Семей', 'Атырау',
  'Қостанай', 'Петропавл', 'Орал', 'Түркістан', 'Қызылорда',
]

// Оптимизация фото через Supabase Image Transformation (Pro).
// object/public -> render/image/public + width/quality. Отдаёт лёгкий WebP на лету.
// Качество 90 = визуально не отличить от оригинала, но файл в разы меньше.
// НА КРОП НЕ ВЛИЯЕТ — обрезка задаётся отдельно в CSS (object-fit).
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
