// Умное форматирование описания товара.
// Поддерживает:
// - переносы строк (Enter)
// - абзацы (двойной Enter)
// - маркированные списки (строки начинающиеся с -, —, •, *)
// - подсветка строк типа "Состав:", "Материал:", "Уход:"

type Block =
  | { type: 'paragraph'; lines: string[] }
  | { type: 'list'; items: string[] }
  | { type: 'meta'; key: string; value: string }

const META_KEYS = ['состав', 'материал', 'размер', 'уход', 'производство', 'страна', 'артикул']

function isMetaLine(line: string): { key: string; value: string } | null {
  const m = line.match(/^([A-Za-zА-Яа-яЁё ]+):\s*(.+)$/)
  if (!m) return null
  const key = m[1].trim().toLowerCase()
  if (!META_KEYS.some(k => key.startsWith(k))) return null
  return { key: m[1].trim(), value: m[2].trim() }
}

function isListLine(line: string): string | null {
  const m = line.match(/^[\-—•*]\s*(.+)$/)
  return m ? m[1].trim() : null
}

function parseDescription(raw: string): Block[] {
  const lines = raw.split('\n').map(l => l.trim())
  const blocks: Block[] = []
  let currentParagraph: string[] = []
  let currentList: string[] = []

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', lines: currentParagraph })
      currentParagraph = []
    }
  }
  function flushList() {
    if (currentList.length > 0) {
      blocks.push({ type: 'list', items: currentList })
      currentList = []
    }
  }

  for (const line of lines) {
    if (!line) {
      // Пустая строка — конец абзаца/списка
      flushParagraph()
      flushList()
      continue
    }

    const meta = isMetaLine(line)
    if (meta) {
      flushParagraph()
      flushList()
      blocks.push({ type: 'meta', key: meta.key, value: meta.value })
      continue
    }

    const listItem = isListLine(line)
    if (listItem !== null) {
      flushParagraph()
      currentList.push(listItem)
      continue
    }

    // Обычная строка — добавляем в текущий абзац
    flushList()
    currentParagraph.push(line)
  }

  flushParagraph()
  flushList()

  return blocks
}

export default function ProductDescription({ text }: { text: string }) {
  if (!text || !text.trim()) return null

  const blocks = parseDescription(text)

  return (
    <div className="pdp-desc">
      {blocks.map((b, i) => {
        if (b.type === 'paragraph') {
          return (
            <p key={i}>
              {b.lines.map((line, li) => (
                <span key={li}>
                  {line}
                  {li < b.lines.length - 1 && <br />}
                </span>
              ))}
            </p>
          )
        }
        if (b.type === 'list') {
          return (
            <ul key={i} className="pdp-desc-list">
              {b.items.map((item, ii) => (
                <li key={ii}>{item}</li>
              ))}
            </ul>
          )
        }
        if (b.type === 'meta') {
          return (
            <div key={i} className="pdp-desc-meta">
              <span className="meta-key">{b.key}</span>
              <span className="meta-value">{b.value}</span>
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
