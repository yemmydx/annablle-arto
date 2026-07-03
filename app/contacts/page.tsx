import type { ReactNode } from 'react'
import LegalPage from '@/components/store/LegalPage'

export const metadata = { title: 'Контакты — POD PLATIEM' }

const F = ({ children }: { children: ReactNode }) => <span className="legal-fill">{children}</span>

export default function ContactsPage() {
  return (
    <LegalPage title="Контакты" intro="Мы на связи и рады помочь с выбором, заказом и любым вопросом по доставке или оплате.">
      <h2>Реквизиты продавца</h2>
      <ul>
        <li>Наименование: <F>[ИП / ТОО «___»]</F></li>
        <li>БИН / ИИН: <F>[___________]</F></li>
        <li>Юридический адрес: <F>[город, улица, дом]</F></li>
      </ul>

      <h2>Как с нами связаться</h2>
      <ul>
        <li>Телефон / WhatsApp: <F>[+7 ___ ___ __ __]</F></li>
        <li>E-mail: <F>[hello@podplatiem.kz]</F></li>
      </ul>

      <h2>Время работы</h2>
      <p>Приём и обработка заказов: <F>[Пн–Вс, 10:00–20:00 (время Астаны)]</F>. Обращения вне рабочего времени обрабатываются на следующий рабочий день.</p>

      <h2>Возврат товара</h2>
      <p>Возврат осуществляется по адресу <F>[адрес пункта приёма]</F> либо по инструкции менеджера при курьерской доставке. Подробнее — в разделе <a href="/returns">«Возврат товара»</a>.</p>
    </LegalPage>
  )
}
