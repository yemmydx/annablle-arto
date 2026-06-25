'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

const ITEMS = [
  { label: 'Комплект', sub: 'Velvet Rose', color: 'linear-gradient(165deg,#f3c8be,#c98e88)' },
  { label: 'Пижама', sub: 'Silk Touch', color: 'linear-gradient(165deg,#ead0c4,#d4a094)' },
  { label: 'Боди', sub: 'Lace Dream', color: 'linear-gradient(165deg,#f5d4ca,#e8b4a6)' },
  { label: 'Халат', sub: 'Cashmere Feel', color: 'linear-gradient(165deg,#d4a094,#8a5448)' },
  { label: 'Комплект', sub: 'Morning Blush', color: 'linear-gradient(165deg,#f0c8be,#d8907e)' },
  { label: 'Боди', sub: 'Soft Lace', color: 'linear-gradient(165deg,#e8c4b6,#c8907e)' },
  { label: 'Пижама', sub: 'Rose Dream', color: 'linear-gradient(165deg,#f3c8be,#d99c8e)' },
  { label: 'Халат', sub: 'Velour Wrap', color: 'linear-gradient(165deg,#c8907e,#9a6858)' },
]

const STATS = [
  { num: '48', label: 'моделей в коллекции' },
  { num: '6', label: 'категорий бельё' },
  { num: '30', label: 'дней возврат' },
  { num: '16', label: 'городов Казахстана' },
]

const VALUES = [
  { title: 'Комфорт прежде всего', text: 'Мы не верим в бельё, которое нужно терпеть. Каждая вещь создана чтобы вы забыли что она на вас.' },
  { title: 'Качество материалов', text: 'Премиальная микрофибра, натуральное кружево, мягкий сатин — только те ткани, которые выбрали бы для себя.' },
  { title: 'Все размеры', text: 'От XS до 3XL. Потому что красивое бельё создано для всех, а не для манекенов.' },
  { title: 'Казахстан наш дом', text: 'Доставляем по всей стране. Алматы, Астана, Шымкент и ещё 13 городов — быстро и бережно.' },
]

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const el = document.getElementById('about-scroll')
    if (!el) return
    const handler = () => setY(el.scrollTop)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])
  return y
}

