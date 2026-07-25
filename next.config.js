/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Отключаем оптимизацию картинок на Vercel: на бесплатном тарифе лимит 5000/мес,
    // и он выжигался при просмотре каталога → фото пропадали. Теперь картинки идут
    // напрямую из Supabase, без обработки Vercel и без лимита.
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

module.exports = nextConfig
