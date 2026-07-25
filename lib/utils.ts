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

// Методы оплаты
export const PAYMENT_METHODS = [
  { value: 'kaspi', label: 'Kaspi Pay' },
  { value: 'halyk', label: 'Halyk Bank' },
  { value: 'card', label: 'Visa / Mastercard' },
  { value: 'cash', label: 'Наличные при получении' },
]

// Города Казахстана
export const KZ_CITIES = [
  'Алматы', 'Астана', 'Шымкент', 'Қарағанды', 'Ақтөбе',
  'Тараз', 'Павлодар', 'Өскемен', 'Семей', 'Атырау',
  'Қостанай', 'Петропавл', 'Орал', 'Түркістан', 'Қызылорда',
]

// Оптимизация фото через Supabase Image Transformation (Pro-тариф).
// Публичную ссылку (.../object/public/...) превращает в трансформированную
// (.../render/image/public/...?width=&quality=) — Supabase отдаёт лёгкий WebP на лету.
// Внешние/пустые ссылки возвращаются без изменений.
export function optimizeImage(
  url: string | null | undefined,
  opts: { width?: number; quality?: number } = {}
): string {
  if (!url) return ''
  if (!url.includes('/storage/v1/object/public/')) return url
  const { width = 600, quality = 75 } = opts
  const base = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
  const sep = base.includes('?') ? '&' : '?'
  return `${base}${sep}width=${width}&quality=${quality}`
}
