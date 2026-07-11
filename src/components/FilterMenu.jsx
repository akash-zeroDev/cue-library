import { useEffect, useRef, useState } from 'react'

function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 4.5L6 7.5L9 4.5" />
    </svg>
  )
}
function Check() {
  return (
    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 12, height: 12 }}>
      <path d="M2.5 6.5L5 9l4.5-5" />
    </svg>
  )
}

export default function FilterMenu({ label, value, options, onChange, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected && selected.value !== options[0].value
    ? `${label}: ${selected.label}`
    : label

  return (
    <div className="fm" ref={ref}>
      <button
        type="button"
        className={`pill${value !== options[0].value ? ' pill-on' : ''}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {displayLabel}
        <Chevron />
      </button>
      {open && (
        <div className={`fm-menu fm-menu-${align}`} role="menu">
          {options.map((opt) => {
            const on = opt.value === value
            return (
              <button
                key={opt.value ?? 'null'}
                type="button"
                role="menuitemradio"
                aria-checked={on}
                className={`fm-item${on ? ' fm-item-on' : ''}`}
                onClick={() => { onChange(opt.value); setOpen(false) }}
              >
                <span>{opt.label}</span>
                {on && <Check />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
