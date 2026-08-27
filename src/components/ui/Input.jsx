import { forwardRef, useId } from 'react'

import { cn } from '../../lib/cn.js'

/**
 * Input — campo de texto padrao da Lumina.
 * Estrutura: label uppercase (text-label) acima + caixa com bg-input e
 * focus ring violeta. leftIcon opcional (lupa, email, etc.).
 */
const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon: LeftIcon = null,
    rightAdornment = null,
    type = 'text',
    id: idProp,
    className = '',
    containerClassName = '',
    fullWidth = true,
    ...rest
  },
  ref
) {
  const reactId = useId()
  const id = idProp || reactId
  const errorId = error ? `${id}-error` : undefined
  const helpId = helperText ? `${id}-help` : undefined

  return (
    <div className={cn(fullWidth && 'w-full', containerClassName)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-label">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          'group flex items-center gap-2 rounded-xl bg-bg-input px-3.5',
          'ring-1 ring-inset ring-hairline transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:shadow-glow-soft',
          error && 'ring-tertiary-500/70 focus-within:ring-tertiary-500',
          rest.disabled && 'opacity-60'
        )}
      >
        {LeftIcon ? (
          <LeftIcon
            size={16}
            className={cn(
              'shrink-0 text-text-muted transition-colors',
              'group-focus-within:text-accent'
            )}
          />
        ) : null}

        <input
          ref={ref}
          id={id}
          type={type}
          aria-invalid={!!error}
          aria-describedby={cn(errorId, helpId) || undefined}
          className={cn(
            'h-11 w-full bg-transparent py-2 text-sm text-text-primary',
            'placeholder:text-text-muted focus:outline-none',
            className
          )}
          {...rest}
        />

        {rightAdornment ? <div className="shrink-0">{rightAdornment}</div> : null}
      </div>

      {error ? (
        <p id={errorId} className="mt-1.5 text-xs font-medium text-tint-rose">
          {error}
        </p>
      ) : helperText ? (
        <p id={helpId} className="mt-1.5 text-xs text-text-muted">
          {helperText}
        </p>
      ) : null}
    </div>
  )
})

export default Input
