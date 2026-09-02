import crypto from 'crypto'

/**
 * Robokassa (KZ) — формирование платёжной ссылки и проверка подписей.
 *
 * ENV:
 *   ROBOKASSA_MERCHANT_LOGIN   — идентификатор магазина
 *   ROBOKASSA_PASSWORD1        — пароль #1 (боевой)
 *   ROBOKASSA_PASSWORD2        — пароль #2 (боевой)
 *   ROBOKASSA_TEST_PASSWORD1   — тестовый пароль #1
 *   ROBOKASSA_TEST_PASSWORD2   — тестовый пароль #2
 *   ROBOKASSA_IS_TEST          — '1' => тестовый режим, '0'/пусто => боевой
 *   ROBOKASSA_HASH_ALGO        — 'md5' (по умолчанию) | 'sha256' | 'sha512'
 *   NEXT_PUBLIC_SITE_URL       — базовый URL сайта (для ResultURL и т.п.), опционально
 */

const PAY_ENDPOINT = 'https://auth.robokassa.kz/Merchant/Index.aspx'

function algo(): string {
  return (process.env.ROBOKASSA_HASH_ALGO || 'md5').toLowerCase()
}

function isTest(): boolean {
  return process.env.ROBOKASSA_IS_TEST === '1'
}

function pass1(): string {
  return (isTest() ? process.env.ROBOKASSA_TEST_PASSWORD1 : process.env.ROBOKASSA_PASSWORD1) || ''
}

function pass2(): string {
  return (isTest() ? process.env.ROBOKASSA_TEST_PASSWORD2 : process.env.ROBOKASSA_PASSWORD2) || ''
}

function merchant(): string {
  return process.env.ROBOKASSA_MERCHANT_LOGIN || ''
}

// --- Фискализация (чек) ---
// Включена по умолчанию; отключается ROBOKASSA_FISCALIZATION=0.
function fiscalizationEnabled(): boolean {
  return process.env.ROBOKASSA_FISCALIZATION !== '0'
}
// Ставка НДС по позиции. Для неплательщика НДС — 'none'. Уточни у Robokassa/бухгалтера.
function defaultTax(): string {
  return process.env.ROBOKASSA_TAX || 'none'
}
// Система налогообложения (sno). Если пусто — берётся значение из кабинета Robokassa.
function taxSystem(): string {
  return process.env.ROBOKASSA_SNO || ''
}

export type ReceiptItem = {
  name: string
  quantity: number
  sum: number            // стоимость позиции целиком (цена * кол-во), в тенге
  tax?: string
  payment_object?: string // 'commodity' (товар) | 'service' (услуга) ...
}

/**
 * Формирует параметр Receipt: минимизированный JSON, закодированный в URL ОДИН раз.
 * Эта же строка используется и в подписи, и в ссылке — байт в байт.
 */
function buildReceiptParam(items: ReceiptItem[]): string {
  const receipt: {
    sno?: string
    items: Array<Record<string, unknown>>
  } = {
    items: items.map(i => ({
      name: String(i.name).slice(0, 128),
      quantity: i.quantity,
      sum: i.sum,
      payment_method: 'full_payment',
      payment_object: i.payment_object || 'commodity',
      tax: i.tax || defaultTax(),
    })),
  }
  const sno = taxSystem()
  if (sno) receipt.sno = sno
  return encodeURIComponent(JSON.stringify(receipt))
}

function hash(input: string): string {
  return crypto.createHash(algo()).update(input, 'utf8').digest('hex')
}

/** Сумма в формате Robokassa: строка с двумя знаками после точки. */
export function formatOutSum(tenge: number): string {
  return Number(tenge).toFixed(2)
}

/**
 * Строит подписанную ссылку на оплату.
 * @param invId  номер заказа (целое, order_number)
 * @param outSum сумма в тенге (целое число тенге)
 * @param description назначение платежа
 * @param email  e-mail покупателя (для чека/уведомления)
 * @param items  позиции чека для фискализации (если включена)
 */
export function buildPaymentUrl(opts: {
  invId: number
  outSum: number
  description: string
  email?: string | null
  items?: ReceiptItem[]
}): string {
  const login = merchant()
  const sum = formatOutSum(opts.outSum)
  const inv = String(opts.invId)

  const useReceipt = fiscalizationEnabled() && !!opts.items && opts.items.length > 0
  const receiptEncoded = useReceipt ? buildReceiptParam(opts.items!) : ''

  // Подпись инициации: MerchantLogin:OutSum:InvId[:Receipt]:Пароль#1
  // Receipt (если есть) — в URL-кодированном виде, тот же, что уйдёт в ссылке.
  const sigBase = useReceipt
    ? `${login}:${sum}:${inv}:${receiptEncoded}:${pass1()}`
    : `${login}:${sum}:${inv}:${pass1()}`
  const signature = hash(sigBase)

  const params = new URLSearchParams({
    MerchantLogin: login,
    OutSum: sum,
    InvId: inv,
    Description: opts.description,
    Culture: 'ru',
    Encoding: 'utf-8',
  })
  if (opts.email) params.set('Email', opts.email)
  if (isTest()) params.set('IsTest', '1')

  let url = `${PAY_ENDPOINT}?${params.toString()}`
  // Receipt дописываем вручную уже закодированным — чтобы URLSearchParams не закодировал повторно.
  if (useReceipt) url += `&Receipt=${receiptEncoded}`
  url += `&SignatureValue=${signature}`
  return url
}

/**
 * Проверка подписи из ResultURL: MD5(OutSum:InvId:Пароль#2).
 * Robokassa присылает SignatureValue в верхнем регистре.
 */
export function verifyResultSignature(outSum: string, invId: string, signature: string): boolean {
  const expected = hash(`${outSum}:${invId}:${pass2()}`)
  return expected.toLowerCase() === (signature || '').toLowerCase()
}

/**
 * Проверка подписи из SuccessURL: MD5(OutSum:InvId:Пароль#1).
 * Позволяет убедиться, что покупатель действительно вернулся после оплаты.
 */
export function verifySuccessSignature(outSum: string, invId: string, signature: string): boolean {
  const expected = hash(`${outSum}:${invId}:${pass1()}`)
  return expected.toLowerCase() === (signature || '').toLowerCase()
}

export const robokassaConfigured = () => Boolean(merchant() && pass1() && pass2())
