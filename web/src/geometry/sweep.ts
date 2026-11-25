import { type Vec, add, dist, polar } from './crystal'

/** The bisector of p and q, seen from p: the line of spots y with (y - p) . n = h, n = (nx, ny) the unit direction of angle alpha. */
export type Bisector = { q: Vec; h: number; alpha: number; nx: number; ny: number }

/** One wedge of directions [a, b] from p in which the same bisectors are crossed, in the same order. */
export type Interval = {
  a: number
  b: number
  /** Bisectors crossed by rays in this wedge, nearest first: the k-th entry bounds zone k from outside. */
  order: number[]
  /** Smallest distance from p to each crossing of `order`, over the wedge. */
  closest: number[]
  /** For each crossing of `order`: the wedge's start angle measured from the bisector's normal, and its tangent at both ends. */
  from: number[]
  tanFrom: number[]
  tanTo: number[]
}

/**
 * The angular sweep of a point p among the given other points. Along the ray from p in direction theta,
 * the k-th crossing r_k(theta) is where zone k ends: spots before it have fewer than k points nearer than p.
 * Zone k of p is the region between r_{k-1} and r_k, so every Brillouin zone and every area below is read
 * off these intervals. The zones are exact for spots within half the radius that the other points cover.
 */
export type Sweep = { p: Vec; lines: Bisector[]; intervals: Interval[] }

const TAU = 2 * Math.PI

/** theta - alpha, wrapped into (-pi, pi]. */
const offset = (theta: number, alpha: number) => {
  const u = (theta - alpha) % TAU
  return u > Math.PI ? u - TAU : u <= -Math.PI ? u + TAU : u
}

export const crossing = (l: Bisector, theta: number) => {
  const c = Math.cos(theta - l.alpha)
  return c > 1e-12 ? l.h / c : Infinity
}

/**
 * Exact within `reach` of p. With `depth`, each wedge keeps only its `depth` nearest bisectors, enough for zones 1 to
 * `depth`, and no wedge is wider than pi/16, for drawing outlines.
 */
export function sweep(p: Vec, others: Vec[], reach = Infinity, depth?: number): Sweep {
  const lines: Bisector[] = []
  for (const q of others) {
    const d = dist(p, q)
    if (d < 1e-12) continue
    lines.push({ q, h: d / 2, alpha: Math.atan2(q.y - p.y, q.x - p.x), nx: (q.x - p.x) / d, ny: (q.y - p.y) / d })
  }

  const cuts: number[] = []
  for (const l of lines) {
    cuts.push(l.alpha + Math.PI / 2, l.alpha - Math.PI / 2)
    if (l.h < reach) {
      const g = Math.acos(l.h / reach)
      cuts.push(l.alpha + g, l.alpha - g)
    }
  }
  for (let i = 0; i < lines.length; i++) {
    const n = lines[i]
    for (let j = i + 1; j < lines.length; j++) {
      const m = lines[j]
      const det = Math.sin(m.alpha - n.alpha)
      if (Math.abs(det) < 1e-12) continue
      const x = (n.h * Math.sin(m.alpha) - m.h * Math.sin(n.alpha)) / det
      const y = (m.h * Math.cos(n.alpha) - n.h * Math.cos(m.alpha)) / det
      if (x * x + y * y < reach * reach) cuts.push(Math.atan2(y, x))
    }
  }

  const angles = cuts.map((u) => ((u % TAU) + TAU) % TAU).sort((u, v) => u - v)
  const stops: number[] = []
  for (const u of angles) if (stops.length === 0 || u - stops[stops.length - 1] > 1e-12) stops.push(u)
  if (stops.length === 0) stops.push(0)
  stops.push(stops[0] + TAU)

  const widest = depth ? Math.PI / 16 : Infinity
  const intervals: Interval[] = []
  for (let s = 0; s + 1 < stops.length; s++) {
    const pieces = Math.max(1, Math.ceil((stops[s + 1] - stops[s]) / widest))
    for (let k = 0; k < pieces; k++) {
      const a = stops[s] + ((stops[s + 1] - stops[s]) * k) / pieces
      const b = stops[s] + ((stops[s + 1] - stops[s]) * (k + 1)) / pieces
      intervals.push(wedgeOrder(lines, a, b, reach, depth ?? Infinity))
    }
  }
  return { p, lines, intervals }
}

