import index from './figures/index.json'

export type FigureEntry = {
  id: string
  file: string
  caption: string
  group: string
  section: string
  layout: string
  groupCaption?: string
}

const SCALE = 1.3

const widthOf = (svg: string) => Number(/<svg[^>]*\swidth="([\d.]+)"/.exec(svg)![1])

/** A `Static` for one folder of figures: its index.json and its `./figures/*.svg` glob. */
export function staticFigures(entries: FigureEntry[], svgs: Record<string, string>) {
  const byId = new Map(entries.map((e) => [e.id, e]))

  /** Static figures in one row, each with its caption. */
  return function Static({ ids }: { ids: string[] }) {
    const entries = ids.map((id) => {
      const e = byId.get(id)
      if (!e) throw new Error(`no figure ${id}`)
      return { ...e, svg: svgs[`./figures/${e.file}`] }
    })
    const one = entries.length === 1
    const caption = one ? entries[0].caption : entries[0].groupCaption
    return (
      <figure className="fig static">
        <div className="static-row">
          {entries.map((e, i) => (
            <div key={e.id} className="static-item" style={{ flex: `0 1 ${Math.max(widthOf(e.svg) * SCALE, 210)}px` }}>
              {i > 0 && e.layout === 'trace' && <span className="static-arrow">→</span>}
              <div className="static-svg" style={{ maxWidth: widthOf(e.svg) * SCALE }} dangerouslySetInnerHTML={{ __html: e.svg }} />
              {!one && e.caption && <div className="panel-label">{e.caption}</div>}
            </div>
          ))}
        </div>
        {caption && <figcaption>{caption}</figcaption>}
      </figure>
    )
  }
}

export const Static = staticFigures(
  index,
  import.meta.glob<string>('./figures/*.svg', { eager: true, query: '?raw', import: 'default' }),
)
