import { type ReactNode, createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
  type Crystal,
  type SetPoint,
  type Vec,
  cross,
  dist,
  dot,
  moveSite,
  norm,
  pointsWithin,
  reduce,
  scale,
  spacing,
  sub,
  toCartesian,
  vec,
} from '../geometry/crystal'
import { sweepAt, sweeps } from '../geometry/fingerprint'
import { type Sweep, outline, zoneLabelSpot } from '../geometry/sweep'
import { type Frame, paintCoverage, paintDots, paintGrid } from './periodic'
import { useWidth } from './width'

export type Overlay = 'none' | 'balls' | 'brillouin'

export const SITE_NAMES = ['a', 'b', 'c']

/** Paper, then the shades of a spot covered 1, 2, 3, 4, 5 or more times. */
export const COVER: [number, number, number][] = [
  [242, 242, 242],
  [220, 223, 248],
  [174, 180, 244],
  [120, 128, 242],
  [74, 82, 214],
  [38, 44, 160],
]

export type View = {
  crystal: Crystal
  /** Pixels per unit length. */
  s: number
  W: number
  H: number
  screen: (v: Vec) => [number, number]
  world: (clientX: number, clientY: number) => Vec
  /** Every point of the set in view, with a margin, listed on first use. */
  readonly points: SetPoint[]
}

const ViewContext = createContext<View | null>(null)

export function useView(): View {
  const v = useContext(ViewContext)
  if (!v) throw new Error('useView outside a Playground')
  return v
}

export type PlaygroundProps = {
  crystal: Crystal
  /** When set, the basis tips and the motif points b, c can be dragged. */
  onCrystal?: (c: Crystal) => void
  overlay?: Overlay
  t?: number
  /** The motif point whose Brillouin zones are drawn. */
  focus?: number
  onFocus?: (site: number) => void
  zones?: number
  /** The zone outlined in blue, in the Brillouin overlay. */
  zone?: number
  /** Half the width of the window, in units of length. */
  span?: number
  center?: Vec
  /** Height over width. */
  aspect?: number
  grid?: boolean
  cell?: boolean
  /** Labelled tags on a, b, c, v₁ and v₂; on by default when the crystal can be dragged. */
  tags?: boolean
  dots?: boolean
  /** Draws on a canvas under the picture, in world coordinates; `px` is one pixel in units of length. */
  paint?: (g: CanvasRenderingContext2D, px: number, view: View) => void
  children?: ReactNode
}

/**
 * The one picture every interactive figure is built on: the periodic set of a crystal, its lattice and cell, an
 * optional overlay, and any extra layers passed as children. Children draw in world coordinates inside <World>,
 * or in screen coordinates with <Label>.
 */
