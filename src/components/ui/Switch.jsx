import { useId } from 'react'

import { cn } from '../../lib/cn.js'

/**
 * Switch — toggle binario (on/off) com labels descritivos opcionais.
 * Use para configuracoes de notificacao, preferencias, etc.
 */
export default function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
}) {
  const id = useId()

  const handleToggle = () => {
    if (disabled) return
    onChange?.(!checked)
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        'flex items-start gap-3',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        className
      )}
    >
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base',
          checked
            ? 'bg-primary-600 shadow-glow-soft'
            : 'bg-bg-elevated hover:bg-neutral-600'
        )}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200',
            checked ? 'translate-x-[22px]' : 'translate-x-[2px]'
          )}
        />
      </button>

      {(label || description) && (
        <span className="flex flex-col gap-0.5 select-none">
          {label && <span className="text-sm font-semibold text-text-primary">{label}</span>}
          {description && (
            <span className="text-xs text-text-secondary leading-relaxed">{description}</span>
          )}
        </span>
      )}
    </label>
  )
}
