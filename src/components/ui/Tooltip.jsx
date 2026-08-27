import { useId, useState } from 'react'

import { cn } from '../../lib/cn.js'

const POSITIONS = {
  top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left:   'right-full top-1/2 -translate-y-1/2 mr-2',
  right:  'left-full top-1/2 -translate-y-1/2 ml-2',
}

/**
 * Tooltip — exibido em hover/focus do elemento filho.
 * Sem dependencia externa: usa CSS opacity + pointer-events.
 */
export default function Tooltip({
  label,
  position = 'top',
  children,
  className = '',
}) {
  const id = useId()
  const [open, setOpen] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {/* Aplica aria-describedby ao primeiro filho clonando se possivel.
          Aqui mantemos simples: o aria fica no wrapper. */}
      <span aria-describedby={open ? id : undefined}>{children}</span>

      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 whitespace-nowrap rounded-md',
          'bg-bg-base/95 px-2 py-1 text-xs font-medium text-text-primary',
          'border border-primary/20 shadow-glow-soft backdrop-blur',
          'transition-opacity duration-150',
          open ? 'opacity-100' : 'opacity-0',
          POSITIONS[position],
          className
        )}
      >
        {label}
      </span>
    </span>
  )
}
