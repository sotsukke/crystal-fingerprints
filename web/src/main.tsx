import { StrictMode, Suspense, lazy, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { type Crystal, type Vec, cellArea, reduced, toCartesian, vec } from './geometry/crystal'
import { defaultRange, densityFingerprint } from './geometry/fingerprint'
import { SECTIONS } from './course/sections'
import { EXPECTED_SECTIONS } from './expected/sections'
import { Choice, Slider } from './playground/controls'
import { type Overlay, Playground, SITE_NAMES } from './playground/playground'
import { Plot } from './playground/plot'
import './styles.css'

type Route = 'playground' | 'course' | 'expected' | 'journal' | 'references'

const Course = lazy(() => import('./course/course').then((m) => ({ default: m.Course })))
const Expected = lazy(() => import('./expected/expected').then((m) => ({ default: m.Expected })))
const Journal = lazy(() => import('./journal/journal').then((m) => ({ default: m.Journal })))
const References = lazy(() => import('./references/references').then((m) => ({ default: m.References })))

type Section = { id: string; n: number; title: string }

const SECTIONS_OF: Partial<Record<Route, Section[]>> = { course: SECTIONS, expected: EXPECTED_SECTIONS }

/** The section of `sections` whose heading was last scrolled past. */
function useSection(sections: Section[] | undefined) {
  const [current, setCurrent] = useState('')
  useEffect(() => {
    if (!sections) return
    const update = () => {
      const passed = sections.filter((s) => (document.getElementById(s.id)?.getBoundingClientRect().top ?? Infinity) < 160)
      setCurrent(passed.at(-1)?.id ?? sections[0].id)
    }
    update()
    addEventListener('scroll', update, { passive: true })
    return () => removeEventListener('scroll', update)
  }, [sections])
  return current
}

const routeOf = (hash: string): Route =>
  hash.startsWith('#/course')
    ? 'course'
    : hash.startsWith('#/expected')
      ? 'expected'
      : hash.startsWith('#/journal')
        ? 'journal'
        : hash.startsWith('#/references')
          ? 'references'
          : 'playground'

const MOTIF = [vec(0, 0), vec(0.52, 0.46), vec(0.2, 0.7)]

const START: Crystal = { origin: vec(0, 0), v1: vec(1, 0), v2: vec(0.38, 0.92), motif: MOTIF.slice(0, 2) }

function App() {
  const [route, setRoute] = useState<Route>(routeOf(location.hash))
  useEffect(() => {
    const on = () => {
      setRoute(routeOf(location.hash))
      window.scrollTo(0, 0)
    }
    addEventListener('hashchange', on)
    return () => removeEventListener('hashchange', on)
  }, [])

  const [crystal, setCrystal] = useState(START)
  const [overlay, setOverlay] = useState<Overlay>('balls')
  const [t, setT] = useState(0.31)
  const [k, setK] = useState(1)
  const [focus, setFocus] = useState(0)
  const sections = SECTIONS_OF[route]
  const section = useSection(sections)
  const tMax = defaultRange(crystal)
  const shownT = Math.min(t, tMax)

  const [spare, setSpare] = useState<Vec[]>([])
  const setSites = (n: number) => {
    const motif = crystal.motif.slice(0, n)
    const kept = [...crystal.motif.slice(0, 3), ...spare.slice(crystal.motif.length)]
    setSpare(kept)
    while (motif.length < n) motif.push(kept[motif.length] ?? MOTIF[motif.length])
    setCrystal({ ...crystal, motif })
    setFocus((f) => Math.min(f, n - 1))
  }

  return (
    <div className="shell">
      <nav className="sidebar">
        <a href="#/" className="brand">
          Crystal
          <br />
          Fingerprints
        </a>
        <div className="group">
          <a href="#/" className={route === 'playground' ? 'item on' : 'item'}>
            Playground
          </a>
          <a href="#/course" className={route === 'course' ? 'item on' : 'item'}>
            Density fingerprints
          </a>
          <a href="#/journal" className={route === 'journal' ? 'item on' : 'item'}>
            AI journal
          </a>
          <a href="#/expected" className={route === 'expected' ? 'item on' : 'item'}>
            Expected fingerprints
          </a>
          <a href="#/references" className={route === 'references' ? 'item on' : 'item'}>
            References
          </a>
        </div>
        {route === 'playground' && (
          <>
        <div className="divider" />
        <Choice
          vertical
          label="Points per cell"
          value={crystal.motif.length}
          onChange={setSites}
          options={[1, 2, 3].map((n) => ({ value: n, label: n === 1 ? '1 point' : `${n} points`, note: SITE_NAMES.slice(0, n).join(' ') }))}
        />
        <Choice
          vertical
          label="Overlay"
          value={overlay}
          onChange={setOverlay}
          options={[
            { value: 'none', label: 'Empty' },
            { value: 'balls', label: 'Balls', note: 'ψ' },
            { value: 'brillouin', label: 'Brillouin zones', note: 'Z' },
          ]}
        />
        <div className="group">
          <Slider label="radius t" value={shownT} min={0} max={tMax} step={0.001} digits={3} onChange={setT} />
          {overlay === 'brillouin' && (
            <p className="hint">Click a point to see its zones and the disk of radius t. Picking ψₖ with k ≥ 1 outlines zone k.</p>
          )}
        </div>
          </>
        )}
        {sections && (
          <>
            <div className="divider" />
            <div className="group toc">
              <h6>Sections</h6>
              {sections.map((s) => (
                <button
                  key={s.id}
                  className={s.id === section ? 'item on' : 'item'}
                  onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth' })}
                >
                  {s.title}
                  <small>{s.n}</small>
                </button>
              ))}
            </div>
          </>
        )}
      </nav>
      <main>
        {route === 'playground' ? (
          <PlaygroundPage
            crystal={crystal}
            onCrystal={setCrystal}
            overlay={overlay}
            t={shownT}
            onT={setT}
            k={k}
            onK={setK}
            focus={focus}
            onFocus={setFocus}
          />
        ) : (
          <Suspense>
            {route === 'course' ? <Course /> : route === 'expected' ? <Expected /> : route === 'references' ? <References /> : <Journal />}
          </Suspense>
        )}
      </main>
    </div>
  )
}

function PlaygroundPage({
  crystal,
  onCrystal,
  overlay,
  t,
  onT,
  k,
  onK,
  focus,
  onFocus,
}: {
  crystal: Crystal
  onCrystal: (c: Crystal) => void
  overlay: Overlay
  t: number
  onT: (t: number) => void
  k: number
  onK: (k: number) => void
  focus: number
  onFocus: (i: number) => void
}) {
  const settled = useDeferredValue(crystal)
  const fp = useMemo(() => densityFingerprint(settled), [settled])
  const shown = Array.from({ length: Math.min(5, fp.count) }, (_, i) => i)
  const kShown = Math.min(k, shown.length - 1)
  const fmt = (u: number) => u.toFixed(3)
  return (
    <div className="bench">
      <section>
        <div className="hd">
          <h2>Crystal</h2>
          {overlay === 'brillouin' && <span>zones of {SITE_NAMES[focus]}</span>}
        </div>
        <Playground
          crystal={crystal}
          onCrystal={onCrystal}
          overlay={overlay}
          t={t}
          focus={focus}
          onFocus={overlay === 'brillouin' ? onFocus : undefined}
          zone={overlay === 'brillouin' && kShown > 0 ? kShown : undefined}
          span={overlay === 'brillouin' ? 1.9 : 2.7}
          center={vec(0.65, 0.45)}
          aspect={1.3}
        />
      </section>
      <section>
        <div className="hd">
          <h2>Fingerprint</h2>
        </div>
        <Plot curves={fp} show={shown} t={t} onT={onT} k={kShown} onK={onK} boxes height={440} />
        <div className="fields">
          <h6>
            <span>basis · cell area {cellArea(crystal).toFixed(3)}</span>
            <button className="link" onClick={() => onCrystal(reduced(crystal))}>
              reduce
            </button>
          </h6>
          {(['v1', 'v2'] as const).map((v, i) => (
            <div className="row" key={v}>
              <span>v{'₁₂'[i]}</span>
              <b>{fmt(crystal[v].x)}</b>
              <b>{fmt(crystal[v].y)}</b>
            </div>
          ))}
          {crystal.motif.slice(1).map((f, i) => {
            const p = toCartesian(crystal, f)
            return (
              <div className="row" key={i}>
                <span>{SITE_NAMES[i + 1]}</span>
                <b>{fmt(p.x)}</b>
                <b>{fmt(p.y)}</b>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
