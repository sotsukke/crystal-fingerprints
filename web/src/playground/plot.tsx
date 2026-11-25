import { useMemo } from 'react'
import type { Curves } from '../geometry/fingerprint'
import { useWidth } from './width'

const L = 40
const R = 16
const TOP = 30
const BOTTOM = 42
const SUB = '₀₁₂₃₄₅₆₇₈₉'

const fix3 = (v: number) => (Math.abs(v) < 5e-4 ? 0 : v).toFixed(3)

export const sub = (k: number) => [...String(k)].map((d) => SUB[+d]).join('')

type PlotProps = {
  curves: Curves
  /** Greek letter of the curves: psi or phi. */
  symbol?: 'ψ' | 'φ'
  /** Curves shown, by index; all by default. */
  show?: number[]
  t?: number
  onT?: (t: number) => void
  /** The curve drawn bold; the others go light grey. */
  k?: number
  onK?: (k: number) => void
  /** A second set of curves, dashed, for comparison. */
  ghost?: Curves
  /** Draw the ghost over the curves in paper-coloured dashes, to show that they coincide. */
  ghostOnTop?: boolean
  /** Mark, for each shown curve, where the gap to the ghost is largest. */
  gaps?: boolean
  marks?: { t: number; label: string }[]
  height?: number
  /** Height as a share of the width, in place of a fixed height. */
  aspect?: number
  /** One box per curve with its value at t; clicking a box picks k. */
  boxes?: boolean
  yLabel?: string
}

