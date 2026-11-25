import { describe, expect, it } from 'vitest'
import { type Crystal, cellArea, moveSite, pointsWithin, toCartesian, toCell, vec } from './crystal'
import { densityFingerprint, lineFingerprint, sweeps } from './fingerprint'
import { zoneArea } from './sweep'

const square = (...motif: [number, number][]): Crystal => ({
  origin: vec(0, 0),
  v1: vec(1, 0),
  v2: vec(0, 1),
  motif: motif.map(([x, y]) => vec(x, y)),
})

function monteCarlo(c: Crystal, t: number, kMax: number, n = 40000) {
  let seed = 7
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const psi = new Array<number>(kMax + 1).fill(0)
  for (let s = 0; s < n; s++) {
    const y = toCartesian(c, vec(rand(), rand()))
    const k = pointsWithin(c, y, t).length
    if (k <= kMax) psi[k] += 1 / n
  }
  return psi
}

describe('density fingerprint', () => {
  it('matches the square lattice shares of course 1.5', () => {
    const fp = densityFingerprint(square([0, 0]), 1)
    const [p0, p1] = fp.at(0.3)
    expect(p0).toBeCloseTo(0.72, 2)
    expect(p1).toBeCloseTo(0.28, 2)
    const [q0, q1, q2] = fp.at(0.6)
    expect(q0).toBeCloseTo(0.05, 2)
    expect(q1).toBeCloseTo(0.77, 2)
    expect(q2).toBeCloseTo(0.18, 2)
  })

  it('matches the hand check of exercise 2.13 at t = 0.4', () => {
    const [p0, p1, p2, p3] = densityFingerprint(square([0, 0], [0.5, 0.25]), 1).at(0.4)
    expect(p0).toBeCloseTo(0.185, 3)
    expect(p1).toBeCloseTo(0.625, 3)
    expect(p2).toBeCloseTo(0.19, 3)
    expect(p3).toBeCloseTo(0, 6)
  })

  it('agrees with sampling on a skewed three-point crystal', () => {
    const c: Crystal = { origin: vec(0, 0), v1: vec(1.1, 0.1), v2: vec(0.4, 0.9), motif: [vec(0, 0), vec(0.3, 0.6), vec(0.7, 0.2)] }
    const fp = densityFingerprint(c)
    for (const t of [0.25, 0.5, 0.7]) {
      const exact = fp.at(t)
      const sampled = monteCarlo(c, t, fp.count - 1)
      exact.forEach((v, k) => expect(Math.abs(v - sampled[k])).toBeLessThan(0.01))
    }
  })

  it('sums to one at every radius', () => {
    const fp = densityFingerprint(square([0, 0], [0.5, 0.25], [0.2, 0.6]))
    for (const t of [0.1, 0.4, fp.tMax]) expect(fp.at(t).reduce((a, b) => a + b)).toBeCloseTo(1, 9)
  })
})

describe('Brillouin zones', () => {
  it('each zone of the square lattice has the area of a cell (course 2.5)', () => {
    const [s] = sweeps(square([0, 0]), 8)
    for (let k = 1; k <= 10; k++) expect(zoneArea(s, k)).toBeCloseTo(1, 9)
  })

  it('the 3rd zones of the course 2.6 motif have areas 0.32, 0.34, 0.33', () => {
    const c = square([0, 0], [0.5, 0.25], [0.2, 0.6])
    const areas = sweeps(c, 6, 3).map((s) => zoneArea(s, 3))
    expect(areas.map((a) => a.toFixed(2))).toEqual(['0.32', '0.34', '0.33'])
    expect(areas.reduce((a, b) => a + b)).toBeCloseTo(cellArea(c), 9)
  })
})

describe('line fingerprint', () => {
  it('the two sets of course 3.12 share their density functions', () => {
    const a = lineFingerprint([0, 1, 3, 4, 5, 7, 9, 10, 12], 15, 5, 6)
    const b = lineFingerprint([0, 1, 3, 4, 6, 8, 9, 12, 14], 15, 5, 6)
    for (let t = 0; t <= 5; t += 0.05) a.at(t).forEach((v, k) => expect(v).toBeCloseTo(b.at(t)[k], 9))
    expect(a.at(0.5)[0]).toBeCloseTo(0.4, 9)
  })
})

describe('moving a motif point', () => {
  const c: Crystal = { origin: vec(0, 0), v1: vec(1, 0), v2: vec(0.3, 0.9), motif: [vec(0, 0), vec(0.5, 0.5)] }
  const set = (x: Crystal) =>
    pointsWithin(x, vec(0.4, 0.4), 3)
      .map((q) => `${q.pos.x.toFixed(6)},${q.pos.y.toFixed(6)}`)
      .sort()

  it('keeps the point under the cursor and the lattice unchanged when it leaves the cell', () => {
    for (const to of [vec(2.4, 0.3), vec(-0.7, 1.6), vec(0.2, -1.3)]) {
      const m = moveSite(c, 1, to)!
      expect(m).not.toBeNull()
      const b = toCartesian(m, m.motif[1])
      expect(b.x).toBeCloseTo(to.x, 9)
      expect(b.y).toBeCloseTo(to.y, 9)
      expect(Math.abs(cellArea(m))).toBeCloseTo(cellArea(c), 9)
      expect(set(m)).toEqual(set({ ...c, motif: [vec(0, 0), toCell(c, to)] }))
    }
  })
})
