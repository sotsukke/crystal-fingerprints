export type Vec = { x: number; y: number }

export const vec = (x: number, y: number): Vec => ({ x, y })
export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y })
export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y })
export const scale = (a: Vec, s: number): Vec => ({ x: a.x * s, y: a.y * s })
export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y
export const cross = (a: Vec, b: Vec) => a.x * b.y - a.y * b.x
export const norm = (a: Vec) => Math.hypot(a.x, a.y)
export const dist = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y)
export const polar = (theta: number, r: number): Vec => ({ x: r * Math.cos(theta), y: r * Math.sin(theta) })

/** A crystal file: a cell spanned by v1, v2 at `origin`, and a motif in cell coordinates, each in [0, 1). */
export type Crystal = { origin: Vec; v1: Vec; v2: Vec; motif: Vec[] }

/** A point of the periodic set: motif point `site` translated by lattice vector i v1 + j v2. */
export type SetPoint = { pos: Vec; site: number; i: number; j: number }

export const cellArea = (c: Crystal) => Math.abs(cross(c.v1, c.v2))

export const toCartesian = (c: Crystal, f: Vec): Vec => ({
  x: c.origin.x + f.x * c.v1.x + f.y * c.v2.x,
  y: c.origin.y + f.x * c.v1.y + f.y * c.v2.y,
})

export const toCell = (c: Crystal, p: Vec): Vec => {
  const d = sub(p, c.origin)
  const det = cross(c.v1, c.v2)
  return { x: cross(d, c.v2) / det, y: cross(c.v1, d) / det }
}

export const wrap01 = (u: number) => u - Math.floor(u)

export const motifPositions = (c: Crystal) => c.motif.map((f) => toCartesian(c, f))

/** Typical spacing between points: the side of a square holding one point. */
export const spacing = (c: Crystal) => Math.sqrt(cellArea(c) / c.motif.length)

/** Lagrange–Gauss reduction: the same lattice, with a basis of a shortest and a next-shortest vector. */
export function reduce(a: Vec, b: Vec): [Vec, Vec] {
  let u = a
  let v = b
  if (norm(u) > norm(v)) [u, v] = [v, u]
  for (;;) {
    const m = Math.round(dot(u, v) / dot(u, u))
    v = sub(v, scale(u, m))
    if (norm(v) >= norm(u)) return [u, v]
    ;[u, v] = [v, u]
  }
}

/** Every point of the periodic set within distance `radius` of `center`. */
export function pointsWithin(c: Crystal, center: Vec, radius: number): SetPoint[] {
  const [b1, b2] = reduce(c.v1, c.v2)
  const det = cross(b1, b2)
  const reach1 = (radius * norm(b2)) / Math.abs(det)
  const reach2 = (radius * norm(b1)) / Math.abs(det)
  const out: SetPoint[] = []
  c.motif.forEach((f, site) => {
    const d = sub(center, toCartesian(c, f))
    const a1 = cross(d, b2) / det
    const a2 = cross(b1, d) / det
    for (let m = Math.ceil(a1 - reach1); m <= a1 + reach1; m++) {
      for (let n = Math.ceil(a2 - reach2); n <= a2 + reach2; n++) {
        const shift = add(scale(b1, m), scale(b2, n))
        const pos = add(toCartesian(c, f), shift)
        if (dist(pos, center) > radius) continue
        const g = toCell({ ...c, origin: vec(0, 0) }, shift)
        out.push({ pos, site, i: Math.round(g.x), j: Math.round(g.y) })
      }
    }
  })
  return out
}

/** The same periodic set written in another cell: basis w1, w2 spanning a sublattice, with the cell at `origin`. */
export function rewrite(c: Crystal, origin: Vec, w1: Vec, w2: Vec): Crystal {
  const target: Crystal = { origin, v1: w1, v2: w2, motif: [] }
  const center = toCartesian(target, vec(0.5, 0.5))
  const radius = (norm(w1) + norm(w2)) / 2 + 1e-9
  const eps = 1e-9
  const motif = pointsWithin(c, center, radius)
    .map((p) => toCell(target, p.pos))
    .filter((f) => f.x > -eps && f.x < 1 - eps && f.y > -eps && f.y < 1 - eps)
    .map((f) => vec(Math.max(0, f.x), Math.max(0, f.y)))
    .sort((a, b) => a.y - b.y || a.x - b.x)
  return { ...target, motif }
}

