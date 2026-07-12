// Текстовый логотип: POD PLATIEM + ПОД ПЛАТЬЕМ (цвета этикетки, без овала).
// Размеры задаются в globals.css (.brand-logo-*), там же мобильная версия.

export default function BrandLogo(_props: { height?: number; variant?: string } = {}) {
  return (
    <span className="brand-logo">
      <span className="brand-logo-title">POD PLATIEM</span>
      <span className="brand-logo-sub">ПОД ПЛАТЬЕМ</span>
    </span>
  )
}
