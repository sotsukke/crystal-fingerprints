import { Fragment, type ReactNode } from 'react'

type Item = { ordered: boolean; body: string[]; children: Item[] }
type Block =
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'para'; text: string }
  | { kind: 'quote'; text: string }
  | { kind: 'list'; items: Item[] }

const INLINE = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*\s][^*]*\*)/g

function inline(text: string): ReactNode {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{inline(part.slice(2, -2))}</strong>
    if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part)
    if (link) return <a key={i} href={link[2]}>{inline(link[1])}</a>
    if (part.length > 2 && part.startsWith('*') && part.endsWith('*')) return <em key={i}>{inline(part.slice(1, -1))}</em>
    return <Fragment key={i}>{part}</Fragment>
  })
}

const BULLET = /^(\s*)([-*]|\d+\.)\s+(.*)$/

function parse(src: string): Block[] {
  const blocks: Block[] = []
  let para: string[] = []
  let stack: { indent: number; items: Item[] }[] = []
  const flush = () => {
    if (para.length) blocks.push({ kind: 'para', text: para.join(' ') })
    para = []
  }
  const endList = () => {
    stack = []
  }
  for (const line of src.split('\n')) {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    const bullet = BULLET.exec(line)
    if (heading) {
      flush()
      endList()
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] })
    } else if (bullet) {
      flush()
      const indent = bullet[1].length
      const item: Item = { ordered: /\d/.test(bullet[2]), body: [bullet[3]], children: [] }
      if (!stack.length) {
        const list: Block = { kind: 'list', items: [] }
        blocks.push(list)
        stack = [{ indent, items: list.items }]
      }
      while (stack.length > 1 && indent < stack[stack.length - 1].indent) stack.pop()
      const top = stack[stack.length - 1]
      if (indent > top.indent && top.items.length) {
        const parent = top.items[top.items.length - 1]
        stack.push({ indent, items: parent.children })
      }
      stack[stack.length - 1].items.push(item)
    } else if (/^\s+\S/.test(line) && stack.length) {
      const items = stack[stack.length - 1].items
      items[items.length - 1].body.push(line.trim())
    } else if (line.startsWith('>')) {
      flush()
      endList()
      const text = line.replace(/^>\s?/, '')
      const last = blocks[blocks.length - 1]
      if (last?.kind === 'quote') last.text += ' ' + text
      else blocks.push({ kind: 'quote', text })
    } else if (!line.trim()) {
      flush()
    } else {
      endList()
      para.push(line.trim())
    }
  }
  flush()
  return blocks
}

function List({ items }: { items: Item[] }) {
  const Tag = items[0]?.ordered ? 'ol' : 'ul'
  return (
    <Tag>
      {items.map((it, i) => (
        <li key={i}>
          {inline(it.body.join(' '))}
          {it.children.length > 0 && <List items={it.children} />}
        </li>
      ))}
    </Tag>
  )
}

/** Renders the small Markdown subset the journal summary uses. */
export function Markdown({ src }: { src: string }) {
  return (
    <>
      {parse(src).map((b, i) => {
        if (b.kind === 'heading') {
          const H = `h${b.level}` as 'h2'
          return <H key={i}>{inline(b.text)}</H>
        }
        if (b.kind === 'para') return <p key={i}>{inline(b.text)}</p>
        if (b.kind === 'quote') return <blockquote key={i}>{inline(b.text)}</blockquote>
        return <List key={i} items={b.items} />
      })}
    </>
  )
}