export function Playground({
  crystal,
  onCrystal,
  overlay = 'none',
  t,
  focus = 0,
  onFocus,
  zones = 4,
  zone,
  span = 2.4,
  center,
  aspect = 0.75,
  grid = true,
  cell = true,
  tags = !!onCrystal,
  dots = true,
  paint,
  children,
}: PlaygroundProps) {
  const [box, W] = useWidth<HTMLDivElement>()
  const H = Math.round(W * aspect)
  const s = W / (2 * span)
  const c = center ?? toCartesian(crystal, vec(0.5, 0.5))

  const view = useMemo<View>(() => {
    const screen = (v: Vec): [number, number] => [W / 2 + (v.x - c.x) * s, H / 2 - (v.y - c.y) * s]
    const world = (clientX: number, clientY: number) => {
      const r = box.current!.getBoundingClientRect()
      return vec(c.x + (clientX - r.left - W / 2) / s, c.y - (clientY - r.top - H / 2) / s)
    }
    const reach = Math.hypot(W, H) / (2 * s) + Math.max(t ?? 0, spacing(crystal)) + 0.2
    let points: SetPoint[] | undefined
    return {
      crystal,
      s,
      W,
      H,
      screen,
      world,
      get points() {
        return (points ??= pointsWithin(crystal, c, reach))
      },
    }
  }, [crystal, s, W, H, c.x, c.y, t, box])

  /**
   * Moves a basis tip to the pointer. Too close to the other vector's line, the tip stays just far enough from it to keep
   * the cell area; anything else not allowed stops the tip at the last allowed spot on the way.
   */
  const moveTip = (which: 'v1' | 'v2', to: Vec) => {
    const d = sub(to, crystal.origin)
    const other = which === 'v1' ? crystal.v2 : crystal.v1
    const n = scale(vec(-other.y, other.x), 1 / norm(other))
    const h = dot(d, n)
    const keep = MIN_AREA / norm(other)
    const side = Math.sign(h) || Math.sign(dot(crystal[which], n))
    const off = Math.abs(h) >= keep ? d : vec(d.x + n.x * (side * keep - h), d.y + n.y * (side * keep - h))
    const want = norm(off) > MAX_TIP ? scale(off, MAX_TIP / norm(off)) : off
    const at = (u: number) => ({ ...crystal, [which]: vec(crystal[which].x + (want.x - crystal[which].x) * u, crystal[which].y + (want.y - crystal[which].y) * u) })
    if (allowed(at(1)) || !allowed(crystal)) return onCrystal?.(at(1))
    let [lo, hi] = [0, 1]
    for (let k = 0; k < 24; k++) {
      const mid = (lo + hi) / 2
      if (allowed(at(mid))) lo = mid
      else hi = mid
    }
    onCrystal?.(at(lo))
  }

  const home = crystal.motif.map((f) => toCartesian(crystal, f))
  const [copy, setCopy] = useState(vec(0, 0))
  const focused = home[Math.min(focus, home.length - 1)]
  const editable = !!onCrystal

  /** The point of the set under the pointer, if any: the nearest within a grip's radius. */
  const pick = (clientX: number, clientY: number) => {
    const at = view.world(clientX, clientY)
    let best: SetPoint | undefined
    for (const p of pointsWithin(crystal, at, GRIP / s)) if (!best || dist(p.pos, at) < dist(best.pos, at)) best = p
    return best
  }
  return (
    <ViewContext.Provider value={view}>
      <div
        ref={box}
        className="pg"
        style={{ height: H }}
        onPointerDown={
          onFocus &&
          ((e) => {
            const p = e.target === e.currentTarget ? pick(e.clientX, e.clientY) : undefined
            if (!p) return
            onFocus(p.site)
            setCopy(sub(p.pos, home[p.site]))
          })
        }
        onPointerMove={
          onFocus &&
          ((e) => {
            e.currentTarget.style.cursor = e.target === e.currentTarget && pick(e.clientX, e.clientY) ? 'pointer' : ''
          })
        }
      >
        {overlay === 'balls' && <Coverage t={t ?? 0.5} />}
        {paint && <PaintLayer paint={paint} />}
        {overlay === 'brillouin' && (
          <Sheet>
            <World>
              <g transform={`translate(${copy.x},${copy.y})`}>
                <Zones site={focus} count={zones} outlined={zone} t={t} />
              </g>
            </World>
          </Sheet>
        )}
        {grid && <ShaderLayer paint={(gl, frame, v) => paintGrid(gl, v.crystal, frame, rgb('--ink'), 0.22)} />}
        <Sheet>
          {children}
          <World>{cell && <Cell />}</World>
        </Sheet>
        {dots && (
          <ShaderLayer
            paint={(gl, frame, v) => {
              const dpr = window.devicePixelRatio || 1
              paintDots(gl, v.crystal, frame, 3 * dpr, 1.5 * dpr, rgb('--ink'), rgb('--paper'))
            }}
          />
        )}
        <Sheet>
          {overlay === 'brillouin' && <FocusRing at={vec(focused.x + copy.x, focused.y + copy.y)} />}
          {tags && (
            <>
              <Tag at={home[0]} text="a" />
              {home.slice(1).map((p, i) => (
                <Tag key={i} at={p} text={SITE_NAMES[i + 1]} />
              ))}
              <Tag at={toCartesian(crystal, vec(1, 0))} text="v₁" />
              <Tag at={toCartesian(crystal, vec(0, 1))} text="v₂" />
            </>
          )}
          <World>
            {editable &&
              home.slice(1).map((p, i) => (
                <Handle
                  key={`m${i}`}
                  at={p}
                  onPress={() => {
                    onFocus?.(i + 1)
                    setCopy(vec(0, 0))
                  }}
                  onDrag={(to) => {
                    const next = moveSite(crystal, i + 1, to)
                    if (next) onCrystal!(next)
                  }}
                />
              ))}
            {editable && (
              <>
                <Handle at={toCartesian(crystal, vec(1, 0))} onDrag={(to) => moveTip('v1', to)} />
                <Handle at={toCartesian(crystal, vec(0, 1))} onDrag={(to) => moveTip('v2', to)} />
              </>
            )}
          </World>
        </Sheet>
      </div>
    </ViewContext.Provider>
  )
}

