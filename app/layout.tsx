import type { Metadata, Viewport } from 'next'
import './globals.css'

const FONTS_URL = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter+Tight:wght@300;400;500;600&family=JetBrains+Mono:wght@300;400;500&display=swap'

export const metadata: Metadata = {
  metadataBase: new URL('https://podplatiem.com'),
  title: 'POD PLATIEM — Женское бельё в Казахстане',
  description: 'Изысканное женское бельё с доставкой по всему Казахстану. Оплата Kaspi Pay, Halyk, картой.',
  openGraph: {
    title: 'POD PLATIEM — Женское бельё в Казахстане',
    description: 'Изысканное женское бельё с доставкой по всему Казахстану. Оплата Kaspi Pay, Halyk, картой.',
    url: 'https://podplatiem.com',
    siteName: 'POD PLATIEM',
    locale: 'ru_RU',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {/* Ранняя загрузка шрифтов: соединение и CSS шрифтов стартуют сразу,
            не дожидаясь @import внутри globals.css */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_URL} />
        <div className="app-bg" />
        {children}
      </body>
    </html>
  )
}
