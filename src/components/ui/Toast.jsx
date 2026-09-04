import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { CloseCircle, InfoCircle, TickCircle, Warning2 } from 'iconsax-reactjs'

import { cn } from '../../lib/cn.js'

const TYPE_STYLES = {
  success: { icon: TickCircle, ring: 'ring-emerald-500/40',  bg: 'bg-emerald-500/15',  iconColor: 'text-positive' },
  warning: { icon: Warning2,  ring: 'ring-amber-500/40',    bg: 'bg-amber-500/15',    iconColor: 'text-caution' },
  error:   { icon: Warning2,  ring: 'ring-tertiary-500/40', bg: 'bg-tertiary-500/15', iconColor: 'text-tint-rose' },
  info:    { icon: InfoCircle,         ring: 'ring-primary-500/40',  bg: 'bg-primary-600/15',  iconColor: 'text-accent' },
}

/**
 * Toast — notificacao flutuante no canto inferior direito.
 * Auto-dismiss apos `autoHideMs` (padrao 3000ms). Renderiza via portal.
 *
 * Uso simples: estado open + setOpen(false) ao fechar:
 *   <Toast open={open} onClose={() => setOpen(false)} message="..." type="info" />
 *
 * **A região viva existe sempre, mesmo fechada.** Leitor de tela só anuncia
 * mudança dentro de um nó que ele já estava observando; criar o nó junto com a
 * mensagem faz o anúncio se perder. Como este componente é o que confirma as
 * ações destrutivas — "criador excluído", "conta desconectada e 3 publicações
 * apagadas" —, perder o anúncio significa apagar dado sem retorno audível.
 *
 * Erro vai em `role="alert"` (assertivo, interrompe a leitura); o resto em
 * `role="status"` (educado, espera a pausa). A distinção é o que separa
 * "aconteceu o que você pediu" de "algo deu errado agora".
 */
export default function Toast({
  open,
  onClose,
  message,
  description,
  type = 'info',
  autoHideMs = 3500,
}) {
  const { t } = useTranslation()
  useEffect(() => {
    if (!open || !autoHideMs) return
    const timer = setTimeout(() => onClose?.(), autoHideMs)
    return () => clearTimeout(timer)
  }, [open, autoHideMs, onClose])

  const style = TYPE_STYLES[type] || TYPE_STYLES.info
  const Icon  = style.icon
  const urgente = type === 'error'

  return createPortal(
    <div
      data-toast-live
      role={urgente ? 'alert' : 'status'}
      aria-live={urgente ? 'assertive' : 'polite'}
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-[70] max-w-sm"
    >
      {!open ? null : (
      <div className="animate-fade-in">
      <div className={cn(
        'flex items-start gap-3 rounded-2xl border border-primary/20 bg-bg-surface/95 p-4 backdrop-blur-md',
        'shadow-glow-soft ring-1 ring-inset',
        style.ring
      )}>
        <span className={cn('mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', style.bg, style.iconColor)}>
          <Icon size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text-primary">{message}</p>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.a11y.close')}
          className="shrink-0 rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-elevated hover:text-text-primary"
        >
          <CloseCircle size={14} />
        </button>
      </div>
      </div>
      )}
    </div>,
    document.body
  )
}
