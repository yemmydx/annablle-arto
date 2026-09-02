import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { buildPaymentUrl, robokassaConfigured, type ReceiptItem } from '@/lib/robokassa'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    if (!robokassaConfigured()) {
      return NextResponse.json({ error: 'Оплата временно недоступна' }, { status: 503 })
    }

    const { order_id } = await req.json()
    if (!order_id) {
      return NextResponse.json({ error: 'Не указан заказ' }, { status: 400 })
    }

    // Сумму берём из БД, а не с фронта — защита от подмены.
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('order_number, total_amount, customer_email, status')
      .eq('id', order_id)
      .single()

    if (error || !order) {
      return NextResponse.json({ error: 'Заказ не найден' }, { status: 404 })
    }
    if (order.status === 'paid') {
      return NextResponse.json({ error: 'Заказ уже оплачен' }, { status: 409 })
    }

    // Позиции чека для фискализации: собираем из состава заказа.
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('product_name, qty, price')
      .eq('order_id', order_id)

    const items: ReceiptItem[] = (orderItems || []).map(i => ({
      name: i.product_name,
      quantity: i.qty,
      sum: i.price * i.qty,
      payment_object: 'commodity',
    }))

    // Доставка — отдельной позицией, иначе сумма чека не сойдётся с OutSum.
    const goodsSum = items.reduce((acc, i) => acc + i.sum, 0)
    const shipping = order.total_amount - goodsSum
    if (shipping > 0) {
      items.push({ name: 'Доставка', quantity: 1, sum: shipping, payment_object: 'service' })
    }

    const url = buildPaymentUrl({
      invId: order.order_number,
      outSum: order.total_amount,
      description: `Заказ №${order.order_number} — POD PLATIEM`,
      email: order.customer_email,
      items,
    })

    return NextResponse.json({ url })
  } catch (e) {
    console.error('Robokassa create error:', e)
    return NextResponse.json({ error: 'Не удалось создать оплату' }, { status: 500 })
  }
}