export default function AboutClient() {
  const conveyorRef = useRef<HTMLDivElement>(null)
  const [offset, setOffset] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const [heroOffset, setHeroOffset] = useState(0)
  const [heroBg, setHeroBg] = useState<string | null>(null)

  // Загружаем фон hero из настроек сайта (REST API напрямую)
  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return
    fetch(`${url}/rest/v1/site_settings?key=eq.hero_bg&select=value`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (data && data[0] && data[0].value) setHeroBg(data[0].value)
      })
      .catch(() => {})
  }, [])

  // Конвейер — бесконечная прокрутка карточек
  useEffect(() => {
    let frame: number
    let start: number | null = null
    const speed = 0.5
    function animate(ts: number) {
      if (start === null) start = ts
      const elapsed = ts - start
      setOffset(prev => {
        const next = prev + speed
        // Сбрасываем когда прошли половину (дублируем массив)
        const itemW = 220 + 16
        const half = ITEMS.length * itemW
        return next >= half ? 0 : next
      })
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  // Параллакс героя при скролле страницы
  useEffect(() => {
    function onScroll() {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect()
        setHeroOffset(rect.top * 0.3)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ overflow: 'hidden' }}>

      {/* HERO с параллаксом */}
      <div ref={heroRef} style={{ position: 'relative', height: '90vh', minHeight: 600, overflow: 'hidden', background: 'linear-gradient(135deg, var(--rose) 0%, var(--rose-deep) 100%)' }}>
        {/* Фоновое фото (если задано в админке → Настройки → Главный баннер) */}
        {heroBg && (
          <>
            <img src={heroBg} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(58,40,40,0.55) 0%, rgba(58,40,40,0.25) 55%, rgba(58,40,40,0.1) 100%)', zIndex: 1 }} />
          </>
        )}        {/* Фоновые плавающие кружки */}
        <div style={{ position: 'absolute', inset: 0, transform: `translateY(${heroOffset}px)`, transition: 'transform 0.1s linear' }}>
          {[
            { w: 400, h: 400, t: '-10%', l: '-5%', op: 0.15 },
            { w: 300, h: 300, t: '60%', r: '-5%', op: 0.1 },
            { w: 200, h: 200, t: '20%', l: '45%', op: 0.08 },
          ].map((c, i) => (
            <div key={i} style={{ position: 'absolute', width: c.w, height: c.h, borderRadius: '50%', background: 'rgba(255,247,243,0.3)', top: c.t, left: (c as any).l, right: (c as any).r, opacity: c.op }} />
          ))}
        </div>

        {/* Текст */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px 60px', zIndex: 2 }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,247,243,0.7)', marginBottom: 20 }}>
            POD PLATIEM ✿ Казахстан
          </span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(56px, 9vw, 120px)', lineHeight: 0.9, letterSpacing: '-0.02em', color: 'var(--cream)', marginBottom: 32 }}>
            Бельё, в<br />котором<br /><em style={{ fontStyle: 'italic' }}>хочется жить</em>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,247,243,0.8)', maxWidth: 480, lineHeight: 1.7, marginBottom: 36 }}>
            Мы создаём бельё для женщин, которые ценят комфорт и элегантность. Каждая вещь — это забота, которую можно почувствовать.
          </p>
          <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '16px 28px', borderRadius: 999, background: 'var(--cream)', color: 'var(--ink)', textDecoration: 'none', fontSize: 13, letterSpacing: '0.04em', width: 'fit-content' }}>
            Смотреть коллекцию
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </Link>
        </div>

        {/* Плашка внизу справа */}
        <div style={{ position: 'absolute', bottom: 40, right: 60, display: 'flex', gap: 24 }}>
          {STATS.slice(0, 2).map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, fontWeight: 300, color: 'var(--cream)', lineHeight: 1 }}>{s.num}</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,247,243,0.6)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* КОНВЕЙЕР — бесконечно едет */}
      <div style={{ background: 'var(--ink)', padding: '48px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 16, width: 'max-content', transform: `translateX(-${offset}px)`, willChange: 'transform' }}>
          {/* Дублируем массив для бесконечности */}
          {[...ITEMS, ...ITEMS, ...ITEMS].map((item, i) => (
            <div key={i} style={{ width: 220, flexShrink: 0 }}>
              <div style={{ aspectRatio: '3/4', borderRadius: 12, background: item.color, position: 'relative', marginBottom: 12, overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0,rgba(255,255,255,0.06) 2px,transparent 2px,transparent 14px)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 14 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,247,243,0.8)', background: 'rgba(58,40,40,0.4)', padding: '3px 7px', borderRadius: 4, backdropFilter: 'blur(8px)' }}>
                    [ {item.label} ]
                  </span>
                </div>
              </div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'var(--cream)', fontStyle: 'italic', paddingLeft: 4 }}>{item.sub}</p>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,247,243,0.4)', paddingLeft: 4, marginTop: 2 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* БЕГУЩИЙ ТЕКСТ */}
      <div style={{ background: 'var(--rose)', padding: '14px 0', overflow: 'hidden', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'inline-block', animation: 'scroll 20s linear infinite', fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontStyle: 'italic', fontWeight: 300, color: 'var(--ink)' }}>
          {Array(6).fill(null).map((_, i) => (
            <span key={i} style={{ padding: '0 40px' }}>Нежность в каждой детали ✿</span>
          ))}
        </div>
      </div>

      {/* НАШИ ЦЕННОСТИ */}
      <section style={{ padding: '96px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginBottom: 96 }}>
            <div>
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--rose-deep)', display: 'block', marginBottom: 20 }}>— Манифест</span>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(40px, 5vw, 64px)', lineHeight: 1, letterSpacing: '-0.01em', marginBottom: 24 }}>
                POD PLATIEM —<br /><em style={{ fontStyle: 'italic' }}>это про тебя</em>
              </h2>
              <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
                Бельё, в котором не хочется снимать. Свободные посадки, мягкие чашки без косточек, ткани, которые ведут себя по-человечески.
              </p>
              <p style={{ color: 'var(--ink-soft)', fontSize: 15, lineHeight: 1.8 }}>
                Никаких обещаний про идеал — только удобство, которое заметно с первой минуты. Мы в Казахстане, мы понимаем вас.
              </p>
            </div>
            {/* Плитка статистики */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              {STATS.map((s, i) => (
                <div key={i} style={{ background: i % 2 === 0 ? 'var(--rose)' : 'var(--bg-2)', padding: '40px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 160, borderRadius: i === 0 ? '12px 0 0 0' : i === 1 ? '0 12px 0 0' : i === 2 ? '0 0 0 12px' : '0 0 12px 0' }}>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 56, fontWeight: 300, lineHeight: 1, color: 'var(--ink)' }}>{s.num}</span>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-soft)', opacity: 0.8 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Карточки ценностей */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ borderTop: `2px solid ${i % 2 === 0 ? 'var(--rose-deep)' : 'var(--ink)'}`, paddingTop: 20 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5, display: 'block', marginBottom: 10 }}>
                  0{i+1}
                </span>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 22, marginBottom: 12, lineHeight: 1.2 }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-soft)', lineHeight: 1.7 }}>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ВРАЩАЮЩИЙСЯ КОНВЕЙЕР — горизонтальный скролл при скролле */}
      <div style={{ background: 'var(--bg-2)', padding: '80px 0', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 60px', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 48, lineHeight: 1, letterSpacing: '-0.01em' }}>
              Коллекция <em style={{ fontStyle: 'italic', color: 'var(--rose-deep)' }}>2025</em>
            </h2>
            <Link href="/catalog" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink)', textDecoration: 'none', borderBottom: '1px solid var(--ink)', paddingBottom: 2 }}>
              Смотреть всё →
            </Link>
          </div>
        </div>

        {/* Горизонтальный ряд карточек — слева направо */}
        <div style={{ display: 'flex', gap: 16, padding: '0 60px', overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {ITEMS.map((item, i) => (
            <div key={i} style={{ flexShrink: 0, width: 260 }}>
              <div style={{ aspectRatio: '3/4', borderRadius: 12, background: item.color, position: 'relative', overflow: 'hidden', marginBottom: 14, cursor: 'pointer', transition: 'transform .5s cubic-bezier(.2,.7,.2,1)' }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-8px)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0,rgba(255,255,255,0.06) 2px,transparent 2px,transparent 14px)' }} />
                <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 28, color: 'var(--cream)', lineHeight: 1 }}>{item.sub}</h3>
                  <div style={{ width: 32, height: 32, borderRadius: 999, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', display: 'grid', placeItems: 'center', color: 'var(--cream)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17 17 7M9 7h8v8"/></svg>
                  </div>
                </div>
              </div>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.5 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* КОНТАКТЫ */}
      <section style={{ padding: '96px 60px', background: 'var(--ink)', color: 'var(--cream)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(48px, 6vw, 80px)', lineHeight: 0.9, marginBottom: 32 }}>
              Найди нас
            </h2>
            <p style={{ fontSize: 15, opacity: 0.7, lineHeight: 1.8, marginBottom: 36 }}>
              Мы в Казахстане. Онлайн — всегда. Пишите в WhatsApp или Instagram, мы отвечаем быстро.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                ['WhatsApp', '+7 700 123 45 67', 'https://wa.me/77001234567'],
                ['Instagram', '@podplatiem', 'https://instagram.com/podplatiem'],
                ['Email', 'hello@podplatiem.kz', 'mailto:hello@podplatiem.kz'],
              ].map(([label, val, href]) => (
                <a key={label} href={href} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 0', borderBottom: '1px solid rgba(255,247,243,0.1)', textDecoration: 'none', color: 'var(--cream)' }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', opacity: 0.5 }}>{label}</span>
                  <span style={{ fontSize: 15 }}>{val}</span>
                </a>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {ITEMS.slice(0, 4).map((item, i) => (
              <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: item.color, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(45deg,rgba(255,255,255,0.06) 0,rgba(255,255,255,0.06) 2px,transparent 2px,transparent 14px)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div style={{ background: 'var(--rose)', padding: '64px 60px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(40px, 6vw, 72px)', lineHeight: 1, letterSpacing: '-0.01em', marginBottom: 24 }}>
          Готова <em style={{ fontStyle: 'italic' }}>почувствовать</em> разницу?
        </h2>
        <Link href="/catalog" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, padding: '18px 36px', borderRadius: 999, background: 'var(--ink)', color: 'var(--cream)', textDecoration: 'none', fontSize: 14, letterSpacing: '0.04em' }}>
          Смотреть коллекцию
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </Link>
      </div>

    </div>
  )
}
