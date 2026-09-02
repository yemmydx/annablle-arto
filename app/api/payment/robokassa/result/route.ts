import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { verifyResultSignature } from '@/lib/robokassa'

export const runtime = 'nodejs'

// Robokassa может слать уведомление и POST-ом (form-urlencoded), и GET-ом.
async function readParams(req: NextRequest): Promise<URLSearchParams> {
  if (req.method === 'POST') {
    const ct = req.headers.get('content-type') || ''
    if (ct.includes('application/x-www-form-urlencoded') || ct.includes('multipart/form-data')) {
      const form = await req.formData()
      const p = new URLSearchParams()
      form.forEach((v, k) => p.set(k, String(v)))
      return p
    }
  }
  return req.nextUrl.searchParams
}

async function handle(req: NextRequest) {
  const params = await readParams(req)
  const outSum = params.get('OutSum') || ''
  const invId = params.get('InvId') || ''
  const signature = params.get('SignatureValue') || ''

  if (!outSum || !invId || !signature) {
    return new NextResponse('bad request', { status: 400 })
  }

  if (!verifyResultSignature(outSum, invId, signature)) {
    console.warn('Robokassa result: signature mismatch', { invId, outSum })
    return new NextResponse('bad sign', { status: 400 })
  }

  // Подпись верна — платёж подтверждён. Помечаем заказ оплаченным (идемпотентно).
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, status')
    .eq('order_number', Number(invId))
    .single()

  if (error || !order) {
    console.error('Robokassa result: order not found', invId)
    // Отвечаем OK, чтобы Robokassa не долбила повторами по несуществующему заказу.
    return new NextResponse(`OK${invId}`, { status: 200 })
  }

  if (order.status !== 'paid') {
    await supabaseAdmin
      .from('orders')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('id', order.id)
  }

  // Обязательный ответ Robokassa.
  return new NextResponse(`OK${invId}`, {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}

export async function POST(req: NextRequest) { return handle(req) }
export async function GET(req: NextRequest) { return handle(req) }
