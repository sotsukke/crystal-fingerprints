import { type ReactNode, useEffect, useRef, useState } from 'react'

export const Psi = ({ k = 'k' }: { k?: ReactNode }) => (
  <>
    <i>ψ</i>
    <sub>{k}</sub>
  </>
)

export const Phi = ({ k = 'k' }: { k?: ReactNode }) => (
  <>
    <i>φ</i>
    <sub>{k}</sub>
  </>
)

export const V = ({ i }: { i: 1 | 2 }) => (
  <>
    <i>v</i>
    <sub>{i}</sub>
  </>
)

const Beside = ({ aside, children }: { aside?: ReactNode; children: ReactNode }) =>
  aside ? (
    <div className="beside">
      <div>{children}</div>
      <div className="aside">{aside}</div>
    </div>
  ) : (
    <div>{children}</div>
  )

export function P({ n, aside, children }: { n: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <div className="para">
      <span className="num">{n}</span>
      <Beside aside={aside}>{children}</Beside>
    </div>
  )
}

function Box({
  n,
  kind,
  title,
  aside,
  children,
}: {
  n: string
  kind: string
  title?: ReactNode
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="para">
      <span className="num">{n}</span>
      <section className={`box ${kind}`}>
        <header>
          <span className="kind">{kind}</span> {title}
        </header>
        <Beside aside={aside}>
          <div className="box-body">{children}</div>
        </Beside>
      </section>
    </div>
  )
}

export const Definition = ({
  n,
  plural,
  aside,
  children,
}: {
  n: string
  plural?: boolean
  aside?: ReactNode
  children: ReactNode
}) => (
  <Box n={n} kind={plural ? 'definitions' : 'definition'} aside={aside}>
    {children}
  </Box>
)

export const Algorithm = ({ n, title, children }: { n: string; title: ReactNode; children: ReactNode }) => (
  <Box n={n} kind="algorithm" title={title}>
    {children}
  </Box>
)

/** A question whose answer stays folded until the reader asks for it. */
export function Question({
  n,
  ask,
  answer,
  kind = 'question',
  reveal = 'Show the answer',
}: {
  n: string
  ask: ReactNode
  answer: ReactNode
  kind?: 'question' | 'dissonance' | 'try'
  reveal?: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="para">
      <span className="num">{n}</span>
      <section className={`box ask ${kind}`}>
        <p className="ask-q">
          <span className="kind">{kind}</span> {ask}
        </p>
        {open ? (
          <div className="ask-a">
            <span className="kind">{kind === 'try' ? 'check' : 'answer'}</span> {answer}
          </div>
        ) : (
          <button className="reveal" onClick={() => setOpen(true)}>
            {reveal}
          </button>
        )}
      </section>
    </div>
  )
}

export function Fig({ caption, children, wide }: { caption?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <figure className={wide ? 'fig wide' : 'fig'}>
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

export const Row = ({ children }: { children: ReactNode }) => <div className="fig-row">{children}</div>

export const Controls = ({ children }: { children: ReactNode }) => <div className="fig-controls">{children}</div>

export const Note = ({ children }: { children: ReactNode }) => <p className="fig-note">{children}</p>

/** Mounts its children once they come near the screen. */
export function Defer({ height, children }: { height: number; children: ReactNode }) {
  const [near, setNear] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: '800px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [near])
  return near ? <>{children}</> : <div ref={ref} style={{ minHeight: height }} />
}
