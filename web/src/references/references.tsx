import { Fragment, type ReactNode } from 'react'
import bib from '../../../refs.bib?raw'

type Entry = { key: string; type: string; fields: Record<string, string> }

function parse(src: string): Entry[] {
  const text = src
    .split('\n')
    .filter((line) => !/^\s*%/.test(line))
    .join('\n')
  const entries: Entry[] = []
  const head = /@(\w+)\s*\{\s*([^,\s]+)\s*,/g
  let m: RegExpExecArray | null
  while ((m = head.exec(text))) {
    const fields: Record<string, string> = {}
    let i = head.lastIndex
    for (;;) {
      const field = /\s*(\w+)\s*=\s*/y
      field.lastIndex = i
      const f = field.exec(text)
      if (!f) break
      i = field.lastIndex
      let value = ''
      if (text[i] === '{') {
        let depth = 0
        const start = i
        do {
          if (text[i] === '{') depth++
          else if (text[i] === '}') depth--
          i++
        } while (depth > 0)
        value = text.slice(start + 1, i - 1)
      } else {
        const bare = /[^,}\s]*/y
        bare.lastIndex = i
        value = bare.exec(text)![0]
        i = bare.lastIndex
      }
      fields[f[1].toLowerCase()] = value.replace(/\s+/g, ' ').trim()
      const comma = /\s*,/y
      comma.lastIndex = i
      if (comma.exec(text)) i = comma.lastIndex
    }
    entries.push({ key: m[2], type: m[1].toLowerCase(), fields })
    head.lastIndex = i
  }
  return entries
}

const plain = (s: string) =>
  s
    .replace(/\{\\'(\w)\}|\\'\{?(\w)\}?/g, (_, a, b) => `${a ?? b}́`.normalize('NFC'))
    .replace(/\\(?:texttt|url|emph|textit)\{([^}]*)\}/g, '$1')
    .replace(/\\ /g, ' ')
    .replace(/---/g, '—')
    .replace(/--/g, '–')
    .replace(/[{}]/g, '')

/** A field's LaTeX as text, with `$…$` set in italics. */
const tex = (s: string): ReactNode =>
  plain(s).split(/(\$[^$]+\$)/).map((part, i) =>
    part.startsWith('$') ? <i key={i}>{part.slice(1, -1)}</i> : <Fragment key={i}>{part}</Fragment>,
  )

const people = (s: string) =>
  s.split(' and ').map((name) => {
    const [last, first] = name.split(',').map((p) => p.trim())
    return first ? `${first} ${last}` : last
  })

function authors(s: string) {
  const names = people(s)
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`
}

const ordinal = (n: number) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : (['th', 'st', 'nd', 'rd'][n % 10] ?? 'th')}`

const surname = (e: Entry) => (e.fields.author ?? '').split(' and ')[0].split(',')[0].replace(/[{}]/g, '').replace(/^de /, '')

function Reference({ e }: { e: Entry }) {
  const f = e.fields
  const volume = f.volume ? `${f.volume}${f.number ? `(${f.number})` : ''}` : ''
  const pages = f.pages ?? f.eid
  const venue: ReactNode[] = []
  if (e.type === 'article') venue.push(<i key="j">{tex(f.journal)}</i>, volume && ` ${volume}`, pages && `:${plain(pages)}`, `, ${f.year}.`)
  else if (e.type === 'inproceedings')
    venue.push(
      'In ',
      <i key="b">{tex(f.booktitle)}</i>,
      f.series && `, ${f.series}`,
      volume && ` ${volume}`,
      pages && `, pages ${plain(pages)}`,
      f.publisher && `. ${f.publisher}`,
      `, ${f.year}.`,
    )
  else if (e.type === 'phdthesis') venue.push(`PhD thesis, ${f.school}, ${f.year}.`)
  else if (e.type === 'book') venue.push(f.edition && `${ordinal(Number(f.edition))} edition. `, `${f.publisher}, ${f.year}.`)
  else venue.push(f.year && `${f.year}.`)
  const title = e.type === 'book' ? <i>{tex(f.title)}</i> : tex(f.title)
  const url = f.url ?? (f.howpublished && plain(f.howpublished))
  return (
    <li>
      <span className="key">[{e.key}]</span>
      <span>
        {plain(authors(f.author))}. {title}. {venue}
        {f.note && <> {tex(f.note.replace(/\.$/, ''))}.</>}
        {f.doi && (
          <>
            {' '}
            <a href={`https://doi.org/${f.doi}`}>doi:{f.doi}</a>.
          </>
        )}
        {f.eprint && (
          <>
            {' '}
            <a href={`https://arxiv.org/abs/${f.eprint}`}>arXiv:{f.eprint}</a>.
          </>
        )}
        {url && (
          <>
            {' '}
            <a href={url}>{url}</a>.
          </>
        )}
      </span>
    </li>
  )
}

const ENTRIES = parse(bib).sort((a, b) => surname(a).localeCompare(surname(b)) || a.fields.year.localeCompare(b.fields.year))

export function References() {
  return (
    <article className="course journal">
      <h1>References</h1>
      <ol className="refs">
        {ENTRIES.map((e) => (
          <Reference key={e.key} e={e} />
        ))}
      </ol>
    </article>
  )
}
