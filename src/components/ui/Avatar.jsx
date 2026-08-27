import { useState } from 'react'

import { cn } from '../../lib/cn.js'

const SIZE = {
  sm: { wrap: 'h-8 w-8',  text: 'text-xs'  },
  md: { wrap: 'h-10 w-10', text: 'text-sm'  },
  lg: { wrap: 'h-14 w-14', text: 'text-base' },
  xl: { wrap: 'h-20 w-20', text: 'text-2xl' },
}

// Paleta deterministica: mesmo nome -> mesma cor de fallback
const FALLBACK_TINTS = [
  'bg-primary-600/30 text-accent-strong ring-primary-400/30',
  'bg-secondary-500/25 text-tint-sky ring-secondary-400/30',
  'bg-tertiary-500/25 text-tint-rose ring-tertiary-400/30',
  'bg-emerald-500/25 text-positive ring-emerald-400/30',
  'bg-amber-500/25 text-caution ring-amber-400/30',
]

function initialsOf(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function tintFor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % FALLBACK_TINTS.length
  return FALLBACK_TINTS[hash]
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
  status, // 'online' | 'offline' | undefined
  ...rest
}) {
  const [errored, setErrored] = useState(false)
  const dims = SIZE[size] || SIZE.md
  const showImage = src && !errored

  return (
    <span className={cn('relative inline-flex shrink-0', className)} {...rest}>
      <span
        className={cn(
          'inline-flex items-center justify-center overflow-hidden rounded-full ring-1',
          dims.wrap,
          showImage ? 'ring-primary/20 bg-bg-surface' : cn('font-semibold ring-1', dims.text, tintFor(name))
        )}
        aria-label={name || 'avatar'}
        role="img"
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            onError={() => setErrored(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          initialsOf(name)
        )}
      </span>

      {status ? (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-bg-base',
            status === 'online' ? 'bg-success' : 'bg-neutral-500'
          )}
          aria-hidden
        />
      ) : null}
    </span>
  )
}
