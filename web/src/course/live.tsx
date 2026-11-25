import { useMemo, useState } from 'react'
import { type Crystal, type Vec, dist, pointsWithin, vec } from '../geometry/crystal'
import { type Curves, cumulative, densityFingerprint } from '../geometry/fingerprint'
import { type Sweep } from '../geometry/sweep'
import { Choice, Slider } from '../playground/controls'
import { BallOutlines, Handle, Label, Playground, type View, World, token, useView, useZoneSweeps, zonePath2D } from '../playground/playground'
import { Plot } from '../playground/plot'
import { Fig, Row } from './blocks'

const unitSquare = (...motif: [number, number][]): Crystal => ({
  origin: vec(0, 0),
  v1: vec(1, 0),
  v2: vec(0, 1),
  motif: motif.map(([x, y]) => vec(x, y)),
})

const SQUARE = unitSquare([0, 0])
const EXERCISE = unitSquare([0, 0], [0.5, 0.25])

const times = (k: number) => (k === 1 ? 'once' : k === 2 ? 'twice' : k === 3 ? 'three times' : `${k} times`)

/** 1.5–1.6: balls of one radius around every point, and the density functions read off them. */
export function GrowFigure() {
  const [t, setT] = useState(0.3)
  const fp = useMemo(() => densityFingerprint(SQUARE, 1), [])
  return (
    <Fig wide caption="Drag along the plot to grow the balls.">
      <Row>
        <Playground crystal={SQUARE} overlay="balls" t={t} span={1.45} aspect={1} center={vec(0.5, 0.5)} />
        <Plot curves={fp} t={t} onT={setT} aspect={1} show={[0, 1, 2, 3, 4]} />
      </Row>
    </Fig>
  )
}

function Cross({ at }: { at: Vec }) {
  const { s } = useView()
  const d = 5 / s
  return (
    <path className="stroke blue" d={`M${at.x - d},${at.y - d}L${at.x + d},${at.y + d}M${at.x - d},${at.y + d}L${at.x + d},${at.y - d}`} />
  )
}

/** 2.1: balls of radius t around the points, a spot y, and its 2nd nearest point. */
export function NearestFigure() {
  const [y, setY] = useState(vec(0.3, 0.2))
  const [t, setT] = useState(0.6)
  const order = pointsWithin(SQUARE, y, 2.5).sort((a, b) => dist(a.pos, y) - dist(b.pos, y))
  const count = pointsWithin(SQUARE, y, t).length
  const second = order[1]
  const d = dist(second.pos, y)
  return (
    <Fig>
      <div className="fig-controls">
        <Slider label="t" value={t} min={0} max={1.1} onChange={setT} />
        <figcaption className="fig-readout">
          y is in {count} {count === 1 ? 'ball' : 'balls'}: its 2nd nearest point is {d.toFixed(2)} away,{' '}
          {d <= t ? 'within' : 'beyond'} t.
        </figcaption>
      </div>
      <Playground crystal={SQUARE} cell={false} overlay="balls" t={t} span={1.4} aspect={0.5} center={vec(0.5, 0.5)}>
        <World>
          <line x1={y.x} y1={y.y} x2={second.pos.x} y2={second.pos.y} className="stroke blue thin dashed" />
          <Cross at={y} />
          <Handle at={y} onDrag={(p) => setY(vec(Math.min(2, Math.max(-1.1, p.x)), Math.min(1.3, Math.max(-0.6, p.y))))} />
        </World>
        {order.slice(0, 2).map((q, i) => (
          <Label key={i} at={q.pos} dx={-12} dy={16} className={i === 1 ? 'label blue' : 'label'}>
            {i === 0 ? '1st' : '2nd'}
          </Label>
        ))}
        <Label at={y} dx={12} dy={-8} className="label blue">
          y
        </Label>
      </Playground>
    </Fig>
  )
}

/** The region covered at least k times, exactly: zone k of each point inside that point's ball, copied over the lattice. */
function paintAtLeast(g: CanvasRenderingContext2D, view: View, sws: Sweep[], t: number, k: number) {
  const r = Math.max(t, 1e-3)
  const paths = sws.map((sw) => zonePath2D(sw, k, r * 1.05))
  for (const q of view.points) {
    const sw = sws[q.site]
    g.save()
    g.beginPath()
    g.arc(q.pos.x, q.pos.y, t, 0, 2 * Math.PI)
    g.clip()
    g.translate(q.pos.x - sw.p.x, q.pos.y - sw.p.y)
    g.fill(paths[q.site], 'evenodd')
    g.restore()
  }
}

