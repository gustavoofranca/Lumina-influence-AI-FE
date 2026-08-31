import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

import { cn } from '../../lib/cn.js'

const TYPE_STYLES = {
  success: { icon: CheckCircle2, ring: 'ring-emerald-500/40',  bg: 'bg-emerald-500/15',  iconColor: 'text-positive' },
  warning: { icon: AlertCircle,  ring: 'ring-amber-500/40',    bg: 'bg-amber-500/15',    iconColor: 'text-caution' },
  error:   { icon: AlertCircle,  ring: 'ring-tertiary-500/40', bg: 'bg-tertiary-500/15', iconColor: 'text-tint-rose' },
  info:    { icon: Info,         ring: 'ring-primary-500/40',  bg: 'bg-primary-600/15',  iconColor: 'text-accent' },
}

/**
 * Toast — notificacao flutuante no canto inferior direito.
 * Auto-dismiss apos `autoHideMs` (padrao 3000ms). Renderiza via portal.
 *
 * Uso simples: estado open + setOpen(false) ao fechar:
 *   <Toast open={open} onClose={() => setOpen(false)} message="..." type="info" />
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

  if (!open) return null

  const style = TYPE_STYLES[type] || TYPE_STYLES.info
  const Icon  = style.icon

  return createPortal(
    <div className="fixed bottom-6 right-6 z-[70] max-w-sm animate-fade-in">
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
          <X size={14} />
        </button>
      </div>
    </div>,
    document.body
  )
}