/** Indices of the bisectors crossed within `reach` along the direction (cm, sm), nearest first. */
function nearestAll(lines: Bisector[], cm: number, sm: number, reach: number): number[] {
  const seen: { i: number; r: number }[] = []
  for (let i = 0; i < lines.length; i++) {
    const c = cm * lines[i].nx + sm * lines[i].ny
    if (c <= 1e-12) continue
    const r = lines[i].h / c
    if (r < reach) seen.push({ i, r })
  }
  return seen.sort((u, v) => u.r - v.r).map((s) => s.i)
}

/** The first `depth` entries of nearestAll. */
function nearestFew(lines: Bisector[], cm: number, sm: number, reach: number, depth: number): number[] {
  const order: number[] = []
  const dists: number[] = []
  for (let i = 0; i < lines.length; i++) {
    const c = cm * lines[i].nx + sm * lines[i].ny
    if (c <= 1e-12) continue
    const r = lines[i].h / c
    if (r >= reach || (order.length === depth && r >= dists[depth - 1])) continue
    let at = order.length === depth ? depth - 1 : order.length
    while (at > 0 && dists[at - 1] > r) {
      order[at] = order[at - 1]
      dists[at] = dists[at - 1]
      at--
    }
    order[at] = i
    dists[at] = r
  }
  return order
}

function wedgeOrder(lines: Bisector[], a: number, b: number, reach: number, depth: number): Interval {
  const mid = (a + b) / 2
  const cm = Math.cos(mid)
  const sm = Math.sin(mid)
  const order = depth < Infinity ? nearestFew(lines, cm, sm, reach, depth) : nearestAll(lines, cm, sm, reach)
  const closest = order.map((i) => {
    const l = lines[i]
    const ua = offset(a, l.alpha)
    if (ua <= 0 && ua + (b - a) >= 0) return l.h
    return Math.min(crossing(l, a), crossing(l, b))
  })
  const from = order.map((i) => offset(a, lines[i].alpha))
  return { a, b, order, closest, from, tanFrom: from.map(Math.tan), tanTo: from.map((u) => Math.tan(u + b - a)) }
}

/** The integral over [a, b] of min(r(theta), t)^2 / 2, for r the crossing with bisector l (or no crossing). */
export function cappedWedge(l: Bisector | undefined, a: number, b: number, t: number): number {
  const w = b - a
  if (!l || t <= l.h) return t === Infinity ? Infinity : 0.5 * t * t * w
  const g = t === Infinity ? Math.PI / 2 : Math.acos(l.h / t)
  const ua = offset(a, l.alpha)
  const lo = Math.max(ua, -g)
  const hi = Math.min(ua + w, g)
  const inside = hi > lo ? hi - lo : 0
  const triangles = inside > 0 ? 0.5 * l.h * l.h * (Math.tan(hi) - Math.tan(lo)) : 0
  const rest = w - inside
  if (t === Infinity) return rest > 1e-12 ? Infinity : triangles
  return triangles + 0.5 * t * t * rest
}

/** Area of zone k of p inside the closed ball B(p, t); t = Infinity gives the whole zone. */
export function zoneArea(s: Sweep, k: number, t = Infinity): number {
  let total = 0
  for (const iv of s.intervals) {
    const outer = cappedWedge(s.lines[iv.order[k - 1]], iv.a, iv.b, t)
    const inner = k === 1 ? 0 : cappedWedge(s.lines[iv.order[k - 2]], iv.a, iv.b, t)
    total += outer - inner
  }
  return Number.isNaN(total) ? Infinity : total
}

/**
 * For every k in 0..kMax+1, the area of the union of zones 1..k of p inside B(p, t), computed in one pass.
 * Position j of a wedge's order contributes a plain sector once its closest crossing is beyond t.
 */