/** 2.7: at least k, at least k + 1, and exactly k, side by side. */
export function AtLeastFigure() {
  const [t, setT] = useState(0.8)
  const [k, setK] = useState(2)
  const phi = useMemo(() => cumulative(densityFingerprint(SQUARE, 1.2)), []).at(t)
  const sws = useZoneSweeps(SQUARE, Math.max(t, 1e-3))
  const layer = (k: number, color: string, alpha = 1) => (g: CanvasRenderingContext2D, view: View) => {
    g.fillStyle = token(color)
    g.globalAlpha = alpha
    paintAtLeast(g, view, sws, t, k)
    g.globalAlpha = 1
  }
  const panel = (layers: ((g: CanvasRenderingContext2D, view: View) => void)[], label: string, value: number) => (
    <div>
      <Playground
        crystal={SQUARE}
        cell={false}
        grid={false}
        span={1.2}
        aspect={1}
        center={vec(0.5, 0.5)}
        paint={(g, _, view) => layers.forEach((l) => l(g, view))}
      >
        <World>
          <BallOutlines t={t} />
        </World>
      </Playground>
      <div className="panel-label">
        {label}: <b>{value.toFixed(2)}</b>
      </div>
    </div>
  )
  return (
    <Fig>
      <div className="fig-controls">
        <Choice label="k" value={k} onChange={setK} options={[1, 2, 3].map((m) => ({ value: m, label: m }))} />
        <Slider label="t" value={t} min={0} max={1.2} onChange={setT} />
      </div>
      <div className="panels">
        {panel([layer(k, '--c2', 0.85)], `at least ${times(k)}`, phi[k])}
        {panel([layer(k + 1, '--c4')], `at least ${times(k + 1)}`, phi[k + 1] ?? 0)}
        {panel([layer(k, '--c2', 0.85), layer(k + 1, '--paper')], `exactly ${times(k)}`, phi[k] - (phi[k + 1] ?? 0))}
      </div>
    </Fig>
  )
}

const DIRECTIONS = [0.6, 2.4, 4.1]

/** The crystal with motif point j moved by delta in a fixed direction of its own. */
const jitter = (c: Crystal, delta: number): Crystal => ({
  ...c,
  motif: c.motif.map((f, j) => vec(f.x + delta * Math.cos(DIRECTIONS[j]), f.y + delta * Math.sin(DIRECTIONS[j]))),
})

/** max over k and t of |psi_k - psi'_k| / sqrt(k + 1), over a fine grid of radii. */
function fingerprintDistance(a: Curves, b: Curves) {
  let best = 0
  for (let i = 0; i <= 400; i++) {
    const t = (i / 400) * a.tMax
    const u = a.at(t)
    const v = b.at(t)
    for (let k = 0; k < Math.max(u.length, v.length); k++) best = Math.max(best, Math.abs((u[k] ?? 0) - (v[k] ?? 0)) / Math.sqrt(k + 1))
  }
  return best
}

/** 3.4–3.5: the exercise crystal against a copy with every point moved by delta. */
export function DistanceFigure() {
  const [delta, setDelta] = useState(0.04)
  const fp = useMemo(() => densityFingerprint(EXERCISE, 1), [])
  const moved = useMemo(() => densityFingerprint(jitter(EXERCISE, delta), 1), [delta])
  const d = useMemo(() => fingerprintDistance(fp, moved), [fp, moved])
  return (
    <Fig
      wide
      caption={`Solid: the exercise crystal. Dashed: each point moved by δ = ${delta.toFixed(3)}. Blue bars: the largest gap of each ψₖ. Fingerprint distance ${d.toFixed(3)}: it shrinks to 0 with δ.`}
    >
      <div className="fig-controls">
        <Slider label="move every point by δ" value={delta} min={0} max={0.1} step={0.002} digits={3} onChange={setDelta} />
      </div>
      <Plot curves={fp} ghost={moved} gaps show={[0, 1, 2, 3]} height={340} />
    </Fig>
  )
}
