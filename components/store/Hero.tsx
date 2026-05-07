import Link from 'next/link'

const ArrowUR = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17 17 7M9 7h8v8"/></svg>
const Arrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-grid">
        {/* Главная карточка */}
        <div className="hero-img">
          <div className="ph"><div className="ph-label">[ campaign · коллекция 2025 ]</div></div>
          <div className="hero-overlay">
            <div className="hero-meta">
              <span className="hero-tag">Annabelle Arto ✿ Коллекция 2025</span>
              <span className="hero-tag">KZ · ₸</span>
            </div>
            <div>
              <h1 className="hero-title">
                Нежность<em><br/>в каждой</em><br/>детали
              </h1>
              <div className="hero-bottom">
                <Link href="/catalog" className="hero-cta">
                  В коллекцию <Arrow />
                </Link>
                <span className="hero-tag" style={{maxWidth:240,textAlign:'right',lineHeight:1.5,opacity:0.85}}>
                  Капсула из 48 силуэтов. Натуральные ткани, мягкие посадки.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Боковые карточки */}
        <div className="hero-side">
          <div className="hero-card" style={{background:'linear-gradient(160deg,#d4a094 0%,#8a5448 100%)'}}>
            <div className="ph"><div className="ph-label">[ editorial · комплекты ]</div></div>
            <div className="hero-card-mini">
              <span className="hero-tag" style={{color:'rgba(255,247,243,0.8)'}}>Хиты продаж</span>
              <div>
                <h3>Бельё,<br/><em>которое любят</em></h3>
                <Link href="/catalog?featured=true" className="hero-cta" style={{marginTop:14,fontSize:12,padding:'10px 16px'}}>
                  Хиты <ArrowUR />
                </Link>
              </div>
            </div>
          </div>
          <div className="hero-card" style={{background:'linear-gradient(160deg,#f0c8be 0%,#c98e88 100%)'}}>
            <div className="ph"><div className="ph-label">[ новинки · сезон 2025 ]</div></div>
            <div className="hero-card-mini">
              <span className="hero-tag" style={{color:'rgba(58,40,40,0.7)'}}>Новинки ✿ 2025</span>
              <div>
                <h3 style={{color:'var(--ink)'}}>Пижамы<br/><em>& боди</em></h3>
                <Link href="/catalog?new=true" className="hero-cta" style={{marginTop:14,fontSize:12,padding:'10px 16px',background:'var(--ink)',color:'var(--cream)'}}>
                  Смотреть <ArrowUR />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
