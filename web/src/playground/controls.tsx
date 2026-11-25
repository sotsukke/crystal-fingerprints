import type { CSSProperties, ReactNode } from 'react'

/** A labelled row of options; the chosen one carries the blue square. */
export function Choice<T extends string | number>({
  label,
  value,
  options,
  onChange,
  vertical = false,
}: {
  label: string
  value: T
  options: { value: T; label: ReactNode; note?: ReactNode }[]
  onChange: (v: T) => void
  vertical?: boolean
}) {
  return (
    <div className={vertical ? 'group' : 'choice'} role="radiogroup" aria-label={label}>
      <h6>{label}</h6>
      <div className={vertical ? undefined : 'options'} style={vertical ? { display: 'contents' } : undefined}>
        {options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={o.value === value}
            className={o.value === value ? 'item on' : 'item'}
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.note && <small>{o.note}</small>}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 0.005,
  digits = 2,
  onChange,
}: {
  label: ReactNode
  value: number
  min: number
  max: number
  step?: number
  digits?: number
  onChange: (v: number) => void
}) {
  return (
    <label className="slider">
      <span>
        {label} <b>{value.toFixed(digits)}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ '--p': `${(100 * (value - min)) / (max - min)}%` } as CSSProperties}
        onChange={(e) => onChange(+e.target.value)}
      />
    </label>
  )
}
