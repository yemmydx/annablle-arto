import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { items, ...orderData } = body

    // Создаём заказ
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) throw orderError

    // Создаём позиции заказа
    const orderItems = items.map((item: any) => ({
      ...item,
      order_id: order.id,
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    return NextResponse.json({
      success: true,
      order_id: order.id,
      order_number: order.order_number,
      total_amount: order.total_amount,
    })
  } catch (error) {
    console.error('Order error:', error)
    return NextResponse.json({ error: 'Ошибка создания заказа' }, { status: 500 })
  }
}
