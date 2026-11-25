import { type Crystal, cellArea, dist, motifPositions, pointsWithin, spacing } from './crystal'
import { type Sweep, deepestZone, starAreas, sweep } from './sweep'

/** Curves over radii 0..tMax: at(t) gives the values of curves 0..count-1. */
export type Curves = { tMax: number; count: number; at(t: number): number[] }

/** Each motif point with every point of the set within `radius`: zones are exact for spots within radius / 2. */
export function sweeps(c: Crystal, radius: number, reach?: number, depth?: number): Sweep[] {
  return c.motif.map((_, i) => sweepAt(c, i, radius, reach, depth))
}

/** The sweep of motif point i alone, as in `sweeps`. */
export function sweepAt(c: Crystal, i: number, radius: number, reach?: number, depth?: number): Sweep {
  const p = motifPositions(c)[i]
  const others = pointsWithin(c, p, radius)
    .map((q) => q.pos)
    .filter((q) => dist(p, q) > 1e-12)
  return sweep(p, others, reach, depth)
}

export const defaultRange = (c: Crystal) => 1.6 * spacing(c)

/**
 * The cumulative density phi_k(t) is the share of the cell covered at least k times. A spot is covered at least
 * k times iff it lies in zone k of the motif point p it belongs to and within t of p, so phi_k(t) * area(U) sums,
 * over the motif, the area of zone k inside B(p, t). Then psi_k = phi_k - phi_{k+1}.
 */
export function densityFingerprint(c: Crystal, tMax = defaultRange(c), kCap = 16): Curves {
  const all = sweeps(c, 2 * tMax, tMax)
  const kMax = Math.min(kCap, Math.max(...all.map((s) => deepestZone(s, tMax))))
  const area = cellArea(c)
  return {
    tMax,
    count: kMax + 1,
    at(t) {
      const stars = new Float64Array(kMax + 2)
      for (const s of all) {
        const a = starAreas(s, t, kMax)
        for (let k = 0; k < stars.length; k++) stars[k] += a[k]
      }
      const phi = (k: number) => (k === 0 ? 1 : (stars[k] - stars[k - 1]) / area)
      return Array.from({ length: kMax + 1 }, (_, k) => phi(k) - phi(k + 1))
    },
  }
}

/** A periodic set on a line: points in [0, period), repeated every period. */
export function lineFingerprint(points: number[], period: number, tMax: number, kMax: number): Curves {
  return {
    tMax,
    count: kMax + 1,
    at(t) {
      const events: [number, number][] = []
      for (const x of points) {
        for (let shift = -Math.ceil(t / period) - 1; shift <= Math.ceil(t / period) + 1; shift++) {
          events.push([x + shift * period - t, 1], [x + shift * period + t, -1])
        }
      }
      events.sort((u, v) => u[0] - v[0] || v[1] - u[1])
      const psi = new Array<number>(kMax + 1).fill(0)
      let depth = 0
      let at = 0
      for (const [x, step] of events) {
        const lo = Math.max(at, 0)
        const hi = Math.min(x, period)
        if (hi > lo && depth <= kMax) psi[depth] += (hi - lo) / period
        depth += step
        at = x
      }
      return psi
    },
  }
}

/** Cumulative densities phi_k = psi_k + psi_{k+1} + ..., with phi_0 = 1. */
export const cumulative = (fp: Curves): Curves => ({
  ...fp,
  at(t) {
    const phi = fp.at(t)
    for (let k = phi.length - 2; k >= 0; k--) phi[k] += phi[k + 1]
    return phi
  },
})
