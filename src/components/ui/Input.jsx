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
    /** `padrao` usa a superfície do app; `vidro` usa a da landing. */
    variant = 'padrao',
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
        <label htmlFor={id} className={cn('mb-1.5 block text-label', variant === 'vidro' && '!text-landing-muted')}>
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          'group flex items-center gap-2 rounded-xl px-3.5',
          'transition-all duration-200',
          // A caixa é a única coisa que muda entre as variantes. O campo em si,
          // o rótulo e o erro continuam iguais — trocar o material não pode
          // trocar o comportamento.
          variant === 'vidro'
            ? cn(
                'bg-transparent backdrop-blur-[4px] ring-1 ring-inset ring-white/10',
                'focus-within:ring-2 focus-within:ring-landing-violet/70',
                'focus-within:shadow-[0_0_18px_rgba(124,58,237,0.35)]'
              )
            : cn(
                'bg-bg-input ring-1 ring-inset ring-hairline',
                'focus-within:ring-2 focus-within:ring-primary-500 focus-within:shadow-glow-soft'
              ),
          error && 'ring-tertiary-500/70 focus-within:ring-tertiary-500',
          rest.disabled && 'opacity-60'
        )}
      >
        {LeftIcon ? (
          <LeftIcon
            size={16}
            className={cn(
              'shrink-0 transition-colors',
              variant === 'vidro' ? 'text-landing-muted group-focus-within:text-landing-violet'
                                  : 'text-text-muted group-focus-within:text-accent'
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
            'h-11 w-full bg-transparent py-2 text-sm focus:outline-none',
            variant === 'vidro' ? 'text-landing-text placeholder:text-landing-muted'
                                : 'text-text-primary placeholder:text-text-muted',
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