const inCell = (f: Vec) => f.x >= 0 && f.x < 1 && f.y >= 0 && f.y < 1

/** The same periodic set over another basis of the same lattice, each motif point re-expressed and wrapped into [0, 1). */
function rebase(c: Crystal, v1: Vec, v2: Vec): Crystal {
  const target = { ...c, v1, v2, motif: [] }
  return {
    ...target,
    motif: c.motif.map((f) => {
      const g = toCell(target, toCartesian(c, f))
      return vec(wrap01(g.x), wrap01(g.y))
    }),
  }
}

/**
 * Moves motif point i to p over the same lattice. When p leaves the cell, the basis changes instead of the point
 * jumping: take the quarter turn of the reduced basis whose cone holds p, then run the subtractive Euclid algorithm
 * on p's coordinates (s > t: v2 += v1, s -= t, and the mirror case) until both are below 1. The new basis depends only
 * on the lattice and p, never on the drag path. Null when no cell at the origin holds p (p on a ray beyond a lattice point).
 */
export function moveSite(c: Crystal, i: number, p: Vec): Crystal | null {
  const at = (r: Crystal, f: Vec): Crystal => ({ ...r, motif: r.motif.map((m, j) => (j === i ? f : m)) })
  const f = toCell(c, p)
  if (inCell(f)) return at(c, f)
  const [e1, r2] = reduce(c.v1, c.v2)
  const e2 = cross(e1, r2) * cross(c.v1, c.v2) < 0 ? scale(r2, -1) : r2
  const d = sub(p, c.origin)
  const coords = (w1: Vec, w2: Vec) => {
    const det = cross(w1, w2)
    return vec(cross(d, w2) / det, cross(w1, d) / det)
  }
  const neg = (v: Vec) => scale(v, -1)
  const turns: [Vec, Vec][] = [
    [e1, e2],
    [e2, neg(e1)],
    [neg(e1), neg(e2)],
    [neg(e2), e1],
  ]
  let [w1, w2] = turns.reduce((a, b) => {
    const u = coords(...a)
    const v = coords(...b)
    return Math.min(v.x, v.y) > Math.min(u.x, u.y) ? b : a
  })
  let { x: s, y: t } = coords(w1, w2)
  const shears = (big: number, small: number) => (small >= 1 ? Math.ceil(big / small) - 1 : Math.floor((big - 1) / small) + 1)
  for (let round = 0; s >= 1 || t >= 1; round++) {
    if (Math.abs(s - t) <= 1e-9 || Math.min(s, t) <= 1e-9 || round === 100) return null
    if (s > t) {
      const k = shears(s, t)
      w2 = add(w2, scale(w1, k))
      s -= k * t
    } else {
      const k = shears(t, s)
      w1 = add(w1, scale(w2, k))
      t -= k * s
    }
  }
  if (Math.max(norm(w1), norm(w2)) > 4 * Math.max(norm(e1), norm(e2), norm(d))) return null
  return inCell(vec(s, t)) ? at(rebase(c, w1, w2), vec(s, t)) : null
}

/** The Lagrange–Gauss reduced basis of the same lattice, oriented like the old one, with the motif re-expressed. */
export function reduced(c: Crystal): Crystal {
  const [a, r] = reduce(c.v1, c.v2)
  const b = cross(a, r) * cross(c.v1, c.v2) < 0 ? scale(r, -1) : r
  const turns: [Vec, Vec][] = [
    [a, b],
    [b, scale(a, -1)],
    [scale(a, -1), scale(b, -1)],
    [scale(b, -1), a],
  ]
  const stays = ([w1, w2]: [Vec, Vec]) => c.motif.every((f) => inCell(toCell({ ...c, v1: w1, v2: w2 }, toCartesian(c, f))))
  return rebase(c, ...(turns.find(stays) ?? turns[0]))
}