/** One SVG layer of the picture, in screen coordinates. */
function Sheet({ children }: { children: ReactNode }) {
  const { W, H } = useView()
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H}>
      {children}
    </svg>
  )
}

const MAX_TIP = 3.2
const MIN_AREA = 0.018
const MIN_GAP = 0.06

/** A basis the playground can draw at full frame rate: no lattice points closer than MIN_GAP, no cell smaller than MIN_AREA. */
const allowed = (c: Crystal) =>
  Math.abs(cross(c.v1, c.v2)) >= MIN_AREA && norm(reduce(c.v1, c.v2)[0]) >= MIN_GAP && norm(c.v1) <= MAX_TIP && norm(c.v2) <= MAX_TIP

/** Radius of a grip, in pixels. */
const GRIP = 13

/** A group drawn in world coordinates, y pointing up. Strokes keep their pixel width. */
export function World({ children }: { children: ReactNode }) {
  const { s, screen } = useView()
  const [ox, oy] = screen(vec(0, 0))
  return (
    <g transform={`matrix(${s} 0 0 ${-s} ${ox} ${oy})`} style={{ vectorEffect: 'non-scaling-stroke' }} className="world">
      {children}
    </g>
  )
}

export function Label({
  at,
  dx = 0,
  dy = 0,
  anchor = 'middle',
  className,
  children,
}: {
  at: Vec
  dx?: number
  dy?: number
  anchor?: 'start' | 'middle' | 'end'
  className?: string
  children: ReactNode
}) {
  const [x, y] = useView().screen(at)
  return (
    <text x={x + dx} y={y + dy} textAnchor={anchor} className={className ?? 'label'}>
      {children}
    </text>
  )
}

/** An invisible grip, larger than what it moves. */
export function Handle({
  at,
  onDrag,
  onPress,
  radius = GRIP,
}: {
  at: Vec
  onDrag?: (to: Vec) => void
  onPress?: () => void
  radius?: number
}) {
  const { s, world } = useView()
  return (
    <circle
      cx={at.x}
      cy={at.y}
      r={radius / s}
      className={onDrag ? 'grip' : 'grip press'}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        onPress?.()
      }}
      onPointerMove={(e) => {
        if (onDrag && e.currentTarget.hasPointerCapture(e.pointerId)) onDrag(world(e.clientX, e.clientY))
      }}
    />
  )
}

/** A labelled marker in the old applet's style: a boxed point with a dark flag carrying its name. */
export function Tag({ at, text }: { at: Vec; text: string }) {
  const [x, y] = useView().screen(at)
  const w = 9 * [...text].length + 10
  return (
    <g className="tag" pointerEvents="none">
      <rect className="box" x={x - 8} y={y - 8} width={16} height={16} />
      <rect className="dot" x={x - 3.5} y={y - 3.5} width={7} height={7} />
      <rect className="flag" x={x + 13} y={y - 27} width={w} height={19} />
      <text x={x + 18} y={y - 13}>
        {text}
      </text>
    </g>
  )
}

function Cell() {
  const { crystal } = useView()
  const corners = [vec(0, 0), vec(1, 0), vec(1, 1), vec(0, 1)].map((f) => toCartesian(crystal, f))
  return <polygon className="cell" vectorEffect="non-scaling-stroke" points={corners.map((p) => `${p.x},${p.y}`).join(' ')} />
}

export function Arrow({ from, to, className = 'arrow' }: { from: Vec; to: Vec; className?: string }) {
  const { s } = useView()
  const d = sub(to, from)
  const len = norm(d)
  const head = Math.min(9 / s, len / 3)
  const u = vec(d.x / len, d.y / len)
  const base = vec(to.x - u.x * head, to.y - u.y * head)
  const side = vec(-u.y * head * 0.45, u.x * head * 0.45)
  return (
    <g className={className}>
      <line x1={from.x} y1={from.y} x2={base.x} y2={base.y} vectorEffect="non-scaling-stroke" />
      <polygon points={`${to.x},${to.y} ${base.x + side.x},${base.y + side.y} ${base.x - side.x},${base.y - side.y}`} />
    </g>
  )
}

