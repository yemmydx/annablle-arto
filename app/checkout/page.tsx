'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/store/Header'
import Footer from '@/components/store/Footer'
import { useCart } from '@/lib/cart'
import { formatPrice, DELIVERY_METHODS, PAYMENT_METHODS, KZ_CITIES } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    city: 'Алматы',
    address: '',
    delivery_method: 'courier',
    payment_method: 'kaspi',
    notes: '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        total_amount: totalPrice(),
        items: items.map(i => ({
          product_id: i.product.id,
          product_name: i.product.name,
          size: i.size,
          color: i.color,
          qty: i.qty,
          price: i.product.price,
        })),
      }),
    })

    setLoading(false)

    if (res.ok) {
      clearCart()
      setSuccess(true)
    }
  }

  if (items.length === 0 && !success) {
    router.push('/cart')
    return null
  }

  if (success) {
    return (
      <main>
        <Header />
        <div className="max-w-lg mx-auto px-8 py-24 text-center">
          <div className="text-4xl mb-6">✓</div>
          <h1 className="font-cormorant text-3xl font-light mb-4">
            Заказ <em className="italic text-amber-700">оформлен!</em>
          </h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-8">
            Мы свяжемся с вами в ближайшее время для подтверждения заказа и уточнения деталей доставки.
          </p>
          <a href="/" className="bg-stone-900 text-stone-50 px-8 py-3 text-[12px] tracking-widest uppercase hover:bg-stone-700 transition-colors">
            На главную
          </a>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main>
      <Header />
      <div className="max-w-5xl mx-auto px-8 py-10">
        <h1 className="font-cormorant text-3xl font-light mb-8">
          Оформление <em className="italic text-amber-700">заказа</em>
        </h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-10">
            {/* Форма */}
            <div className="col-span-2 flex flex-col gap-6">
              {/* Контакты */}
              <fieldset>
                <legend className="text-[10px] tracking-widest uppercase text-stone-400 mb-4">Контактные данные</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-1">Имя и фамилия *</label>
                    <input
                      name="customer_name"
                      value={form.customer_name}
                      onChange={handleChange}
                      required
                      placeholder="Айгерим Сейткали"
                      className="w-full border border-stone-200 px-3 py-2.5 text-[13px] focus:border-stone-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-1">Телефон *</label>
                    <input
                      name="customer_phone"
                      value={form.customer_phone}
                      onChange={handleChange}
                      required
                      placeholder="+7 700 000 00 00"
                      className="w-full border border-stone-200 px-3 py-2.5 text-[13px] focus:border-stone-500 outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] text-stone-500 block mb-1">Email</label>
                    <input
                      name="customer_email"
                      value={form.customer_email}
                      onChange={handleChange}
                      type="email"
                      placeholder="email@example.com"
                      className="w-full border border-stone-200 px-3 py-2.5 text-[13px] focus:border-stone-500 outline-none"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Доставка */}
              <fieldset>
                <legend className="text-[10px] tracking-widest uppercase text-stone-400 mb-4">Доставка</legend>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-1">Город *</label>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      className="w-full border border-stone-200 px-3 py-2.5 text-[13px] focus:border-stone-500 outline-none bg-white"
                    >
                      {KZ_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-1">Способ доставки *</label>
                    <select
                      name="delivery_method"
                      value={form.delivery_method}
                      onChange={handleChange}
                      className="w-full border border-stone-200 px-3 py-2.5 text-[13px] focus:border-stone-500 outline-none bg-white"
                    >
                      {DELIVERY_METHODS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[11px] text-stone-500 block mb-1">Адрес *</label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      placeholder="ул. Абая 10, кв. 5"
                      className="w-full border border-stone-200 px-3 py-2.5 text-[13px] focus:border-stone-500 outline-none"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Оплата */}
              <fieldset>
                <legend className="text-[10px] tracking-widest uppercase text-stone-400 mb-4">Оплата</legend>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map(m => (
                    <label
                      key={m.value}
                      className={`flex items-center gap-3 border p-3 cursor-pointer transition-colors ${
                        form.payment_method === m.value
                          ? 'border-stone-900 bg-stone-50'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment_method"
                        value={m.value}
                        checked={form.payment_method === m.value}
                        onChange={handleChange}
                        className="accent-stone-900"
                      />
                      <span className="text-[12px] text-stone-700">{m.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Примечание */}
              <div>
                <label className="text-[11px] text-stone-500 block mb-1">Примечание к заказу</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Любые пожелания по доставке..."
                  className="w-full border border-stone-200 px-3 py-2.5 text-[13px] focus:border-stone-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Сводка заказа */}
            <div>
              <div className="bg-stone-50 p-6 sticky top-24">
                <h2 className="font-cormorant text-xl font-light mb-4">Ваш заказ</h2>

                <div className="flex flex-col gap-3 mb-4">
                  {items.map(item => (
                    <div key={`${item.product.id}-${item.size}`} className="flex justify-between text-[12px]">
                      <span className="text-stone-600">
                        {item.product.name} × {item.qty}
                        <br />
                        <span className="text-stone-400">р. {item.size}</span>
                      </span>
                      <span className="text-stone-800">{formatPrice(item.product.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-4 flex justify-between font-medium mb-6">
                  <span className="text-[13px]">Итого</span>
                  <span className="font-cormorant text-xl">{formatPrice(totalPrice())}</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-stone-900 text-stone-50 py-4 text-[12px] tracking-widest uppercase hover:bg-stone-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Оформляем...' : 'Подтвердить заказ'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </main>
  )
}
