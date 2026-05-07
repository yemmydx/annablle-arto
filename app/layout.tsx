import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Annabelle Arto — Женское бельё в Казахстане',
  description: 'Изысканное женское бельё с доставкой по всему Казахстану. Оплата Kaspi Pay, Halyk, картой.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <div className="app-bg" />
        {children}
      </body>
    </html>
  )
}
