import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem, Product } from './supabase'

type CartStore = {
  items: CartItem[]
  addItem: (product: Product, size: string, color: string | null) => void
  removeItem: (productId: string, size: string) => void
  updateQty: (productId: string, size: string, qty: number) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, size, color) => {
        const items = get().items
        const existing = items.find(
          i => i.product.id === product.id && i.size === size
        )
        if (existing) {
          set({
            items: items.map(i =>
              i.product.id === product.id && i.size === size
                ? { ...i, qty: i.qty + 1 }
                : i
            ),
          })
        } else {
          set({ items: [...items, { product, size, color, qty: 1 }] })
        }
      },

      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            i => !(i.product.id === productId && i.size === size)
          ),
        })
      },

      updateQty: (productId, size, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, size)
          return
        }
        set({
          items: get().items.map(i =>
            i.product.id === productId && i.size === size ? { ...i, qty } : i
          ),
        })
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0),
    }),
    {
      name: 'annabelle-cart', // сохраняется в localStorage
    }
  )
)
