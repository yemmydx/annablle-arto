// Структура mega-menu. Чтобы добавить/убрать пункт — правь только этот файл.
// Все ссылки ведут на /catalog?col=<slug> или /catalog?cat=<slug>
// Когда у тебя в базе появятся товары с этими категориями/коллекциями — они автоматически
// отфильтруются на странице каталога.

export type MenuCol = { title: string; items: { label: string; href: string }[] }
export type MenuBanner = { title: string; subtitle: string; image?: string; href: string }
export type MenuItem = {
  label: string
  href?: string             // если не задано — есть выпадение
  columns?: MenuCol[]       // 1-3 колонок
  banner?: MenuBanner       // картинка справа
}

// Хелперы для slug
const cat = (s: string) => `/catalog?cat=${encodeURIComponent(s)}`
const col = (s: string) => `/catalog?col=${encodeURIComponent(s)}`

export const MENU: MenuItem[] = [
  {
    label: 'Бельё',
    columns: [
      {
        title: 'Категории',
        items: [
          { label: 'Бюстгальтеры', href: cat('bra') },
          { label: 'Трусы женские', href: cat('panties') },
          { label: 'Трусы хлопок, модал', href: cat('panties-cotton') },
          { label: 'Бесшовное бельё', href: cat('seamless') },
          { label: 'Комплекты белья', href: cat('sets') },
          { label: 'Боди', href: cat('bodysuit') },
          { label: 'Аксессуары', href: cat('accessories') },
        ],
      },
      {
        title: 'Коллекции',
        items: [
          'Cotton','Obrana lingerie','Freedom','Idol','Noemi','Anabelle','Dea','Aida',
          'Per Amore','Lure','Rosalia','Sorpresa','FATALE','Lily','Lovely','Intrigo',
          'Énigme','Peony','Charm','Instinct','Velour (Lux)','Zefira','Diana','Silk',
          'Strong&Tender','Nika',
        ].map(name => ({ label: name, href: col(name) })),
      },
      {
        title: 'Новинки / Акции',
        items: [
          { label: 'Новинки', href: '/catalog?new=true' },
          { label: 'Акции', href: '/catalog?sale=true' },
          { label: '1+1=3 на бюсты', href: '/catalog?promo=bra-3' },
          { label: '1+1=3 на трусы', href: '/catalog?promo=panties-3' },
        ],
      },
    ],
    banner: {
      title: 'FATALE',
      subtitle: 'New Collection',
      href: col('FATALE'),
    },
  },
  {
    label: 'Купальники',
    columns: [
      {
        title: 'Категории',
        items: [
          { label: 'Слитные купальники', href: cat('swim-one-piece') },
          { label: 'Раздельные купальники', href: cat('swim-bikini') },
          { label: 'Пляжная одежда', href: cat('beachwear') },
          { label: 'Парео', href: cat('pareo') },
          { label: 'Аксессуары', href: cat('swim-accessories') },
        ],
      },
      {
        title: 'Коллекции',
        items: [
          'Costa Brava','Sunny Kiss','Afina','Perla','Laguna','Malibu','Sport Glam',
          'Basic Line Anabel Arto','Bora-Bora','Siren','Monte-Carlo','Zagrava','Mandry',
          'Slavna','Mantra','Bella','Barvy','Synevyr','Dolce Vita','Marrakesh','Sahara',
          'Cruise','Monaco','Wild&Free','Dopamine Splash','Diva','Flora Noir','Tropicana',
          'Playa','Basic Line Obrana','Tesoro','Copacabana','Wild&Gentle','Liana',
        ].map(name => ({ label: name, href: col(name) })),
      },
      {
        title: 'Новинки / Акции',
        items: [
          { label: 'Новинки', href: '/catalog?new=true&cat=swim' },
          { label: 'Акции', href: '/catalog?sale=true&cat=swim' },
          { label: 'Купальники со скидкой', href: '/catalog?sale=true&cat=swim' },
          { label: 'swimwear and beachwear -50%', href: '/catalog?promo=swim-50' },
          { label: 'Основная коллекция', href: '/catalog?cat=swim' },
        ],
      },
    ],
    banner: {
      title: 'Basic Line',
      subtitle: 'Anabelle Arto · New Collection',
      href: col('Basic Line Anabel Arto'),
    },
  },
  {
    label: 'Одежда',
    columns: [
      {
        title: 'Категории',
        items: [
          { label: 'Пижамы и костюмы', href: cat('pajamas') },
          { label: 'Сорочки, халаты и платья', href: cat('robes') },
          { label: 'Джемперы, блузы', href: cat('blouses') },
          { label: 'Боди', href: cat('bodysuit') },
          { label: 'Майки', href: cat('tops') },
          { label: 'Одежда для спорта', href: cat('sport') },
          { label: 'Обувь и аксессуары', href: cat('shoes-acc') },
        ],
      },
      {
        title: 'Коллекции',
        items: [
          'Velour (Lux)','Obrana lingerie','Cotton','Lure','Peony','Dea','Lily','Lovely',
          'Amuleto','Idol','Énigme','MAVKA','Noemi','Savana','FATALE','Silk','Erato (Lux)',
          'Nika','Instinct','Miracle','Aurora','Aida','Violett',
        ].map(name => ({ label: name, href: col(name) })),
      },
      {
        title: 'Новинки / Акции',
        items: [
          { label: 'Новинки', href: '/catalog?new=true&cat=clothes' },
          { label: 'Акции', href: '/catalog?sale=true&cat=clothes' },
          { label: 'Homewear sale', href: '/catalog?promo=homewear' },
          { label: 'Основная коллекция', href: '/catalog?cat=clothes' },
        ],
      },
    ],
    banner: {
      title: 'Velour (Lux)',
      subtitle: 'New Collection',
      href: col('Velour (Lux)'),
    },
  },
  {
    label: 'Колготки',
    columns: [
      {
        title: 'Категории',
        items: [
          { label: 'Классические колготки', href: cat('tights') },
          { label: 'Чулки', href: cat('stockings') },
          { label: 'Корректирующие колготки', href: cat('tights-shape') },
          { label: 'Зимние колготки', href: cat('tights-winter') },
          { label: 'Носки и гольфы', href: cat('socks') },
          { label: 'Леггинсы', href: cat('leggings') },
        ],
      },
      {
        title: 'Новинки / Акции',
        items: [
          { label: 'Акции', href: '/catalog?sale=true&cat=tights' },
        ],
      },
    ],
  },
  {
    label: 'Мужчинам',
    columns: [
      {
        title: 'Категории',
        items: [
          { label: 'Бельё мужское', href: cat('men-underwear') },
          { label: 'Одежда мужская', href: cat('men-clothes') },
          { label: 'Купальные плавки', href: cat('men-swim') },
          { label: 'Носки', href: cat('men-socks') },
        ],
      },
      {
        title: 'Новинки / Акции',
        items: [
          { label: 'Акции', href: '/catalog?sale=true&cat=men' },
          { label: 'Homewear sale', href: '/catalog?promo=men-homewear' },
        ],
      },
    ],
  },
  {
    label: 'Детям',
    columns: [
      {
        title: 'Категории',
        items: [
          { label: 'Детское бельё', href: cat('kids-underwear') },
          { label: 'Детская одежда', href: cat('kids-clothes') },
          { label: 'Купальники для подростков', href: cat('teen-swim') },
          { label: 'Колготки для подростков', href: cat('teen-tights') },
          { label: 'Носки для подростков', href: cat('teen-socks') },
        ],
      },
      {
        title: 'Коллекции',
        items: [
          { label: 'MAVKA', href: col('MAVKA') },
          { label: 'Bora-Bora', href: col('Bora-Bora') },
        ],
      },
      {
        title: 'Новинки / Акции',
        items: [
          { label: 'Акции', href: '/catalog?sale=true&cat=kids' },
        ],
      },
    ],
    banner: {
      title: 'MAVKA',
      subtitle: 'New Collection',
      href: col('MAVKA'),
    },
  },
  {
    label: 'Outlet',
    href: '/catalog?sale=true',
  },
]