function FocusRing({ at }: { at: Vec }) {
  const [x, y] = useView().screen(at)
  return <circle className="focus-ring" cx={x} cy={y} r={15} pointerEvents="none" />
}

function PaintLayer({ paint }: { paint: NonNullable<PlaygroundProps['paint']> }) {
  const view = useView()
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const { W, H, s, screen } = view
    const dpr = window.devicePixelRatio || 1
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
    cv.style.height = `${H}px`
    const g = cv.getContext('2d')!
    g.setTransform(1, 0, 0, 1, 0, 0)
    g.clearRect(0, 0, cv.width, cv.height)
    const [ox, oy] = screen(vec(0, 0))
    g.setTransform(dpr * s, 0, 0, -dpr * s, dpr * ox, dpr * oy)
    paint(g, 1 / s, view)
  })
  return <canvas ref={ref} aria-hidden />
}

/** A WebGL canvas the size of the picture, repainted on every render. */
function ShaderLayer({ paint }: { paint: (gl: WebGL2RenderingContext, frame: Frame, view: View) => void }) {
  const view = useView()
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const dpr = window.devicePixelRatio || 1
    const width = Math.round(view.W * dpr)
    const height = Math.round(view.H * dpr)
    if (cv.width !== width || cv.height !== height) {
      cv.width = width
      cv.height = height
    }
    cv.style.height = `${view.H}px`
    paint(cv.getContext('webgl2', { antialias: false })!, frameOf(view), view)
  })
  return <canvas ref={ref} aria-hidden />
}

/** The canvas of a layer as a periodic shader sees it: its bottom-left corner in the world, and one device pixel. */
function frameOf({ screen, H, s }: View): Frame {
  const [ox, oy] = screen(vec(0, 0))
  return { corner: vec(-ox / s, (oy - H) / s), unit: 1 / (s * (window.devicePixelRatio || 1)) }
}

/** A colour token of the stylesheet as red, green, blue in 0..255. */
const rgb = (name: string): [number, number, number] => {
  const hex = token(name).replace('#', '')
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number]
}

/** A colour token of the stylesheet, for canvas drawing. */
export const token = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

export function polygonPath(pts: Vec[], path = new Path2D()): Path2D {
  pts.forEach((p, i) => (i ? path.lineTo(p.x, p.y) : path.moveTo(p.x, p.y)))
  if (pts.length) path.closePath()
  return path
}

/** Zone k of a sweep as a canvas path, to fill with the even-odd rule. */
export const zonePath2D = (sw: Sweep, k: number, cap: number) => polygonPath(outline(sw, k - 1, cap), polygonPath(outline(sw, k, cap)))

/** Coverage by the closed balls of radius t: each pixel takes the shade of the number of balls containing it, 5 or more alike. */
function Coverage({ t }: { t: number }) {
  return <ShaderLayer paint={(gl, frame, view) => paintCoverage(gl, view.crystal, frame, t, COVER)} />
}