export function Plot({
  curves,
  symbol = 'ψ',
  show,
  t,
  onT,
  k,
  onK,
  ghost,
  ghostOnTop = false,
  gaps = false,
  marks = [],
  height = 320,
  aspect,
  boxes = false,
  yLabel = 'share of unit cell',
}: PlotProps) {
  const [svg, W] = useWidth<SVGSVGElement>()
  const H = aspect ? Math.round(W * aspect) : height
  const ks = show ?? Array.from({ length: curves.count }, (_, i) => i)
  const tMax = curves.tMax
  const x = (u: number) => L + (u / tMax) * (W - L - R)
  const y = (v: number) => TOP + (1 - v) * (H - TOP - BOTTOM)

  const N = 160
  const sample = (c: Curves) =>
    Array.from({ length: N + 1 }, (_, i) => {
      const u = (i / N) * tMax
      return { u, v: c.at(u) }
    })
  const rows = useMemo(() => sample(curves), [curves])
  const ghostRows = useMemo(() => (ghost ? sample(ghost) : undefined), [ghost])

  const path = (rs: { u: number; v: number[] }[], i: number) =>
    rs.map((r, j) => `${j ? 'L' : 'M'}${x(r.u).toFixed(1)},${y(r.v[i] ?? 0).toFixed(1)}`).join('')

  const labelAt = (i: number) => {
    if (i === 0 && symbol === 'ψ') return rows.find((r) => (r.v[0] ?? 0) <= 0.85) ?? rows[0]
    return rows.reduce((best, r) => ((r.v[i] ?? 0) > (best.v[i] ?? 0) ? r : best), rows[0])
  }

  const setFrom = (clientX: number) => {
    if (!onT || !svg.current) return
    const px = clientX - svg.current.getBoundingClientRect().left
    onT(Math.min(tMax, Math.max(0, ((px - L) / (W - L - R)) * tMax)))
  }

  const step = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2].find((d) => tMax / d <= 10) ?? 5
  const xs: number[] = []
  for (let u = 0; u <= tMax + 1e-9; u += step) xs.push(u)
  const digits = step < 0.1 ? 2 : step < 1 ? 1 : 0
  const now = t === undefined ? undefined : curves.at(t)

  const gapBars = useMemo(() => {
    if (!gaps || !ghostRows) return []
    const bars = ks.flatMap((i) => {
      const best = rows.reduce(
        (acc, r, j) => {
          const g = Math.abs((r.v[i] ?? 0) - (ghostRows[j].v[i] ?? 0))
          return g > acc.g ? { g, j } : acc
        },
        { g: 0, j: 0 },
      )
      if (best.g < 1e-3) return []
      const r = rows[best.j]
      const a = y(r.v[i] ?? 0)
      const b = y(ghostRows[best.j].v[i] ?? 0)
      return [{ i, g: best.g, x: x(r.u), a, b, labelY: Math.min((a + b) / 2 + 4, H - BOTTOM - 6) }]
    })
    const byY = [...bars].sort((p, q) => p.labelY - q.labelY)
    for (let j = 1; j < byY.length; j++)
      if (Math.abs(byY[j].x - byY[j - 1].x) < 48) byY[j].labelY = Math.max(byY[j].labelY, byY[j - 1].labelY + 13)
    return bars
  }, [gaps, ghostRows, rows, ks.join(), W, H])
  const cls = (i: number) => (k === undefined ? 'curve dark' : i === k ? 'curve on' : 'curve')

  return (
    <figure className="plot">
      <svg
        ref={svg}
        viewBox={`0 0 ${W} ${H}`}
        height={H}
        className={onT ? 'draggable' : undefined}
        role="img"
        aria-label={onT ? 'Density functions; drag to change the radius t' : 'Density functions'}
        onPointerDown={(e) => {
          if (!onT) return
          e.currentTarget.setPointerCapture(e.pointerId)
          setFrom(e.clientX)
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) setFrom(e.clientX)
        }}
      >
        {Array.from({ length: 11 }, (_, i) => i / 10).map((v, i) => (
          <g key={v}>
            <rect className="grid-line" x={L} y={Math.round(y(v))} width={W - L - R} height={1} fill="var(--grid)" />
            {i % 2 === 0 && (
              <text className="tick" x={L - 8} y={y(v) + 4} textAnchor="end">
                {v.toFixed(1)}
              </text>
            )}
          </g>
        ))}
        {xs.map((u, i) => (
          <g key={u}>
            <rect x={Math.round(x(u))} y={TOP} width={1} height={H - TOP - BOTTOM} fill="var(--grid)" />
            {i % 2 === 0 && (
              <text className="tick" x={x(u)} y={H - BOTTOM + 20} textAnchor="middle">
                {u.toFixed(digits)}
              </text>
            )}
          </g>
        ))}
        <rect x={L} y={H - BOTTOM} width={W - L - R} height={1} fill="var(--ink)" />
        <rect x={L} y={TOP} width={1} height={H - TOP - BOTTOM} fill="var(--ink)" />
        <text className="axis-title" x={W - R} y={H - 4} textAnchor="end">
          radius t
        </text>
        <text className="axis-title" x={L - 32} y={TOP - 14}>
          {yLabel}
        </text>

        {marks.map((m) => (
          <g key={m.label}>
            <line className="mark" x1={x(m.t)} x2={x(m.t)} y1={TOP} y2={H - BOTTOM} />
            <rect className="mark-dot" x={x(m.t) - 3} y={H - BOTTOM - 3} width={6} height={6} />
          </g>
        ))}
        {ghostRows &&
          !ghostOnTop &&
          ks.map((i) => <path key={`g${i}`} d={path(ghostRows, i)} className={`${cls(i)} ghost`} />)}
        {ks
          .filter((i) => i !== k)
          .concat(k !== undefined && ks.includes(k) ? [k] : [])
          .map((i) => (
            <path key={i} d={path(rows, i)} className={cls(i)} />
          ))}
        {ghostRows && ghostOnTop && ks.map((i) => <path key={`g${i}`} d={path(ghostRows, i)} className="curve ghost top" />)}
        {gapBars.map((g) => (
          <g key={`b${g.i}`}>
            <line className="gap" x1={g.x} x2={g.x} y1={g.a} y2={g.b} />
            <text className="gap-label" x={g.x + 5} y={g.labelY}>
              {symbol}
              {sub(g.i)} {g.g.toFixed(3)}
            </text>
          </g>
        ))}
        {ks.map((i) => {
          const r = labelAt(i)
          const v = r.v[i] ?? 0
          if (v < 0.02) return null
          return (
            <text key={`l${i}`} className={i === k ? 'curve-label on' : 'curve-label'} x={x(r.u) + (i ? -8 : 8)} y={y(v) - 10}>
              {symbol}
              {sub(i)}
            </text>
          )
        })}
        {t !== undefined && now && (
          <g pointerEvents="none">
            <rect className="now" x={Math.round(x(t))} y={TOP} width={1} height={H - TOP - BOTTOM} />
            <rect className="now" x={x(t) - 6} y={H - BOTTOM - 6} width={12} height={12} />
            {ks.map((i) => (
              <rect
                key={i}
                className={i === k ? 'now-dot on' : 'now-dot'}
                x={x(t) - 4}
                y={y(now[i] ?? 0) - 4}
                width={8}
                height={8}
              />
            ))}
          </g>
        )}
      </svg>
      {boxes && now && (
        <div className="vals">
          {ks.map((i) => (
            <button key={i} className={i === k ? 'on' : undefined} onClick={() => onK?.(i)}>
              {symbol}
              {sub(i)}(t)
              <b>{fix3(now[i] ?? 0)}</b>
            </button>
          ))}
          {ks.length < curves.count && (
            <div className="rest">
              {symbol}≥{ks.length}
              <b>{fix3(1 - ks.reduce((u, i) => u + (now[i] ?? 0), 0))}</b>
            </div>
          )}
        </div>
      )}
    </figure>
  )
}
