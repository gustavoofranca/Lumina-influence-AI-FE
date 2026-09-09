import { useId } from 'react'

import { cn } from '../../lib/cn.js'

/**
 * Switch — toggle binario (on/off) com labels descritivos opcionais.
 * Use para configuracoes de notificacao, preferencias, etc.
 *
 * O nome acessivel NAO vem do <label htmlFor>. Pelo HTML-AAM, o nome de um
 * <button> sai de aria-labelledby, de aria-label ou do proprio conteudo — e o
 * conteudo aqui e so o <span> da bolinha. A varredura de 09/09 leu a arvore de
 * acessibilidade e achou os quatro interruptores de Preferencias com nome
 * vazio: o leitor de tela anunciava "switch, ligado" sem dizer do que.
 *
 * Quando o rotulo visivel ja existe fora do componente, passe `ariaLabelledBy`
 * apontando para ele — assim o nome falado e o texto lido, que e o que a regra
 * de rotulo no nome pede. `ariaLabel` fica para quando nao ha texto visivel.
 */
export default function Switch({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className = '',
  ariaLabel,
  ariaLabelledBy,
}) {
  const id = useId()
  const idRotulo = `${id}-rotulo`
  // O rotulo interno so nomeia se existir; senao vale o que veio de fora.
  const rotuladoPor = ariaLabelledBy || (label ? idRotulo : undefined)

  if (import.meta.env.DEV && !rotuladoPor && !ariaLabel) {
    // Controle sem nome nao reprova build nem teste — some em silencio e so
    // aparece com leitor de tela. Avisa em desenvolvimento, com o componente.
    console.warn('Switch: sem nome acessivel. Passe `label`, `ariaLabel` ou `ariaLabelledBy`.')
  }

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
        aria-label={ariaLabel}
        aria-labelledby={rotuladoPor}
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
          {label && (
            <span id={idRotulo} className="text-sm font-semibold text-text-primary">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-text-secondary leading-relaxed">{description}</span>
          )}
        </span>
      )}
    </label>
  )
}