export function starAreas(s: Sweep, t: number, kMax: number): Float64Array {
  const out = new Float64Array(kMax + 2)
  const whole = new Float64Array(kMax + 3)
  const g = new Float64Array(s.lines.length)
  const tanG = new Float64Array(s.lines.length)
  s.lines.forEach((l, i) => {
    if (t <= l.h) return
    g[i] = Math.acos(l.h / t)
    tanG[i] = Math.sqrt(t * t - l.h * l.h) / l.h
  })
  const tt = 0.5 * t * t
  for (const iv of s.intervals) {
    const w = iv.b - iv.a
    let k = 1
    for (; k <= kMax + 1 && k - 1 < iv.order.length && iv.closest[k - 1] < t; k++) {
      const i = iv.order[k - 1]
      const ua = iv.from[k - 1]
      const lo = Math.max(ua, -g[i])
      const hi = Math.min(ua + w, g[i])
      let area = tt * w
      if (hi > lo) {
        const h = s.lines[i].h
        const tanHi = hi === g[i] ? tanG[i] : iv.tanTo[k - 1]
        const tanLo = lo === -g[i] ? -tanG[i] : iv.tanFrom[k - 1]
        area += 0.5 * h * h * (tanHi - tanLo) - tt * (hi - lo)
      }
      out[k] += area
    }
    whole[k] += tt * w
  }
  for (let k = 1, run = 0; k <= kMax + 1; k++) out[k] += run += whole[k]
  return out
}

/** Largest number of crossings closer than t along any ray: zones beyond it do not meet B(p, t). */
export const deepestZone = (s: Sweep, t: number) =>
  Math.max(0, ...s.intervals.map((iv) => iv.closest.filter((r) => r < t).length)) + 1

/** The boundary r_k(theta), capped at `cap`, as a closed polygon around p. Zone k lies between outlines k-1 and k. */
export function outline(s: Sweep, k: number, cap: number): Vec[] {
  if (k === 0) return []
  const pts: Vec[] = []
  for (const iv of s.intervals) {
    const l = s.lines[iv.order[k - 1]]
    for (const theta of [iv.a, iv.b]) {
      pts.push(add(s.p, polar(theta, Math.min(l ? crossing(l, theta) : Infinity, cap))))
    }
  }
  return dropCollinear(pts)
}

/** The closed polygon without the points that lie on the segment between their neighbours. */
function dropCollinear(raw: Vec[]): Vec[] {
  const pts = raw.filter((q, i) => dist(q, raw[(i + 1) % raw.length]) > 1e-9)
  const out: Vec[] = []
  for (let i = 0; i < pts.length; i++) {
    const a = out.length ? out[out.length - 1] : pts[pts.length - 1]
    const b = pts[i]
    const c = pts[(i + 1) % pts.length]
    const ux = b.x - a.x
    const uy = b.y - a.y
    const vx = c.x - b.x
    const vy = c.y - b.y
    const tiny = 1e-9 * (Math.hypot(ux, uy) + Math.hypot(vx, vy) + 1e-12) ** 2
    if (Math.abs(ux * vy - uy * vx) > tiny || ux * vx + uy * vy < 0) out.push(b)
  }
  return out
}

/** A spot inside zone k, away from its edges, for a label. */
export function zoneLabelSpot(s: Sweep, k: number, cap: number): Vec | undefined {
  let best: { gap: number; spot: Vec } | undefined
  for (const iv of s.intervals) {
    const mid = (iv.a + iv.b) / 2
    const l = s.lines[iv.order[k - 1]]
    const outer = Math.min(l ? crossing(l, mid) : Infinity, cap)
    const inner = k === 1 ? 0 : crossing(s.lines[iv.order[k - 2]], mid)
    const gap = outer - inner
    if (outer >= cap * 0.9) continue
    if (!best || gap > best.gap) best = { gap, spot: add(s.p, polar(mid, (inner + outer) / 2)) }
  }
  return best?.spot
}
