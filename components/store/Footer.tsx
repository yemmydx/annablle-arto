import Link from 'next/link'

export default function Footer() {
  return (
    <footer>
      <div className="footer-grid">
        <div>
          <h3>Будь <em>нежной.</em></h3>
          <p style={{opacity:0.7,fontSize:13,maxWidth:320}}>
            Письма раз в месяц: о новинках, скидках и секретах ухода за бельём.
          </p>
          <div className="subscribe">
            <input placeholder="Твой email" />
            <button>Подписаться</button>
          </div>
        </div>
        <div>
          <h6>Каталог</h6>
          <ul>
            {[['Комплекты','/catalog?category=komplekty'],['Пижамы','/catalog?category=pijamy'],['Боди','/catalog?category=body'],['Халаты','/catalog?category=halaty'],['Новинки','/catalog?new=true']].map(([l,h]) => (
              <li key={h}><Link href={h}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h6>Сервис</h6>
          <ul>
            {[['Доставка и оплата','/delivery'],['Возврат товара','/returns'],['Таблица размеров','/size-guide'],['Контакты','/contacts']].map(([l,h]) => (
              <li key={h}><Link href={h}>{l}</Link></li>
            ))}
          </ul>
        </div>
        <div>
          <h6>POD PLATIEM</h6>
          <ul>
            <li><Link href="/about">О бренде</Link></li>
            <li><a href="https://instagram.com/podplatiem">Instagram</a></li>
            <li><a href="https://wa.me/77001234567">WhatsApp</a></li>
            <li><a>Казахстан 🇰🇿</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 POD PLATIEM</span>
        <span>КАЗАХСТАН · БЕЛЬЁ С ЛЮБОВЬЮ</span>
        <span>KZ · ₸</span>
      </div>
    </footer>
  )
}
