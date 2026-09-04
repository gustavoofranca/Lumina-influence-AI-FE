import { forwardRef, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { CloseCircle, SearchNormal1 as SearchIcon } from 'iconsax-reactjs'

import { cn } from '../../lib/cn.js'

/**
 * Search — variante de input com lupa fixa a esquerda.
 * Util na topbar do app ("Analisar criador..." / "Analyze creator...").
 *
 * Props: value, onChange, placeholder, onSubmit (Enter).
 * Mostra botao X para limpar quando ha texto.
 */
const Search = forwardRef(function Search(
  {
    value = '',
    onChange,
    onSubmit,
    placeholder,
    label,
    id: idProp,
    className = '',
    containerClassName = '',
    fullWidth = true,
    autoFocus = false,
  },
  ref
) {
  const reactId = useId()
  const { t } = useTranslation()
  const id = idProp || reactId

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSubmit) {
      e.preventDefault()
      onSubmit(value)
    }
  }

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } })
    }
  }

  return (
    <div className={cn(fullWidth && 'w-full', containerClassName)}>
      {label ? (
        <label htmlFor={id} className="mb-1.5 block text-label">
          {label}
        </label>
      ) : null}

      <div
        className={cn(
          'group flex h-11 items-center gap-2 rounded-xl bg-bg-input px-3.5',
          'ring-1 ring-inset ring-hairline transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:shadow-glow-soft',
          className
        )}
      >
        <SearchIcon
          size={16}
          className="shrink-0 text-text-muted transition-colors group-focus-within:text-accent"
        />
        <input
          ref={ref}
          id={id}
          type="search"
          aria-label={label ? undefined : placeholder}
          value={value}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'h-full w-full bg-transparent text-sm text-text-primary',
            'placeholder:text-text-muted focus:outline-none',
            // Esconde o "X" nativo do input[type=search] (Webkit/IE)
            '[&::-webkit-search-cancel-button]:hidden'
          )}
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label={t('common.a11y.clear')}
            className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-surface hover:text-text-primary"
          >
            <CloseCircle size={14} />
          </button>
        ) : null}
      </div>
    </div>
  )
})

export default Search