/** Closed balls of radius t drawn as outlines only. */
export function BallOutlines({ t }: { t: number }) {
  const { points } = useView()
  return (
    <g className="balls-outline">
      {points.map((p) => (
        <circle key={`${p.site}:${p.i}:${p.j}`} cx={p.pos.x} cy={p.pos.y} r={t} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  )
}

/** The sweep of each motif point at its own cell, prepared for drawing zones within `radius` of it. */
/** The deepest zone any figure draws. */
export const ZONE_DEPTH = 6

export function useZoneSweeps(crystal: Crystal, radius: number): Sweep[] {
  return useMemo(() => sweeps(crystal, 2 * radius * 1.05, radius * 1.05, ZONE_DEPTH), [crystal, radius])
}

export const zoneRadius = (c: Crystal) => 2 * spacing(c)

export const pathOf = (pts: Vec[]) => (pts.length ? `M${pts.map((p) => `${p.x},${p.y}`).join('L')}Z` : '')

/** Zone k of a sweep as an SVG path: between outlines k-1 and k. */
export const zonePath = (sw: Sweep, k: number, cap: number) => pathOf(outline(sw, k, cap)) + pathOf(outline(sw, k - 1, cap))

/** The bisectors that bound one of zones 1..count somewhere. */
const bounding = (sw: Sweep, count: number) => {
  const used = new Set<number>()
  for (const iv of sw.intervals) for (const i of iv.order.slice(0, count)) used.add(i)
  return [...used].map((i) => sw.lines[i])
}

/** Zones 1..count of one motif point, shaded by zone number, with the bisectors that bound them. */
export function Zones({
  site,
  count,
  radius,
  outlined,
  only,
  numbers = true,
  bisectors = true,
  t,
}: {
  site: number
  count: number
  radius?: number
  /** Draw the disk of radius t around the point, with the zones strong inside it and faded outside. */
  t?: number
  /** A zone drawn with a blue edge. */
  outlined?: number
  /** Shade this zone only. */
  only?: number
  numbers?: boolean
  bisectors?: boolean
}) {
  const { crystal } = useView()
  const R = radius ?? zoneRadius(crystal)
  const at = Math.min(site, crystal.motif.length - 1)
  const sw = useMemo(() => sweepAt(crystal, at, 2 * R * 1.05, R * 1.05, ZONE_DEPTH), [crystal, at, R])
  const p = sw.p
  const id = `zclip-${site}-${Math.round(R * 1000)}`
  const ks = Array.from({ length: count }, (_, i) => i + 1)
  const fills = ks.map((k) => (
    <path
      key={k}
      d={zonePath(sw, k, R * 1.05)}
      fillRule="evenodd"
      className={only === undefined || only === k ? `zone z${Math.min(k, 5)}` : 'zone off'}
    />
  ))
  return (
    <g className="zones">
      <defs>
        <clipPath id={id}>
          <circle cx={p.x} cy={p.y} r={R} />
        </clipPath>
        <clipPath id={`${id}-union`}>
          <path d={pathOf(outline(sw, count, R * 1.05))} />
        </clipPath>
        {t !== undefined && (
          <clipPath id={`${id}-disk`}>
            <circle cx={p.x} cy={p.y} r={t} />
          </clipPath>
        )}
      </defs>
      <g clipPath={`url(#${id})`}>
        {t === undefined ? fills : <g className="faded">{fills}</g>}
        {t !== undefined && <g clipPath={`url(#${id}-disk)`}>{fills}</g>}
        {bisectors && (
          <g clipPath={`url(#${id}-union)`}>
          {bounding(sw, count)
            .filter((l) => l.h < R)
            .map((l, i) => {
              const half = Math.sqrt(R * R - l.h * l.h)
              const m = vec(p.x + l.h * Math.cos(l.alpha), p.y + l.h * Math.sin(l.alpha))
              const d = vec(-Math.sin(l.alpha) * half, Math.cos(l.alpha) * half)
              return (
                <line
                  key={i}
                  className="bisector"
                  vectorEffect="non-scaling-stroke"
                  x1={m.x - d.x}
                  y1={m.y - d.y}
                  x2={m.x + d.x}
                  y2={m.y + d.y}
                />
              )
            })}
          </g>
        )}
        {outlined !== undefined && (
          <path d={zonePath(sw, outlined, R * 1.05)} fillRule="evenodd" className="zone-edge" vectorEffect="non-scaling-stroke" />
        )}
      </g>
      {t !== undefined && <circle className="disk" cx={p.x} cy={p.y} r={t} />}
      {numbers && <ZoneNumbers sw={sw} count={count} R={R} />}
    </g>
  )
}

function ZoneNumbers({ sw, count, R }: { sw: Sweep; count: number; R: number }) {
  const { s } = useView()
  return (
    <>
      {Array.from({ length: count }, (_, i) => i + 1).map((k) => {
        const at = zoneLabelSpot(sw, k, R)
        if (!at) return null
        return (
          <text key={k} className="zone-number" transform={`translate(${at.x},${at.y}) scale(${1 / s},${-1 / s})`} dy="0.35em">
            {k}
          </text>
        )
      })}
    </>
  )
}
